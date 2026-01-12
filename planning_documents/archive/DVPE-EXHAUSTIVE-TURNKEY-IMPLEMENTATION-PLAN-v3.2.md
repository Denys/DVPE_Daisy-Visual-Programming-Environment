# DVPE EXHAUSTIVE TURNKEY IMPLEMENTATION PLAN
## Daisy Visual Programming Environment - Complete Build Instructions

**Version:** 3.2
**Status:** ✅ AUTHORIZED FOR IMMEDIATE OPERATIONAL DEPLOYMENT  
**Target Platform:** Daisy Field  
**Validation Benchmark:** Dual-Voice Subtractive Synthesizer  
**Architecture:** Approach A - Tool First  
**Development Model:** Parallelized work streams  
**Previous Version:** 3.1 FROZEN (2025-12-12)
**Update Date:** 2025-12-12
**Update Focus:** Detailed Phase 3, 4, 5 Implementation Specifications

---

## VERSION 3.2 CHANGELOG

### Changes from v3.1

1. **Phase 3: Code Generation Engine** - Expanded from summary to full implementation with:
   - Complete CodeGenerator class implementation
   - Detailed template files with code samples
   - CV routing and hardware mapping analyzers
   - Connection type handling

2. **Phase 4: Integration & Validation** - Expanded with:
   - Complete reference patch JSON specification
   - Step-by-step hardware validation protocol
   - Debugging and troubleshooting procedures
   - Performance optimization guidelines

3. **Phase 5: Extended Features** - Expanded with:
   - LFO block implementation
   - Effects blocks (Reverb, Delay, Chorus)
   - Custom Block Compiler specification
   - Polyphony system design

---

## 5. PHASE 3: CODE GENERATION ENGINE (Weeks 4-6)

### 5.1 Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    CODE GENERATION PIPELINE                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [PatchGraph]  ──────────────────────────────────────────────▶ │
│        │                                                       │
│        ▼                                                       │
│  ┌────────────────┐                                            │
│  │  GraphAnalyzer │  ◀─── Topological Sort                     │
│  │                │  ◀─── Cycle Detection                      │
│  │                │  ◀─── Audio Path Analysis                  │
│  └───────┬────────┘                                            │
│          │                                                     │
│          ▼                                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              ANALYZERS                                  │   │
│  │  ┌──────────────┐ ┌────────────────┐ ┌───────────────┐ │   │
│  │  │ Processing   │ │  CV Routing    │ │   Hardware    │ │   │
│  │  │    Order     │ │   Analyzer     │ │    Mapping    │ │   │
│  │  └──────────────┘ └────────────────┘ └───────────────┘ │   │
│  └─────────────────────────┬──────────────────────────────┘    │
│                            │                                   │
│                            ▼                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              TEMPLATE ENGINE                            │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │   │
│  │  │   Header    │ │    Init     │ │  AudioCallback   │  │   │
│  │  │  Template   │ │  Template   │ │    Template      │  │   │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘  │   │
│  │  ┌─────────────┐ ┌─────────────┐                       │   │
│  │  │    Main     │ │  Makefile   │                       │   │
│  │  │  Template   │ │  Template   │                       │   │
│  │  └─────────────┘ └─────────────┘                       │   │
│  └─────────────────────────┬──────────────────────────────┘    │
│                            │                                   │
│                            ▼                                   │
│                     [Generated Files]                          │
│                    • main.cpp                                  │
│                    • Makefile                                  │
└────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Core Code Generator

**Task 3.1: Create `src/codegen/CodeGenerator.ts`**

```typescript
// src/codegen/CodeGenerator.ts

import { PatchGraph, BlockInstance, Connection, BlockDefinition } from '@/core/types';
import { BlockRegistry } from '@/core/blocks';
import { GraphAnalyzer, ProcessingOrder } from '@/core/graph/GraphAnalyzer';
import { CVRoutingAnalyzer, CVRoute } from './analyzers/CVRoutingAnalyzer';
import { HardwareMappingAnalyzer, HardwareMapping } from './analyzers/HardwareMappingAnalyzer';

export interface GeneratedCode {
  mainCpp: string;
  makefile: string;
  errors: string[];
  warnings: string[];
}

export interface BlockCodeContext {
  instanceName: string;      // e.g., 'osc_1'
  definition: BlockDefinition;
  block: BlockInstance;
  inputConnections: Connection[];
  outputConnections: Connection[];
}

export class CodeGenerator {
  private patch: PatchGraph;
  private blockDefs: Map<string, BlockDefinition>;
  private processingOrder: ProcessingOrder;
  private cvRoutes: CVRoute[];
  private hardwareMapping: HardwareMapping;
  
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
    
    // Analyze CV routing
    this.cvRoutes = CVRoutingAnalyzer.analyze(patch.connections, this.blockDefs);
    
    // Analyze hardware mapping
    this.hardwareMapping = HardwareMappingAnalyzer.analyze(patch.blocks, this.blockDefs);
  }
  
  generate(): GeneratedCode {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check processing order validity
    if (!this.processingOrder.valid) {
      return {
        mainCpp: '',
        makefile: '',
        errors: [this.processingOrder.error || 'Invalid graph'],
        warnings: [],
      };
    }
    
    // Generate code sections
    const includes = this.generateIncludes();
    const declarations = this.generateDeclarations();
    const audioCallback = this.generateAudioCallback();
    const mainFunction = this.generateMain();
    
    const mainCpp = `${includes}

${declarations}

${audioCallback}

