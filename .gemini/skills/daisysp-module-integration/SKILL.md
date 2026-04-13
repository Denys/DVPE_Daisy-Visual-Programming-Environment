---
name: daisysp-module-integration
description: |
  Integrate DaisySP modules into DVPE with full Context7 documentation lookup.
  Use when adding oscillators, filters, effects, physical modeling, or drums
  from DaisySP library into DVPE block definitions.
  Trigger keywords: DaisySP, add module, oscillator, filter, effect, StringVoice,
  ModalVoice, Svf, MoogLadder, ReverbSc, AnalogBassDrum.
---

# DaisySP Module Integration

## Overview
Research DaisySP modules via Context7 MCP and create corresponding DVPE blocks.

## Workflow

### Step 1: Resolve Library ID
**Tool**: `mcp_context7_resolve-library-id`
**Query**: `"DaisySP"`
**Expected**: `/electro-smith/DaisySP`

### Step 2: Query Module Documentation
**Tool**: `mcp_context7_query-docs`
**libraryId**: `/electro-smith/DaisySP`

**Query Patterns by Type**:
| Type | Query |
|------|-------|
| Synth | `"Oscillator Svf Adsr envelope"` |
| Effect | `"[EffectName] Process wet dry"` |
| Drums | `"AnalogBassDrum SynthSnareDrum HiHat"` |
| Physical | `"StringVoice ModalVoice"` |
| Filter | `"[FilterName] SetFreq SetRes Low High"` |

### Step 3: Extract Module API
**From Context7 response, identify**:
- `Init()` parameters (sample rate, any others)
- `Process()` signature (inputs, return type)
- Setter methods (`SetFreq`, `SetDecay`, etc.)
- Member access methods (`.Low()`, `.High()`)

### Step 4: Map to DVPE Block
**DaisySP → DVPE Mapping**:

| DaisySP | DVPE Property |
|---------|---------------|
| `Init(sr)` | `cppInit` |
| `Process(in)` | `cppProcess` |
| `SetFreq(f)` | parameter with `cppSetter: "SetFreq"` |
| Member `.Low()` | output port |
| Input argument | input port |

### Step 5: Check LGPL Status
**LGPL Modules** (require `USE_DAISYSP_LGPL = 1`):
- MoogLadder
- ReverbSc
- StringVoice
- ModalVoice
- Compressor
- ATone

**Add to block definition**:
```typescript
cppFlags: ['USE_DAISYSP_LGPL']  // If LGPL
```

### Step 6: Create Block Definition
Follow `block-definition-workflow` skill for file creation.

### Step 7: Verify Integration
```bash
# Test block registration
npm test -- BlockRegistry.test.ts

# Build test project
cd _block_diagrams_code/tested
# Create .dvpe using new block
# Generate C++ and compile
```

## Fallback Chain

If Context7 fails:
1. **Perplexity MCP**: 
   ```
   "Electrosmith Daisy [module] site:forum.electro-smith.com"
   ```
2. **Local Examples**:
   ```
   grep_search(SearchPath="examples/dsp/", Query="[ModuleName]")
   ```
3. **Cached Reference**: Use DAISY_EXPERT_SP_v5.2.md module tables

## Module Reference Tables

### Synthesis
| Module | Init | Key Methods | LGPL |
|--------|------|-------------|------|
| `Oscillator` | `.Init(sr)` | `SetFreq()`, `SetWaveform()`, `Process()` | No |
| `StringVoice` | `.Init(sr)` | `SetFreq()`, `Trig()`, `Process()` | **Yes** |
| `ModalVoice` | `.Init(sr)` | `SetFreq()`, `Trig()`, `Process()` | **Yes** |

### Filters
| Module | Init | Key Methods | LGPL |
|--------|------|-------------|------|
| `Svf` | `.Init(sr)` | `SetFreq()`, `SetRes()`, `Process()`, `.Low()`, `.High()` | No |
| `MoogLadder` | `.Init(sr)` | `SetFreq()`, `SetRes()`, `Process()` | **Yes** |

### Effects
| Module | Init | Key Methods | LGPL |
|--------|------|-------------|------|
| `ReverbSc` | `.Init(sr)` | `SetFeedback()`, `SetLpFreq()`, `Process()` | **Yes** |
| `Chorus` | `.Init(sr)` | `SetLfoFreq()`, `SetLfoDepth()`, `Process()` | No |

## Resources
- [Context7 MCP](mcp://context7)
- [DaisySP GitHub](https://github.com/electro-smith/DaisySP)
- [DAISY_EXPERT_SP_v5.2](file:///_agentic_promts/DAISY_EXPERT_SP_v5.2.md)
