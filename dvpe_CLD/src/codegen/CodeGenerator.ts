/**
 * Code Generator
 * Generates C++ code for Daisy Field from DVPE patch graphs
 * Ported from dvpe with type adaptations for dvpe_CLD
 */

import {
    BlockInstance,
    Connection,
    BlockDefinition,
    SignalType,
    PortDirection,
    HardwareConfiguration,
    FieldControlMapping,
    FieldMappingLayer,
    PolyVoiceBlanket,
} from '@/types';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import { GraphAnalyzer, ProcessingOrder } from '@/core/graph/GraphAnalyzer';
import { HardwareMappingAnalyzer, HardwareMapping } from './analyzers/HardwareMappingAnalyzer';
import { CustomBlockDefinition } from '@/types/customBlock';
import {
    buildFieldMappingConflictErrors,
    getFieldKeyIndex,
    getFieldKnobIndex,
} from '@/core/fieldMapping';

// ============================================================================
// TYPES
// ============================================================================

export interface PatchMetadata {
    name: string;
    blockSize: number;
    sampleRate?: number;
    targetHardware?: string;
}

export interface PatchGraph {
    blocks: BlockInstance[];
    connections: Connection[];
    polyVoiceBlankets?: PolyVoiceBlanket[];
    metadata: PatchMetadata;
    hardwareConfig?: HardwareConfiguration;
}

export interface GeneratedCode {
    mainCpp: string;
    makefile: string;
    errors: string[];
    warnings: string[];
}

interface GenerationContext {
    patch: Pick<PatchGraph, 'blocks' | 'connections'>;
    blockDefs: Map<string, BlockDefinition>;
    instancePrefix: string;
    inputOverrides: Map<string, string>; // key: `${targetBlockId}:${targetPortId}`
}

interface CustomPortEndpoint {
    blockId: string;
    portId: string;
}

// ============================================================================
// CODE GENERATOR
// ============================================================================

export class CodeGenerator {
    private patch: PatchGraph;
    private blockDefs: Map<string, BlockDefinition>;
    private processingOrder: ProcessingOrder;
    private hardwareMapping: HardwareMapping;
    private generationContextStack: GenerationContext[] = [];

    constructor(patch: PatchGraph) {
        this.patch = patch;
        this.blockDefs = new Map();

        // Load block definitions
        patch.blocks.forEach(block => {
            const def = BlockRegistry.get(block.definitionId);
            if (def) {
                this.blockDefs.set(block.definitionId, def);
            }
        });

        // Analyze graph
        this.processingOrder = GraphAnalyzer.getProcessingOrder(
            patch.blocks,
            patch.connections,
            this.blockDefs
        );


        // Analyze hardware mapping
        this.hardwareMapping = HardwareMappingAnalyzer.analyze(patch.blocks, this.blockDefs);
    }

    generate(): GeneratedCode {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!this.processingOrder.valid) {
            return {
                mainCpp: '',
                makefile: '',
                errors: [this.processingOrder.error || 'Invalid graph'],
                warnings: [],
            };
        }

        const fieldMappingErrors = buildFieldMappingConflictErrors(
            this.patch.hardwareConfig?.fieldControlMappings,
            this.patch.connections
        );
        if (fieldMappingErrors.length > 0) {
            return {
                mainCpp: '',
                makefile: '',
                errors: fieldMappingErrors,
                warnings: [],
            };
        }

        const polyVoiceGroupErrors = this.validatePolyVoiceGroups();
        if (polyVoiceGroupErrors.length > 0) {
            return {
                mainCpp: '',
                makefile: '',
                errors: polyVoiceGroupErrors,
                warnings: [],
            };
        }

        const polyVoiceBlanketErrors = this.validatePolyVoiceBlankets();
        if (polyVoiceBlanketErrors.length > 0) {
            return {
                mainCpp: '',
                makefile: '',
                errors: polyVoiceBlanketErrors,
                warnings: [],
            };
        }

        const includes = this.generateIncludes();
        const declarations = this.generateDeclarations();
        const midiHandler = this.generateMidiHandler();
        const audioCallback = this.generateAudioCallback();
        const mainFunction = this.generateMain();

        // Build mainCpp conditionally to avoid empty sections (Bug #014 fix)
        const sections = [includes, declarations];
        if (midiHandler) {
            sections.push(midiHandler);
        }
        sections.push(audioCallback, mainFunction);
        const mainCpp = sections.join('\n\n');

        const makefile = this.generateMakefile();