${mainFunction}`;

    const makefile = this.generateMakefile();
    
    return { mainCpp, makefile, errors, warnings };
  }
  
  // =====================
  // INCLUDES SECTION
  // =====================
  private generateIncludes(): string {
    const includes = new Set<string>();
    includes.add('#include "daisy_field.h"');
    includes.add('#include "daisysp.h"');
    
    // Add block-specific includes
    this.blockDefs.forEach(def => {
      if (def.headerFile && def.headerFile !== 'daisysp.h') {
        includes.add(`#include "${def.headerFile}"`);
      }
    });
    
    return `// Generated by DVPE - ${this.patch.metadata.name}
// ${new Date().toISOString()}

${Array.from(includes).join('\n')}

using namespace daisy;
using namespace daisysp;`;
  }
  
  // =====================
  // DECLARATIONS SECTION
  // =====================
  private generateDeclarations(): string {
    const lines: string[] = [];
    
    lines.push('// Hardware');
    lines.push('DaisyField hw;');
    lines.push('');
    lines.push('// DSP Modules');
    
    this.patch.blocks.forEach(block => {
      const def = this.blockDefs.get(block.definitionId);
      if (!def) return;
      
      const instanceName = this.getInstanceName(block);
      
      // Skip hardware I/O blocks (they don't need instances)
      if (def.category === 'I/O' && !def.className) {
        return;
      }
      
      if (def.namespace) {
        lines.push(`${def.namespace}::${def.className} ${instanceName};`);
      } else if (def.className) {
        lines.push(`${def.className} ${instanceName};`);
      }
    });
    
    // Add signal routing variables
    lines.push('');
    lines.push('// Signal Variables');
    
    this.patch.blocks.forEach(block => {
      const def = this.blockDefs.get(block.definitionId);
      if (!def) return;
      
      const instanceName = this.getInstanceName(block);
      
      // Audio output variables
      const audioOuts = def.ports.filter(p => p.type === 'audio_out');
      audioOuts.forEach(port => {
        lines.push(`float sig_${instanceName}_${port.id} = 0.0f;`);
      });
      
      // CV output variables
      const cvOuts = def.ports.filter(p => p.type === 'cv_out');
      cvOuts.forEach(port => {
        lines.push(`float cv_${instanceName}_${port.id} = 0.0f;`);
      });
    });
    
    return lines.join('\n');
  }
  
  // =====================
  // AUDIO CALLBACK
  // =====================
  private generateAudioCallback(): string {
    const lines: string[] = [];
    
    lines.push('void AudioCallback(AudioHandle::InputBuffer in,');
    lines.push('                   AudioHandle::OutputBuffer out,');
    lines.push('                   size_t size) {');
    lines.push('    hw.ProcessAllControls();');
    lines.push('');
    
    // Read hardware controls (outside sample loop)
    lines.push('    // Read hardware controls');
    this.hardwareMapping.knobs.forEach((blockId, index) => {
      const block = this.patch.blocks.find(b => b.id === blockId);
      if (block) {
        const instanceName = this.getInstanceName(block);
        lines.push(`    float knob_${instanceName} = hw.knob[${index}].Value();`);
      }
    });
    
    // Read keyboard state
    lines.push('');
    lines.push('    // Read keyboard');
    this.hardwareMapping.keys.forEach((blockId, index) => {
      const block = this.patch.blocks.find(b => b.id === blockId);
      if (block) {
        const instanceName = this.getInstanceName(block);
        lines.push(`    bool key_${instanceName} = hw.KeyboardState(${index});`);
      }
    });
    
    lines.push('');
    lines.push('    for (size_t i = 0; i < size; i++) {');
    
    // Generate processing code in topological order
    this.processingOrder.blocks.forEach(blockId => {
      const block = this.patch.blocks.find(b => b.id === blockId);
      if (!block) return;
      
      const def = this.blockDefs.get(block.definitionId);
      if (!def) return;
      
      const code = this.generateBlockProcessing(block, def);
      if (code) {
        lines.push('');
        lines.push(`        // ${def.displayName}`);
        code.forEach(line => lines.push('        ' + line));
      }
    });
    
    // Generate output assignment
    lines.push('');
    lines.push('        // Output');
    const outputCode = this.generateOutputAssignment();
    outputCode.forEach(line => lines.push('        ' + line));
    
    lines.push('    }');
    lines.push('}');
    
    return lines.join('\n');
  }
  
  private generateBlockProcessing(block: BlockInstance, def: BlockDefinition): string[] {
    const lines: string[] = [];
    const instanceName = this.getInstanceName(block);
    
    // Handle different block types
    switch (def.id) {
      case 'oscillator':
        lines.push(...this.generateOscillatorCode(block, def, instanceName));
        break;
      case 'moog_ladder':
        lines.push(...this.generateFilterCode(block, def, instanceName));
        break;
      case 'adsr':
        lines.push(...this.generateAdsrCode(block, def, instanceName));
        break;
      case 'vca':
        lines.push(...this.generateVcaCode(block, def, instanceName));
        break;
      case 'mixer':
        lines.push(...this.generateMixerCode(block, def, instanceName));
        break;
      case 'knob':
        lines.push(...this.generateKnobCode(block, def, instanceName));
        break;
      case 'key':
        lines.push(...this.generateKeyCode(block, def, instanceName));
        break;
      default:
        // Generic processing
        if (def.processMethod) {
          lines.push(`sig_${instanceName}_out = ${instanceName}.${def.processMethod}();`);
        }
    }
    
    return lines;
  }
  
  private generateOscillatorCode(block: BlockInstance, def: BlockDefinition, name: string): string[] {
    const lines: string[] = [];
    
    // Check for frequency CV modulation
    const freqCV = this.getInputConnection(block.id, 'freq_cv');
    if (freqCV) {
      const sourceVar = this.getSourceVariable(freqCV);
      const baseFreq = block.parameterValues['freq'] ?? def.parameters.find(p => p.id === 'freq')?.defaultValue ?? 440;
      lines.push(`${name}.SetFreq(${baseFreq}f * (1.0f + ${sourceVar}));`);
    }
    
    lines.push(`sig_${name}_out = ${name}.Process();`);
    return lines;
  }
  
  private generateFilterCode(block: BlockInstance, def: BlockDefinition, name: string): string[] {
    const lines: string[] = [];
    
    // Get audio input
    const audioIn = this.getInputConnection(block.id, 'in');
    const inputVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
    
    // Check for cutoff CV modulation
    const freqCV = this.getInputConnection(block.id, 'freq_cv');
    if (freqCV) {
      const sourceVar = this.getSourceVariable(freqCV);
      const baseCutoff = block.parameterValues['freq'] ?? 1000;
      lines.push(`${name}.SetFreq(${baseCutoff}f + (${sourceVar} * 10000.0f));`);
    }
    
    lines.push(`sig_${name}_out = ${name}.Process(${inputVar});`);
    return lines;
  }
  
  private generateAdsrCode(block: BlockInstance, def: BlockDefinition, name: string): string[] {
    const lines: string[] = [];
    
    // Get gate input
    const gateIn = this.getInputConnection(block.id, 'gate');
    const gateVar = gateIn ? this.getSourceVariable(gateIn) : 'false';
    
    lines.push(`cv_${name}_out = ${name}.Process(${gateVar});`);
    return lines;
  }
  
  private generateVcaCode(block: BlockInstance, def: BlockDefinition, name: string): string[] {
    const lines: string[] = [];
    
    // Get inputs
    const audioIn = this.getInputConnection(block.id, 'audio_in');
    const cvIn = this.getInputConnection(block.id, 'cv_in');
    
    const audioVar = audioIn ? this.getSourceVariable(audioIn) : '0.0f';
    const cvVar = cvIn ? this.getSourceVariable(cvIn) : '1.0f';
    const gain = block.parameterValues['gain'] ?? 1.0;
    
    lines.push(`sig_${name}_out = ${audioVar} * ${cvVar} * ${gain}f;`);
    return lines;
  }
  
  private generateMixerCode(block: BlockInstance, def: BlockDefinition, name: string): string[] {
    const lines: string[] = [];
    
    const channels = ['ch1', 'ch2', 'ch3', 'ch4'];
    const mixTerms: string[] = [];
    
    channels.forEach((ch, i) => {
      const conn = this.getInputConnection(block.id, ch);
      if (conn) {
        const sourceVar = this.getSourceVariable(conn);
        const level = block.parameterValues[`${ch}_level`] ?? 0.8;
        mixTerms.push(`(${sourceVar} * ${level}f)`);
      }
    });
    
    if (mixTerms.length > 0) {
      lines.push(`sig_${name}_out = ${mixTerms.join(' + ')};`);
    } else {
      lines.push(`sig_${name}_out = 0.0f;`);
    }
    
    return lines;
  }
  
  private generateKnobCode(block: BlockInstance, def: BlockDefinition, name: string): string[] {
    const lines: string[] = [];
    const channel = block.parameterValues['channel'] ?? 0;
    const min = block.parameterValues['min'] ?? 0;
    const max = block.parameterValues['max'] ?? 1;
    const range = max - min;
    
    lines.push(`cv_${name}_out = ${min}f + (hw.knob[${channel}].Value() * ${range}f);`);
    return lines;
  }
  
  private generateKeyCode(block: BlockInstance, def: BlockDefinition, name: string): string[] {
    const lines: string[] = [];
    const note = block.parameterValues['note'] ?? 60;
    const freq = 440.0 * Math.pow(2, (note - 69) / 12);
    const gate = block.parameterValues['gate'] ?? false;
    
    // For MVP, use static values (MIDI in Phase 5)
    lines.push(`cv_${name}_cv_out = ${freq.toFixed(2)}f;`);
    lines.push(`bool gate_${name}_gate_out = ${gate};`);
    
    return lines;
  }
  
  private generateOutputAssignment(): string[] {
    // Find AudioOutput block
    const outputBlock = this.patch.blocks.find(b => {
      const def = this.blockDefs.get(b.definitionId);
      return def?.id === 'audio_output';
    });
    
    if (!outputBlock) {
      return [
        'out[0][i] = 0.0f;',
        'out[1][i] = 0.0f;',
      ];
    }
    
    const leftConn = this.getInputConnection(outputBlock.id, 'left');
    const rightConn = this.getInputConnection(outputBlock.id, 'right');
    
    const leftVar = leftConn ? this.getSourceVariable(leftConn) : '0.0f';
    const rightVar = rightConn ? this.getSourceVariable(rightConn) : leftVar;
    
    return [
      `out[0][i] = ${leftVar};`,
      `out[1][i] = ${rightVar};`,
    ];
  }
  
  // =====================
  // MAIN FUNCTION
  // =====================
  private generateMain(): string {
    const lines: string[] = [];
    const sr = this.patch.metadata.sampleRate;
    const blockSize = this.patch.metadata.blockSize;
    
    lines.push('int main(void) {');
    lines.push('    hw.Init();');
    lines.push(`    hw.SetAudioBlockSize(${blockSize});`);
    lines.push('    float sr = hw.AudioSampleRate();');
    lines.push('');
    lines.push('    // Initialize DSP modules');
    
    // Generate init calls in topological order
    this.processingOrder.blocks.forEach(blockId => {
      const block = this.patch.blocks.find(b => b.id === blockId);
      if (!block) return;
      
      const def = this.blockDefs.get(block.definitionId);
      if (!def || !def.initMethod) return;
      
      const instanceName = this.getInstanceName(block);
      const initParams = def.initParams.map(p => p === 'sample_rate' ? 'sr' : p).join(', ');
      
      lines.push(`    ${instanceName}.${def.initMethod}(${initParams});`);
      
      // Set default parameter values
      def.parameters.forEach(param => {
        const value = block.parameterValues[param.id] ?? param.defaultValue;
        if (param.cppSetter) {
          if (typeof value === 'number') {
            lines.push(`    ${instanceName}.${param.cppSetter}(${value}f);`);
          } else if (typeof value === 'boolean') {
            lines.push(`    ${instanceName}.${param.cppSetter}(${value});`);
          } else if (param.type === 'enum') {
            // Handle enum values (e.g., waveform)
            lines.push(`    ${instanceName}.${param.cppSetter}(${def.className}::${value});`);
          }
        }
      });
    });
    
    lines.push('');
    lines.push('    hw.StartAdc();');
    lines.push('    hw.StartAudio(AudioCallback);');
    lines.push('');
    lines.push('    while(1) {}');
    lines.push('}');
    
    return lines.join('\n');
  }
  
  // =====================
  // MAKEFILE
  // =====================
  private generateMakefile(): string {
    const projectName = this.patch.metadata.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    return `# Project Name
TARGET = ${projectName}

# Sources
CPP_SOURCES = main.cpp

# Library Locations
LIBDAISY_DIR = ../../libdaisy
DAISYSP_DIR = ../../DaisySP

# Core location, and target processor
SYSTEM_FILES_DIR = $(LIBDAISY_DIR)/core
OPT = -Os

# Includes
C_INCLUDES += -I$(DAISYSP_DIR)/Source

# Include Libraries
include $(SYSTEM_FILES_DIR)/Makefile
`;
  }
  
  // =====================
  // HELPER METHODS
  // =====================
  private getInstanceName(block: BlockInstance): string {
    const def = this.blockDefs.get(block.definitionId);
    const base = def?.className?.toLowerCase() || block.definitionId;
    // Remove namespace if present
    const simpleName = base.split('::').pop() || base;
    return `${simpleName}_${block.id.substring(0, 8)}`;
  }
  
  private getInputConnection(blockId: string, portId: string): Connection | undefined {
    return this.patch.connections.find(
      c => c.targetBlockId === blockId && c.targetPortId === portId
    );
  }
  
  private getSourceVariable(conn: Connection): string {
    const sourceBlock = this.patch.blocks.find(b => b.id === conn.sourceBlockId);
    if (!sourceBlock) return '0.0f';
    
    const sourceDef = this.blockDefs.get(sourceBlock.definitionId);
    if (!sourceDef) return '0.0f';
    
    const sourceInstanceName = this.getInstanceName(sourceBlock);
    const sourcePort = sourceDef.ports.find(p => p.id === conn.sourcePortId);
    
    if (sourcePort?.type.includes('cv')) {
      return `cv_${sourceInstanceName}_${conn.sourcePortId}`;
    } else if (sourcePort?.type.includes('gate')) {
      return `gate_${sourceInstanceName}_${conn.sourcePortId}`;
    } else {
      return `sig_${sourceInstanceName}_${conn.sourcePortId}`;
    }
  }
}
```

---

### 5.3 CV Routing Analyzer

**Task 3.2: Create `src/codegen/analyzers/CVRoutingAnalyzer.ts`**

```typescript
// src/codegen/analyzers/CVRoutingAnalyzer.ts

