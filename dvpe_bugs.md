# DVPE Implementation Bug Log

A lessons-learned document for DVPE block development. Check this **before** implementing new blocks.

---

## Block Implementation Checklist

Use this checklist for every new block to avoid common bugs:

```
□ Block Definition File
  □ cvModulatable: true on parameters that should be CV controllable
  □ CV input ports in ports[] array for each cvModulatable parameter
  □ Trigger port if block is triggerable (drums, physical modeling)
  □ Correct category (DRUMS, PHYSICAL_MODELING, EFFECTS, etc.)

□ BlockRegistry.ts
  □ Import added
  □ Block added to allBlocks array

□ index.ts (definitions)
  □ Export added

□ CodeGenerator.ts
  □ Switch case added in generateBlockProcessing()
  □ Generator method implemented
  □ Added to skipBlocks list if inline implementation
```

---

## Bug #001: Missing CV Toggle in Inspector

**Date**: 2026-01-09  
**Blocks Affected**: All Phase 3 drum blocks

**Symptom**: Inspector panel showed parameters but no "CV" toggle checkbox.

**Root Cause**: Parameters missing `cvModulatable: true` property.

**Fix**: Add to each parameter that should support CV modulation:
```typescript
{
    id: 'freq',
    displayName: 'Pitch',
    type: ParameterType.FLOAT,
    cvModulatable: true,  // ← ADD THIS
    // ...
}
```

---

## Bug #002: Missing CV Ports on Canvas

**Date**: 2026-01-09  
**Blocks Affected**: All Phase 3 drum blocks

**Symptom**: Block on canvas only showed TRIG port, no CV input ports (yellow dots) like Oscillator.

**Root Cause**: `cvModulatable: true` only enables Inspector toggle. Canvas ports require explicit port definitions in the `ports[]` array.

**Fix**: Add CV input ports for each modulatable parameter:
```typescript
ports: [
    { id: 'trig', displayName: 'TRIG', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
    { id: 'freq_cv', displayName: 'PITCH CV', signalType: SignalType.CV, direction: PortDirection.INPUT },  // ← ADD
    { id: 'tone_cv', displayName: 'TONE CV', signalType: SignalType.CV, direction: PortDirection.INPUT },   // ← ADD
    { id: 'out', displayName: 'OUT', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
]
```

**Reference**: See `oscillator.ts` for correct pattern with `freq_cv`, `amp_cv`, `pw_cv` ports.

---

## Bug #003: Missing Public Setter Parameters

**Date**: 2026-01-09  
**Blocks Affected**: All Phase 3 drum blocks

**Symptom**: Some DaisySP public setters were not exposed as parameters in block definitions.

**Root Cause**: Block definitions created without verifying all public methods in DaisySP class.

**Missing Parameters Found**:
- HiHat: `SetNoisiness` (mix between tone and noise)
- All drums: `SetAccent` missing `cvModulatable` and CV port

**Fix**: Before creating a block, check DaisySP documentation for all public setters:
```
1. Search: "DaisySP [ClassName] public methods"
2. Compare with block definition parameters
3. Add missing SetXxx methods as parameters
4. Add cvModulatable: true for all float parameters
5. Add corresponding CV ports
```

---

## Prevention Strategy

### Template-Based Block Creation

Create new blocks by copying an existing, complete block (e.g., `oscillator.ts` for sources, `synthBassDrum.ts` for drums) rather than starting from scratch. This ensures:
- All required properties are present
- CV modulation is correctly configured
- Port definitions match parameter definitions

### Automated Validation (Future)

Consider adding a build-time validator that checks:
1. Every parameter with `cvModulatable: true` has a corresponding `*_cv` port
2. All blocks are registered in BlockRegistry
3. All blocks have generator methods in CodeGenerator

---

## Archive Policy

When this file exceeds 20 bugs, archive resolved bugs to `dvpe_bugs_archive.md` and keep only:
- Latest 5 bugs
- All checklist items
- Prevention strategy section
