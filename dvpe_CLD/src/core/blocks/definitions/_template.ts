/**
 * BLOCK TEMPLATE - Copy this for new blocks
 * 
 * Usage:
 * 1. Copy this file to src/core/blocks/definitions/yourBlock.ts
 * 2. Replace all TEMPLATE placeholders
 * 3. Update ports/parameters as needed
 * 4. Add export to index.ts
 * 5. Register in BlockRegistry.ts
 * 6. Add generator to CodeGenerator.ts
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    ParameterCurve,
    SignalType,
    PortDirection,
} from '@/types';

export const TemplateBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'template_block',                    // Unique ID (snake_case)
    className: 'daisysp::TemplateClass',     // DaisySP class name
    displayName: 'TEMPLATE',                  // UI display name (UPPERCASE)
    category: BlockCategory.SOURCES,          // Choose: SOURCES, FILTERS, EFFECTS, MODULATORS, DYNAMICS, DRUMS, PHYSICAL_MODELING, MATH, UTILITY, USER_IO

    // === C++ CODE GENERATION ===
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],              // Init arguments
    processMethod: 'Process',
    processReturnType: 'float',               // 'float', 'void', or 'bool'

    // === PARAMETERS ===
    // Every parameter with cvModulatable: true MUST have a matching CV port below!
    parameters: [
        {
            id: 'freq',
            displayName: 'Frequency',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 440.0,
            range: { min: 20.0, max: 20000.0, step: 1.0, curve: ParameterCurve.LOGARITHMIC },
            unit: 'Hz',
            cvModulatable: true,              // ← Enables Inspector CV toggle
            group: 'Main',
            description: 'Oscillator frequency',
        },
        {
            id: 'amp',
            displayName: 'Amplitude',
            type: ParameterType.FLOAT,
            cppSetter: 'SetAmp',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,              // ← Enables Inspector CV toggle
            group: 'Main',
            description: 'Output amplitude',
        },
    ],

    // === PORTS ===
    // IMPORTANT: Add CV port for EACH parameter with cvModulatable: true
    ports: [
        // Trigger input (for drums/physical modeling)
        {
            id: 'trig',
            displayName: 'TRIG',
            signalType: SignalType.TRIGGER,   // Orange color
            direction: PortDirection.INPUT,
            cppParam: 'trig',
            description: 'Trigger input',
        },
        // CV inputs - one for each cvModulatable parameter
        {
            id: 'freq_cv',                    // ← Match parameter ID + '_cv'
            displayName: 'FREQ CV',
            signalType: SignalType.CV,        // Yellow color
            direction: PortDirection.INPUT,
            description: 'Frequency modulation input',
        },
        {
            id: 'amp_cv',                     // ← Match parameter ID + '_cv'
            displayName: 'AMP CV',
            signalType: SignalType.CV,        // Yellow color
            direction: PortDirection.INPUT,
            description: 'Amplitude modulation input',
        },
        // Audio output
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,     // Cyan color
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Audio output',
        },
    ],

    // === VISUAL ===
    colorScheme: BlockColorScheme.AUDIO,      // Choose: AUDIO, CONTROL, USER, LOGIC, FX, FILTER, MODULATION, DYNAMICS, UTILITY
    icon: 'Waves',                            // Lucide icon name

    // === DOCUMENTATION ===
    description: 'Short description for library',
    documentation: `
Extended documentation with usage notes.
Explain each parameter and typical usage.
    `.trim(),
};
