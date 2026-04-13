# Vacuum Pro Synthesizer - Block Diagram

## Voice Architecture (6 Voices Polyphonic)

```mermaid
graph TB
    subgraph "VOICE GENERATOR (Per Voice)"
        subgraph "VTO ONE - Oscillator 1"
            VTO1[VTO 1<br/>SAW/TRI/PWM/SQR<br/>BMYN/FCHP/CNHH<br/>DMTS/ATOP]
            VTO1_DETUNE[Detune]
            VTO1_FINE[Fine]
            VTO1_WIDE[Wide]
            VTO1_RANGE[Range]
            VTO1_PITCH[Pitch]
            VTO1_DELAY[Delay Time/Amount]
            VTO1_ENV2[ENV 2 to Shape]
            VTO1_SHAPE[Shape Control]
        end
        
        subgraph "VTO TWO - Oscillator 2"
            VTO2[VTO 2<br/>SAW/TRI/PWM/SQR<br/>Sync Mode]
            VTO2_DETUNE[Detune]
            VTO2_FINE[Fine]
            VTO2_KIP[KIP/DC]
            VTO2_RANGE[Range]
            VTO2_PITCH[Pitch]
            VTO2_DELAY[Delay Time/Amount]
            VTO2_ENV2[ENV 2 to Shape]
            VTO2_SHAPE[Shape Control]
            VTO2_SYNC[Sync: OFF/PART/FULL<br/>Start Phase]
        end
        
        RINGMOD[Ring Modulator<br/>VTO1 × VTO2]
        
        subgraph "MIXER"
            MIX_VTO1[VTO 1 Level]
            MIX_VTO2[VTO 2 Level]
            MIX_GAIN[Gain]
            MIX_KEYTRK[Key Track]
            MIX_RINGMOD[RingMod Level]
        end
        
        subgraph "VT HPF/BPF - High/Band Pass Filter"
            HPF[HP/BP Filter]
            HPF_CUTOFF[Cutoff]
            HPF_SLOPE[Slope: 8/12/16/20]
            HPF_RES[Resonance]
            HPF_ROUTE[Routing:<br/>Serial/Parallel<br/>CRM_PLEX]
            HPF_ENV1[ENV 1 Mod]
            HPF_ENV2[ENV 2 Mod]
        end
        
        subgraph "VT LPF - Low Pass Filter"
            LPF[LP Filter]
            LPF_CUTOFF[Cutoff]
            LPF_SLOPE[Slope: 8/12/24/28]
            LPF_RESC[Resonance]
            LPF_KEYTRK[Key Track]
            LPF_ENV2[ENV 2 Mod]
            LPF_ENT[ENT]
            LPF_DUST[Dust]
        end
        
        subgraph "ENV - Envelopes"
            ENV_SEL[ENV 1/Z Switch<br/>HP/LP/Both]
            ENV1[ENV 1<br/>A/D/S/R]
            ENV2[ENV 2<br/>A/D/S/R]
            ENV3[ENV 3 AMP<br/>A/D/S/R]
            ENV4[ENV 4 MOD<br/>Pitch Dest<br/>ATT LVL/TIME<br/>SLOPE/REL RLP]
        end
        
        subgraph "AGE - Amplifier"
            VCA[VCA]
            AGE_VOL[Volume]
            AGE_PAN[Pan]
            AGE_DRIFT[Drift]
            AGE_GLIDE[Glide Time/All]
            AGE_GLD_RETR[GLD RETR]
        end
        
        subgraph "LFO - Modulators"
            LFO1[LFO 1<br/>Sine/Free]
            LFO1_RATE[Rate]
            LFO1_FADE[Fade]
            LFO1_SHAPE[Shape]
            LFO1_SYNC[Sync]
            
            LFO2[LFO 2<br/>Sine/Free]
            LFO2_RATE[Rate]
            LFO2_FADE[Fade]
            
            VIB[VIB LFO<br/>Vibrato]
            VIB_TRIM[Trim]
        end
        
        subgraph "MOD - Modulation"
            MOD_VIB[VIB]
            MOD_VBB[VBB]
            MOD_MPF[MPF x2]
            MOD_LFO1[LFO 1 x MW<br/>Source/Depth]
            MOD_LFO2[LFO 2 Shape<br/>Medwheel/HPF<br/>Source/Depth/Dest]
        end
        
        subgraph "VTA - Voice Timing/Assignment"
            VTA_MODE[Mode]
            VTA_GLIDE[Glide]
        end
    end
    
    subgraph "GLOBAL EFFECTS"
        subgraph "CHORUS/PHASER"
            CHORUS[Chorus/Phaser]
            CH_CHRS[CHRS 1/2]
            CH_PHS[PHS 2]
            CH_RATE[Rate]
            CH_MIA[MIA]
            CH_DEPTH[Depth]
            CH_TIME[Time]
            CH_FDBK[Feedback]
            CH_MIX[Mix]
        end
        
        subgraph "DELAY"
            DELAY[Delay Line]
            DLY_SYNC[Sync: L/R]
            DLY_WIDTH[Width]
            DLY_LEVEL[Level]
        end
        
        subgraph "MASTER"
            MASTER_LEVEL[Master Level]
        end
    end
    
    subgraph "INPUT CONTROLS"
        KEYBOARD[Keyboard<br/>Note/Velocity]
        ARP[Arpeggiator<br/>Mode/Range]
        SMART[Smart Controls<br/>Part A/B]
    end
    
    %% Signal Flow
    VTO1 --> RINGMOD
    VTO2 --> RINGMOD
    
    VTO1 --> MIX_VTO1
    VTO2 --> MIX_VTO2
    RINGMOD --> MIX_RINGMOD
    
    MIX_VTO1 --> HPF
    MIX_VTO2 --> HPF
    MIX_RINGMOD --> HPF
    
    HPF --> LPF
    HPF -.Parallel.-> VCA
    
    LPF --> VCA
    
    VCA --> CHORUS
    CHORUS --> DELAY
    DELAY --> MASTER_LEVEL
    
    %% Modulation Routing - Primary Paths
    KEYBOARD --> VTO1_PITCH
    KEYBOARD --> VTO2_PITCH
    KEYBOARD -.Velocity.-> ENV3
    
    ENV1 -.Mod.-> HPF_ENV1
    ENV1 -.Mod.-> LPF_ENV2
    
    ENV2 -.Mod.-> VTO1_SHAPE
    ENV2 -.Mod.-> VTO2_SHAPE
    ENV2 -.Mod.-> HPF_ENV2
    ENV2 -.Mod.-> LPF_ENV2
    
    ENV3 -.Amp.-> VCA
    
    ENV4 -.Pitch.-> VTO1_PITCH
    ENV4 -.Pitch.-> VTO2_PITCH
    
    LFO1 -.Mod.-> VTO1_PITCH
    LFO1 -.Mod.-> VTO2_PITCH
    LFO1 -.Mod.-> HPF_CUTOFF
    LFO1 -.Mod.-> LPF_CUTOFF
    
    LFO2 -.Mod.-> VTO1_PITCH
    LFO2 -.Mod.-> VTO2_PITCH
    LFO2 -.Mod.-> CHORUS
    
    VIB -.Vibrato.-> VTO1_PITCH
    VIB -.Vibrato.-> VTO2_PITCH
    
    MOD_LFO1 -.MW.-> LFO1
    MOD_LFO2 -.MW.-> LFO2
    
    ARP --> KEYBOARD
    SMART -.Macro.-> VTO1
    SMART -.Macro.-> VTO2
    SMART -.Macro.-> HPF
    SMART -.Macro.-> LPF

    %% Styling
    classDef oscillator fill:#4a6741,stroke:#89a97e,stroke-width:2px,color:#fff
    classDef filter fill:#5a5a3a,stroke:#a9a97e,stroke-width:2px,color:#fff
    classDef modulator fill:#3a4a5a,stroke:#7e89a9,stroke-width:2px,color:#fff
    classDef effect fill:#4a3a5a,stroke:#8e7ea9,stroke-width:2px,color:#fff
    classDef control fill:#3a3a3a,stroke:#7e7e7e,stroke-width:2px,color:#fff
    
    class VTO1,VTO2,RINGMOD oscillator
    class HPF,LPF filter
    class ENV1,ENV2,ENV3,ENV4,LFO1,LFO2,VIB modulator
    class CHORUS,DELAY effect
    class KEYBOARD,ARP,SMART,MASTER_LEVEL control
```

