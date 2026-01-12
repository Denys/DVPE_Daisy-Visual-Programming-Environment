# DVPE Project Definition

**Daisy Visual Programming Environment**  
**Created**: 2026-01-11  
**Last Updated**: 2026-01-11

---

## 🎯 Project Goal

Create a **visual block programming environment** for the **Electrosmith Daisy** hardware platform that enables musicians and designers to:
- Design audio processing patches using a **node-based visual interface**
- **Generate production-ready C++ code** automatically from block diagrams
- **Deploy** directly to Daisy hardware without writing code manually
- Build patches from a comprehensive library of **DSP blocks** (oscillators, filters, effects, modulators, utilities)

**Core Value Proposition**: Bridge the gap between visual design tools (like Max/MSP, Pure Data) and embedded audio hardware by providing a **turnkey solution** from diagram to deployment.

---

## 📋 Initial Conditions

### Reference Materials
- **DaisySP Library**: Official C++ DSP library for Daisy hardware
- **libDaisy**: Hardware abstraction layer for Daisy platforms
- **UPE Framework v3.0**: Universal Programming Environment design principles
- **XY Flow**: React-based visual graph library for the canvas UI

### Build Framework
- **Frontend**: React + TypeScript + Vite
- **Backend**: C++ code generation engine
- **Testing**: Vitest for validation
- **Deployment Target**: Electrosmith Daisy (Seed, Patch, Field, Pod)

---

## 🗺️ Project Scope

### In Scope
1. **Visual Block Diagram Composer** (✅ Phase 0-2 Complete)
2. **Comprehensive Block Library** (✅ Phase 1-5 Complete)
3. **Code Generation Engine** (✅ Phase 3 Complete)
4. **Architecture Window** (⏳ Phase 10 - Active)
   - Hardware platform selection (Seed, Patch, Field, Pod)
   - Pin mapping
5. **Custom Block Designer** (⏳ Phase 11 - Planned)
   - Custom visual interfaces
   - Compound blocks

### Out of Scope
- Real-time audio processing in the browser
- Polyphony System (Deferred indefinitely)

---

## 📊 General Plan (Stages & Phases)

### Stage 1: Foundation (Completed ✅)
- **Phase 0-9**: 76 Blocks, Code Gen, UI Basics, Validation

### Stage 2: Hardware Integration (Active 🚀)
- **Phase 10**: Architecture Window (~20h)
- **Phase 11**: Block Diagram Designer (~30h)
- **Phase 12**: New Blocks (Slider, Switch, etc.)

### Stage 3: Deployment (Planned ⏳)
- **Phase 13**: Production Build & Documentation

---

## ✅ End Criteria

The DVPE project is **considered complete** when:

1. **Architecture Window** allows full hardware configuration.
2. **Block Designer** allows creation of custom UI blocks.
3. **End-to-End** flow (Design -> Generate -> Flash) works for all target platforms.
4. **Documentation** is sufficient for a new user to build a synth.

---

## compass Navigation

- **detailed plan** → `planning_documents/DVPE-IMPLEMENTATION-PLAN-v3.3.md`
- **current status** → `CHECKPOINT.md`
- **completion tracker** → `completion_monitor.md`
- **bug log** → `dvpe_bugs.md`