import { Connection, BlockDefinition, PortType } from '@/core/types';

export interface CVRoute {
  sourceBlockId: string;
  sourcePortId: string;
  targetBlockId: string;
  targetPortId: string;
  targetParameter: string;  // Which parameter is being modulated
}

export class CVRoutingAnalyzer {
  static analyze(
    connections: Connection[],
    blockDefs: Map<string, BlockDefinition>
  ): CVRoute[] {
    const routes: CVRoute[] = [];
    
    connections
      .filter(conn => conn.type === 'control')
      .forEach(conn => {
        // Find which parameter this CV connection modulates
        const targetDef = blockDefs.get(conn.targetBlockId);
        if (!targetDef) return;
        
        // Match port to parameter (e.g., 'freq_cv' -> 'freq')
        const paramId = conn.targetPortId.replace('_cv', '');
        const param = targetDef.parameters.find(p => p.id === paramId && p.cvDestination);
        
        if (param) {
          routes.push({
            sourceBlockId: conn.sourceBlockId,
            sourcePortId: conn.sourcePortId,
            targetBlockId: conn.targetBlockId,
            targetPortId: conn.targetPortId,
            targetParameter: param.id,
          });
        }
      });
    
    return routes;
  }
  
  static generateModulationCode(route: CVRoute, cvValue: string, baseValue: number): string {
    // Different modulation strategies based on parameter type
    return `${baseValue}f * (1.0f + ${cvValue})`;
  }
}
```

---

### 5.4 Hardware Mapping Analyzer

**Task 3.3: Create `src/codegen/analyzers/HardwareMappingAnalyzer.ts`**

```typescript
// src/codegen/analyzers/HardwareMappingAnalyzer.ts