## Signal Path Summary

### Per-Voice Architecture
```
KEYBOARD → VTO1/VTO2 (Oscillators) → MIXER → HPF/BPF → LPF → VCA → [Voice Out]
                ↓                                ↑        ↑      ↑
           RINGMOD (VTO1×VTO2)                 ENV1    ENV2   ENV3
                                                 ↑        ↑      ↑
                                              LFO1     LFO2    VEL
```

### Global Processing Chain
```
[6x Voice Sum] → Chorus/Phaser → Delay → Master → [Audio Out]
                       ↑           ↑
                     LFO1        LFO2
```

## Modulation Matrix - Primary Paths

| Source | Destinations |
|--------|-------------|
| **ENV 1** | HPF Cutoff, LPF Cutoff |
| **ENV 2** | VTO1 Shape, VTO2 Shape, HPF Cutoff, LPF Cutoff |
| **ENV 3** | VCA (Amplitude) |
| **ENV 4** | VTO1 Pitch, VTO2 Pitch |
| **LFO 1** | VTO1/2 Pitch, HPF/LPF Cutoff, selectable via MW |
| **LFO 2** | VTO1/2 Pitch, Chorus/Phaser, selectable via MW |
| **VIB** | VTO1/2 Pitch (Vibrato) |
| **Velocity** | ENV 3 (Amp), Filter tracking |
| **Key Track** | Mixer Gain, LPF Cutoff |
| **MOD Wheel** | LFO 1 Depth, LFO 2 Depth |

## Architecture Notes

### Voice Count
- 6-voice polyphony (visible in "6 Voices" indicator)
- Each voice is a complete VTO1→VTO2→MIXER→FILTERS→VCA chain

### Filter Routing Options
- **Serial**: HPF → LPF (classic)
- **Parallel**: HPF + LPF mixed
- **CRM_PLEX**: Complex routing mode

### Oscillator Sync
- VTO2 can sync to VTO1
- Modes: OFF / PART / FULL
- Adjustable start phase

### Smart Controls
- Part A / Part B macro assignments
- Global parameter morphing

### Effects Chain
- Pre-Master: Chorus/Phaser → Delay
- All global (not per-voice)
- Stereo processing with Width control