        return { mainCpp, makefile, errors, warnings };
    }

    // ===========================================================================
    // INCLUDES SECTION
    // ===========================================================================

    private generateIncludes(): string {
        const platform = this.getTargetPlatform();
        let header = 'daisy_seed.h';

        if (platform === 'pod') {
            header = 'daisy_pod.h';
        } else if (platform === 'field') {
            header = 'daisy_field.h';
        } else {
            header = 'daisy_seed.h';
        }

        const parts: string[] = [];

        // Header comment and includes (always)
        parts.push(`// Generated by DVPE - ${this.patch.metadata.name}
// ${new Date().toISOString()}

#include "${header}"
#include "daisysp.h"

using namespace daisy;
using namespace daisysp;`);

        // MAX_DELAY - only if delay-based blocks are used (Bug #014 fix)
        if (this.usesDelayBlock()) {
            parts.push(`
#define MAX_DELAY 96000`);
        }

        // MIDI globals - only if MIDI blocks are used (Bug #014 fix)
        if (this.usesMidiBlocks()) {
            parts.push(`
// ============================================================================
// GLOBAL MIDI STATE
// ============================================================================
// Variables updated by HandleMidiMessage
float midi_pitch_global = 0.0f;
float midi_velocity_global = 0.0f;
float midi_gate_global = 0.0f;`);
        }

        // Arpeggiator class - only if arpeggiator block is used (Bug #014 fix)
        if (this.usesArpeggiator()) {
            parts.push(this.generateArpeggiatorClass());
        }

        if (this.usesPolyGrainletVoice()) {
            parts.push(this.generatePolyGrainletVoiceClass());
        }

        if (this.usesPolyVoiceAllocator()) {
            parts.push(this.generatePolyVoiceGroupAllocatorClass());
        }

        return parts.join('\n');
    }

    private generatePolyVoiceGroupAllocatorClass(): string {
        return `
// ============================================================================
// POLY VOICE GROUP ALLOCATOR
// ============================================================================
template <size_t NumVoices>
class PolyVoiceGroupAllocator {
  public:
    void Init() {
        note_counter_ = 0;
        for(size_t i = 0; i < NumVoices; ++i) {
            voices_[i].active = false;
            voices_[i].gate = false;
            voices_[i].key_index = -1;
            voices_[i].freq_hz = 0.0f;
            voices_[i].age = 0;
        }
    }

    void UpdateKeys(DaisyField& field, int octave) {
        for(size_t i = 0; i < kNumPlayableKeys; ++i) {
            const size_t key_index = PlayableKeyAt(i);
            if(field.KeyboardRisingEdge(key_index)) {
                const float midi_note = KeyToMidi(key_index, octave);
                NoteOn(key_index, mtof(midi_note));
            }
            if(field.KeyboardFallingEdge(key_index)) {
                NoteOff(key_index);
            }
        }
    }

    float GetFrequency(size_t voice_index) const {
        if(voice_index >= NumVoices || !voices_[voice_index].active) {
            return 0.0f;
        }
        return voices_[voice_index].freq_hz;
    }

    bool GetGate(size_t voice_index) const {
        return voice_index < NumVoices && voices_[voice_index].active && voices_[voice_index].gate;
    }

    float GetPanOffset(size_t voice_index, float spread) const {
        if(voice_index >= NumVoices || voices_[voice_index].key_index < 0) {
            return 0.0f;
        }
        const float key_position = KeyPan(static_cast<size_t>(voices_[voice_index].key_index), spread);
        return key_position * 0.5f;
    }

  private:
    struct Voice {
        bool active;
        bool gate;
        int key_index;
        float freq_hz;
        uint32_t age;
    };

    static constexpr size_t kNumPlayableKeys = 13;

    static size_t PlayableKeyAt(size_t playable_index) {
        static const size_t playable_keys[kNumPlayableKeys] = {
            0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14,
        };
        return playable_keys[playable_index];
    }

    static float KeyToMidi(size_t key_index, int octave) {
        static const float scale[16] = {
            0.0f, 2.0f, 4.0f, 5.0f,
            7.0f, 9.0f, 11.0f, 12.0f,
            0.0f, 1.0f, 3.0f, 0.0f,
            6.0f, 8.0f, 10.0f, 0.0f,
        };
        return 24.0f + (12.0f * static_cast<float>(octave)) + scale[key_index];
    }

    static float KeyPan(size_t key_index, float spread) {
        const float key_position = (static_cast<float>(key_index) / 14.0f) * 2.0f - 1.0f;
        return fclamp(key_position * fclamp(spread, 0.0f, 1.0f), -1.0f, 1.0f);
    }

    Voice* FindVoiceForKey(size_t key_index) {
        for(size_t i = 0; i < NumVoices; ++i) {
            if(voices_[i].active && voices_[i].key_index == static_cast<int>(key_index)) {
                return &voices_[i];
            }
        }
        return nullptr;
    }

    Voice* FindFreeVoice() {
        for(size_t i = 0; i < NumVoices; ++i) {
            if(!voices_[i].active || !voices_[i].gate) {
                return &voices_[i];
            }
        }
        return nullptr;
    }

    Voice* FindOldestVoice() {
        Voice* oldest = &voices_[0];
        for(size_t i = 1; i < NumVoices; ++i) {
            if(voices_[i].age < oldest->age) {
                oldest = &voices_[i];
            }
        }
        return oldest;
    }

    void NoteOn(size_t key_index, float freq_hz) {
        Voice* voice = FindVoiceForKey(key_index);
        if(voice == nullptr) {
            voice = FindFreeVoice();
        }
        if(voice == nullptr) {
            voice = FindOldestVoice();
        }
        if(voice != nullptr) {
            voice->key_index = static_cast<int>(key_index);
            voice->freq_hz = freq_hz;
            voice->gate = true;
            voice->active = true;
            voice->age = ++note_counter_;
        }
    }

    void NoteOff(size_t key_index) {
        Voice* voice = FindVoiceForKey(key_index);
        if(voice != nullptr) {
            voice->gate = false;
        }
    }

    Voice voices_[NumVoices];
    uint32_t note_counter_;
};`;
    }

    private generatePolyGrainletVoiceClass(): string {
        return `
// ============================================================================
// POLY GRAINLET VOICE CLASS
// ============================================================================
template <size_t NumVoices>
class PolyGrainletVoice {
  public:
    void Init(float sample_rate) {
        note_counter_ = 0;
        for(size_t i = 0; i < NumVoices; ++i) {
            voices_[i].osc.Init(sample_rate);
            voices_[i].env.Init(sample_rate);
            voices_[i].env.SetSustainLevel(0.85f);
            voices_[i].env.SetDecayTime(0.08f);
            voices_[i].active = false;
            voices_[i].gate = false;
            voices_[i].key_index = -1;
            voices_[i].pan = 0.0f;
            voices_[i].age = 0;
        }
    }

    void UpdateKeys(DaisyField& field, int octave) {
        for(size_t i = 0; i < kNumPlayableKeys; ++i) {
            const size_t key_index = PlayableKeyAt(i);
            if(field.KeyboardRisingEdge(key_index)) {
                const float midi_note = KeyToMidi(key_index, octave);
                NoteOn(key_index, mtof(midi_note));
            }
            if(field.KeyboardFallingEdge(key_index)) {
                NoteOff(key_index);
            }
        }
    }

    void Process(float shape,
                 float formant_hz,
                 float bleed,
                 float attack_s,
                 float release_s,
                 float spread,
                 float output_gain,
                 float* left,
                 float* right) {
        float dry_left = 0.0f;
        float dry_right = 0.0f;

        for(size_t i = 0; i < NumVoices; ++i) {
            Voice& voice = voices_[i];
            if(!voice.active) {
                continue;
            }

            voice.osc.SetShape(fclamp(shape, 0.0f, 1.0f));
            voice.osc.SetFormantFreq(fmaxf(20.0f, formant_hz));
            voice.osc.SetBleed(fclamp(bleed, 0.0f, 1.0f));
            voice.env.SetAttackTime(fmaxf(0.001f, attack_s));
            voice.env.SetReleaseTime(fmaxf(0.001f, release_s));

            if(voice.key_index >= 0) {
                voice.pan = KeyPan(static_cast<size_t>(voice.key_index), spread);
            }

            const float amp = voice.env.Process(voice.gate);
            if(!voice.gate && !voice.env.IsRunning()) {
                voice.active = false;
                voice.key_index = -1;
                continue;
            }

            const float sig = voice.osc.Process() * amp;
            const float left_gain = sqrtf(0.5f * (1.0f - voice.pan));
            const float right_gain = sqrtf(0.5f * (1.0f + voice.pan));
            dry_left += sig * left_gain;
            dry_right += sig * right_gain;
        }

        *left = fclamp(dry_left * output_gain, -1.0f, 1.0f);
        *right = fclamp(dry_right * output_gain, -1.0f, 1.0f);
    }

  private:
    struct Voice {
        GrainletOscillator osc;
        Adsr env;
        bool active;
        bool gate;
        int key_index;
        float pan;
        uint32_t age;
    };

    static constexpr size_t kNumPlayableKeys = 13;

    static size_t PlayableKeyAt(size_t playable_index) {
        static const size_t playable_keys[kNumPlayableKeys] = {
            0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14,
        };
        return playable_keys[playable_index];
    }

    static float KeyToMidi(size_t key_index, int octave) {
        static const float scale[16] = {
            0.0f, 2.0f, 4.0f, 5.0f,
            7.0f, 9.0f, 11.0f, 12.0f,
            0.0f, 1.0f, 3.0f, 0.0f,
            6.0f, 8.0f, 10.0f, 0.0f,
        };
        return 24.0f + (12.0f * static_cast<float>(octave)) + scale[key_index];
    }

    static float KeyPan(size_t key_index, float spread) {
        const float key_position = (static_cast<float>(key_index) / 14.0f) * 2.0f - 1.0f;
        return fclamp(key_position * fclamp(spread, 0.0f, 1.0f), -1.0f, 1.0f);
    }

    Voice* FindVoiceForKey(size_t key_index) {
        for(size_t i = 0; i < NumVoices; ++i) {
            if(voices_[i].active && voices_[i].key_index == static_cast<int>(key_index)) {
                return &voices_[i];
            }
        }
        return nullptr;
    }

    Voice* FindFreeVoice() {
        for(size_t i = 0; i < NumVoices; ++i) {
            if(!voices_[i].active) {
                return &voices_[i];
            }
        }
        return nullptr;
    }

    Voice* FindOldestVoice() {
        Voice* oldest = &voices_[0];
        for(size_t i = 1; i < NumVoices; ++i) {
            if(voices_[i].age < oldest->age) {
                oldest = &voices_[i];
            }
        }
        return oldest;
    }

    void NoteOn(size_t key_index, float freq_hz) {
        Voice* voice = FindVoiceForKey(key_index);
        if(voice == nullptr) {
            voice = FindFreeVoice();
        }
        if(voice == nullptr) {
            voice = FindOldestVoice();
        }
        if(voice != nullptr) {
            voice->key_index = static_cast<int>(key_index);
            voice->pan = KeyPan(key_index, 0.0f);
            voice->gate = true;
            voice->active = true;
            voice->age = ++note_counter_;
            voice->osc.SetFreq(freq_hz);
            voice->env.Retrigger(false);
        }
    }

    void NoteOff(size_t key_index) {
        Voice* voice = FindVoiceForKey(key_index);
        if(voice != nullptr) {
            voice->gate = false;
        }
    }

    Voice voices_[NumVoices];
    uint32_t note_counter_;
};`;
    }

    /**
     * Generate the SimpleArpeggiator class (extracted for conditional inclusion)
     */
    private generateArpeggiatorClass(): string {
        return `
// ============================================================================
// ARPEGGIATOR CLASS
// ============================================================================
class SimpleArpeggiator {
public:
    enum class Mode { UP, DOWN, UP_DOWN, RANDOM, AS_PLAYED };

    void Init(float sample_rate) {
        sample_rate_ = sample_rate;
        mode_ = Mode::UP;
        octave_range_ = 1;
        gate_length_ = 0.5f;
        current_note_index_ = 0;
        going_up_ = true;
        last_clock_high_ = false;
        gate_active_ = false;
        gate_timer_ = 0.0f;
        current_pitch_ = 0.0f;
        current_velocity_ = 0.0f;
        step_duration_invalid_ = true;
    }

    void Process(bool clock_high, bool reset) {
        if(reset) {
            current_note_index_ = 0;
            going_up_ = true;
        }

        // Clock edge detection
        if(clock_high && !last_clock_high_) {
             AdvanceStep();
        }
        last_clock_high_ = clock_high;
    }

    void OnNoteOn(uint8_t note, uint8_t vel) {
        if(vel == 0) { OnNoteOff(note); return; }
        bool found = false;
        for(auto& n : held_notes_) { if(n.note == note) { n.vel = vel; found = true; break; } }
        if(!found) held_notes_.push_back({note, vel});
        UpdateSortedNotes();
    }

    void OnNoteOff(uint8_t note) {
        held_notes_.erase(std::remove_if(held_notes_.begin(), held_notes_.end(), [note](const auto& n){ return n.note == note; }), held_notes_.end());
        UpdateSortedNotes();
    }

    float GetPitch() { return current_pitch_; } // Scaled 0-1
    float GetGate() { return gate_active_ ? 1.0f : 0.0f; }
    float GetVelocity() { return current_velocity_; }

    void SetMode(float m) { mode_ = static_cast<Mode>((int)m); UpdateSortedNotes(); }
    void SetOctaveRange(float o) { octave_range_ = (int)o; }
    void SetGateLength(float g) { gate_length_ = g; }

private:
    struct Note { uint8_t note; uint8_t vel; };
    std::vector<Note> held_notes_;
    std::vector<Note> play_buffer_;
    Mode mode_;
    int octave_range_;
    float gate_length_;
    float sample_rate_;
    int current_note_index_;
    bool going_up_;
    bool last_clock_high_;
    bool gate_active_;
    float gate_timer_;
    float current_pitch_;
    float current_velocity_;
    bool step_duration_invalid_;

    void UpdateSortedNotes() {
       play_buffer_ = held_notes_;
       if(mode_ == Mode::AS_PLAYED) return;
       // Standard sort
       std::sort(play_buffer_.begin(), play_buffer_.end(), [](const Note& a, const Note& b) { return a.note < b.note; });
    }

    void AdvanceStep() {
        if(play_buffer_.empty()) { gate_active_ = false; return; }

        if(mode_ == Mode::RANDOM) {
             current_note_index_ = rand() % play_buffer_.size();
        } else {
             // Simple cycle logic
             current_note_index_ = (current_note_index_ + 1) % play_buffer_.size();
        }

        Note n = play_buffer_[current_note_index_];
        current_pitch_ = (n.note) / 127.0f;
        current_velocity_ = n.vel / 127.0f;
        gate_active_ = true;
    }
};`;
    }

    // ===========================================================================
    // DECLARATIONS SECTION
    // ===========================================================================

    private generateDeclarations(): string {
        const lines: string[] = [];
        const platform = this.getTargetPlatform();
        lines.push('// Detected Platform: ' + platform);

        lines.push('// Hardware');
        switch (platform) {
            case 'pod': lines.push('DaisyPod hw;'); break;
            case 'field': lines.push('DaisyField hw;'); break;
            case 'seed': default: lines.push('DaisySeed hw;'); break;
        }
        lines.push('');

        // Declarations for Seed Mapped Controls (Switches, LEDs)
        if (platform === 'seed' && this.patch.hardwareConfig?.pinMapping) {
            const mapping = this.patch.hardwareConfig.pinMapping;
            // Check for mapped switches
            ['switch_1', 'switch_2'].forEach(id => {
                if (mapping[id]) lines.push(`Switch ${id};`);
            });
            // Check for mapped LEDs
            ['led_1', 'led_2'].forEach(id => {
                if (mapping[id]) lines.push(`Led ${id};`);
            });
            lines.push('');
        }

        lines.push('// DSP Modules');

        const blanketMemberIds = this.getPolyVoiceBlanketMemberIds();
        this.getPolyVoiceBlankets().forEach(blanket => {
            const instanceName = this.getPolyVoiceBlanketInstanceName(blanket);
            lines.push(`PolyVoiceGroupAllocator<${this.getPolyVoiceBlanketVoiceCount(blanket)}> ${instanceName}_voices;`);
            this.generatePolyVoiceBlanketDeclarations(blanket, lines);
        });

        this.patch.blocks.forEach(block => {
            if (blanketMemberIds.has(block.id)) return;

            const def = this.blockDefs.get(block.definitionId);
            if (!def) return;

            const instanceName = this.getInstanceName(block);

            // Phase 13.3: custom blocks are flattened into internal modules
            if (this.isCustomBlockDefinition(def)) {
                if (this.isPolyVoiceGroupDefinition(def)) {
                    lines.push(`PolyVoiceGroupAllocator<${this.getPolyVoiceCount(block)}> ${instanceName}_voices;`);
                    this.generatePolyVoiceGroupDeclarations(instanceName, def, lines, this.getPolyVoiceCount(block));
                } else {
                    this.generateCustomDeclarations(instanceName, def, lines);
                }
                return;
            }

            // Phase 13: Inline blocks (no class instance)
            if (def.cppInlineProcess || def.cppProcessTemplate) {
                // Generate state variables
                if (def.cppStateVars) {
                    def.cppStateVars.forEach(v => {
                        lines.push(`${v.type} state_${instanceName}_${v.name} = ${v.init};`);
                    });
                }
                return;
            }

            // Skip I/O blocks without DSP class and inline math blocks
            if (this.shouldSkipDeclaration(def.id)) {
                // Special case: Switch needs state variable for latch
                if (def.id === 'switch') {
                    lines.push(`bool latch_${instanceName} = false;`);
                }
                return;
            }

            const className = def.className.replace('daisysp::', '');

            if (def.id === 'poly_grainlet_voice') {
                lines.push(`PolyGrainletVoice<${this.getPolyVoiceCount(block)}> ${instanceName};`);
            } else {
                lines.push(`${className} ${instanceName};`);
            }
        });

        // Signal routing variables
        lines.push('');
        lines.push('// Signal Variables');

        this.getPolyVoiceBlankets().forEach(blanket => {
            this.generatePolyVoiceBlanketSignalDeclarations(blanket, lines);
        });

        this.patch.blocks.forEach(block => {
            if (blanketMemberIds.has(block.id)) return;

            const def = this.blockDefs.get(block.definitionId);
            if (!def) return;

            const instanceName = this.getInstanceName(block);

            // Phase 13.3: include flattened internal signal variables
            if (this.isCustomBlockDefinition(def)) {
                if (this.isPolyVoiceGroupDefinition(def)) {
                    this.generatePolyVoiceGroupSignalDeclarations(instanceName, def, lines, this.getPolyVoiceCount(block));
                } else {
                    this.generateCustomSignalDeclarations(instanceName, def, lines);
                }
            }

            def.ports
                .filter(p => p.direction === PortDirection.OUTPUT)
                .forEach(port => {
                    this.appendSignalDeclaration(lines, port.signalType, instanceName, port.id);
                });
        });

        return lines.join('\n');
    }

    // ===========================================================================
    // MIDI HANDLER
    // ===========================================================================

    private generateMidiHandler(): string {
        // Bug #014 fix: Only generate MIDI handler if MIDI blocks are used
        if (!this.usesMidiBlocks()) {
            return '';
        }

        const lines: string[] = [];

        lines.push('void HandleMidiMessage(MidiEvent m) {');
        lines.push('    switch(m.type) {');
        lines.push('        case NoteOn:');
        lines.push('        {');
        lines.push('            NoteOnEvent p = m.AsNoteOn();');
        lines.push('            if(p.velocity == 0) {');
        lines.push('                // Note Off via Velocity 0');
        // Handle all Arpeggiators
        this.patch.blocks.forEach(block => {
            const def = this.blockDefs.get(block.definitionId);
            if (def && def.id === 'arpeggiator') {
                const name = this.getInstanceName(block);
                lines.push(`                ${name}.OnNoteOff(p.note);`);
            }
        });
        lines.push('            } else {');
        lines.push('                // Note On');
        // Update Globals for MidiNote
        lines.push(`                midi_pitch_global = mtof(p.note) / 1000.0f; // Placeholder freq, MidiNote uses Scaled 0-1, let's match CodeGen logic`);
        lines.push(`                // Actually MidiNote logic in generateMidiNoteCode says "requires external handler to update globals"`);
        lines.push(`                // Let's implement standard MidiNote globals update here too if needed, but primarily Arpeggiator`);
        lines.push(`                midi_pitch_global = p.note / 127.0f;`);
        lines.push(`                midi_velocity_global = p.velocity / 127.0f;`);
        lines.push(`                midi_gate_global = 1.0f;`);
        // Handle all Arpeggiators
        this.patch.blocks.forEach(block => {
            const def = this.blockDefs.get(block.definitionId);
            if (def && def.id === 'arpeggiator') {
                const name = this.getInstanceName(block);
                lines.push(`                ${name}.OnNoteOn(p.note, p.velocity);`);
            }
        });
        lines.push('            }');
        lines.push('        }');
        lines.push('        break;');
        lines.push('        case NoteOff:');
        lines.push('        {');
        lines.push('            NoteOffEvent p = m.AsNoteOff();');
        lines.push(`            midi_gate_global = 0.0f;`);
        // Handle all Arpeggiators
        this.patch.blocks.forEach(block => {
            const def = this.blockDefs.get(block.definitionId);
            if (def && def.id === 'arpeggiator') {
                const name = this.getInstanceName(block);
                lines.push(`            ${name}.OnNoteOff(p.note);`);
            }
        });
        lines.push('        }');
        lines.push('        break;');
        lines.push('        default: break;');
        lines.push('    }');
        lines.push('}');
        lines.push('');
        return lines.join('\n');
    }

    // ===========================================================================
    // AUDIO CALLBACK
    // ===========================================================================

    private generateAudioCallback(): string {
        const lines: string[] = [];
        const platform = this.getTargetPlatform();

        lines.push('void AudioCallback(AudioHandle::InputBuffer in,');
        lines.push('                   AudioHandle::OutputBuffer out,');
        lines.push('                   size_t size) {');
        if (platform !== 'seed') {
            lines.push('    hw.ProcessAllControls();');
        }
        lines.push('');

        // Read knobs
        lines.push('    // Read hardware controls');
        if (this.hasFieldControlMappings()) {
            lines.push('    const bool field_sw1_held = hw.GetSwitch(DaisyField::SW_1)->Pressed();');
            lines.push('    const bool field_sw2_held = hw.GetSwitch(DaisyField::SW_2)->Pressed();');
            lines.push('    const int field_mapping_layer = field_sw1_held && field_sw2_held ? 3 : (field_sw2_held ? 2 : (field_sw1_held ? 1 : 0));');
        }

        // Handle Knobs
        if (platform === 'seed') {
            const mapping = this.patch.hardwareConfig?.pinMapping || {};
            // We need to keep track of which ADC index corresponds to which knob
            // The logic must match Init() order!
            let adcIndex = 0;
            for (let i = 1; i <= 4; i++) {
                const id = `knob_${i}`;
                if (mapping[id]) {
                    // hw.knob[i] doesn't exist on seed. User declared local var?
                    // We need global vars or just local usage?
                    // generateKnobCode usage: hw.knob[channel].Value()
                    // So we must spoof it or change generateKnobCode.
                    // Easier: map to a standardized array if we want compatibility
                    // Or change generateKnobCode.
                    // For now, let's create local float variables matching standardized names
                    // And depend on generateKnobCode to use them?
                    // generateKnobCode currently uses `hw.knob[channel].Value()`.
                    // We should update generateKnobCode to use a getter helper.

                    lines.push(`    float knob_${i}_val = hw.adc.GetFloat(${adcIndex});`);
                    adcIndex++;
                } else {
                    lines.push(`    float knob_${i}_val = 0.0f;`);
                }
            }

            // Process Switches for latch handling
            ['switch_1', 'switch_2'].forEach(id => {
                if (mapping[id]) lines.push(`    ${id}.Debounce();`);
            });

        } else {
            // Pod / Field: No pre-reading needed as we access hw.knob directly in generateKnobCode
            // for compatibility with existing structure.
        }

        /* 
           Compatibility Note: 
           generateKnobCode currently emits `hw.knob[channel].Value()`.
           For Seed this is invalid.
           We MUST update generateKnobCode to be platform aware or use a common macro/variable.
        */

        // Read keys (Field only usually)
        if (platform === 'field') {
            lines.push('');
            lines.push('    // Read keyboard');
            this.hardwareMapping.keys.forEach((blockId, index) => {
                const block = this.patch.blocks.find(b => b.id === blockId);
                if (block) {
                    const instanceName = this.getInstanceName(block);
                    lines.push(`    bool key_${instanceName} = hw.KeyboardState(${index});`);
                }
            });
        }

        const preSampleProcessing = this.generatePreSampleProcessing();
        if (preSampleProcessing.length > 0) {
            lines.push('');
            lines.push('    // Pre-sample event processing');
            preSampleProcessing.forEach(line => lines.push('    ' + line));
        }

        lines.push('');
        lines.push('    float sr = hw.AudioSampleRate();');
        lines.push('    for (size_t i = 0; i < size; i++) {');

        // Generate processing code for each block in order
        const generatedBlankets = new Set<string>();
        this.processingOrder.blocks.forEach(blockId => {
            const blanket = this.getPolyVoiceBlanketForMember(blockId);
            if (blanket) {
                if (!generatedBlankets.has(blanket.id)) {
                    generatedBlankets.add(blanket.id);
                    const code = this.generatePolyVoiceBlanketProcessing(blanket);
                    if (code.length > 0) {
                        lines.push('');
                        lines.push(`        // ${blanket.label || 'Poly Voice Blanket'}`);
                        code.forEach(line => lines.push('        ' + line));
                    }
                }
                return;
            }

            const block = this.patch.blocks.find(b => b.id === blockId);
            if (!block) return;

            const def = this.blockDefs.get(block.definitionId);
            if (!def) return;

            const code = this.generateBlockProcessing(block, def);
            if (code.length > 0) {
                lines.push('');
                lines.push(`        // ${def.displayName}`);
                code.forEach(line => lines.push('        ' + line));
            }
        });

        // Output assignment
        lines.push('');
        lines.push('        // Output');
        const outputCode = this.generateOutputAssignment();
        outputCode.forEach(line => lines.push('        ' + line));

        lines.push('    }');
        lines.push('}');

        return lines.join('\n');
    }

    // ===========================================================================
    // BLOCK-SPECIFIC CODE GENERATORS
    // ===========================================================================

    private generateBlockProcessing(block: BlockInstance, def: BlockDefinition): string[] {
        const lines: string[] = [];

        // Custom Block Handling (Phase 13.3 - flattening)
        if (this.isCustomBlockDefinition(def)) {
            if (this.isPolyVoiceGroupDefinition(def)) {
                return this.generatePolyVoiceGroupProcessing(block, def);
            }
            return this.generateCustomBlockProcessing(block, def);
        }

        const instanceName = this.getInstanceName(block);

        // Phase 13: Inline Processing (Arithmetic, Math, Utility)
        if (def.cppInlineProcess || def.cppProcessTemplate) {
            return this.generateInlineProcessCode(block, def);
        }

        switch (def.id) {
            case 'oscillator':
                lines.push(...this.generateOscillatorCode(block, instanceName));
                break;
            case 'fm2':
                lines.push(...this.generateFm2Code(block, instanceName));
                break;
            case 'particle':
                lines.push(...this.generateParticleCode(block, instanceName));
                break;
            case 'grainlet_oscillator':
                lines.push(...this.generateGrainletCode(block, instanceName));
                break;
            case 'poly_grainlet_voice':
                lines.push(...this.generatePolyGrainletVoiceCode(block, instanceName));
                break;
            case 'moog_ladder':
                lines.push(...this.generateMoogLadderCode(block, instanceName));
                break;
            case 'svf':
                lines.push(...this.generateSvfCode(block, instanceName));
                break;
            case 'adsr':
                lines.push(...this.generateAdsrCode(block, instanceName));
                break;
            case 'ad_env':
                lines.push(...this.generateAdEnvCode(block, instanceName));
                break;
            case 'vca':
                lines.push(...this.generateVcaCode(block, instanceName));
                break;
            case 'mixer':
                lines.push(...this.generateMixerCode(block, instanceName));
                break;
            case 'delay':
            case 'delay_line':  // Alias for block definition ID
                lines.push(...this.generateDelayCode(block, instanceName));
                break;
            case 'reverb':
            case 'reverb_sc':  // Alias for block definition ID
                lines.push(...this.generateReverbCode(block, instanceName));
                break;
            case 'compressor':
                lines.push(...this.generateCompressorCode(block, instanceName));
                break;
            case 'overdrive':
                lines.push(...this.generateOverdriveCode(block, instanceName));
                break;
            case 'compressor_expander':
                lines.push(...this.generateCompressorExpanderCode(block, instanceName));
                break;
            case 'sola_time_stretch':
                lines.push(...this.generateSolaTimeStretchCode(block, instanceName));
                break;
            case 'crosstalk_canceller':
                lines.push(...this.generateCrosstalkCancellerCode(block, instanceName));
                break;
            case 'robotization':
                lines.push(...this.generateRobotizationCode(block, instanceName));
                break;
            case 'whisperization':
                lines.push(...this.generateWhisperizationCode(block, instanceName));
                break;
            case 'yin_pitch':
                lines.push(...this.generateYinPitchCode(block, instanceName));
                break;
            case 'envelope_follower':
                lines.push(...this.generateEnvelopeFollowerCode(block, instanceName));
                break;
            case 'arpeggiator':
                lines.push(...this.generateArpeggiatorCode(block, instanceName));
                break;
            case 'knob':
                lines.push(...this.generateKnobCode(block, instanceName));
                break;
            case 'key':
                lines.push(...this.generateKeyCode(block, instanceName));
                break;
            case 'gate_trigger_in':
                lines.push(...this.generateGateTriggerInCode(block, instanceName));
                break;
            case 'encoder':
                lines.push(...this.generateEncoderCode(block, instanceName));
                break;
            // ===== PHASE 1: Core DSP Blocks =====
            case 'lfo':
                lines.push(...this.generateLfoCode(block, instanceName));
                break;
            case 'whitenoise':
                lines.push(...this.generateWhiteNoiseCode(block, instanceName));
                break;
            case 'chorus':
                lines.push(...this.generateChorusCode(block, instanceName));
                break;
            case 'flanger':
                lines.push(...this.generateFlangerCode(block, instanceName));
                break;
            case 'onepole':
                lines.push(...this.generateOnePoleCode(block, instanceName));
                break;
            case 'atone':
                lines.push(...this.generateAToneCode(block, instanceName));
                break;
            case 'dcblock':
                lines.push(...this.generateDCBlockCode(block, instanceName));
                break;
            case 'limiter':
                lines.push(...this.generateLimiterCode(block, instanceName));
                break;
            case 'fold':
                lines.push(...this.generateFoldCode(block, instanceName));
                break;
            // ===== PHASE 2: Math & Utility Blocks =====
            case 'add':
                lines.push(...this.generateAddCode(block, instanceName));
                break;
            case 'multiply':
                lines.push(...this.generateMultiplyCode(block, instanceName));
                break;
            case 'subtract':
                lines.push(...this.generateSubtractCode(block, instanceName));
                break;
            case 'divide':
                lines.push(...this.generateDivideCode(block, instanceName));
                break;
            case 'gain':
                lines.push(...this.generateGainCode(block, instanceName));
                break;
            case 'bypass':
                lines.push(...this.generateBypassCode(block, instanceName));
                break;
            case 'sample_delay':
                lines.push(...this.generateSampleDelayCode(block, instanceName));
                break;
            case 'cv_to_freq':
                lines.push(...this.generateCvToFreqCode(block, instanceName));
                break;
            case 'mux':
                lines.push(...this.generateMuxCode(block, instanceName));
                break;
            case 'demux':
                lines.push(...this.generateDemuxCode(block, instanceName));
                break;
            case 'linear_vca':
                lines.push(...this.generateLinearVcaCode(block, instanceName));
                break;
            // ===== PHASE 3: Drums =====
            case 'hihat':
                lines.push(...this.generateHiHatCode(block, instanceName));
                break;
            case 'analog_bass_drum':
                lines.push(...this.generateAnalogBassDrumCode(block, instanceName));
                break;
            case 'analog_snare_drum':
                lines.push(...this.generateAnalogSnareDrumCode(block, instanceName));
                break;
            case 'synth_bass_drum':
                lines.push(...this.generateSynthBassDrumCode(block, instanceName));
                break;
            case 'synth_snare_drum':
                lines.push(...this.generateSynthSnareDrumCode(block, instanceName));
                break;
            // ===== PHASE 3: Physical Modeling & Effects =====
            case 'drip':
                lines.push(...this.generateDripCode(block, instanceName));
                break;
            case 'modal_voice':
                lines.push(...this.generateModalVoiceCode(block, instanceName));
                break;
            case 'string_voice':
                lines.push(...this.generateStringVoiceCode(block, instanceName));
                break;
            case 'wavefolder':
                lines.push(...this.generateWavefolderCode(block, instanceName));
                break;
            case 'dust':
                lines.push(...this.generateDustCode(block, instanceName));
                break;
            // ===== PHASE 4A: Advanced Effects =====
            case 'decimator':
                lines.push(...this.generateDecimatorCode(block, instanceName));
                break;
            case 'phaser':
                lines.push(...this.generatePhaserCode(block, instanceName));
                break;
            case 'tremolo':
                lines.push(...this.generateTremoloCode(block, instanceName));
                break;
            case 'autowah':
                lines.push(...this.generateAutowahCode(block, instanceName));
                break;
            case 'resonator':
                lines.push(...this.generateResonatorCode(block, instanceName));
                break;
            case 'pluck':
                lines.push(...this.generatePluckCode(block, instanceName));
                break;
            case 'crossfade':
                lines.push(...this.generateCrossFadeCode(block, instanceName));
                break;
            case 'sample_rate_reducer':
                lines.push(...this.generateSampleRateReducerCode(block, instanceName));
                break;
            // ===== PHASE 4B: Inline Utilities =====
            case 'pan':
                lines.push(...this.generatePanCode(block, instanceName));
                break;
            case 'balance':
                lines.push(...this.generateBalanceCode(block, instanceName));
                break;
            case 'softclip':
                lines.push(...this.generateSoftClipCode(block, instanceName));
                break;
            case 'hardclip':
                lines.push(...this.generateHardClipCode(block, instanceName));
                break;
            case 'rectifier':
                lines.push(...this.generateRectifierCode(block, instanceName));
                break;
            case 'slew':
                lines.push(...this.generateSlewCode(block, instanceName));
                break;
            case 'smooth':
                lines.push(...this.generateSmoothCode(block, instanceName));
                break;
            case 'gate':
                lines.push(...this.generateGateCode(block, instanceName));
                break;
            // ===== PHASE 4C: Complex Blocks =====
            case 'bitcrush':
                lines.push(...this.generateBitcrushCode(block, instanceName));
                break;
            case 'oscillator_bank':
                lines.push(...this.generateOscillatorBankCode(block, instanceName));
                break;
            case 'harmonic_oscillator':
                lines.push(...this.generateHarmonicOscillatorCode(block, instanceName));
                break;
            case 'variable_saw_oscillator':
                lines.push(...this.generateVariableSawOscillatorCode(block, instanceName));
                break;
            case 'distortion':
                lines.push(...this.generateDistortionCode(block, instanceName));
                break;
            case 'stereo_mixer':
                lines.push(...this.generateStereoMixerCode(block, instanceName));
                break;
            case 'pitch_shifter':
                lines.push(...this.generatePitchShifterCode(block, instanceName));
                break;
            // ===== PHASE 5: Hardware I/O =====
            case 'midi_note':
                lines.push(...this.generateMidiNoteCode(block, instanceName));
                break;
            case 'midi_cc':
                lines.push(...this.generateMidiCCCode(block, instanceName));
                break;
            case 'cv_input':
                lines.push(...this.generateCVInputCode(block, instanceName));
                break;
            case 'cv_output':
                lines.push(...this.generateCVOutputCode(block, instanceName));
                break;
            case 'gate_output':
                lines.push(...this.generateGateOutputCode(block, instanceName));
                break;
            case 'led_output':
                lines.push(...this.generateLEDOutputCode(block, instanceName));
                break;
            // ===== PHASE 12: New Features =====
            case 'slider':
                lines.push(...this.generateSliderCode(block, instanceName));
                break;
            case 'switch':
                lines.push(...this.generateSwitchCode(block, instanceName));
                break;
            case 'abs':
                lines.push(...this.generateAbsCode(block, instanceName));
                break;
            case 'exp':
                lines.push(...this.generateExpCode(block, instanceName));
                break;
            case 'pow2':
                lines.push(...this.generatePow2Code(block, instanceName));
                break;
            case 'dc_source':
                lines.push(...this.generateDcSourceCode(block, instanceName));
                break;
        }

        return lines;
    }

    private generateOscillatorCode(block: BlockInstance, name: string): string[] {
        const lines: string[] = [];
        const freqCV = this.getInputConnection(block.id, 'freq_cv');
        const waveCV = this.getInputConnection(block.id, 'waveform_cv');
        const ampCV = this.getInputConnection(block.id, 'amp_cv');
        const pwCV = this.getInputConnection(block.id, 'pw_cv');

        let freqExpr = this.formatFloat(block.parameterValues['freq'] ?? 440);
        if (freqCV) {
            const freqVar = this.getSourceVariable(freqCV);
            // V/Octave: base * 2^cv
            freqExpr = `${freqExpr} * powf(2.0f, ${freqVar})`;
        }
        lines.push(`${name}.SetFreq(${freqExpr});`);

        // Amplitude modulation
        if (ampCV) {
            const ampVar = this.getSourceVariable(ampCV);
            const baseAmp = this.formatFloat(block.parameterValues['amp'] ?? 0.5);
            lines.push(`${name}.SetAmp(${baseAmp} * fabsf(${ampVar}));`);
        }

        // Pulse width modulation
        if (pwCV) {
            const pwVar = this.getSourceVariable(pwCV);
            const basePw = this.formatFloat(block.parameterValues['pw'] ?? 0.5);
            lines.push(`${name}.SetPw(${basePw} + ${pwVar});`);
        }

        // Waveform modulation
        if (waveCV) {
            const waveVar = this.getSourceVariable(waveCV);
            // Map 0..1 to 0..7
            // Oscillator waveforms: WAVE_SIN, WAVE_TRI, WAVE_SAW, WAVE_RAMP, WAVE_SQUARE, 
            // WAVE_POLYBLEP_TRI, WAVE_POLYBLEP_SAW, WAVE_POLYBLEP_SQUARE (8 total)
            lines.push(`${name}.SetWaveform((uint8_t)(fminf(7.0f, fmaxf(0.0f, fabsf(${waveVar}) * 7.9f))));`);
        }

        lines.push(`sig_${name}_out = ${name}.Process();`);
        return lines;
    }

    private generateOscillatorBankCode(block: BlockInstance, name: string): string[] {
        const lines: string[] = [];

        // Handle Freq manually to match Oscillator behavior (Linear FM)
        const freqCV = this.getInputConnection(block.id, 'freq_cv');
        let freqExpr = this.formatFloat(block.parameterValues['freq'] ?? 440);
        if (freqCV) {
            const freqVar = this.getSourceVariable(freqCV);
            // V/Octave: base * 2^cv
            freqExpr = `${freqExpr} * powf(2.0f, ${freqVar})`;
        }
        lines.push(`${name}.SetFreq(${freqExpr});`);

        // Use generic writer for amplitudes (SetSingleAmp with index) and Gain
        // Note: Generic writer adds CV if present.
        this.writeParameterSetters(block, name, lines, ['freq']);

        lines.push(`sig_${name}_out = ${name}.Process();`);
        return lines;
    }

    private generateHarmonicOscillatorCode(block: BlockInstance, name: string): string[] {
        const lines: string[] = [];

        // Handle Freq manually
        const freqCV = this.getInputConnection(block.id, 'freq_cv');
        let freqExpr = this.formatFloat(block.parameterValues['freq'] ?? 440);
        if (freqCV) {
            const freqVar = this.getSourceVariable(freqCV);
            // V/Octave: base * 2^cv
            freqExpr = `${freqExpr} * powf(2.0f, ${freqVar})`;
        }
        lines.push(`${name}.SetFreq(${freqExpr});`);

        // Handle other params via generic writer
        this.writeParameterSetters(block, name, lines, ['freq']);

        lines.push(`sig_${name}_out = ${name}.Process();`);
        return lines;
    }

    private generateVariableSawOscillatorCode(block: BlockInstance, name: string): string[] {
        const lines: string[] = [];

        // Handle Freq manually
        const freqCV = this.getInputConnection(block.id, 'freq_cv');
        let freqExpr = this.formatFloat(block.parameterValues['freq'] ?? 440);
        if (freqCV) {
            const freqVar = this.getSourceVariable(freqCV);
            // V/Octave: base * 2^cv
            freqExpr = `${freqExpr} * powf(2.0f, ${freqVar})`;
        }
        lines.push(`${name}.SetFreq(${freqExpr});`);

        // Handle PW/Shape/Waveshape via generic writer
        this.writeParameterSetters(block, name, lines, ['freq']);

        lines.push(`sig_${name}_out = ${name}.Process();`);
        return lines;
    }

    private generateFm2Code(block: BlockInstance, name: string): string[] {
        const freqCV = this.getInputConnection(block.id, 'freq_cv');
        const lines: string[] = [];

        if (freqCV) {
            const sourceVar = this.getSourceVariable(freqCV);
            const baseFreq = block.parameterValues['frequency'] ?? 440;
            lines.push(`${name}.SetFrequency(${this.formatFloat(baseFreq)} * (1.0f + ${sourceVar}));`);
        }

        lines.push(`sig_${name}_out = ${name}.Process();`);
        return lines;
    }

    private generateParticleCode(block: BlockInstance, name: string): string[] {
        const syncIn = this.getInputConnection(block.id, 'sync');
        const syncVar = syncIn ? this.getSourceVariable(syncIn) : 'false';
        return [`sig_${name}_out = ${name}.Process(${syncVar});`];
    }

    private generateGrainletCode(block: BlockInstance, name: string): string[] {
        const lines: string[] = [];
        this.writeParameterSetters(block, name, lines);
        lines.push(`sig_${name}_out = ${name}.Process();`);
        return lines;
    }

    private generatePolyGrainletVoiceCode(block: BlockInstance, name: string): string[] {
        const shape = this.getParameterExpression(block, 'shape', 0.35);
        const formant = this.getParameterExpression(block, 'formant_freq', 1200);
        const bleed = this.getParameterExpression(block, 'bleed', 0.25);
        const attack = this.getParameterExpression(block, 'attack', 0.01);
        const release = this.getParameterExpression(block, 'release', 0.25);
        const spread = this.getParameterExpression(block, 'spread', 0.4);
        const gain = this.getParameterExpression(block, 'output_gain', 0.18);

        return [
            `${name}.Process(${shape}, ${formant}, ${bleed}, ${attack}, ${release}, ${spread}, ${gain}, &sig_${name}_left, &sig_${name}_right);`,
        ];
    }

    private generateMoogLadderCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';

        const freqCV = this.getInputConnection(block.id, 'freq_cv');
        const lines: string[] = [];

        if (freqCV) {
            const sourceVar = this.getSourceVariable(freqCV);
            const baseCutoff = block.parameterValues['cutoff'] ?? 1000;
            lines.push(`${name}.SetFreq(${this.formatFloat(baseCutoff)} + (${sourceVar} * 10000.0f));`);
        }

        lines.push(`sig_${name}_out = ${name}.Process(${inputVar});`);
        return lines;
    }

    private generateSvfCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';

        const lines: string[] = [];
        this.writeParameterSetters(block, name, lines);
        lines.push(
            `${name}.Process(${inputVar});`,
            `sig_${name}_low = ${name}.Low();`,
            `sig_${name}_high = ${name}.High();`,
            `sig_${name}_band = ${name}.Band();`,
            `sig_${name}_notch = ${name}.Notch();`,
        );
        return lines;
    }

    private generateAdsrCode(block: BlockInstance, name: string): string[] {
        const gateVar = this.getInputExpression(block, 'gate', 'false');
        const attack = this.getParameterExpression(block, 'attack', 0.01);
        const decay = this.getParameterExpression(block, 'decay', 0.1);
        const sustain = this.getParameterExpression(block, 'sustain', 0.7);
        const release = this.getParameterExpression(block, 'release', 0.3);
        return [
            `${name}.SetTime(ADSR_SEG_ATTACK, ${attack});`,
            `${name}.SetTime(ADSR_SEG_DECAY, ${decay});`,
            `${name}.SetSustainLevel(${sustain});`,
            `${name}.SetTime(ADSR_SEG_RELEASE, ${release});`,
            `cv_${name}_out = ${name}.Process(${gateVar});`
        ];
    }

    private generateAdEnvCode(block: BlockInstance, name: string): string[] {
        const trigVar = this.getInputExpression(block, 'trig', 'false');
        return [
            `if (${trigVar}) ${name}.Trigger();`,
            `cv_${name}_out = ${name}.Process();`
        ];
    }

    private generateVcaCode(block: BlockInstance, name: string): string[] {
        // VCA is not a DaisySP class - implemented as inline multiplication
        const audioIn = this.getInputConnection(block.id, 'in') || this.getInputConnection(block.id, 'audio_in');
        const cvIn = this.getInputConnection(block.id, 'gain_cv')
            || this.getInputConnection(block.id, 'cv')
            || this.getInputConnection(block.id, 'cv_in');

        const audioVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        const cvVar = cvIn ? this.getSourceVariable(cvIn) : '1.0f';
        const gain = block.parameterValues['gain'] ?? 1.0;

        return [`sig_${name}_out = ${audioVar} * ${cvVar} * ${this.formatFloat(gain)};`];
    }

    private generateMixerCode(block: BlockInstance, name: string): string[] {
        // Mixer is not a DaisySP class - implemented as inline addition
        const channels = ['ch1', 'ch2', 'ch3', 'ch4'];
        const mixTerms: string[] = [];

        channels.forEach(ch => {
            const conn = this.getInputConnection(block.id, ch);
            if (conn) {
                const sourceVar = this.getSourceVariable(conn);
                const level = block.parameterValues[`${ch}_level`] ?? 0.8;
                mixTerms.push(`(${sourceVar} * ${this.formatFloat(level)})`);
            }
        });

        if (mixTerms.length > 0) {
            return [`sig_${name}_out = ${mixTerms.join(' + ')};`];
        }
        return [`sig_${name}_out = 0.0f;`];
    }

    private generateDelayCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        const feedback = block.parameterValues['feedback'] ?? 0.5;

        return [
            `float delayed = ${name}.Read();`,
            `${name}.Write(${inputVar} + delayed * ${this.formatFloat(feedback)});`,
            `sig_${name}_out = delayed;`,
        ];
    }

    private generateReverbCode(block: BlockInstance, name: string): string[] {
        const leftIn = this.getInputConnection(block.id, 'in_l') || this.getInputConnection(block.id, 'in');
        const rightIn = this.getInputConnection(block.id, 'in_r');
        const leftVar = leftIn ? this.getSourceVariable(leftIn) : '0.0f';
        const rightVar = rightIn ? this.getSourceVariable(rightIn) : leftVar;

        const lines: string[] = [];
        this.writeParameterSetters(block, name, lines, ['wet_dry']);
        const wetDry = this.getParameterExpression(block, 'wet_dry', 0.3);

        lines.push(
            `float revL, revR;`,
            `${name}.Process(${leftVar}, ${rightVar}, &revL, &revR);`,
            `sig_${name}_out_l = (${leftVar} * (1.0f - ${wetDry})) + (revL * ${wetDry});`,
            `sig_${name}_out_r = (${rightVar} * (1.0f - ${wetDry})) + (revR * ${wetDry});`,
        );
        return lines;
    }

    private generateCompressorCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateOverdriveCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateKnobCode(block: BlockInstance, name: string): string[] {
        const channel = parseInt(block.parameterValues['channel'] as string) || 0;
        const min = block.parameterValues['min'] ?? 0;
        const max = block.parameterValues['max'] ?? 1;
        const range = (max as number) - (min as number);

        const platform = this.getTargetPlatform();

        let valueExpr = `hw.knob[${channel}].Value()`;

        if (platform === 'seed') {
            // Seed uses local variables knob_1_val, knob_2_val etc populated in AudioCallback
            // channel 0 -> knob_1
            valueExpr = `knob_${channel + 1}_val`;
        } else if (platform === 'pod') {
            // Pod uses hw.knob1.Value(), hw.knob2.Value() directly
            const knobNum = channel + 1;
            valueExpr = `hw.knob${knobNum}.Value()`;
        } else if (platform === 'field') {
            const safeChannel = Math.min(Math.max(0, channel), 7);
            valueExpr = `hw.GetKnobValue(DaisyField::KNOB_${safeChannel + 1})`;
        }

        return [`cv_${name}_out = ${this.formatFloat(min)} + (${valueExpr} * ${this.formatFloat(range)});`];
    }

    private generateKeyCode(block: BlockInstance, name: string): string[] {
        const note = block.parameterValues['note'] ?? 60;
        const freq = 440.0 * Math.pow(2, ((note as number) - 69) / 12);

        // Find key index
        let keyIndex = 0;
        this.hardwareMapping.keys.forEach((blockId, idx) => {
            if (blockId === block.id) keyIndex = idx;
        });

        return [
            `cv_${name}_cv = ${freq.toFixed(2)}f;`,
            `gate_${name}_gate = hw.KeyboardState(${keyIndex});`,
        ];
    }

    private generateGateTriggerInCode(block: BlockInstance, name: string): string[] {
        const platform = this.getTargetPlatform();
        if (platform === 'field') {
            return [
                `gate_${name}_gate = hw.gate_in.State();`,
                `gate_${name}_trig = hw.gate_in.Trig();`,
            ];
        }

        const channel = parseInt(block.parameterValues['channel'] as string) || 0;
        return [
            `gate_${name}_gate = hw.GateInput[${channel}].State();`,
            `gate_${name}_trig = hw.GateInput[${channel}].Trig();`,
        ];
    }

    private generateEncoderCode(_block: BlockInstance, name: string): string[] {
        const platform = this.getTargetPlatform();

        if (platform === 'pod') {
            return [
                `// Encoder from Daisy Pod`,
                `float cv_${name}_value = hw.encoder.Pressed() ? 1.0f : 0.0f; // Simplified`,
                `float cv_${name}_increment = (float)hw.encoder.Increment();`,
                `bool gate_${name}_press = hw.encoder.RisingEdge();`
            ];
        }

        return [
            `// [WARNING] Encoder block is not supported on ${platform} hardware`,
            `float cv_${name}_value = 0.0f;`,
            `float cv_${name}_increment = 0.0f;`,
            `bool gate_${name}_press = false;`,
        ];
    }

    // ===========================================================================
    // PHASE 1: CORE DSP BLOCK GENERATORS
    // ===========================================================================

    private generateLfoCode(block: BlockInstance, name: string): string[] {
        const freqCV = this.getInputConnection(block.id, 'freq_cv');
        const ampCV = this.getInputConnection(block.id, 'amp_cv');
        const waveCV = this.getInputConnection(block.id, 'waveform_cv');
        const lines: string[] = [];

        let freqExpr = this.formatFloat(block.parameterValues['freq'] ?? 1.0);
        if (freqCV) {
            const freqVar = this.getSourceVariable(freqCV);
            // V/Octave: base * 2^cv
            freqExpr = `${freqExpr} * powf(2.0f, ${freqVar})`;
        }
        lines.push(`${name}.SetFreq(${freqExpr});`);

        if (ampCV) {
            const ampVar = this.getSourceVariable(ampCV);
            const baseAmp = this.formatFloat(block.parameterValues['amp'] ?? 1.0);
            lines.push(`${name}.SetAmp(${baseAmp} * fabsf(${ampVar}));`);
        }

        // Waveform modulation
        if (waveCV) {
            const waveVar = this.getSourceVariable(waveCV);
            // Map 0..1 to 0..4
            // LFO waveforms: WAVE_SIN, WAVE_TRI, WAVE_SAW, WAVE_RAMP, WAVE_SQUARE (5 total)
            lines.push(`${name}.SetWaveform((uint8_t)(fminf(4.0f, fmaxf(0.0f, fabsf(${waveVar}) * 4.9f))));`);
        }

        lines.push(`cv_${name}_out = ${name}.Process();`);
        return lines;
    }

    private generateWhiteNoiseCode(_block: BlockInstance, name: string): string[] {
        // WhiteNoise.Process() returns audio sample
        return [`sig_${name}_out = ${name}.Process();`];
    }

    private generateChorusCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateFlangerCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateOnePoleCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateAToneCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateDCBlockCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateLimiterCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateFoldCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    // ===========================================================================
    // PHASE 2: MATH & UTILITY BLOCK GENERATORS (Inline implementations)
    // ===========================================================================

    private generateAddCode(block: BlockInstance, name: string): string[] {
        // Add is inline - sum multiple inputs
        const inputs = ['in1', 'in2', 'in3', 'in4'];
        const terms: string[] = [];

        inputs.forEach(inputId => {
            const conn = this.getInputConnection(block.id, inputId);
            if (conn) {
                terms.push(this.getSourceVariable(conn));
            }
        });

        if (terms.length > 0) {
            return [`sig_${name}_out = ${terms.join(' + ')};`];
        }
        return [`sig_${name}_out = 0.0f;`];
    }

    private generateMultiplyCode(block: BlockInstance, name: string): string[] {
        // Multiply is inline
        const in1 = this.getInputConnection(block.id, 'in1');
        const in2 = this.getInputConnection(block.id, 'in2');

        const var1 = in1 ? this.getSourceVariable(in1) : '1.0f';
        const var2 = in2 ? this.getSourceVariable(in2) : '1.0f';

        return [`sig_${name}_out = ${var1} * ${var2};`];
    }

    private generateSubtractCode(block: BlockInstance, name: string): string[] {
        // Subtract is inline
        const in1 = this.getInputConnection(block.id, 'in1');
        const in2 = this.getInputConnection(block.id, 'in2');

        const var1 = in1 ? this.getSourceVariable(in1) : '0.0f';
        const var2 = in2 ? this.getSourceVariable(in2) : '0.0f';

        return [`sig_${name}_out = ${var1} - ${var2};`];
    }

    private generateDivideCode(block: BlockInstance, name: string): string[] {
        // Divide is inline with protection against division by zero
        const in1 = this.getInputConnection(block.id, 'in1');
        const in2 = this.getInputConnection(block.id, 'in2');

        const var1 = in1 ? this.getSourceVariable(in1) : '0.0f';
        const var2 = in2 ? this.getSourceVariable(in2) : '1.0f';

        return [`sig_${name}_out = ${var1} / fmaxf(fabsf(${var2}), 0.0001f);`];
    }

    private generateGainCode(block: BlockInstance, name: string): string[] {
        // Gain is inline multiplication
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        const gain = block.parameterValues['gain'] ?? 1.0;

        return [`sig_${name}_out = ${inputVar} * ${this.formatFloat(gain)};`];
    }

    private generateBypassCode(block: BlockInstance, name: string): string[] {
        // Bypass with Control Input
        const audioIn = this.getInputConnection(block.id, 'in');
        const ctrlIn = this.getInputConnection(block.id, 'ctrl');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';

        if (ctrlIn) {
            const ctrlVar = this.getSourceVariable(ctrlIn);
            return [`sig_${name}_out = (${ctrlVar} > 0.5f) ? ${inputVar} : 0.0f;`];
        }

        return [`sig_${name}_out = ${inputVar};`];
    }

    private generateSampleDelayCode(block: BlockInstance, name: string): string[] {
        // Sample delay (z^-1) using static variable
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';

        return [
            `sig_${name}_out = ${name}_prev;`,
            `${name}_prev = ${inputVar};`,
        ];
    }

    private generateCvToFreqCode(block: BlockInstance, name: string): string[] {
        // CV to Frequency: 1V/Oct standard conversion
        // CV of 0 = 440Hz (A4), each volt is an octave
        const cvIn = this.getInputConnection(block.id, 'cv_in');
        const cvVar = cvIn ? this.getSourceVariable(cvIn) : '0.0f';

        return [`cv_${name}_freq = 440.0f * powf(2.0f, ${cvVar});`];
    }

    private generateMuxCode(block: BlockInstance, name: string): string[] {
        // Mux: select one of multiple inputs based on selector CV
        const selector = this.getInputConnection(block.id, 'selector');
        const in1 = this.getInputConnection(block.id, 'in1');
        const in2 = this.getInputConnection(block.id, 'in2');

        const selectorVar = selector ? this.getSourceVariable(selector) : '0.0f';
        const var1 = in1 ? this.getSourceVariable(in1) : '0.0f';
        const var2 = in2 ? this.getSourceVariable(in2) : '0.0f';

        return [`sig_${name}_out = (${selectorVar} < 0.5f) ? ${var1} : ${var2};`];
    }

    private generateDemuxCode(block: BlockInstance, name: string): string[] {
        // Demux: route input to one of multiple outputs based on selector
        const selector = this.getInputConnection(block.id, 'selector');
        const audioIn = this.getInputConnection(block.id, 'in');

        const selectorVar = selector ? this.getSourceVariable(selector) : '0.0f';
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';

        return [
            `sig_${name}_out1 = (${selectorVar} < 0.5f) ? ${inputVar} : 0.0f;`,
            `sig_${name}_out2 = (${selectorVar} >= 0.5f) ? ${inputVar} : 0.0f;`,
        ];
    }

    private generateLinearVcaCode(block: BlockInstance, name: string): string[] {
        // LinearVCA is inline multiplication (no DaisySP class)
        const audioIn = this.getInputConnection(block.id, 'in');
        const cvIn = this.getInputConnection(block.id, 'cv');

        const audioVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        const cvVar = cvIn ? this.getSourceVariable(cvIn) : '1.0f';

        return [`sig_${name}_out = ${audioVar} * ${cvVar};`];
    }

    // ===========================================================================
    // PHASE 3: DRUMS BLOCK GENERATORS
    // ===========================================================================

    private generateHiHatCode(block: BlockInstance, name: string): string[] {
        const trigIn = this.getInputConnection(block.id, 'trig');
        const trigVar = trigIn ? this.getSourceVariable(trigIn) : 'false';
        return [`sig_${name}_out = ${name}.Process(${trigVar});`];
    }

    private generateAnalogBassDrumCode(block: BlockInstance, name: string): string[] {
        const trigIn = this.getInputConnection(block.id, 'trig');
        const trigVar = trigIn ? this.getSourceVariable(trigIn) : 'false';
        return [`sig_${name}_out = ${name}.Process(${trigVar});`];
    }

    private generateAnalogSnareDrumCode(block: BlockInstance, name: string): string[] {
        const trigIn = this.getInputConnection(block.id, 'trig');
        const trigVar = trigIn ? this.getSourceVariable(trigIn) : 'false';
        return [`sig_${name}_out = ${name}.Process(${trigVar});`];
    }

    private generateSynthBassDrumCode(block: BlockInstance, name: string): string[] {
        const trigIn = this.getInputConnection(block.id, 'trig');
        const trigVar = trigIn ? this.getSourceVariable(trigIn) : 'false';
        return [`sig_${name}_out = ${name}.Process(${trigVar});`];
    }

    private generateSynthSnareDrumCode(block: BlockInstance, name: string): string[] {
        const trigIn = this.getInputConnection(block.id, 'trig');
        const trigVar = trigIn ? this.getSourceVariable(trigIn) : 'false';
        return [`sig_${name}_out = ${name}.Process(${trigVar});`];
    }

    // ===========================================================================
    // PHASE 3: PHYSICAL MODELING BLOCK GENERATORS
    // ===========================================================================

    private generateDripCode(block: BlockInstance, name: string): string[] {
        const trigIn = this.getInputConnection(block.id, 'trig');
        const trigVar = trigIn ? this.getSourceVariable(trigIn) : 'false';
        return [`sig_${name}_out = ${name}.Process(${trigVar});`];
    }

    private generateModalVoiceCode(block: BlockInstance, name: string): string[] {
        const trigIn = this.getInputConnection(block.id, 'trig');
        const freqCV = this.getInputConnection(block.id, 'freq_cv');
        const lines: string[] = [];

        if (freqCV) {
            const freqVar = this.getSourceVariable(freqCV);
            const baseFreq = block.parameterValues['freq'] ?? 220;
            lines.push(`${name}.SetFreq(${this.formatFloat(baseFreq)} * (1.0f + ${freqVar}));`);
        }

        const trigVar = trigIn ? this.getSourceVariable(trigIn) : 'false';
        lines.push(`sig_${name}_out = ${name}.Process(${trigVar});`);
        return lines;
    }

    private generateStringVoiceCode(block: BlockInstance, name: string): string[] {
        const trigIn = this.getInputConnection(block.id, 'trig');
        const freqCV = this.getInputConnection(block.id, 'freq_cv');
        const lines: string[] = [];

        if (freqCV) {
            const freqVar = this.getSourceVariable(freqCV);
            const baseFreq = block.parameterValues['freq'] ?? 220;
            lines.push(`${name}.SetFreq(${this.formatFloat(baseFreq)} * (1.0f + ${freqVar}));`);
        }

        const trigVar = trigIn ? this.getSourceVariable(trigIn) : 'false';
        lines.push(`sig_${name}_out = ${name}.Process(${trigVar});`);
        return lines;
    }

    private generateWavefolderCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const gainCV = this.getInputConnection(block.id, 'gain_cv');
        const lines: string[] = [];

        if (gainCV) {
            const gainVar = this.getSourceVariable(gainCV);
            const baseGain = block.parameterValues['gain'] ?? 1.0;
            lines.push(`${name}.SetGain(${this.formatFloat(baseGain)} * (1.0f + ${gainVar}));`);
        }

        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        lines.push(`sig_${name}_out = ${name}.Process(${inputVar});`);
        return lines;
    }

    private generateDustCode(block: BlockInstance, name: string): string[] {
        // Dust is inline random impulse generator
        const densityCV = this.getInputConnection(block.id, 'density_cv');
        const density = block.parameterValues['density'] ?? 10.0;
        const amp = block.parameterValues['amp'] ?? 0.5;

        const lines: string[] = [];
        let densityVal = this.formatFloat(density);
        if (densityCV) {
            const cvVar = this.getSourceVariable(densityCV);
            densityVal = `${this.formatFloat(density)} * (1.0f + ${cvVar})`;
        }

        // Inline dust implementation: random impulse based on density
        lines.push(`float ${name}_rand = (float)rand() / (float)RAND_MAX;`);
        lines.push(`float ${name}_thresh = ${densityVal} / sr;`);
        lines.push(`sig_${name}_out = (${name}_rand < ${name}_thresh) ? ${this.formatFloat(amp)} : 0.0f;`);
        lines.push(`gate_${name}_trig_out = (${name}_rand < ${name}_thresh);`);
        return lines;
    }

    // ===========================================================================
    // PHASE 4A: ADVANCED EFFECTS BLOCK GENERATORS
    // ===========================================================================

    private generateDecimatorCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generatePhaserCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateTremoloCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateAutowahCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generateResonatorCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    private generatePluckCode(block: BlockInstance, name: string): string[] {
        const trigIn = this.getInputConnection(block.id, 'trig');
        const trigVar = trigIn ? this.getSourceVariable(trigIn) : 'false';
        return [`sig_${name}_out = ${name}.Process(${trigVar});`];
    }

    private generateCrossFadeCode(block: BlockInstance, name: string): string[] {
        const in1 = this.getInputConnection(block.id, 'in1');
        const in2 = this.getInputConnection(block.id, 'in2');
        const var1 = in1 ? this.getSourceVariable(in1) : '0.0f';
        const var2 = in2 ? this.getSourceVariable(in2) : '0.0f';
        return [
            `float ${name}_in1 = ${var1};`,
            `float ${name}_in2 = ${var2};`,
            `sig_${name}_out = ${name}.Process(${name}_in1, ${name}_in2);`
        ];
    }

    private generateSampleRateReducerCode(block: BlockInstance, name: string): string[] {
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        return [`sig_${name}_out = ${name}.Process(${inputVar});`];
    }

    // ===========================================================================
    // PHASE 4B: INLINE UTILITY BLOCK GENERATORS
    // ===========================================================================

    private generatePanCode(block: BlockInstance, name: string): string[] {
        // Pan is inline - mono to stereo panning
        const audioIn = this.getInputConnection(block.id, 'in');
        const panCV = this.getInputConnection(block.id, 'pan_cv');

        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        let panVal = this.formatFloat(block.parameterValues['pan'] ?? 0.5);
        if (panCV) {
            const cvVar = this.getSourceVariable(panCV);
            panVal = `fminf(1.0f, fmaxf(0.0f, ${panVal} + ${cvVar}))`;
        }

        return [
            `sig_${name}_left = ${inputVar} * sqrtf(1.0f - ${panVal});`,
            `sig_${name}_right = ${inputVar} * sqrtf(${panVal});`,
        ];
    }

    private generateBalanceCode(block: BlockInstance, name: string): string[] {
        // Balance is inline - stereo balance control
        const leftIn = this.getInputConnection(block.id, 'left_in');
        const rightIn = this.getInputConnection(block.id, 'right_in');
        const balCV = this.getInputConnection(block.id, 'balance_cv');

        const leftVar = leftIn ? this.getSourceVariable(leftIn) : '0.0f';
        const rightVar = rightIn ? this.getSourceVariable(rightIn) : '0.0f';
        let balVal = this.formatFloat(block.parameterValues['balance'] ?? 0.5);
        if (balCV) {
            const cvVar = this.getSourceVariable(balCV);
            balVal = `fminf(1.0f, fmaxf(0.0f, ${balVal} + ${cvVar}))`;
        }

        return [
            `sig_${name}_left_out = ${leftVar} * (1.0f - ${balVal});`,
            `sig_${name}_right_out = ${rightVar} * ${balVal};`,
        ];
    }

    private generateSoftClipCode(block: BlockInstance, name: string): string[] {
        // SoftClip is inline tanh saturation
        const audioIn = this.getInputConnection(block.id, 'in');
        const driveCV = this.getInputConnection(block.id, 'drive_cv');

        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        let driveVal = this.formatFloat(block.parameterValues['drive'] ?? 1.0);
        if (driveCV) {
            const cvVar = this.getSourceVariable(driveCV);
            driveVal = `fmaxf(0.1f, ${driveVal} * (1.0f + ${cvVar}))`;
        }

        return [`sig_${name}_out = tanhf(${inputVar} * ${driveVal}) / tanhf(${driveVal});`];
    }

    private generateHardClipCode(block: BlockInstance, name: string): string[] {
        // HardClip is inline clipping
        const audioIn = this.getInputConnection(block.id, 'in');
        const threshCV = this.getInputConnection(block.id, 'threshold_cv');

        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        let threshVal = this.formatFloat(block.parameterValues['threshold'] ?? 0.8);
        if (threshCV) {
            const cvVar = this.getSourceVariable(threshCV);
            threshVal = `fmaxf(0.01f, ${threshVal} * (1.0f + ${cvVar}))`;
        }

        return [`sig_${name}_out = fminf(fmaxf(${inputVar}, -${threshVal}), ${threshVal});`];
    }

    private generateRectifierCode(block: BlockInstance, name: string): string[] {
        // Rectifier is inline abs/max
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        const mode = block.parameterValues['mode'] ?? 0;

        if (mode === 1) {
            // Half-wave
            return [`sig_${name}_out = fmaxf(${inputVar}, 0.0f);`];
        }
        // Full-wave (default)
        return [`sig_${name}_out = fabsf(${inputVar});`];
    }

    private generateSlewCode(block: BlockInstance, name: string): string[] {
        // Slew limiter - inline one-pole with separate rise/fall
        const cvIn = this.getInputConnection(block.id, 'in');
        const inputVar = cvIn ? this.getSourceVariable(cvIn) : '0.0f';
        const rise = Number(block.parameterValues['rise'] ?? 0.01);
        const fall = Number(block.parameterValues['fall'] ?? 0.01);

        // Calculate coefficients from time constants
        return [
            `float ${name}_target = ${inputVar};`,
            `float ${name}_coef = (${name}_target > ${name}_prev) ? ${this.formatFloat(1.0 / (rise * 48000))} : ${this.formatFloat(1.0 / (fall * 48000))};`,
            `${name}_prev += (${name}_target - ${name}_prev) * fminf(${name}_coef, 1.0f);`,
            `cv_${name}_out = ${name}_prev;`,
        ];
    }

    private generateSmoothCode(block: BlockInstance, name: string): string[] {
        // Smooth is inline one-pole lowpass
        const cvIn = this.getInputConnection(block.id, 'in');
        const inputVar = cvIn ? this.getSourceVariable(cvIn) : '0.0f';
        const smooth = block.parameterValues['smooth'] ?? 0.99;

        return [
            `${name}_prev = ${name}_prev * ${this.formatFloat(smooth)} + ${inputVar} * ${this.formatFloat(1.0 - (smooth as number))};`,
            `cv_${name}_out = ${name}_prev;`,
        ];
    }

    private generateGateCode(block: BlockInstance, name: string): string[] {
        // Gate is inline threshold comparison
        const audioIn = this.getInputConnection(block.id, 'in');
        const threshCV = this.getInputConnection(block.id, 'threshold_cv');

        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        let threshVal = this.formatFloat(block.parameterValues['threshold'] ?? 0.01);
        if (threshCV) {
            const cvVar = this.getSourceVariable(threshCV);
            threshVal = `fmaxf(0.0f, ${threshVal} + ${cvVar} * 0.5f)`;
        }

        return [`sig_${name}_out = (fabsf(${inputVar}) > ${threshVal}) ? ${inputVar} : 0.0f;`];
    }

    // ===========================================================================
    // HELPER METHODS
    // ===========================================================================

    private isCustomBlockDefinition(def: BlockDefinition): def is CustomBlockDefinition {
        return (def as CustomBlockDefinition).isCustom === true;
    }

    private isPolyVoiceGroupDefinition(def: BlockDefinition): def is CustomBlockDefinition {
        return this.isCustomBlockDefinition(def) && def.id === 'poly_voice_group';
    }

    /**
     * Check if a custom block is a code module (has custom C++ code)
     */
    private isCodeModule(def: CustomBlockDefinition): boolean {
        return def.codeModule !== undefined && def.codeModule.cppCode.trim() !== '';
    }

    private getCurrentContext(): GenerationContext | undefined {
        return this.generationContextStack[this.generationContextStack.length - 1];
    }

    private getActivePatch(): Pick<PatchGraph, 'blocks' | 'connections'> {
        return this.getCurrentContext()?.patch || this.patch;
    }

    private getActiveBlockDefs(): Map<string, BlockDefinition> {
        return this.getCurrentContext()?.blockDefs || this.blockDefs;
    }

    private withGenerationContext<T>(context: GenerationContext, callback: () => T): T {
        this.generationContextStack.push(context);
        try {
            return callback();
        } finally {
            this.generationContextStack.pop();
        }
    }

    private sanitizeIdentifier(raw: string): string {
        let sanitized = raw
            .replace(/-/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '_');

        if (/^[0-9]/.test(sanitized)) {
            sanitized = '_' + sanitized;
        }

        return sanitized;
    }

    private getSignalPrefix(signalType: SignalType): 'sig' | 'cv' | 'gate' {
        if (signalType === SignalType.CV) return 'cv';
        if (signalType === SignalType.TRIGGER) return 'gate';
        return 'sig';
    }

    private getSignalVariable(instanceName: string, portId: string, signalType: SignalType): string {
        const prefix = this.getSignalPrefix(signalType);
        return `${prefix}_${instanceName}_${portId}`;
    }

    private getDefaultValueForSignalType(signalType: SignalType): string {
        return signalType === SignalType.TRIGGER ? 'false' : '0.0f';
    }

    private createInternalDefsMap(patch: Pick<PatchGraph, 'blocks' | 'connections'>): Map<string, BlockDefinition> {
        const defs = new Map<string, BlockDefinition>();
        patch.blocks.forEach(block => {
            const def = BlockRegistry.get(block.definitionId);
            if (def) {
                defs.set(block.definitionId, def);
            }
        });
        return defs;
    }

    private makeOverrideConnection(blockId: string, portId: string): Connection {
        return {
            id: `__override__${blockId}:${portId}`,
            sourceBlockId: '__override__',
            sourcePortId: `${blockId}:${portId}`,
            targetBlockId: blockId,
            targetPortId: portId,
            type: 'audio',
        };
    }

    private buildCustomInputOverrides(customBlock: BlockInstance, customDef: CustomBlockDefinition): Map<string, string> {
        const overrides = new Map<string, string>();

        customDef.ports
            .filter(port => port.direction === PortDirection.INPUT)
            .forEach(port => {
                const mapping = customDef.exposedPorts[port.id];
                if (!mapping) return;

                const conn = this.getInputConnection(customBlock.id, port.id);
                const value = conn
                    ? this.getSourceVariable(conn)
                    : this.getDefaultValueForSignalType(port.signalType);

                overrides.set(`${mapping.blockId}:${mapping.portId}`, value);
            });

        return overrides;
    }

    private buildCustomParameterOverrides(customBlock: BlockInstance, customDef: CustomBlockDefinition): Map<string, Record<string, number | boolean | string>> {
        const overrides = new Map<string, Record<string, number | boolean | string>>();

        Object.entries(customDef.exposedParameters).forEach(([exposedId, mapping]) => {
            if (!(exposedId in customBlock.parameterValues)) return;

            const blockOverrides = overrides.get(mapping.blockId) || {};
            blockOverrides[mapping.parameterId] = customBlock.parameterValues[exposedId];
            overrides.set(mapping.blockId, blockOverrides);
        });

        return overrides;
    }

    private validatePolyVoiceGroups(): string[] {
        const errors: string[] = [];

        this.patch.blocks.forEach(block => {
            const def = this.blockDefs.get(block.definitionId);
            if (block.definitionId === 'poly_voice_group' && !def) {
                errors.push(`poly_voice_group block "${block.id}" is not registered as a custom block`);
                return;
            }

            if (!def || !this.isPolyVoiceGroupDefinition(def)) {
                return;
            }

            if (this.getTargetPlatform() !== 'field') {
                errors.push(`poly_voice_group block "${block.id}" currently supports Daisy Field targets only`);
            }

            if (!def.internalPatch?.blocks?.length) {
                errors.push(`poly_voice_group block "${block.id}" requires a non-empty internalPatch`);
                return;
            }

            ['pitch_cv', 'gate'].forEach(portId => {
                const port = def.ports.find(candidate => candidate.id === portId && candidate.direction === PortDirection.INPUT);
                if (!port) {
                    errors.push(`poly_voice_group block "${block.id}" is missing required input port "${portId}"`);
                }
                if (!def.exposedPorts[portId]) {
                    errors.push(`poly_voice_group block "${block.id}" is missing exposed mapping for "${portId}"`);
                }
            });

            const outputMappings = this.getPolyVoiceGroupOutputMappings(def);
            if (!outputMappings.left && !outputMappings.right) {
                errors.push(`poly_voice_group block "${block.id}" requires at least one exposed audio output mapping`);
            }

            const internalIds = new Set(def.internalPatch.blocks.map(internalBlock => internalBlock.id));
            Object.entries(def.exposedPorts).forEach(([exposedId, mapping]) => {
                if (!internalIds.has(mapping.blockId)) {
                    errors.push(`poly_voice_group block "${block.id}" exposed port "${exposedId}" maps to missing internal block "${mapping.blockId}"`);
                    return;
                }

                const internalBlock = def.internalPatch.blocks.find(candidate => candidate.id === mapping.blockId);
                const internalDef = internalBlock ? BlockRegistry.get(internalBlock.definitionId) : undefined;
                if (!internalDef) {
                    errors.push(`poly_voice_group block "${block.id}" exposed port "${exposedId}" maps through unknown internal definition "${internalBlock?.definitionId}"`);
                    return;
                }

                if (!internalDef.ports.some(port => port.id === mapping.portId)) {
                    errors.push(`poly_voice_group block "${block.id}" exposed port "${exposedId}" maps to missing internal port "${mapping.portId}"`);
                }
            });

            def.internalPatch.blocks.forEach(internalBlock => {
                if (!BlockRegistry.get(internalBlock.definitionId)) {
                    errors.push(`poly_voice_group block "${block.id}" cannot clone unknown internal block definition "${internalBlock.definitionId}"`);
                }
            });
        });

        return errors;
    }

    private getPolyVoiceBlankets(): PolyVoiceBlanket[] {
        return this.patch.polyVoiceBlankets || [];
    }

    private getPolyVoiceBlanketInstanceName(blanket: PolyVoiceBlanket): string {
        return this.sanitizeIdentifier(blanket.id);
    }

    private getPolyVoiceBlanketVoiceCount(blanket: PolyVoiceBlanket): number {
        const requested = Number(blanket.voiceCount ?? 8);
        if (!Number.isFinite(requested)) {
            return 8;
        }
        return Math.min(16, Math.max(1, Math.round(requested)));
    }

    private getPolyVoiceBlanketMemberIds(): Set<string> {
        const ids = new Set<string>();
        this.getPolyVoiceBlankets().forEach(blanket => {
            blanket.memberBlockIds.forEach(memberId => ids.add(memberId));
        });
        return ids;
    }

    private getPolyVoiceBlanketForMember(blockId: string): PolyVoiceBlanket | undefined {
        return this.getPolyVoiceBlankets().find(blanket => blanket.memberBlockIds.includes(blockId));
    }

    private getPolyVoiceBlanketInternalPatch(blanket: PolyVoiceBlanket): Pick<PatchGraph, 'blocks' | 'connections'> {
        const memberIds = new Set(blanket.memberBlockIds);
        return {
            blocks: this.patch.blocks.filter(block => memberIds.has(block.id)),
            connections: this.patch.connections.filter(connection =>
                memberIds.has(connection.sourceBlockId) &&
                memberIds.has(connection.targetBlockId)
            ),
        };
    }

    private getPolyVoiceBlanketInputCrossings(blanket: PolyVoiceBlanket): Connection[] {
        const memberIds = new Set(blanket.memberBlockIds);
        return this.patch.connections.filter(connection =>
            !memberIds.has(connection.sourceBlockId) &&
            memberIds.has(connection.targetBlockId)
        );
    }

    private getPolyVoiceBlanketOutputCrossings(blanket: PolyVoiceBlanket): Connection[] {
        const memberIds = new Set(blanket.memberBlockIds);
        return this.patch.connections.filter(connection =>
            memberIds.has(connection.sourceBlockId) &&
            !memberIds.has(connection.targetBlockId) &&
            connection.type === SignalType.AUDIO
        );
    }

    private getPortDefinition(blockId: string, portId: string): { block?: BlockInstance; def?: BlockDefinition; port?: ReturnType<BlockDefinition['ports']['find']> } {
        const block = this.patch.blocks.find(candidate => candidate.id === blockId);
        const def = block ? this.blockDefs.get(block.definitionId) : undefined;
        const port = def?.ports.find(candidate => candidate.id === portId);
        return { block, def, port };
    }

    private inferPolyVoiceBlanketPitchEndpoint(blanket: PolyVoiceBlanket): CustomPortEndpoint | undefined {
        const members = this.getPolyVoiceBlanketInternalPatch(blanket).blocks;
        const candidates = members.filter(block => {
            const def = this.blockDefs.get(block.definitionId);
            return def?.id === 'grainlet_oscillator' && def.ports.some(port => port.id === 'freq_cv');
        });
        if (candidates.length !== 1) {
            return undefined;
        }
        return { blockId: candidates[0].id, portId: 'freq_cv' };
    }

    private inferPolyVoiceBlanketGateEndpoint(blanket: PolyVoiceBlanket): CustomPortEndpoint | undefined {
        const members = this.getPolyVoiceBlanketInternalPatch(blanket).blocks;
        const candidates = members.filter(block => {
            const def = this.blockDefs.get(block.definitionId);
            return def?.id === 'adsr' && def.ports.some(port => port.id === 'gate');
        });
        if (candidates.length !== 1) {
            return undefined;
        }
        return { blockId: candidates[0].id, portId: 'gate' };
    }

    private getPolyVoiceBlanketOutputMappings(blanket: PolyVoiceBlanket): { left?: CustomPortEndpoint; right?: CustomPortEndpoint } {
        const crossings = this.getPolyVoiceBlanketOutputCrossings(blanket);
        const audioCrossings = crossings.filter(connection => {
            const { port } = this.getPortDefinition(connection.sourceBlockId, connection.sourcePortId);
            return port?.signalType === SignalType.AUDIO && port.direction === PortDirection.OUTPUT;
        });

        const left = audioCrossings.find(connection => connection.sourcePortId === 'left' || connection.targetPortId === 'left' || connection.targetPortId === 'in_l');
        const right = audioCrossings.find(connection => connection.sourcePortId === 'right' || connection.targetPortId === 'right' || connection.targetPortId === 'in_r');

        if (left && right) {
            return {
                left: { blockId: left.sourceBlockId, portId: left.sourcePortId },
                right: { blockId: right.sourceBlockId, portId: right.sourcePortId },
            };
        }

        const mono = left || right || audioCrossings[0];
        if (!mono) {
            return {};
        }

        const endpoint = { blockId: mono.sourceBlockId, portId: mono.sourcePortId };
        return { left: endpoint, right: endpoint };
    }

    private validatePolyVoiceBlankets(): string[] {
        const errors: string[] = [];
        const seenMemberIds = new Map<string, string>();

        this.getPolyVoiceBlankets().forEach(blanket => {
            const label = `poly_voice_blanket "${blanket.id}"`;

            if (this.getTargetPlatform() !== 'field') {
                errors.push(`${label} currently supports Daisy Field targets only`);
            }

            if (!blanket.memberBlockIds.length) {
                errors.push(`${label} requires at least one member block`);
                return;
            }

            const memberIds = new Set(blanket.memberBlockIds);
            blanket.memberBlockIds.forEach(memberId => {
                if (!this.patch.blocks.some(block => block.id === memberId)) {
                    errors.push(`${label} references missing member block "${memberId}"`);
                }

                const otherBlanket = seenMemberIds.get(memberId);
                if (otherBlanket && otherBlanket !== blanket.id) {
                    errors.push(`${label} overlaps member block "${memberId}" already used by poly_voice_blanket "${otherBlanket}"`);
                }
                seenMemberIds.set(memberId, blanket.id);
            });

            this.getPolyVoiceBlanketInternalPatch(blanket).blocks.forEach(block => {
                if (!this.blockDefs.get(block.definitionId)) {
                    errors.push(`${label} cannot clone unknown member block definition "${block.definitionId}"`);
                }
            });

            this.getPolyVoiceBlanketInputCrossings(blanket).forEach(connection => {
                if (connection.type === SignalType.AUDIO) {
                    errors.push(`${label} does not support audio input crossing into member block "${connection.targetBlockId}" in V1`);
                }

                if (!memberIds.has(connection.targetBlockId)) {
                    errors.push(`${label} has invalid input crossing target "${connection.targetBlockId}"`);
                }
            });

            const pitchEndpoint = this.inferPolyVoiceBlanketPitchEndpoint(blanket);
            if (!pitchEndpoint) {
                errors.push(`${label} requires exactly one grainlet_oscillator member with freq_cv for pitch inference`);
            }

            const gateEndpoint = this.inferPolyVoiceBlanketGateEndpoint(blanket);
            if (!gateEndpoint) {
                errors.push(`${label} requires exactly one adsr member with gate for voice gate inference`);
            }

            const outputs = this.getPolyVoiceBlanketOutputMappings(blanket);
            if (!outputs.left && !outputs.right) {
                errors.push(`${label} requires at least one audio output crossing from inside to outside`);
            }
        });

        return errors;
    }

    private getPolyVoiceGroupOutputMappings(customDef: CustomBlockDefinition): { left?: CustomPortEndpoint; right?: CustomPortEndpoint } {
        const audioOutputPorts = customDef.ports.filter(port =>
            port.direction === PortDirection.OUTPUT &&
            port.signalType === SignalType.AUDIO &&
            customDef.exposedPorts[port.id]
        );

        const leftPort = audioOutputPorts.find(port => port.id === 'left');
        const rightPort = audioOutputPorts.find(port => port.id === 'right');

        if (leftPort && rightPort) {
            return {
                left: customDef.exposedPorts[leftPort.id],
                right: customDef.exposedPorts[rightPort.id],
            };
        }

        if (leftPort) {
            const endpoint = customDef.exposedPorts[leftPort.id];
            return { left: endpoint, right: endpoint };
        }

        if (rightPort) {
            const endpoint = customDef.exposedPorts[rightPort.id];
            return { left: endpoint, right: endpoint };
        }

        const monoPort = audioOutputPorts[0];
        if (!monoPort) {
            return {};
        }

        const endpoint = customDef.exposedPorts[monoPort.id];
        return { left: endpoint, right: endpoint };
    }

    private buildPolyVoiceGroupInputOverrides(
        customBlock: BlockInstance,
        customDef: CustomBlockDefinition,
        allocatorName: string,
        voiceIndex: number
    ): Map<string, string> {
        const overrides = new Map<string, string>();

        customDef.ports
            .filter(port => port.direction === PortDirection.INPUT)
            .forEach(port => {
                const mapping = customDef.exposedPorts[port.id];
                if (!mapping) return;

                let value: string;
                if (port.id === 'pitch_cv') {
                    value = `${allocatorName}.GetFrequency(${voiceIndex})`;
                } else if (port.id === 'gate') {
                    value = `${allocatorName}.GetGate(${voiceIndex})`;
                } else {
                    const conn = this.getInputConnection(customBlock.id, port.id);
                    value = conn
                        ? this.getSourceVariable(conn)
                        : this.getDefaultValueForSignalType(port.signalType);

                    if (port.id === 'spread_cv') {
                        value = `${allocatorName}.GetPanOffset(${voiceIndex}, ${value})`;
                    }
                }

                overrides.set(`${mapping.blockId}:${mapping.portId}`, value);
            });

        return overrides;
    }

    private getInternalProcessingOrderConsideringAllConnections(internalPatch: Pick<PatchGraph, 'blocks' | 'connections'>): string[] {
        const adjacency = new Map<string, Set<string>>();
        const inDegree = new Map<string, number>();

        internalPatch.blocks.forEach(block => {
            adjacency.set(block.id, new Set());
            inDegree.set(block.id, 0);
        });

        internalPatch.connections.forEach(connection => {
            if (!adjacency.has(connection.sourceBlockId) || !inDegree.has(connection.targetBlockId)) {
                return;
            }

            const targets = adjacency.get(connection.sourceBlockId)!;
            if (!targets.has(connection.targetBlockId)) {
                targets.add(connection.targetBlockId);
                inDegree.set(connection.targetBlockId, (inDegree.get(connection.targetBlockId) || 0) + 1);
            }
        });

        const result: string[] = [];
        const remaining = new Set(internalPatch.blocks.map(block => block.id));

        while (remaining.size > 0) {
            let ready = Array.from(remaining).filter(blockId => (inDegree.get(blockId) || 0) === 0);
            if (ready.length === 0) {
                ready = [Array.from(remaining)[0]];
            }

            ready.forEach(blockId => {
                result.push(blockId);
                remaining.delete(blockId);
                adjacency.get(blockId)?.forEach(target => {
                    inDegree.set(target, (inDegree.get(target) || 0) - 1);
                });
            });
        }

        return result;
    }

    private generatePolyVoiceGroupProcessing(block: BlockInstance, customDef: CustomBlockDefinition): string[] {
        const internalPatch = customDef.internalPatch;
        if (!internalPatch?.blocks?.length) {
            return [];
        }

        const instanceName = this.getInstanceName(block);
        const allocatorName = `${instanceName}_voices`;
        const voiceCount = this.getPolyVoiceCount(block);
        const internalDefs = this.createInternalDefsMap(internalPatch);
        const internalOrder = this.getInternalProcessingOrderConsideringAllConnections(internalPatch);
        const parameterOverrides = this.buildCustomParameterOverrides(block, customDef);
        const outputMappings = this.getPolyVoiceGroupOutputMappings(customDef);

        const lines: string[] = [
            `sig_${instanceName}_left = 0.0f;`,
            `sig_${instanceName}_right = 0.0f;`,
        ];

        for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex++) {
            const voicePrefix = `${instanceName}__v${voiceIndex}`;
            const inputOverrides = this.buildPolyVoiceGroupInputOverrides(block, customDef, allocatorName, voiceIndex);

            const voiceLines = this.withGenerationContext(
                {
                    patch: internalPatch,
                    blockDefs: internalDefs,
                    instancePrefix: voicePrefix,
                    inputOverrides,
                },
                () => {
                    const nestedLines: string[] = [];

                    internalOrder.forEach(internalBlockId => {
                        const internalBlock = internalPatch.blocks.find(candidate => candidate.id === internalBlockId);
                        if (!internalBlock) return;

                        const internalDef = internalDefs.get(internalBlock.definitionId);
                        if (!internalDef) return;

                        const overrides = parameterOverrides.get(internalBlock.id);
                        const effectiveBlock: BlockInstance = overrides
                            ? {
                                ...internalBlock,
                                parameterValues: { ...internalBlock.parameterValues, ...overrides },
                            }
                            : internalBlock;

                        nestedLines.push(...this.generateBlockProcessing(effectiveBlock, internalDef));
                    });

                    return nestedLines;
                }
            );

            lines.push(`// poly_voice_group voice ${voiceIndex}`);
            lines.push(...voiceLines);

            const leftSource = outputMappings.left
                ? this.getCustomInternalSourceVariable(voicePrefix, internalPatch, internalDefs, outputMappings.left.blockId, outputMappings.left.portId)
                : '0.0f';
            const rightSource = outputMappings.right
                ? this.getCustomInternalSourceVariable(voicePrefix, internalPatch, internalDefs, outputMappings.right.blockId, outputMappings.right.portId)
                : leftSource;

            lines.push(`sig_${instanceName}_left += ${leftSource};`);
            lines.push(`sig_${instanceName}_right += ${rightSource};`);
        }

        lines.push(`sig_${instanceName}_left = fclamp(sig_${instanceName}_left, -1.0f, 1.0f);`);
        lines.push(`sig_${instanceName}_right = fclamp(sig_${instanceName}_right, -1.0f, 1.0f);`);

        return lines;
    }

    private createPolyVoiceBlanketPseudoDefinition(blanket: PolyVoiceBlanket): CustomBlockDefinition {
        return {
            isCustom: true,
            internalPatch: this.getPolyVoiceBlanketInternalPatch(blanket) as PatchGraph,
            exposedPorts: {},
            exposedParameters: {},
        } as CustomBlockDefinition;
    }

    private generatePolyVoiceBlanketDeclarations(blanket: PolyVoiceBlanket, lines: string[]): void {
        const pseudoDef = this.createPolyVoiceBlanketPseudoDefinition(blanket);
        const instanceName = this.getPolyVoiceBlanketInstanceName(blanket);
        const voiceCount = this.getPolyVoiceBlanketVoiceCount(blanket);

        for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex++) {
            this.generateCustomDeclarations(`${instanceName}__v${voiceIndex}`, pseudoDef, lines);
        }
    }

    private generatePolyVoiceBlanketSignalDeclarations(blanket: PolyVoiceBlanket, lines: string[]): void {
        const pseudoDef = this.createPolyVoiceBlanketPseudoDefinition(blanket);
        const instanceName = this.getPolyVoiceBlanketInstanceName(blanket);
        const voiceCount = this.getPolyVoiceBlanketVoiceCount(blanket);

        lines.push(`float sig_${instanceName}_left = 0.0f;`);
        lines.push(`float sig_${instanceName}_right = 0.0f;`);

        for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex++) {
            this.generateCustomSignalDeclarations(`${instanceName}__v${voiceIndex}`, pseudoDef, lines);
        }
    }

    private buildPolyVoiceBlanketInputOverrides(
        blanket: PolyVoiceBlanket,
        allocatorName: string,
        voiceIndex: number
    ): Map<string, string> {
        const overrides = new Map<string, string>();

        this.getPolyVoiceBlanketInputCrossings(blanket)
            .filter(connection => connection.type !== SignalType.AUDIO)
            .forEach(connection => {
                const sourceValue = this.getSourceVariable(connection);
                const value = connection.targetPortId === 'pan_cv'
                    ? `${allocatorName}.GetPanOffset(${voiceIndex}, ${sourceValue})`
                    : sourceValue;
                overrides.set(`${connection.targetBlockId}:${connection.targetPortId}`, value);
            });

        const pitchEndpoint = this.inferPolyVoiceBlanketPitchEndpoint(blanket);
        if (pitchEndpoint) {
            overrides.set(`${pitchEndpoint.blockId}:${pitchEndpoint.portId}`, `${allocatorName}.GetFrequency(${voiceIndex})`);
        }

        const gateEndpoint = this.inferPolyVoiceBlanketGateEndpoint(blanket);
        if (gateEndpoint) {
            overrides.set(`${gateEndpoint.blockId}:${gateEndpoint.portId}`, `${allocatorName}.GetGate(${voiceIndex})`);
        }

        return overrides;
    }

    private generatePolyVoiceBlanketProcessing(blanket: PolyVoiceBlanket): string[] {
        const internalPatch = this.getPolyVoiceBlanketInternalPatch(blanket);
        if (!internalPatch.blocks.length) {
            return [];
        }

        const instanceName = this.getPolyVoiceBlanketInstanceName(blanket);
        const allocatorName = `${instanceName}_voices`;
        const voiceCount = this.getPolyVoiceBlanketVoiceCount(blanket);
        const internalDefs = this.createInternalDefsMap(internalPatch);
        const internalOrder = this.getInternalProcessingOrderConsideringAllConnections(internalPatch);
        const outputMappings = this.getPolyVoiceBlanketOutputMappings(blanket);

        const lines: string[] = [
            `sig_${instanceName}_left = 0.0f;`,
            `sig_${instanceName}_right = 0.0f;`,
        ];

        for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex++) {
            const voicePrefix = `${instanceName}__v${voiceIndex}`;
            const inputOverrides = this.buildPolyVoiceBlanketInputOverrides(blanket, allocatorName, voiceIndex);

            const voiceLines = this.withGenerationContext(
                {
                    patch: internalPatch,
                    blockDefs: internalDefs,
                    instancePrefix: voicePrefix,
                    inputOverrides,
                },
                () => {
                    const nestedLines: string[] = [];

                    internalOrder.forEach(internalBlockId => {
                        const internalBlock = internalPatch.blocks.find(candidate => candidate.id === internalBlockId);
                        if (!internalBlock) return;

                        const internalDef = internalDefs.get(internalBlock.definitionId);
                        if (!internalDef) return;

                        nestedLines.push(...this.generateBlockProcessing(internalBlock, internalDef));
                    });

                    return nestedLines;
                }
            );

            lines.push(`// poly_voice_blanket ${blanket.id} voice ${voiceIndex}`);
            lines.push(...voiceLines);

            const leftSource = outputMappings.left
                ? this.getCustomInternalSourceVariable(voicePrefix, internalPatch, internalDefs, outputMappings.left.blockId, outputMappings.left.portId)
                : '0.0f';
            const rightSource = outputMappings.right
                ? this.getCustomInternalSourceVariable(voicePrefix, internalPatch, internalDefs, outputMappings.right.blockId, outputMappings.right.portId)
                : leftSource;

            lines.push(`sig_${instanceName}_left += ${leftSource};`);
            lines.push(`sig_${instanceName}_right += ${rightSource};`);
        }

        lines.push(`sig_${instanceName}_left = fclamp(sig_${instanceName}_left, -1.0f, 1.0f);`);
        lines.push(`sig_${instanceName}_right = fclamp(sig_${instanceName}_right, -1.0f, 1.0f);`);

        return lines;
    }

    private generatePolyVoiceBlanketInitialization(blanket: PolyVoiceBlanket, lines: string[]): void {
        const instanceName = this.getPolyVoiceBlanketInstanceName(blanket);
        const pseudoDef = this.createPolyVoiceBlanketPseudoDefinition(blanket);
        const pseudoBlock = {
            id: blanket.id,
            definitionId: 'poly_voice_blanket',
            position: blanket.position,
            parameterValues: {},
        } as BlockInstance;

        lines.push(`    ${instanceName}_voices.Init();`);

        const voiceCount = this.getPolyVoiceBlanketVoiceCount(blanket);
        for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex++) {
            this.generateCustomBlockInitialization(`${instanceName}__v${voiceIndex}`, pseudoBlock, pseudoDef, lines);
        }
    }

    private getPolyVoiceBlanketOutputSignalForConnection(conn: Connection): string | undefined {
        const blanket = this.getPolyVoiceBlanketForMember(conn.sourceBlockId);
        if (!blanket || blanket.memberBlockIds.includes(conn.targetBlockId)) {
            return undefined;
        }

        const instanceName = this.getPolyVoiceBlanketInstanceName(blanket);
        const outputs = this.getPolyVoiceBlanketOutputMappings(blanket);
        const isLeft = outputs.left?.blockId === conn.sourceBlockId && outputs.left?.portId === conn.sourcePortId;
        const isRight = outputs.right?.blockId === conn.sourceBlockId && outputs.right?.portId === conn.sourcePortId;

        if (isRight && (conn.sourcePortId === 'right' || conn.targetPortId === 'right' || conn.targetPortId === 'in_r')) {
            return `sig_${instanceName}_right`;
        }

        if (isLeft && (conn.sourcePortId === 'left' || conn.targetPortId === 'left' || conn.targetPortId === 'in_l')) {
            return `sig_${instanceName}_left`;
        }

        if (isRight) {
            return `sig_${instanceName}_right`;
        }

        if (isLeft) {
            return `sig_${instanceName}_left`;
        }

        return undefined;
    }

    private getCustomInternalSourceVariable(
        instancePrefix: string,
        internalPatch: Pick<PatchGraph, 'blocks' | 'connections'>,
        internalDefs: Map<string, BlockDefinition>,
        blockId: string,
        portId: string
    ): string {
        const sourceBlock = internalPatch.blocks.find(b => b.id === blockId);
        if (!sourceBlock) return '0.0f';

        const sourceDef = internalDefs.get(sourceBlock.definitionId);
        if (!sourceDef) return '0.0f';

        const sourcePort = sourceDef.ports.find(p => p.id === portId);
        const signalType = sourcePort?.signalType || SignalType.AUDIO;
        const internalName = `${instancePrefix}__${this.sanitizeIdentifier(blockId)}`;
        return this.getSignalVariable(internalName, portId, signalType);
    }

    private generateCustomBlockProcessing(block: BlockInstance, customDef: CustomBlockDefinition): string[] {
        const depth = this.generationContextStack.length;
        if (depth >= 3) {
            return [`// [WARNING] Custom block nesting depth limit reached for ${customDef.displayName}`];
        }

        // Phase 13.4: Handle code modules (hybrid custom code)
        if (this.isCodeModule(customDef)) {
            return this.generateCodeModuleProcessing(block, customDef);
        }

        const internalPatch = customDef.internalPatch;
        if (!internalPatch?.blocks?.length) {
            return [];
        }

        const internalDefs = this.createInternalDefsMap(internalPatch);
        const internalOrder = GraphAnalyzer.getProcessingOrder(
            internalPatch.blocks,
            internalPatch.connections,
            internalDefs
        );

        const instanceName = this.getInstanceName(block);
        const inputOverrides = this.buildCustomInputOverrides(block, customDef);
        const parameterOverrides = this.buildCustomParameterOverrides(block, customDef);

        const lines = this.withGenerationContext(
            {
                patch: internalPatch,
                blockDefs: internalDefs,
                instancePrefix: instanceName,
                inputOverrides,
            },
            () => {
                const nestedLines: string[] = [];

                internalOrder.blocks.forEach(internalBlockId => {
                    const internalBlock = internalPatch.blocks.find(b => b.id === internalBlockId);
                    if (!internalBlock) return;

                    const internalDef = internalDefs.get(internalBlock.definitionId);
                    if (!internalDef) return;

                    const overrides = parameterOverrides.get(internalBlock.id);
                    const effectiveBlock: BlockInstance = overrides
                        ? {
                            ...internalBlock,
                            parameterValues: { ...internalBlock.parameterValues, ...overrides },
                        }
                        : internalBlock;

                    nestedLines.push(...this.generateBlockProcessing(effectiveBlock, internalDef));
                });

                return nestedLines;
            }
        );

        customDef.ports
            .filter(port => port.direction === PortDirection.OUTPUT)
            .forEach(port => {
                const mapping = customDef.exposedPorts[port.id];
                if (!mapping) return;

                const sourceVar = this.getCustomInternalSourceVariable(
                    instanceName,
                    internalPatch,
                    internalDefs,
                    mapping.blockId,
                    mapping.portId
                );
                const targetVar = this.getSignalVariable(instanceName, port.id, port.signalType);
                lines.push(`${targetVar} = ${sourceVar};`);
            });

        return lines;
    }

    private getInputValue(block: BlockInstance, inputId: string): string {
        const conn = this.getInputConnection(block.id, inputId);
        if (conn) {
            return this.getSourceVariable(conn);
        }
        return this.getFieldMappedInputExpression(block.id, inputId, '0.0f');
    }

    private getInputExpression(block: BlockInstance, inputId: string, fallback: string): string {
        const conn = this.getInputConnection(block.id, inputId);
        if (conn) {
            return this.getSourceVariable(conn);
        }
        return this.getFieldMappedInputExpression(block.id, inputId, fallback);
    }

    private getParameterExpression(block: BlockInstance, paramId: string, fallback: number): string {
        const def = this.getActiveBlockDefs().get(block.definitionId);
        const param = def?.parameters.find(candidate => candidate.id === paramId);
        const value = block.parameterValues[paramId] ?? param?.defaultValue ?? fallback;
        let valueExpr = this.formatFloat(value);

        if (param?.type === 'enum' && param.enumValues) {
            const enumOpt = param.enumValues.find(candidate => candidate.value === value);
            if (enumOpt?.cppValue) {
                valueExpr = enumOpt.cppValue;
            }
        }

        const cvConn = this.getInputConnection(block.id, `${paramId}_cv`);
        if (cvConn && param?.cvModulatable) {
            valueExpr = `${valueExpr} + ${this.getSourceVariable(cvConn)}`;
        }

        return this.getFieldMappedParameterExpression(block.id, paramId, valueExpr);
    }

    private getFieldControlMappings(): FieldControlMapping[] {
        if (this.getTargetPlatform() !== 'field') {
            return [];
        }
        return this.patch.hardwareConfig?.fieldControlMappings ?? [];
    }

    private hasFieldControlMappings(): boolean {
        return this.getFieldControlMappings().length > 0;
    }

    private getFieldEffectiveMappingForLayer(
        mappings: FieldControlMapping[],
        controlId: string,
        layer: FieldMappingLayer
    ): FieldControlMapping | undefined {
        const layerPriority: Record<FieldMappingLayer, FieldMappingLayer[]> = {
            normal: ['normal'],
            sw1: ['sw1', 'normal'],
            sw2: ['sw2', 'normal'],
            sw1_sw2: ['sw1_sw2', 'sw2', 'sw1', 'normal'],
        };

        for (const candidateLayer of layerPriority[layer]) {
            const candidate = mappings.find(mapping =>
                mapping.controlId === controlId && mapping.layer === candidateLayer
            );
            if (candidate) return candidate;
        }

        return undefined;
    }

    private getFieldLayeredExpressionForTarget(
        controlType: FieldControlMapping['controlType'],
        targetMatches: (mapping: FieldControlMapping) => boolean,
        expressionForMapping: (mapping: FieldControlMapping) => string,
        fallback: string
    ): string {
        const mappings = this.getFieldControlMappings().filter(mapping => mapping.controlType === controlType);
        const controlIds = Array.from(new Set(mappings.map(mapping => mapping.controlId)));

        const exprByLayer = (layer: FieldMappingLayer): string => {
            for (const controlId of controlIds) {
                const effective = this.getFieldEffectiveMappingForLayer(mappings, controlId, layer);
                if (effective && targetMatches(effective)) {
                    return expressionForMapping(effective);
                }
            }
            return fallback;
        };

        const normalExpr = exprByLayer('normal');
        const sw1Expr = exprByLayer('sw1');
        const sw2Expr = exprByLayer('sw2');
        const sw12Expr = exprByLayer('sw1_sw2');

        if (sw1Expr === normalExpr && sw2Expr === normalExpr && sw12Expr === normalExpr) {
            return normalExpr;
        }

        return `(field_mapping_layer == 3 ? ${sw12Expr} : field_mapping_layer == 2 ? ${sw2Expr} : field_mapping_layer == 1 ? ${sw1Expr} : ${normalExpr})`;
    }

    private getFieldMappedParameterExpression(blockId: string, paramId: string, fallback: string): string {
        const hasTargetMapping = this.getFieldControlMappings().some(mapping =>
            mapping.controlType === 'knob' &&
            mapping.targetBlockId === blockId &&
            mapping.targetParameterId === paramId
        );

        if (!hasTargetMapping) {
            return fallback;
        }

        return this.getFieldLayeredExpressionForTarget(
            'knob',
            mapping => mapping.targetBlockId === blockId && mapping.targetParameterId === paramId,
            mapping => this.generateFieldKnobMappingExpression(mapping),
            fallback
        );
    }

    private generateFieldKnobMappingExpression(mapping: FieldControlMapping): string {
        const knobIndex = getFieldKnobIndex(mapping.controlId);
        const knobExpr = `hw.GetKnobValue(DaisyField::KNOB_${knobIndex + 1})`;
        const [min, max] = mapping.outputRange ?? [0, 1];
        const range = Number(max) - Number(min);

        switch (mapping.mappingType ?? 'direct') {
            case 'scaled':
                return `${this.formatFloat(min)} + (${knobExpr} * ${this.formatFloat(range)})`;
            case 'log': {
                const safeMin = Math.max(Number(min), 0.000001);
                const safeMax = Math.max(Number(max), safeMin);
                return `powf(10.0f, log10f(${this.formatFloat(safeMin)}) + (${knobExpr} * (log10f(${this.formatFloat(safeMax)}) - log10f(${this.formatFloat(safeMin)}))))`;
            }
            case 'exp':
                return `${this.formatFloat(min)} + ((1.0f - powf(1.0f - ${knobExpr}, 2.0f)) * ${this.formatFloat(range)})`;
            case 'direct':
            default:
                return knobExpr;
        }
    }

    private getFieldMappedInputExpression(blockId: string, portId: string, fallback: string): string {
        const context = this.getCurrentContext();
        if (context) {
            return fallback;
        }

        const hasTargetMapping = this.getFieldControlMappings().some(mapping =>
            mapping.controlType === 'key' &&
            mapping.targetBlockId === blockId &&
            mapping.targetPortId === portId
        );

        if (!hasTargetMapping) {
            return fallback;
        }

        return this.getFieldLayeredExpressionForTarget(
            'key',
            mapping => mapping.targetBlockId === blockId && mapping.targetPortId === portId,
            mapping => this.generateFieldKeyExpression(mapping, portId),
            fallback
        );
    }

    private generateFieldKeyExpression(mapping: FieldControlMapping, portId: string): string {
        const keyIndex = getFieldKeyIndex(mapping.controlId);
        const output = mapping.keyOutput ?? (portId.toLowerCase().includes('gate') ? 'gate' : 'trigger');
        return output === 'gate'
            ? `hw.KeyboardState(${keyIndex})`
            : `hw.KeyboardRisingEdge(${keyIndex})`;
    }

    private writeParameterSetters(block: BlockInstance, instanceName: string, lines: string[], excludeParams: string[] = []): void {
        const def = this.getActiveBlockDefs().get(block.definitionId);
        if (!def) return;

        def.parameters.forEach(param => {
            if (!param.cppSetter) return;
            if (excludeParams.includes(param.id)) return;

            // Check for CV modulation
            const cvPortId = `${param.id}_cv`;
            const cvConn = this.getInputConnection(block.id, cvPortId);

            let valStr = this.formatFloat(block.parameterValues[param.id] ?? param.defaultValue);

            // Special handling for enums with cppValue
            if (param.type === 'enum' && param.enumValues) {
                const val = block.parameterValues[param.id] ?? param.defaultValue;
                const enumOpt = param.enumValues.find(e => e.value == val);
                if (enumOpt && enumOpt.cppValue) {
                    valStr = enumOpt.cppValue;
                }
            }

            if (cvConn && param.cvModulatable) {
                const cvVar = this.getSourceVariable(cvConn);
                // Simple addition for CV? Or scaling? Standard behavior: param + cv
                // Ideally we'd respect min/max clamping
                // For now, keep it simple as per original design
                valStr = `${valStr} + ${cvVar}`;
            }

            valStr = this.getFieldMappedParameterExpression(block.id, param.id, valStr);

            if (param.cppSetterIndex !== undefined) {
                lines.push(`${instanceName}.${param.cppSetter}(${valStr}, ${param.cppSetterIndex});`);
            } else {
                lines.push(`${instanceName}.${param.cppSetter}(${valStr});`);
            }
        });
    }

    private getPolyVoiceCount(block: BlockInstance): number {
        const requested = Number(block.parameterValues['voice_count'] ?? 8);
        if (!Number.isFinite(requested)) {
            return 8;
        }
        return Math.min(16, Math.max(1, Math.round(requested)));
    }

    private generatePreSampleProcessing(): string[] {
        const platform = this.getTargetPlatform();
        if (platform !== 'field') {
            return [];
        }

        const lines: string[] = [];

        this.patch.blocks
            .filter(block => block.definitionId === 'poly_grainlet_voice')
            .forEach(block => {
                const instanceName = this.getInstanceName(block);
                const octave = Math.min(4, Math.max(0, Math.round(Number(block.parameterValues['octave'] ?? 2))));
                lines.push(`${instanceName}.UpdateKeys(hw, ${octave});`);
            });

        this.patch.blocks
            .filter(block => {
                const def = this.blockDefs.get(block.definitionId);
                return def ? this.isPolyVoiceGroupDefinition(def) : false;
            })
            .forEach(block => {
                const instanceName = this.getInstanceName(block);
                const octave = Math.min(4, Math.max(0, Math.round(Number(block.parameterValues['octave'] ?? 2))));
                lines.push(`${instanceName}_voices.UpdateKeys(hw, ${octave});`);
            });

        this.getPolyVoiceBlankets().forEach(blanket => {
            const instanceName = this.getPolyVoiceBlanketInstanceName(blanket);
            const octave = Math.min(4, Math.max(0, Math.round(Number(blanket.octave ?? 2))));
            lines.push(`${instanceName}_voices.UpdateKeys(hw, ${octave});`);
        });

        return lines;
    }

    // ===========================================================================
    // PHASE 4C: COMPLEX BLOCK GENERATORS
    // ===========================================================================

    private generateBitcrushCode(block: BlockInstance, name: string): string[] {
        // Bitcrush is inline quantization
        const audioIn = this.getInputConnection(block.id, 'in');
        const bitsCV = this.getInputConnection(block.id, 'bits_cv');

        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        let bitsVal = this.formatFloat(block.parameterValues['bits'] ?? 8);
        if (bitsCV) {
            const cvVar = this.getSourceVariable(bitsCV);
            bitsVal = `fmaxf(1.0f, fminf(16.0f, ${bitsVal} + ${cvVar} * 8.0f))`;
        }

        return [
            `float ${name}_levels = powf(2.0f, ${bitsVal});`,
            `sig_${name}_out = roundf(${inputVar} * ${name}_levels) / ${name}_levels;`,
        ];
    }

    private generateDistortionCode(block: BlockInstance, name: string): string[] {
        // Distortion is inline waveshaping
        const audioIn = this.getInputConnection(block.id, 'in');
        const driveCV = this.getInputConnection(block.id, 'drive_cv');

        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        let driveVal = this.formatFloat(block.parameterValues['drive'] ?? 0.5);
        if (driveCV) {
            const cvVar = this.getSourceVariable(driveCV);
            driveVal = `fminf(1.0f, fmaxf(0.0f, ${driveVal} + ${cvVar}))`;
        }
        const level = block.parameterValues['level'] ?? 0.5;

        return [
            `float ${name}_k = 2.0f * ${driveVal} / (1.0f - ${driveVal} + 0.01f);`,
            `sig_${name}_out = (1.0f + ${name}_k) * ${inputVar} / (1.0f + ${name}_k * fabsf(${inputVar})) * ${this.formatFloat(level)};`,
        ];
    }

    private generateStereoMixerCode(block: BlockInstance, name: string): string[] {
        // StereoMixer is inline multi-channel panning
        const channels = ['ch1', 'ch2', 'ch3', 'ch4'];
        let leftTerms: string[] = [];
        let rightTerms: string[] = [];

        channels.forEach(ch => {
            const conn = this.getInputConnection(block.id, ch);
            if (conn) {
                const sourceVar = this.getSourceVariable(conn);
                const level = block.parameterValues[`${ch}_level`] ?? 0.8;
                const pan = block.parameterValues[`${ch}_pan`] ?? 0.5;
                const levelF = this.formatFloat(level);
                const leftGain = this.formatFloat(Math.sqrt(1.0 - (pan as number)));
                const rightGain = this.formatFloat(Math.sqrt(pan as number));
                leftTerms.push(`(${sourceVar} * ${levelF} * ${leftGain})`);
                rightTerms.push(`(${sourceVar} * ${levelF} * ${rightGain})`);
            }
        });

        if (leftTerms.length > 0) {
            return [
                `sig_${name}_left = ${leftTerms.join(' + ')};`,
                `sig_${name}_right = ${rightTerms.join(' + ')};`,
            ];
        }
        return [
            `sig_${name}_left = 0.0f;`,
            `sig_${name}_right = 0.0f;`,
        ];
    }

    private generatePitchShifterCode(block: BlockInstance, name: string): string[] {
        // PitchShifter - simplified implementation note
        const audioIn = this.getInputConnection(block.id, 'in');
        const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
        const mix = block.parameterValues['mix'] ?? 1.0;

        // Note: Real pitch shifting requires buffer implementation
        // This is a placeholder that passes through with mix
        return [
            `// Note: Full pitch shifting requires delay buffer implementation`,
            `sig_${name}_out = ${inputVar} * ${this.formatFloat(mix)};`,
        ];
    }

    // ===========================================================================
    // PHASE 12: NEW FEATURE GENERATORS
    // ===========================================================================

    private generateArpeggiatorCode(block: BlockInstance, name: string): string[] {
        const clock = this.getInputConnection(block.id, 'clock');
        const reset = this.getInputConnection(block.id, 'reset');

        const clockVar = clock ? this.getSourceVariable(clock) : '0.0f'; // Trigger
        const resetVar = reset ? this.getSourceVariable(reset) : '0.0f'; // Trigger

        const processCall = `${name}.Process(${clockVar} > 0.0f, ${resetVar} > 0.0f);`;

        return [
            processCall,
            `sig_${name}_pitch = ${name}.GetPitch();`,
            `sig_${name}_gate = ${name}.GetGate();`,
            `sig_${name}_velocity = ${name}.GetVelocity();`
        ];
    }

    // ===========================================================================
    // OUTPUT ASSIGNMENT
    // ===========================================================================

    private generateOutputAssignment(): string[] {
        const outputBlock = this.patch.blocks.find(b => {
            const def = this.blockDefs.get(b.definitionId);
            return def?.id === 'audio_output';
        });

        if (!outputBlock) {
            return ['out[0][i] = 0.0f;', 'out[1][i] = 0.0f;'];
        }

        const leftConn = this.getInputConnection(outputBlock.id, 'left');
        const rightConn = this.getInputConnection(outputBlock.id, 'right');

        const leftVar = leftConn ? this.getSourceVariable(leftConn) : '0.0f';
        const rightVar = rightConn ? this.getSourceVariable(rightConn) : leftVar;

        return [`out[0][i] = ${leftVar};`, `out[1][i] = ${rightVar};`];
    }

    // ===========================================================================
    // MAIN FUNCTION
    // ===========================================================================

    private generateMain(): string {
        const lines: string[] = [];
        const blockSize = this.patch.metadata.blockSize;
        const platform = this.getTargetPlatform();

        lines.push('int main(void) {');
        lines.push('    hw.Init();');
        lines.push(`    hw.SetAudioBlockSize(${blockSize});`);

        if (platform === 'seed' && this.patch.hardwareConfig?.pinMapping) {
            lines.push('    // Pin Configuration');
            const mapping = this.patch.hardwareConfig.pinMapping;

            // Init ADC
            const adcChannels: string[] = [];

            // Check formatted Knobs (1-4)
            for (let i = 1; i <= 4; i++) {
                const id = `knob_${i}`;
                if (mapping[id]) {
                    // e.g. hw.GetPin(15) -> or use pin name from mapping?
                    // mapping[id] is "Pin 15" or "A0"
                    // We need to parse "Pin 15" to 15.
                    const pinNum = parseInt(mapping[id].replace('Pin ', ''));
                    if (!isNaN(pinNum)) {
                        adcChannels.push(`        adc_cfg[${adcChannels.length}].InitSingle(hw.GetPin(${pinNum}));`);
                    }
                }
            }

            if (adcChannels.length > 0) {
                lines.push(`    AdcChannelConfig adc_cfg[${adcChannels.length}];`);
                lines.push(...adcChannels);
                lines.push(`    hw.adc.Init(adc_cfg, ${adcChannels.length});`);
                lines.push('    hw.adc.Start();');
            }

            // Init Switches
            ['switch_1', 'switch_2'].forEach(id => {
                if (mapping[id]) {
                    const pinNum = parseInt(mapping[id].replace('Pin ', ''));
                    if (!isNaN(pinNum)) {
                        // Init(pin, rate, type, pull, debounce)
                        lines.push(`    ${id}.Init(hw.GetPin(${pinNum}), 1000);`);
                    }
                }
            });

            // Init LEDs
            ['led_1', 'led_2'].forEach(id => {
                if (mapping[id]) {
                    const pinNum = parseInt(mapping[id].replace('Pin ', ''));
                    if (!isNaN(pinNum)) {
                        lines.push(`    ${id}.Init(hw.GetPin(${pinNum}), false);`);
                    }
                }
            });
            lines.push('');
        }

        lines.push('    float sr = hw.AudioSampleRate();');
        lines.push('');
        lines.push('    // Initialize DSP modules');

        const initializedBlankets = new Set<string>();
        this.processingOrder.blocks.forEach(blockId => {
            const blanket = this.getPolyVoiceBlanketForMember(blockId);
            if (blanket) {
                if (!initializedBlankets.has(blanket.id)) {
                    initializedBlankets.add(blanket.id);
                    this.generatePolyVoiceBlanketInitialization(blanket, lines);
                }
                return;
            }

            const block = this.patch.blocks.find(b => b.id === blockId);
            if (!block) return;

            const def = this.blockDefs.get(block.definitionId);
            if (!def) return;

            if (this.isCustomBlockDefinition(def)) {
                if (this.isPolyVoiceGroupDefinition(def)) {
                    this.generatePolyVoiceGroupInitialization(this.getInstanceName(block), block, def, lines);
                } else {
                    this.generateCustomBlockInitialization(this.getInstanceName(block), block, def, lines);
                }
                return;
            }

            this.appendBlockInitialization(block, def, lines);
        });

        lines.push('');
        if (platform === 'seed') {
            lines.push('    hw.adc.Start();');
        } else {
            lines.push('    hw.StartAdc();');
        }
        lines.push('    hw.StartAudio(AudioCallback);');
        lines.push('');
        lines.push('    while(1) {}');
        lines.push('}');

        return lines.join('\n');
    }

    // ===========================================================================
    // MAKEFILE
    // ===========================================================================

    private generateMakefile(): string {
        const projectName = this.patch.metadata.name
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase();

        // Check if patch uses blocks that require LGPL DaisySP (e.g., MoogLadder, ReverbSc)
        // Include both old and new block definition IDs for compatibility
        const lgplBlocks = ['moog_ladder', 'reverb', 'reverb_sc', 'phaser', 'flanger', 'autowah', 'chorus', 'tremolo', 'compressor', 'limiter'];
        const usesLgpl = this.patch.blocks.some(b => lgplBlocks.includes(b.definitionId));

        let lgplConfig = '';
        if (usesLgpl) {
            lgplConfig += 'USE_DAISYSP_LGPL = 1\n';
            lgplConfig += 'C_INCLUDES += -I$(DAISYSP_DIR)/DaisySP-LGPL/Source\n';
            lgplConfig += 'C_INCLUDES += -I$(DAISYSP_DIR)/Source/Utility\n';

            // Add specific sources (check for both old and new IDs)
            if (this.patch.blocks.some(b => b.definitionId === 'reverb' || b.definitionId === 'reverb_sc')) {
                lgplConfig += 'CPP_SOURCES += $(DAISYSP_DIR)/DaisySP-LGPL/Source/Effects/reverbsc.cpp\n';
            }
            if (this.patch.blocks.some(b => b.definitionId === 'moog_ladder')) {
                lgplConfig += 'CPP_SOURCES += $(DAISYSP_DIR)/DaisySP-LGPL/Source/Filters/moogladder.cpp\n';
            }
        }

        return `# Project Name
TARGET = ${projectName}

# Sources
CPP_SOURCES = ${projectName}.cpp

# Library Locations
LIBDAISY_DIR = ../../DaisyExamples/libDaisy
DAISYSP_DIR = ../../DaisyExamples/DaisySP

${lgplConfig}# Core location, and generic Makefile
SYSTEM_FILES_DIR = $(LIBDAISY_DIR)/core
include $(SYSTEM_FILES_DIR)/Makefile
`;
    }

    // ===========================================================================
    // HELPERS
    // ===========================================================================

    private getTargetPlatform(): string {
        const platform = this.patch.hardwareConfig?.platform || this.patch.metadata?.targetHardware || 'seed';
        if (platform === 'pod' || platform === 'field' || platform === 'seed') {
            return platform;
        }
        return 'seed';
    }

    private shouldSkipDeclaration(defId: string): boolean {
        const skipBlocks = [
            'audio_output', 'audio_input', 'knob', 'key', 'encoder', 'gate_trigger_in', 'slider', 'switch',
            'vca', 'mixer', 'add', 'multiply', 'subtract', 'divide',
            'gain', 'bypass', 'sample_delay', 'cv_to_freq', 'mux', 'demux', 'linear_vca', 'linearvca',
            'dust',
            'abs', 'exp', 'pow2', 'dc_source',
            'pan', 'balance', 'softclip', 'hardclip', 'rectifier', 'slew', 'smooth', 'gate',
            'bitcrush', 'distortion', 'stereo_mixer', 'pitch_shifter',
            'midi_note', 'midi_cc', 'cv_input', 'cv_output', 'gate_output', 'led_output'
        ];
        return skipBlocks.includes(defId);
    }

    private shouldSkipInitialization(defId: string): boolean {
        const skipBlocks = [
            'audio_output', 'audio_input', 'knob', 'key', 'encoder', 'gate_trigger_in', 'slider', 'switch',
            'vca', 'mixer', 'add', 'multiply', 'subtract', 'divide',
            'gain', 'bypass', 'sample_delay', 'cv_to_freq', 'mux', 'demux', 'linear_vca', 'linearvca',
            'abs', 'exp', 'pow2', 'dc_source',
            'pan', 'balance', 'softclip', 'hardclip', 'rectifier', 'slew', 'smooth', 'gate',
            'bitcrush', 'distortion', 'stereo_mixer', 'pitch_shifter',
            'midi_note', 'midi_cc', 'cv_input', 'cv_output', 'gate_output', 'led_output'
        ];
        return skipBlocks.includes(defId);
    }

    private appendSignalDeclaration(lines: string[], signalType: SignalType, instanceName: string, portId: string): void {
        if (signalType === SignalType.TRIGGER) {
            lines.push(`bool gate_${instanceName}_${portId} = false;`);
        } else if (signalType === SignalType.CV) {
            lines.push(`float cv_${instanceName}_${portId} = 0.0f;`);
        } else {
            lines.push(`float sig_${instanceName}_${portId} = 0.0f;`);
        }
    }

    private generatePolyVoiceGroupDeclarations(instancePrefix: string, customDef: CustomBlockDefinition, lines: string[], voiceCount: number): void {
        for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex++) {
            this.generateCustomDeclarations(`${instancePrefix}__v${voiceIndex}`, customDef, lines);
        }
    }

    private generateCustomDeclarations(instancePrefix: string, customDef: CustomBlockDefinition, lines: string[], depth = 0): void {
        if (depth >= 3 || !customDef.internalPatch?.blocks?.length) return;

        const internalDefs = this.createInternalDefsMap(customDef.internalPatch);

        customDef.internalPatch.blocks.forEach(internalBlock => {
            const internalDef = internalDefs.get(internalBlock.definitionId);
            if (!internalDef) return;

            const runtimeName = `${instancePrefix}__${this.sanitizeIdentifier(internalBlock.id)}`;

            if (this.isCustomBlockDefinition(internalDef)) {
                this.generateCustomDeclarations(runtimeName, internalDef, lines, depth + 1);
                return;
            }

            if (internalDef.cppInlineProcess) {
                if (internalDef.cppStateVars) {
                    internalDef.cppStateVars.forEach(v => {
                        lines.push(`${v.type} state_${runtimeName}_${v.name} = ${v.init};`);
                    });
                }
                return;
            }

            if (this.shouldSkipDeclaration(internalDef.id)) {
                if (internalDef.id === 'switch') {
                    lines.push(`bool latch_${runtimeName} = false;`);
                }
                return;
            }

            const className = internalDef.className.replace('daisysp::', '');
            lines.push(`${className} ${runtimeName};`);
        });
    }

    private generatePolyVoiceGroupSignalDeclarations(instancePrefix: string, customDef: CustomBlockDefinition, lines: string[], voiceCount: number): void {
        for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex++) {
            this.generateCustomSignalDeclarations(`${instancePrefix}__v${voiceIndex}`, customDef, lines);
        }
    }

    private generateCustomSignalDeclarations(instancePrefix: string, customDef: CustomBlockDefinition, lines: string[], depth = 0): void {
        if (depth >= 3 || !customDef.internalPatch?.blocks?.length) return;

        const internalDefs = this.createInternalDefsMap(customDef.internalPatch);

        customDef.internalPatch.blocks.forEach(internalBlock => {
            const internalDef = internalDefs.get(internalBlock.definitionId);
            if (!internalDef) return;

            const runtimeName = `${instancePrefix}__${this.sanitizeIdentifier(internalBlock.id)}`;

            internalDef.ports
                .filter(p => p.direction === PortDirection.OUTPUT)
                .forEach(port => {
                    this.appendSignalDeclaration(lines, port.signalType, runtimeName, port.id);
                });

            if (this.isCustomBlockDefinition(internalDef)) {
                this.generateCustomSignalDeclarations(runtimeName, internalDef, lines, depth + 1);
            }
        });
    }

    private appendBlockInitialization(block: BlockInstance, def: BlockDefinition, lines: string[]): void {
        // Phase 13: Skip inline blocks (no class to init)
        if (def.cppInlineProcess || def.cppProcessTemplate) return;

        if (this.shouldSkipInitialization(def.id)) {
            return;
        }

        const instanceName = this.getInstanceName(block);

        // Special init handling for specific blocks
        if (def.id === 'whitenoise') {
            // WhiteNoise.Init() takes no arguments
            lines.push(`    ${instanceName}.Init();`);
        } else if (def.id === 'adsr') {
            // ADSR needs special SetTime handling with segment parameter
            lines.push(`    ${instanceName}.Init(sr);`);
            const attack = block.parameterValues['attack'] ?? 0.01;
            const decay = block.parameterValues['decay'] ?? 0.1;
            const sustain = block.parameterValues['sustain'] ?? 0.7;
            const release = block.parameterValues['release'] ?? 0.3;
            lines.push(`    ${instanceName}.SetTime(ADSR_SEG_ATTACK, ${this.formatFloat(attack)});`);
            lines.push(`    ${instanceName}.SetTime(ADSR_SEG_DECAY, ${this.formatFloat(decay)});`);
            lines.push(`    ${instanceName}.SetSustainLevel(${this.formatFloat(sustain)});`);
            lines.push(`    ${instanceName}.SetTime(ADSR_SEG_RELEASE, ${this.formatFloat(release)});`);
        } else if (def.id === 'decimator') {
            lines.push(`    ${instanceName}.Init();`);
        } else if (def.id === 'delay' || def.id === 'delay_line') {
            lines.push(`    ${instanceName}.Init();`);
        } else if (def.id === 'onepole') {
            lines.push(`    ${instanceName}.Init();`);
        } else if (def.id === 'ad_env') {
            // AdEnv needs special SetTime handling with ADENV_SEG_* constants
            lines.push(`    ${instanceName}.Init(sr);`);
            const attack = block.parameterValues['attack'] ?? 0.01;
            const decay = block.parameterValues['decay'] ?? 0.5;
            const curve = block.parameterValues['curve'] ?? 0.0;
            lines.push(`    ${instanceName}.SetTime(ADENV_SEG_ATTACK, ${this.formatFloat(attack)});`);
            lines.push(`    ${instanceName}.SetTime(ADENV_SEG_DECAY, ${this.formatFloat(decay)});`);
            lines.push(`    ${instanceName}.SetCurve(${this.formatFloat(curve)});`);
        } else {
            // Standard Init with sample rate
            lines.push(`    ${instanceName}.Init(sr);`);

            // Set default parameters (skip for ADSR/AdEnv as we handle it specially)
            def.parameters.forEach(param => {
                const value = block.parameterValues[param.id] ?? param.defaultValue;
                // Skip SetTime for ADSR as we handled it above
                if (def.id === 'adsr' && param.cppSetter === 'SetTime') return;

                if (param.cppSetter && value !== undefined) {
                    if (param.type === 'enum' && param.enumValues) {
                        const enumVal = param.enumValues.find(e => e.value === value);
                        if (enumVal?.cppValue) {
                            if (param.cppSetterIndex !== undefined) {
                                lines.push(`    ${instanceName}.${param.cppSetter}(${enumVal.cppValue}, ${param.cppSetterIndex});`);
                            } else {
                                lines.push(`    ${instanceName}.${param.cppSetter}(${enumVal.cppValue});`);
                            }
                        }
                    } else {
                        // Numeric or Boolean
                        const valStr = typeof value === 'boolean' ? String(value) : this.formatFloat(value as number);
                        if (param.cppSetterIndex !== undefined) {
                            lines.push(`    ${instanceName}.${param.cppSetter}(${valStr}, ${param.cppSetterIndex});`);
                        } else {
                            lines.push(`    ${instanceName}.${param.cppSetter}(${valStr});`);
                        }
                    }
                }
            });
        }
    }

    private generatePolyVoiceGroupInitialization(instancePrefix: string, customBlock: BlockInstance, customDef: CustomBlockDefinition, lines: string[]): void {
        lines.push(`    ${instancePrefix}_voices.Init();`);

        const voiceCount = this.getPolyVoiceCount(customBlock);
        for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex++) {
            this.generateCustomBlockInitialization(`${instancePrefix}__v${voiceIndex}`, customBlock, customDef, lines);
        }
    }

    private generateCustomBlockInitialization(instancePrefix: string, customBlock: BlockInstance, customDef: CustomBlockDefinition, lines: string[], depth = 0): void {
        if (depth >= 3 || !customDef.internalPatch?.blocks?.length) return;

        const internalPatch = customDef.internalPatch;
        const internalDefs = this.createInternalDefsMap(internalPatch);
        const internalOrder = GraphAnalyzer.getProcessingOrder(
            internalPatch.blocks,
            internalPatch.connections,
            internalDefs
        );

        const parameterOverrides = this.buildCustomParameterOverrides(customBlock, customDef);

        internalOrder.blocks.forEach(internalBlockId => {
            const internalBlock = internalPatch.blocks.find(b => b.id === internalBlockId);
            if (!internalBlock) return;

            const internalDef = internalDefs.get(internalBlock.definitionId);
            if (!internalDef) return;

            const overrides = parameterOverrides.get(internalBlock.id);
            const runtimeBlock: BlockInstance = {
                ...internalBlock,
                id: `${instancePrefix}__${this.sanitizeIdentifier(internalBlock.id)}`,
                parameterValues: overrides
                    ? { ...internalBlock.parameterValues, ...overrides }
                    : internalBlock.parameterValues,
            };

            if (this.isCustomBlockDefinition(internalDef)) {
                this.generateCustomBlockInitialization(runtimeBlock.id, runtimeBlock, internalDef, lines, depth + 1);
                return;
            }

            this.appendBlockInitialization(runtimeBlock, internalDef, lines);
        });
    }

    private getInstanceName(block: BlockInstance): string {
        const context = this.getCurrentContext();
        const sanitized = this.sanitizeIdentifier(block.id);

        if (!context) {
            return sanitized;
        }

        return `${context.instancePrefix}__${sanitized}`;
    }

    private getInputConnection(blockId: string, portId: string): Connection | undefined {
        const context = this.getCurrentContext();
        if (context) {
            const override = context.inputOverrides.get(`${blockId}:${portId}`);
            if (override !== undefined) {
                return this.makeOverrideConnection(blockId, portId);
            }
        }

        return this.getActivePatch().connections.find(
            c => c.targetBlockId === blockId && c.targetPortId === portId
        );
    }

    private getSourceVariable(conn: Connection): string {
        const context = this.getCurrentContext();

        if (conn.sourceBlockId === '__override__') {
            return context?.inputOverrides.get(conn.sourcePortId) || '0.0f';
        }

        if (!context) {
            const blanketOutput = this.getPolyVoiceBlanketOutputSignalForConnection(conn);
            if (blanketOutput) {
                return blanketOutput;
            }
        }

        const activePatch = this.getActivePatch();
        const activeDefs = this.getActiveBlockDefs();

        const sourceBlock = activePatch.blocks.find(b => b.id === conn.sourceBlockId);
        if (!sourceBlock) return '0.0f';

        const sourceDef = activeDefs.get(sourceBlock.definitionId);
        if (!sourceDef) return '0.0f';

        const sourceInstanceName = this.getInstanceName(sourceBlock);
        const sourcePort = sourceDef.ports.find(p => p.id === conn.sourcePortId);

        if (sourcePort?.signalType === SignalType.CV) {
            return `cv_${sourceInstanceName}_${conn.sourcePortId}`;
        } else if (sourcePort?.signalType === SignalType.TRIGGER) {
            return `gate_${sourceInstanceName}_${conn.sourcePortId}`;
        } else {
            return `sig_${sourceInstanceName}_${conn.sourcePortId}`;
        }
    }

    /**
     * Format a number as a C++ float literal with decimal point
     * e.g., 440 -> "440.0f", 0.5 -> "0.5f"
     */
    private formatFloat(value: unknown): string {
        const num = Number(value);
        if (isNaN(num)) return '0.0f';
        // Ensure at least one decimal place
        const str = num.toString();
        if (str.includes('.')) {
            return `${num}f`;
        }
        return `${num}.0f`;
    }

    // ===========================================================================
    // FEATURE DETECTION HELPERS (Bug #014 fix)
    // ===========================================================================

    /**
     * Check if patch uses any delay-based blocks requiring MAX_DELAY buffer
     */
    private usesDelayBlock(): boolean {
        return this.patch.blocks.some(b =>
            b.definitionId === 'delay_line' ||
            b.definitionId === 'delay' ||
            b.definitionId === 'chorus' ||
            b.definitionId === 'flanger' ||
            b.definitionId === 'reverb_sc' ||
            b.definitionId === 'reverb'
        );
    }

    /**
     * Check if patch uses any MIDI-related blocks
     */
    private usesMidiBlocks(): boolean {
        const midiBlocks = ['midi_note', 'midi_cc', 'arpeggiator'];
        return this.patch.blocks.some(b => midiBlocks.includes(b.definitionId));
    }

    /**
     * Check if patch uses arpeggiator block specifically
     */
    private usesArpeggiator(): boolean {
        return this.patch.blocks.some(b => b.definitionId === 'arpeggiator');
    }

    private usesPolyGrainletVoice(): boolean {
        return this.patch.blocks.some(b => b.definitionId === 'poly_grainlet_voice');
    }

    private usesPolyVoiceGroup(): boolean {
        return this.patch.blocks.some(block => {
            const def = this.blockDefs.get(block.definitionId);
            return def ? this.isPolyVoiceGroupDefinition(def) : false;
        });
    }

    private usesPolyVoiceBlanket(): boolean {
        return this.getPolyVoiceBlankets().length > 0;
    }

    private usesPolyVoiceAllocator(): boolean {
        return this.usesPolyVoiceGroup() || this.usesPolyVoiceBlanket();
    }

    // ===========================================================================
    // PHASE 5: Hardware I/O
    // ===========================================================================

    private generateMidiNoteCode(block: BlockInstance, name: string): string[] {
        // Output code that relies on external MIDI handling
        // For now, we assume global variables are populated by a MIDI handler
        return [
            `// Block: ${block.id} (MidiNote)`,
            `// Note: Requires external MIDI handler to update these globals`,
            `// float ${name}_pitch = midi_pitch_global;`,
            `// float ${name}_velocity = midi_velocity_global;`,
            `// float ${name}_gate = midi_gate_global;`,
        ];
    }

    private generateMidiCCCode(block: BlockInstance, name: string): string[] {
        const channel = Number(block.parameterValues['channel'] ?? 1);
        const cc = Number(block.parameterValues['cc_number'] ?? 1);
        return [
            `// Block: ${block.id} (MidiCC Ch${channel} CC${cc})`,
            `// float ${name}_value = midi_cc_values[${channel}][${cc}];`
        ];
    }

    private generateCVInputCode(block: BlockInstance, name: string): string[] {
        const channel = Number(block.parameterValues['channel'] ?? 0);
        const bipolar = block.parameterValues['bipolar'] === true;
        const platform = this.getTargetPlatform();

        if (platform === 'field') {
            const safeChannel = Math.min(Math.max(0, channel), 3);
            let readCode = `cv_${name}_out = hw.GetCvValue(DaisyField::CV_${safeChannel + 1});`;
            if (bipolar) {
                readCode += ` // Unipolar to Bipolar`;
                readCode += `\n    cv_${name}_out = (cv_${name}_out * 2.0f) - 1.0f;`;
            }
            return [readCode];
        }

        let readCode = `cv_${name}_out = hw.adc.GetFloat(${Math.max(0, channel)});`;
        if (bipolar) {
            readCode += ` // Unipolar to Bipolar`;
            readCode += `\n    cv_${name}_out = (cv_${name}_out * 2.0f) - 1.0f;`;
        }
        return [readCode];
    }

    private generateCVOutputCode(block: BlockInstance, _name: string): string[] {
        const channel = Number(block.parameterValues['channel'] ?? 0);
        const inConn = this.getInputConnection(block.id, 'in');
        const inVar = inConn ? this.getSourceVariable(inConn) : '0.0f';

        const platform = this.getTargetPlatform();
        const safeChannel = Math.min(Math.max(0, channel), 1);
        const scaledValue = `(uint16_t)(fminf(1.0f, fmaxf(0.0f, ${inVar})) * 4095.0f)`;

        if (platform === 'field') {
            return [
                `// CV Output Ch${safeChannel}`,
                safeChannel === 0
                    ? `hw.SetCvOut1(${scaledValue});`
                    : `hw.SetCvOut2(${scaledValue});`
            ];
        }

        return [
            `// CV Output Ch${safeChannel}`,
            `hw.seed.dac.WriteValue((daisy::DacHandle::Channel)${safeChannel}, ${scaledValue});`
        ];
    }

    private generateGateOutputCode(block: BlockInstance, _name: string): string[] {
        const gateVar = this.getInputExpression(block, 'gate', '0.0f');
        const platform = this.getTargetPlatform();

        if (platform === 'field') {
            return [
                `// Gate Output`,
                `dsy_gpio_write(&hw.gate_out, ${gateVar} > 0.5f);`
            ];
        }

        const pin = Number(block.parameterValues['pin'] ?? 0);
        const safePin = Math.max(0, pin);

        return [
            `// Gate Output Pin ${safePin}`,
            `// Assuming custom GateOutput wrapper or direct GPIO`,
            `dsy_gpio_write(&hw.gate_out_pins[${safePin}], ${gateVar} > 0.5f); // Pseudo-code, verify Field implementation`
        ];
    }

    private generateLEDOutputCode(block: BlockInstance, _name: string): string[] {
        const pin = Number(block.parameterValues['pin'] ?? 0);
        // const pwm = block.parameterValues['pwm'] === true; // Unused
        const brightConn = this.getInputConnection(block.id, 'brightness');
        const brightVar = brightConn ? this.getSourceVariable(brightConn) : '0.0f';

        // Daisy Field LED: hw.led[i] needed? The keyboard LEDs are usually controlled by KeyboardState or separately.
        // Assuming generic LED or specific Field LED (maybe the button LEDs?)
        return [
            `// LED Output Pin ${pin}`,
            `// Placeholder for Field LED control`,
            `// LED Output Pin ${pin}`,
            `// Placeholder for Field LED control`,
            `// hw.led[${pin}].Set(${brightVar});`
        ];
    }

    // ===========================================================================
    // PHASE 12: NEW FEATURES
    // ===========================================================================

    private generateSliderCode(block: BlockInstance, name: string): string[] {
        const channel = parseInt(block.parameterValues['channel'] as string) || 0;
        const min = block.parameterValues['min'] ?? 0;
        const max = block.parameterValues['max'] ?? 1;
        const range = (max as number) - (min as number);

        // Using hw.knob[channel] to read ADC
        return [`cv_${name}_out = ${this.formatFloat(min)} + (hw.knob[${channel}].Value() * ${this.formatFloat(range)});`];
    }

    private generateSwitchCode(block: BlockInstance, name: string): string[] {
        const channel = parseInt(block.parameterValues['channel'] as string) || 0;
        const platform = this.getTargetPlatform();
        const safeChannel = Math.min(Math.max(0, channel), 1);
        const pressedExpr = platform === 'field'
            ? `hw.GetSwitch(DaisyField::SW_${safeChannel + 1})->Pressed()`
            : `hw.switches[${safeChannel}].Pressed()`;
        const risingExpr = platform === 'field'
            ? `hw.GetSwitch(DaisyField::SW_${safeChannel + 1})->RisingEdge()`
            : `hw.switches[${safeChannel}].RisingEdge()`;

        return [
            `bool sw_state = ${pressedExpr};`,
            `gate_${name}_gate = sw_state;`,
            `gate_${name}_trig = ${risingExpr};`,
            `if (gate_${name}_trig) latch_${name} = !latch_${name};`,
            `gate_${name}_latch = latch_${name};`
        ];
    }

    private generateAbsCode(block: BlockInstance, name: string): string[] {
        const cvIn = this.getInputConnection(block.id, 'in');
        const inputVar = cvIn ? this.getSourceVariable(cvIn) : '0.0f';
        return [`cv_${name}_out = fabsf(${inputVar});`];
    }

    private generateExpCode(block: BlockInstance, name: string): string[] {
        const cvIn = this.getInputConnection(block.id, 'in');
        const inputVar = cvIn ? this.getSourceVariable(cvIn) : '0.0f';
        return [`cv_${name}_out = expf(${inputVar});`];
    }

    private generatePow2Code(block: BlockInstance, name: string): string[] {
        const cvIn = this.getInputConnection(block.id, 'in');
        const inputVar = cvIn ? this.getSourceVariable(cvIn) : '0.0f';
        return [`cv_${name}_out = powf(2.0f, ${inputVar});`];
    }

    private generateDcSourceCode(block: BlockInstance, name: string): string[] {
        const val = block.parameterValues['value'] ?? 1.0;
        return [`cv_${name}_out = ${this.formatFloat(val)};`];
    }

    private generateCompressorExpanderCode(block: BlockInstance, instanceName: string): string[] {
        const lines: string[] = [];
        this.writeParameterSetters(block, instanceName, lines);
        const inputVar = this.getInputValue(block, 'in');
        lines.push(`sig_${instanceName}_out = ${instanceName}.Process(${inputVar});`);
        return lines;
    }

    private generateSolaTimeStretchCode(block: BlockInstance, instanceName: string): string[] {
        const lines: string[] = [];
        this.writeParameterSetters(block, instanceName, lines);
        const inputVar = this.getInputValue(block, 'in');
        // Streaming API handling
        lines.push(`if (${instanceName}.FeedInput(${inputVar})) {`);
        lines.push(`    // New output available`);
        lines.push(`}`);
        lines.push(`if (${instanceName}.OutputAvailable()) {`);
        lines.push(`    sig_${instanceName}_out = ${instanceName}.GetOutput();`);
        lines.push(`} else {`);
        lines.push(`    sig_${instanceName}_out = 0.0f;`);
        lines.push(`}`);
        return lines;
    }

    private generateCrosstalkCancellerCode(block: BlockInstance, instanceName: string): string[] {
        const lines: string[] = [];
        this.writeParameterSetters(block, instanceName, lines);
        const leftIn = this.getInputValue(block, 'left_in');
        const rightIn = this.getInputValue(block, 'right_in');
        // Pointer-based API handling
        lines.push(`${instanceName}.Process(${leftIn}, ${rightIn}, &sig_${instanceName}_left_out, &sig_${instanceName}_right_out);`);
        return lines;
    }

    private generateRobotizationCode(block: BlockInstance, instanceName: string): string[] {
        const lines: string[] = [];
        this.writeParameterSetters(block, instanceName, lines);
        const inputVar = this.getInputValue(block, 'in');
        lines.push(`sig_${instanceName}_out = ${instanceName}.Process(${inputVar});`);
        return lines;
    }

    private generateWhisperizationCode(block: BlockInstance, instanceName: string): string[] {
        const lines: string[] = [];
        this.writeParameterSetters(block, instanceName, lines);
        const inputVar = this.getInputValue(block, 'in');
        lines.push(`sig_${instanceName}_out = ${instanceName}.Process(${inputVar});`);
        return lines;
    }

    private generateYinPitchCode(block: BlockInstance, instanceName: string): string[] {
        const lines: string[] = [];
        this.writeParameterSetters(block, instanceName, lines);
        const inputVar = this.getInputValue(block, 'in');
        lines.push(`${instanceName}.ProcessSample(${inputVar});`);
        lines.push(`cv_${instanceName}_freq = ${instanceName}.GetFreq();`);
        lines.push(`cv_${instanceName}_midi = ${instanceName}.GetMidiNote();`);
        lines.push(`cv_${instanceName}_conf = ${instanceName}.GetConfidence();`);
        return lines;
    }

    private generateEnvelopeFollowerCode(block: BlockInstance, instanceName: string): string[] {
        const lines: string[] = [];
        this.writeParameterSetters(block, instanceName, lines);
        const inputVar = this.getInputValue(block, 'in');
        lines.push(`cv_${instanceName}_env = ${instanceName}.Process(${inputVar});`);
        return lines;
    }

    // ===========================================================================
    // PHASE 13.4: CODE MODULE GENERATOR
    // ===========================================================================

    /**
     * Generate processing code for a code module custom block.
     * Injects user's C++ code verbatim with port variable mappings.
     */
    private generateCodeModuleProcessing(block: BlockInstance, customDef: CustomBlockDefinition): string[] {
        const codeModule = customDef.codeModule!;
        const instanceName = this.getInstanceName(block);
        const lines: string[] = [];

        // Add comment
        lines.push(`// Code Module: ${customDef.displayName}`);

        // Create input variable mappings (portId -> sourceVariable)
        const inputMappings = new Map<string, string>();
        codeModule.portBindings
            .filter(p => p.direction === PortDirection.INPUT)
            .forEach(port => {
                const conn = this.getInputConnection(block.id, port.id);
                const sourceVar = conn
                    ? this.getSourceVariable(conn)
                    : this.getDefaultValueForSignalType(port.signalType);
                inputMappings.set(port.id, sourceVar);
            });

        // Wrap user code in a scoped block with variable mappings
        lines.push('{');

        // Declare local variables for inputs (to avoid collisions and provide clean names)
        codeModule.portBindings
            .filter(p => p.direction === PortDirection.INPUT)
            .forEach(port => {
                const type = port.signalType === SignalType.TRIGGER ? 'bool' :
                    port.signalType === SignalType.CV ? 'float' : 'float';
                const sourceVar = inputMappings.get(port.id)!;
                lines.push(`    ${type} ${port.id} = ${sourceVar};`);
            });

        // Declare output variables
        codeModule.portBindings
            .filter(p => p.direction === PortDirection.OUTPUT)
            .forEach(port => {
                const type = port.signalType === SignalType.TRIGGER ? 'bool' :
                    port.signalType === SignalType.CV ? 'float' : 'float';
                const defaultValue = port.signalType === SignalType.TRIGGER ? 'false' : '0.0f';
                lines.push(`    ${type} ${port.id} = ${defaultValue};`);
            });

        // State variables (if any)
        if (codeModule.stateVariables && codeModule.stateVariables.length > 0) {
            lines.push('    // State variables');
            codeModule.stateVariables.forEach(state => {
                const prefixedName = `state_${instanceName}_${state.name}`;
                lines.push(`    ${state.type}& ${state.name} = ${prefixedName};`);
            });
        }

        // Inject user code (indented)
        const userCodeLines = codeModule.cppCode.split('\n');
        userCodeLines.forEach(line => {
            // Only indent non-empty lines
            if (line.trim()) {
                lines.push('    ' + line);
            } else {
                lines.push('');
            }
        });

        // Assign outputs to external signal variables
        codeModule.portBindings
            .filter(p => p.direction === PortDirection.OUTPUT)
            .forEach(port => {
                const targetVar = this.getSignalVariable(instanceName, port.id, port.signalType);
                lines.push(`    ${targetVar} = ${port.id};`);
            });

        // Close the scoped block
        lines.push('}');

        return lines;
    }

    // ===========================================================================
    // PHASE 13: INLINE PROCESSING GENERATOR
    // ===========================================================================

    private generateInlineProcessCode(block: BlockInstance, def: BlockDefinition): string[] {
        const lines: string[] = [];
        const instanceName = this.getInstanceName(block);

        // Use template if available, otherwise inline expression
        let code = def.cppProcessTemplate || def.cppInlineProcess || '';

        // 1. Substitute Inputs
        def.ports
            .filter(p => p.direction === PortDirection.INPUT)
            .forEach(port => {
                const inConn = this.getInputConnection(block.id, port.id);
                const inputVar = inConn ? this.getSourceVariable(inConn) : '0.0f';
                const regex = new RegExp(`{{${port.id}}}`, 'g');
                code = code.replace(regex, inputVar);
            });

        // 2. Substitute Parameters
        def.parameters.forEach(param => {
            const val = block.parameterValues[param.id] ?? param.defaultValue;
            const regex = new RegExp(`{{${param.id}}}`, 'g');
            if (param.type === 'float' && typeof val === 'number') {
                code = code.replace(regex, this.formatFloat(val));
            } else {
                code = code.replace(regex, String(val));
            }
        });

        // 3. Substitute State Variables
        if (def.cppStateVars) {
            def.cppStateVars.forEach(v => {
                const stateVar = `state_${instanceName}_${v.name}`;
                const regex = new RegExp(`{{${v.name}}}`, 'g');
                code = code.replace(regex, stateVar);
            });
        }

        // 4. Handle Output Assignment
        if (def.cppProcessTemplate) {
            // In template mode, substitute output placeholders
            def.ports
                .filter(p => p.direction === PortDirection.OUTPUT)
                .forEach(port => {
                    let prefix = 'sig';
                    if (port.signalType === SignalType.CV) prefix = 'cv';
                    if (port.signalType === SignalType.TRIGGER) prefix = 'gate';
                    const outVar = `${prefix}_${instanceName}_${port.id}`;
                    const regex = new RegExp(`{{${port.id}}}`, 'g');
                    code = code.replace(regex, outVar);
                });

            lines.push(...code.split('\n'));
        } else {
            // Inline Expression mode: Assign expression to all outputs
            def.ports
                .filter(p => p.direction === PortDirection.OUTPUT)
                .forEach(port => {
                    let prefix = 'sig';
                    if (port.signalType === SignalType.CV) prefix = 'cv';
                    if (port.signalType === SignalType.TRIGGER) prefix = 'gate';
                    const outVar = `${prefix}_${instanceName}_${port.id}`;
                    lines.push(`${outVar} = ${code};`);
                });
        }

        return lines;
    }
}
