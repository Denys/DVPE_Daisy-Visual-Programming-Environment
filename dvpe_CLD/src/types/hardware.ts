export type PlatformType = 'seed' | 'pod' | 'field';

export interface PinDefinition {
    pinNumber: number; // e.g., 1 for D1, or physical pin number
    name: string;      // "D1", "A0", "Pin 1"
    capabilities: ('gpio' | 'adc' | 'dac' | 'i2c' | 'spi' | 'uart' | 'sai')[];
}

export interface PlatformDefinition {
    id: PlatformType;
    name: string;
    description: string;
    imageUrl: string;
    pins: PinDefinition[]; // Available pins for mapping
    isFixed: boolean; // If true, standard controls are pre-mapped
    standardControls: {
        knobs: number;
        switches: number;
        leds: number;
        audioIns: number;
        audioOuts: number;
        gateIns: number;
        gateOuts: number;
        cvIns: number;
        cvOuts: number;
    };
}

export interface HardwareConfiguration {
    platform: PlatformType;
    pinMapping: Record<string, string>; // logicalName (e.g., "Knob 1") -> physicalPinName (e.g., "A0")
    peripherals: {
        useExternalCodec: boolean;
        useSdram: boolean;
        audioBlockSize: number;
        sampleRate: number;
    };
}

// Default/Initial Configuration
export const DEFAULT_HARDWARE_CONFIG: HardwareConfiguration = {
    platform: 'seed',
    pinMapping: {},
    peripherals: {
        useExternalCodec: false,
        useSdram: false,
        audioBlockSize: 48,
        sampleRate: 48000
    }
};

// --- DATA ---

const SEED_PINS: PinDefinition[] = [];
// Populate 40 pins (Simplified for initial version)
for (let i = 1; i <= 40; i++) {
    const caps: PinDefinition['capabilities'] = ['gpio'];
    // Crude approximation of ADC pins (ADC1_INx) - usually pins 15-22 on Seed 1.1+
    // and some others.
    // Ref: https://github.com/electro-smith/DaisyExamples/tree/master/seed/
    // For MVP we will allow ADC on all "Digital/Analog" pins for simplicity
    // unless we want to be strict. Let's be semi-strict.
    // Pins 15-22 vary by version but generally available for ADC.
    if (i >= 15 && i <= 22) caps.push('adc');
    // Pins 22, 23 DAC
    if (i === 22 || i === 23) caps.push('dac');

    SEED_PINS.push({
        pinNumber: i,
        name: `Pin ${i}`,
        capabilities: caps
    });
}

export const PLATFORMS: Record<PlatformType, PlatformDefinition> = {
    seed: {
        id: 'seed',
        name: 'Daisy Seed',
        description: 'The embedded audio platform. Flexible pinout.',
        imageUrl: '/assets/daisy_seed.png',
        pins: SEED_PINS,
        isFixed: false,
        standardControls: {
            knobs: 0, // User defines
            switches: 0,
            leds: 1, // Built-in User LED
            audioIns: 2,
            audioOuts: 2,
            gateIns: 0,
            gateOuts: 0,
            cvIns: 0,
            cvOuts: 0
        }
    },
    pod: {
        id: 'pod',
        name: 'Daisy Pod',
        description: 'USB powered breakout board with buttons, LEDs, and encoder.',
        imageUrl: '/assets/daisy_pod.png',
        pins: [], // Fixed architecture generally
        isFixed: true,
        standardControls: {
            knobs: 2,
            switches: 2, // 2 buttons
            leds: 2, // RGB leds
            audioIns: 2,
            audioOuts: 2,
            gateIns: 0,
            gateOuts: 0,
            cvIns: 0,
            cvOuts: 0
        }
    },
    field: {
        id: 'field',
        name: 'Daisy Field',
        description: 'Desktop synth platform with keyboard, knobs, CV/Gate.',
        imageUrl: '/assets/daisy_field.png',
        pins: [],
        isFixed: true,
        standardControls: {
            knobs: 8,
            switches: 2, // Toggle switches (plus keyboard...)
            leds: 1, // Simplified
            audioIns: 2,
            audioOuts: 2,
            gateIns: 1,
            gateOuts: 1,
            cvIns: 4,
            cvOuts: 2
        }
    }
};