import { BlockInstance, BlockDefinition } from '@/core/types';

export interface HardwareMapping {
  knobs: Map<number, string>;      // ADC channel -> Block ID
  keys: Map<number, string>;       // Key index -> Block ID
  cvInputs: Map<number, string>;   // CV input -> Block ID
  gateInputs: Map<number, string>; // Gate input -> Block ID
}

export class HardwareMappingAnalyzer {
  static analyze(
    blocks: BlockInstance[],
    blockDefs: Map<string, BlockDefinition>
  ): HardwareMapping {
    const mapping: HardwareMapping = {
      knobs: new Map(),
      keys: new Map(),
      cvInputs: new Map(),
      gateInputs: new Map(),
    };
    
    blocks.forEach(block => {
      const def = blockDefs.get(block.definitionId);
      if (!def) return;
      
      switch (def.id) {
        case 'knob':
          const channel = block.parameterValues['channel'] as number ?? 0;
          mapping.knobs.set(channel, block.id);
          break;
          
        case 'key':
          // Auto-assign keys based on order added
          const nextKeyIndex = mapping.keys.size;
          if (nextKeyIndex < 16) {
            mapping.keys.set(nextKeyIndex, block.id);
          }
          break;
          
        case 'cv_input':
          const cvChannel = block.parameterValues['channel'] as number ?? 0;
          mapping.cvInputs.set(cvChannel, block.id);
          break;
          
        case 'gate_input':
          const gateChannel = block.parameterValues['channel'] as number ?? 0;
          mapping.gateInputs.set(gateChannel, block.id);
          break;
      }
    });
    
    return mapping;
  }
  
