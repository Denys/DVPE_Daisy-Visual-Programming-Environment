# DVPE Project Definition

**Daisy Visual Programming Environment**
**Created**: 2026-01-11
**Last Updated**: 2026-01-23

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
2. **Comprehensive Block Library** (✅ Phase 1-5 Complete, 108 blocks)
3. **Code Generation Engine** (✅ Phase 3 Complete)
4. **Architecture Window** (✅ Phase 10 - Complete)
   - Hardware platform selection (Seed, Field, Pod)
   - Pin mapping
5. **Custom Block Designer** (🚀 Phase 13 - **ESSENTIAL CORE**)
   - Utility block library (40+ primitives)
   - Hierarchical block creation
   - Hybrid code modules

### Out of Scope
- Real-time audio processing in the browser
- Polyphony System (Deferred indefinitely)

---

## 📊 General Plan (Stages & Phases)

### Stage 1: Foundation (Completed ✅)
- **Phase 0-9**: 108 Blocks, Code Gen, UI Basics, Validation

### Stage 2: Hardware Integration (Complete ✅)
- **Phase 10**: Architecture Window ✅ Complete
- **Phase 11**: New Blocks ✅ Complete (Slider, Switch, Math blocks)

### Stage 3: Core Extension (Active 🚀)
- **Phase 13**: Block Designer 🚀 **ACTIVE CORE** (Utility Library, Hierarchical Blocks)

### Stage 4: Deployment
- **Phase 12**: Production Build & Documentation ⏳ Pending

---

## ✅ End Criteria

The DVPE project is **considered complete** when:

1. **Architecture Window** allows full hardware configuration.
2. **Block Designer** is a first-class core feature enabling:
   - Creation of algorithmic blocks via utility primitives or embedded code
   - Creation of hierarchical blocks via encapsulation
   - Utility library sufficient to build any DSP algorithm visually
3. **End-to-End** flow (Design -> Generate -> Flash) works for all target platforms.
4. **Documentation** is sufficient for a new user to build a synth.

---

## Compass Navigation

> **Note**: All planning files consolidated into `PLANNING/` folder (2026-01-23)

- **detailed plan** → `PLANNING/MASTER_PLAN.md`
- **current status** → `PLANNING/CHECKPOINT.md`
- **completion tracker** → `PLANNING/completion_monitor.md`
- **planning directive** → `PLANNING/PROJECT_PLANNING_DIRECTIVE.md`
- **bug log** → `dvpe_bugs.md`