  static getDaisyFieldLimits() {
    return {
      knobs: 8,      // 8 potentiometers
      keys: 16,      // 16 capacitive touch keys
      cvInputs: 2,   // 2 CV inputs
      gateInputs: 2, // 2 gate inputs
      cvOutputs: 2,  // 2 CV outputs
      audioInputs: 2,
      audioOutputs: 2,
    };
  }
}
```

---

### 5.5 Export Integration

**Task 3.4: Create `src/codegen/exportService.ts`**

```typescript
// src/codegen/exportService.ts

import { PatchGraph } from '@/core/types';
import { CodeGenerator, GeneratedCode } from './CodeGenerator';

export interface ExportResult {
  success: boolean;
  files: Map<string, string>;
  errors: string[];
  warnings: string[];
}

export async function exportPatch(patch: PatchGraph): Promise<ExportResult> {
  try {
    const generator = new CodeGenerator(patch);
    const generated = generator.generate();
    
    if (generated.errors.length > 0) {
      return {
        success: false,
        files: new Map(),
        errors: generated.errors,
        warnings: generated.warnings,
      };
    }
    
    const files = new Map<string, string>();
    files.set('main.cpp', generated.mainCpp);
    files.set('Makefile', generated.makefile);
    
    return {
      success: true,
      files,
      errors: [],
      warnings: generated.warnings,
    };
  } catch (error) {
    return {
      success: false,
      files: new Map(),
      errors: [`Export failed: ${error}`],
      warnings: [],
    };
  }
}

export function downloadExport(result: ExportResult, patchName: string) {
  if (!result.success) {
    throw new Error(result.errors.join('\n'));
  }
  
  // Create and download main.cpp
  result.files.forEach((content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}
```

---

### 5.6 Acceptance Criteria for Phase 3

- [ ] `CodeGenerator` class produces valid C++ for simple patches
- [ ] Topological sort correctly orders block processing
- [ ] CV routes generate correct modulation code
- [ ] Hardware I/O blocks map to correct Daisy Field pins
- [ ] Generated `Makefile` compiles with arm-none-eabi-gcc
- [ ] Export function downloads .cpp and Makefile
- [ ] Unit tests verify code generation for edge cases

---

## 6. PHASE 4: INTEGRATION & VALIDATION (Weeks 6-8)

### 6.1 Reference Patch: Dual-Voice Subtractive Synthesizer

**Task 4.1: Create Reference Patch JSON**

Save as `public/examples/dual-voice-synth.json`:

```json
{
  "version": "1.0.0",
  "patch": {
    "metadata": {
      "name": "Dual Voice Subtractive Synth",
      "author": "DVPE Testing",
      "description": "Two-voice synthesizer for validation benchmark",
      "created": "2025-01-01T00:00:00.000Z",
      "modified": "2025-01-01T00:00:00.000Z",
      "version": "1.0.0",
      "targetHardware": "field",
      "sampleRate": 48000,
      "blockSize": 48
    },
    "blocks": [
      {
        "id": "key_1",
        "definitionId": "key",
        "position": { "x": 100, "y": 100 },
        "parameterValues": { "note": 60, "velocity": 0.8, "gate": false },
        "label": "Voice 1 Key"
      },
      {
        "id": "osc_1",
        "definitionId": "oscillator",
        "position": { "x": 300, "y": 100 },
        "parameterValues": { "freq": 440, "amp": 0.8, "waveform": "WAVE_POLYBLEP_SAW", "pw": 0.5 },
        "label": "Oscillator 1"
      },
      {
        "id": "adsr_1",
        "definitionId": "adsr",
        "position": { "x": 300, "y": 250 },
        "parameterValues": { "attack": 0.01, "decay": 0.1, "sustain": 0.7, "release": 0.3 },
        "label": "ADSR 1"
      },
      {
        "id": "filter_1",
        "definitionId": "moog_ladder",
        "position": { "x": 500, "y": 100 },
        "parameterValues": { "freq": 2000, "res": 0.3 },
        "label": "Filter 1"
      },
      {
        "id": "vca_1",
        "definitionId": "vca",
        "position": { "x": 700, "y": 100 },
        "parameterValues": { "gain": 1.0 },
        "label": "VCA 1"
      },
      {
        "id": "key_2",
        "definitionId": "key",
        "position": { "x": 100, "y": 400 },
        "parameterValues": { "note": 64, "velocity": 0.8, "gate": false },
        "label": "Voice 2 Key"
      },
      {
        "id": "osc_2",
        "definitionId": "oscillator",
        "position": { "x": 300, "y": 400 },
        "parameterValues": { "freq": 554.37, "amp": 0.8, "waveform": "WAVE_POLYBLEP_SAW", "pw": 0.5 },
        "label": "Oscillator 2"
      },
      {
        "id": "adsr_2",
        "definitionId": "adsr",
        "position": { "x": 300, "y": 550 },
        "parameterValues": { "attack": 0.01, "decay": 0.1, "sustain": 0.7, "release": 0.3 },
        "label": "ADSR 2"
      },
      {
        "id": "filter_2",
        "definitionId": "moog_ladder",
        "position": { "x": 500, "y": 400 },
        "parameterValues": { "freq": 2000, "res": 0.3 },
        "label": "Filter 2"
      },
      {
        "id": "vca_2",
        "definitionId": "vca",
        "position": { "x": 700, "y": 400 },
        "parameterValues": { "gain": 1.0 },
        "label": "VCA 2"
      },
      {
        "id": "mixer_1",
        "definitionId": "mixer",
        "position": { "x": 900, "y": 250 },
        "parameterValues": { "ch1_level": 0.5, "ch2_level": 0.5, "ch3_level": 0, "ch4_level": 0 },
        "label": "Main Mixer"
      },
      {
        "id": "output_1",
        "definitionId": "audio_output",
        "position": { "x": 1100, "y": 250 },
        "parameterValues": {},
        "label": "Audio Output"
      },
      {
        "id": "knob_freq",
        "definitionId": "knob",
        "position": { "x": 100, "y": 700 },
        "parameterValues": { "channel": "0", "min": 0, "max": 1, "curve": "linear" },
        "label": "Freq Knob"
      },
      {
        "id": "knob_filter",
        "definitionId": "knob",
        "position": { "x": 250, "y": 700 },
        "parameterValues": { "channel": "1", "min": 0, "max": 1, "curve": "logarithmic" },
        "label": "Filter Knob"
      }
    ],
    "connections": [
      { "id": "c1", "sourceBlockId": "key_1", "sourcePortId": "gate_out", "targetBlockId": "adsr_1", "targetPortId": "gate", "type": "gate" },
      { "id": "c2", "sourceBlockId": "osc_1", "sourcePortId": "out", "targetBlockId": "filter_1", "targetPortId": "in", "type": "audio" },
      { "id": "c3", "sourceBlockId": "filter_1", "sourcePortId": "out", "targetBlockId": "vca_1", "targetPortId": "audio_in", "type": "audio" },
      { "id": "c4", "sourceBlockId": "adsr_1", "sourcePortId": "out", "targetBlockId": "vca_1", "targetPortId": "cv_in", "type": "control" },
      { "id": "c5", "sourceBlockId": "vca_1", "sourcePortId": "out", "targetBlockId": "mixer_1", "targetPortId": "ch1", "type": "audio" },
      { "id": "c6", "sourceBlockId": "key_2", "sourcePortId": "gate_out", "targetBlockId": "adsr_2", "targetPortId": "gate", "type": "gate" },
      { "id": "c7", "sourceBlockId": "osc_2", "sourcePortId": "out", "targetBlockId": "filter_2", "targetPortId": "in", "type": "audio" },
      { "id": "c8", "sourceBlockId": "filter_2", "sourcePortId": "out", "targetBlockId": "vca_2", "targetPortId": "audio_in", "type": "audio" },
      { "id": "c9", "sourceBlockId": "adsr_2", "sourcePortId": "out", "targetBlockId": "vca_2", "targetPortId": "cv_in", "type": "control" },
      { "id": "c10", "sourceBlockId": "vca_2", "sourcePortId": "out", "targetBlockId": "mixer_1", "targetPortId": "ch2", "type": "audio" },
      { "id": "c11", "sourceBlockId": "mixer_1", "sourcePortId": "out", "targetBlockId": "output_1", "targetPortId": "left", "type": "audio" },
      { "id": "c12", "sourceBlockId": "mixer_1", "sourcePortId": "out", "targetBlockId": "output_1", "targetPortId": "right", "type": "audio" }
    ]
  }
}
```

---

### 6.2 Hardware Validation Protocol

**Task 4.2: Hardware Testing Checklist**

```markdown
## DVPE Hardware Validation Protocol

### Prerequisites
- [ ] Daisy Field connected via USB
- [ ] arm-none-eabi-gcc installed (10.3+)
- [ ] Daisy Toolchain configured
- [ ] Audio monitoring equipment ready

### Step 1: Firmware Flash
1. Generate C++ code from reference patch
2. Navigate to output directory
3. Run `make clean && make`
4. Verify: Build completes without errors
5. Verify: Binary size < 128KB
6. Run `make program-dfu`
7. Verify: USB LED blinks during flash
8. Verify: Device reboots after flash

### Step 2: Basic Audio Test
1. Connect audio output to monitoring
2. Set monitoring volume to low
3. Power cycle Daisy Field
4. Verify: No audio output (gates inactive)
5. Press Key A1
6. Verify: Audio output (sawrtooth tone, ~440Hz)
7. Release Key A1
8. Verify: Sound decays (ADSR release)

### Step 3: Polyphony Test
1. Press Key A1 (hold)
2. Verify: First voice sounds
3. Press Key A2 (while holding A1)
4. Verify: Second voice adds
5. Release both keys
6. Verify: Both voices decay independently

### Step 4: Knob Modulation
1. Turn Knob 1 (Freq) left
2. Verify: Both oscillators pitch down
3. Turn Knob 1 right
4. Verify: Both oscillators pitch up
5. Turn Knob 2 (Filter) left
6. Verify: Filter closes (dark sound)
7. Turn Knob 2 right
8. Verify: Filter opens (bright sound)

### Step 5: Stability Test
1. Set comfortable volume
2. Play various key combinations
3. Run for 60 seconds continuous
4. Verify: No audio glitches/clicks
5. Verify: No processor freeze
6. Power cycle
7. Verify: Same behavior after restart

### Step 6: Performance Metrics
- [ ] CPU load < 50% (check via USB serial)
- [ ] No buffer underruns
- [ ] Latency < 5ms
- [ ] All 8 knobs respond
- [ ] All 16 keys respond
```

---

### 6.3 Debugging Procedures

**Task 4.3: Create Debug Utilities**

```typescript
// src/codegen/debug/CodeDebugger.ts

export interface DebugInfo {
  signalVariables: string[];
  processingOrder: string[];
  hardwareMapping: Record<string, string>;
  warnings: string[];
}

export function generateDebugCode(patch: PatchGraph): string {
  // Generate code that outputs debug info via USB serial
  return `
// DEBUG MODE
void PrintDebugInfo() {
    hw.PrintLine("=== DVPE Debug ===");
    hw.PrintLine("Blocks: ${patch.blocks.length}");
    hw.PrintLine("Connections: ${patch.connections.length}");
    hw.PrintLine("Sample Rate: ${patch.metadata.sampleRate}");
    hw.PrintLine("Block Size: ${patch.metadata.blockSize}");
}
`;
}
```

---

### 6.4 Acceptance Criteria for Phase 4

- [ ] Reference patch loads in visual editor
- [ ] Export generates compilable C++ code
- [ ] `make` completes without errors
- [ ] Binary flashes to Daisy Field successfully
- [ ] Keys A1 and A2 trigger independent voices
- [ ] Knob 1 modulates oscillator frequency
- [ ] Knob 2 modulates filter cutoff
- [ ] 60-second stability test passes
- [ ] CPU usage remains below 50%

---

## 7. PHASE 5: EXTENDED FEATURES (Weeks 8+)

### 7.1 Additional Block Library

**Task 5.1: LFO Block**

```typescript
// src/core/blocks/control/Lfo.ts

import { BlockDefinition, BlockCategory, ParameterType, PortType, ParameterCurve } from '../../types';
import { BlockRegistry } from '../BlockRegistry';

const LfoBlock: BlockDefinition = {
  id: 'lfo',
  className: 'Oscillator',  // Reuse DaisySP Oscillator at low frequency
  displayName: 'LFO',
  category: BlockCategory.CONTROL,
  
  headerFile: 'daisysp.h',
  namespace: 'daisysp',
  initMethod: 'Init',
  initParams: ['sample_rate'],
  processMethod: 'Process',
  processReturnType: 'float',
  
  parameters: [
    {
      id: 'rate',
      displayName: 'Rate',
      type: ParameterType.FLOAT,
      cppSetter: 'SetFreq',
      defaultValue: 2.0,
      range: { min: 0.01, max: 20.0, curve: ParameterCurve.LOGARITHMIC },
      unit: 'Hz',
      group: 'Main',
    },
    {
      id: 'depth',
      displayName: 'Depth',
      type: ParameterType.FLOAT,
      cppSetter: 'SetAmp',
      defaultValue: 1.0,
      range: { min: 0.0, max: 1.0, curve: ParameterCurve.LINEAR },
      group: 'Main',
    },
    {
      id: 'waveform',
      displayName: 'Shape',
      type: ParameterType.ENUM,
      cppSetter: 'SetWaveform',
      defaultValue: 'WAVE_SIN',
      enumValues: [
        { label: 'Sine', value: 'WAVE_SIN' },
        { label: 'Triangle', value: 'WAVE_TRI' },
        { label: 'Square', value: 'WAVE_SQUARE' },
        { label: 'Ramp Up', value: 'WAVE_RAMP' },
      ],
      group: 'Main',
    },
  ],
  
  ports: [
    {
      id: 'out',
      displayName: 'Out',
      type: PortType.CV_OUT,
      position: 'right',
    },
  ],
  
  color: 'control',
  icon: 'Waves',
  description: 'Low Frequency Oscillator for modulation',
  documentation: 'LFO provides slow-moving control signals for modulating parameters like filter cutoff, pitch vibrato, or tremolo.',
};

BlockRegistry.register(LfoBlock);
export default LfoBlock;
```

---

**Task 5.2: Reverb Block**

```typescript
// src/core/blocks/effects/Reverb.ts

const ReverbBlock: BlockDefinition = {
  id: 'reverb',
  className: 'ReverbSc',
  displayName: 'REVERB',
  category: BlockCategory.EFFECTS,
  
  headerFile: 'daisysp.h',
  namespace: 'daisysp',
  initMethod: 'Init',
  initParams: ['sample_rate'],
  processMethod: 'Process',
  processReturnType: 'void',  // Uses reference params
  
  parameters: [
    {
      id: 'feedback',
      displayName: 'Decay',
      type: ParameterType.FLOAT,
      cppSetter: 'SetFeedback',
      defaultValue: 0.85,
      range: { min: 0.0, max: 1.0 },
      group: 'Main',
    },
    {
      id: 'lpfreq',
      displayName: 'Damping',
      type: ParameterType.FLOAT,
      cppSetter: 'SetLpFreq',
      defaultValue: 10000.0,
      range: { min: 1000.0, max: 18000.0, curve: ParameterCurve.LOGARITHMIC },
      unit: 'Hz',
      group: 'Main',
    },
  ],
  
  ports: [
    { id: 'in_l', displayName: 'In L', type: PortType.AUDIO_IN, position: 'left' },
    { id: 'in_r', displayName: 'In R', type: PortType.AUDIO_IN, position: 'left' },
    { id: 'out_l', displayName: 'Out L', type: PortType.AUDIO_OUT, position: 'right' },
    { id: 'out_r', displayName: 'Out R', type: PortType.AUDIO_OUT, position: 'right' },
  ],
  
  color: 'audio',
  icon: 'Waves',
  description: 'Stereo plate reverb',
  requiresSdram: true,  // ReverbSc uses SDRAM
};
```

---

**Task 5.3: Delay Block**

```typescript
// src/core/blocks/effects/Delay.ts

const DelayBlock: BlockDefinition = {
  id: 'delay',
  className: 'DelayLine',
  displayName: 'DELAY',
  category: BlockCategory.EFFECTS,
  
  parameters: [
    {
      id: 'time',
      displayName: 'Time',
      type: ParameterType.FLOAT,
      cppSetter: 'SetDelay',
      defaultValue: 500.0,
      range: { min: 1.0, max: 2000.0 },
      unit: 'ms',
      cvDestination: true,
    },
    {
      id: 'feedback',
      displayName: 'Feedback',
      type: ParameterType.FLOAT,
      defaultValue: 0.4,
      range: { min: 0.0, max: 0.95 },
    },
    {
      id: 'mix',
      displayName: 'Mix',
      type: ParameterType.FLOAT,
      defaultValue: 0.5,
      range: { min: 0.0, max: 1.0 },
    },
  ],
  
  ports: [
    { id: 'in', displayName: 'In', type: PortType.AUDIO_IN, position: 'left' },
    { id: 'out', displayName: 'Out', type: PortType.AUDIO_OUT, position: 'right' },
  ],
  
  requiresSdram: true,
};
```

---

### 7.2 Polyphony System

**Task 5.4: Voice Allocation Design**

```typescript
// src/core/polyphony/VoiceAllocator.ts

export interface Voice {
  id: number;
  active: boolean;
  note: number;
  velocity: number;
  age: number;  // For voice stealing
}

export interface PolyphonyConfig {
  maxVoices: number;
  stealingMode: 'oldest' | 'lowest' | 'highest' | 'quietest';
  legato: boolean;
}

export class VoiceAllocator {
  private voices: Voice[];
  private config: PolyphonyConfig;
  private nextVoiceId = 0;
  
  constructor(config: PolyphonyConfig) {
    this.config = config;
    this.voices = Array(config.maxVoices).fill(null).map((_, i) => ({
      id: i,
      active: false,
      note: 0,
      velocity: 0,
      age: 0,
    }));
  }
  
  noteOn(note: number, velocity: number): Voice | null {
    // Find free voice
    let voice = this.voices.find(v => !v.active);
    
    // If no free voice, steal one
    if (!voice) {
      voice = this.stealVoice();
    }
    
    if (voice) {
      voice.active = true;
      voice.note = note;
      voice.velocity = velocity / 127;
      voice.age = this.nextVoiceId++;
    }
    
    return voice;
  }
  
  noteOff(note: number): Voice | null {
    const voice = this.voices.find(v => v.active && v.note === note);
    if (voice) {
      voice.active = false;
    }
    return voice;
  }
  
  private stealVoice(): Voice {
    switch (this.config.stealingMode) {
      case 'oldest':
        return this.voices.reduce((oldest, v) => v.age < oldest.age ? v : oldest);
      case 'lowest':
        return this.voices.reduce((low, v) => v.note < low.note ? v : low);
      case 'highest':
        return this.voices.reduce((high, v) => v.note > high.note ? v : high);
      default:
        return this.voices[0];
    }
  }
}
```

---

### 7.3 MIDI Integration

**Task 5.5: MIDI Input Block**

```typescript
// src/core/blocks/io/MidiInput.ts

const MidiInputBlock: BlockDefinition = {
  id: 'midi_input',
  className: 'MidiInput',
  displayName: 'MIDI IN',
  category: BlockCategory.IO,
  
  parameters: [
    {
      id: 'channel',
      displayName: 'Channel',
      type: ParameterType.ENUM,
      defaultValue: 'omni',
      enumValues: [
        { label: 'Omni', value: 'omni' },
        { label: '1', value: '0' },
        { label: '2', value: '1' },
        // ... channels 3-16
      ],
    },
  ],
  
  ports: [
    { id: 'note_out', displayName: 'Note', type: PortType.CV_OUT, position: 'right' },
    { id: 'gate_out', displayName: 'Gate', type: PortType.GATE_OUT, position: 'right' },
    { id: 'velocity_out', displayName: 'Vel', type: PortType.CV_OUT, position: 'right' },
    { id: 'mod_out', displayName: 'Mod', type: PortType.CV_OUT, position: 'right' },
    { id: 'pitch_out', displayName: 'Pitch', type: PortType.CV_OUT, position: 'right' },
  ],
  
  color: 'io',
  icon: 'Music',
  description: 'MIDI note and control input',
};
```

---

### 7.4 Custom Block Compiler (Advanced)

**Task 5.6: Block Definition Parser**

```typescript
// src/core/blocks/custom/BlockParser.ts

export interface ParsedBlock {
  definition: Partial<BlockDefinition>;
  errors: string[];
  warnings: string[];
}

export class BlockParser {
  /**
   * Parse a user-provided C++ snippet and extract block metadata
   */
  static parseFromCpp(cppCode: string): ParsedBlock {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Extract class name
    const classMatch = cppCode.match(/class\s+(\w+)/);
    if (!classMatch) {
      errors.push('No class definition found');
      return { definition: {}, errors, warnings };
    }
    
    // Extract Init method
    const initMatch = cppCode.match(/void\s+Init\s*\(([^)]*)\)/);
    
    // Extract Process method
    const processMatch = cppCode.match(/(float|void)\s+Process\s*\(([^)]*)\)/);
    
    // Extract Set* methods (parameters)
    const setterMatches = cppCode.matchAll(/void\s+Set(\w+)\s*\(([\w\s,*&]+)\)/g);
    
    const parameters: ParameterDefinition[] = [];
    for (const match of setterMatches) {
      const paramName = match[1].toLowerCase();
      const paramType = match[2].includes('float') ? ParameterType.FLOAT : 
                        match[2].includes('bool') ? ParameterType.BOOL :
                        ParameterType.INT;
      
      parameters.push({
        id: paramName,
        displayName: match[1],
        type: paramType,
        cppSetter: `Set${match[1]}`,
        defaultValue: 0,
        range: { min: 0, max: 1 },
      });
    }
    
    return {
      definition: {
        className: classMatch[1],
        initMethod: initMatch ? 'Init' : undefined,
        processMethod: processMatch ? 'Process' : undefined,
        processReturnType: processMatch ? processMatch[1] : undefined,
        parameters,
      },
      errors,
      warnings,
    };
  }
}
```

---

### 7.5 Acceptance Criteria for Phase 5

- [ ] LFO block modulates filter cutoff smoothly
- [ ] Reverb effect produces room ambience
- [ ] Delay effect produces echo with feedback
- [ ] Polyphony system handles 8 voices
- [ ] Voice stealing works correctly
- [ ] MIDI input block receives notes from external controller
- [ ] Custom block compiler parses basic C++ classes
- [ ] All extended blocks have unit tests
- [ ] Performance remains acceptable (< 70% CPU with effects)

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 3.1 | 2025-12-12 | Gap analysis complete, FROZEN for Phase 0-2 |
| **3.2** | **2025-12-12** | **Detailed Phase 3-5 implementation specs** |

---

## AUTHORIZATION

> [!IMPORTANT]
> **VERSION 3.2 CONFIRMATION**
> 
> This document expands v3.1 with detailed implementation specifications for:
> - Phase 3: Complete CodeGenerator implementation
> - Phase 4: Reference patch JSON and validation protocol
> - Phase 5: Extended blocks, polyphony, and MIDI
> 
> **Status:** Approved for continued execution
> **Effective:** 2025-12-12T20:08:00+01:00

---

**END OF IMPLEMENTATION PLAN v3.2**
