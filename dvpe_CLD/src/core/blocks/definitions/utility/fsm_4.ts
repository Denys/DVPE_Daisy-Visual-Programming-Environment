/**
 * FSM_4: Fixed 4-State Finite State Machine
 *
 * A simple FSM with exactly 4 states (1, 2, 3, 4).
 * On each clock/trigger, evaluates conditions and transitions to next state.
 * Outputs gates indicating which state is active.
 *
 * Typical applications:
 * - ADSR envelope sequencing
 * - Looper state management (Record -> Overdub -> Play -> Stop)
 * - Beat repeater / glitch effects
 * - Generative structure (Verse -> Chorus -> Bridge -> Outro)
 *
 * Concatenatable: Chain multiple FSM_4 blocks to create larger state machines.
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const Fsm4Block: BlockDefinition = {
    id: 'fsm_4',
    className: 'DVPE_FSM4',
    displayName: '4-STATE FSM',
    category: BlockCategory.UTILITY,
    description: 'Fixed 4-state finite state machine with configurable transitions',
    documentation: 'On each clock rising edge, evaluates the current state\'s condition against Input A/B. If the condition is met, transitions to the configured next state. Reset forces State 1. Gate outputs indicate the active state. Chain multiple FSM_4 blocks for larger state machines.',

    cppStateVars: [
        { type: 'int', name: 'state', init: '1' },
        { type: 'bool', name: 'prevClock', init: 'false' },
        { type: 'bool', name: 'prevReset', init: 'false' },
    ],

    cppProcessTemplate: `
    // Edge detection
    bool clockRising = {{clock}} > 0.5f && !{{prevClock}};
    bool resetRising = {{reset}} > 0.5f && !{{prevReset}};
    {{prevClock}} = {{clock}} > 0.5f;
    {{prevReset}} = {{reset}} > 0.5f;

    // Reset overrides everything
    if (resetRising) {
      {{state}} = 1;
    }
    // On clock rising edge, evaluate transitions
    else if (clockRising) {
      bool conditionMet = false;
      int nextState = {{state}};

      switch ({{state}}) {
        case 1:
          nextState = {{s1_next}};
          switch ({{s1_condition}}) {
            case 0: conditionMet = true; break;
            case 1: conditionMet = {{input_a}} > 0.5f; break;
            case 2: conditionMet = {{input_b}} > 0.5f; break;
            case 3: conditionMet = {{input_a}} < 0.5f; break;
            case 4: conditionMet = {{input_b}} < 0.5f; break;
          }
          break;
        case 2:
          nextState = {{s2_next}};
          switch ({{s2_condition}}) {
            case 0: conditionMet = true; break;
            case 1: conditionMet = {{input_a}} > 0.5f; break;
            case 2: conditionMet = {{input_b}} > 0.5f; break;
            case 3: conditionMet = {{input_a}} < 0.5f; break;
            case 4: conditionMet = {{input_b}} < 0.5f; break;
          }
          break;
        case 3:
          nextState = {{s3_next}};
          switch ({{s3_condition}}) {
            case 0: conditionMet = true; break;
            case 1: conditionMet = {{input_a}} > 0.5f; break;
            case 2: conditionMet = {{input_b}} > 0.5f; break;
            case 3: conditionMet = {{input_a}} < 0.5f; break;
            case 4: conditionMet = {{input_b}} < 0.5f; break;
          }
          break;
        case 4:
          nextState = {{s4_next}};
          switch ({{s4_condition}}) {
            case 0: conditionMet = true; break;
            case 1: conditionMet = {{input_a}} > 0.5f; break;
            case 2: conditionMet = {{input_b}} > 0.5f; break;
            case 3: conditionMet = {{input_a}} < 0.5f; break;
            case 4: conditionMet = {{input_b}} < 0.5f; break;
          }
          break;
      }

      if (conditionMet) {
        {{state}} = nextState;
      }
    }

    // Set gate outputs
    {{gate_1}} = ({{state}} == 1) ? 1.0f : 0.0f;
    {{gate_2}} = ({{state}} == 2) ? 1.0f : 0.0f;
    {{gate_3}} = ({{state}} == 3) ? 1.0f : 0.0f;
    {{gate_4}} = ({{state}} == 4) ? 1.0f : 0.0f;

    // State ID output (normalized 0.25, 0.5, 0.75, 1.0)
    {{state_id}} = {{state}} * 0.25f;
  `,

    parameters: [
        // State 1 transitions
        {
            id: 's1_next',
            displayName: 'S1 Next',
            type: ParameterType.ENUM,
            defaultValue: 2,
            group: 'State 1',
            description: 'Next state when S1 condition met',
            enumValues: [
                { label: 'Stay S1', value: 1 },
                { label: 'Go S2', value: 2 },
                { label: 'Go S3', value: 3 },
                { label: 'Go S4', value: 4 },
            ],
        },
        {
            id: 's1_condition',
            displayName: 'S1 Condition',
            type: ParameterType.ENUM,
            defaultValue: 0,
            group: 'State 1',
            description: 'Condition to trigger transition',
            enumValues: [
                { label: 'Always (on clock)', value: 0 },
                { label: 'Input A > 0.5', value: 1 },
                { label: 'Input B > 0.5', value: 2 },
                { label: 'Input A < 0.5', value: 3 },
                { label: 'Input B < 0.5', value: 4 },
            ],
        },
        // State 2 transitions
        {
            id: 's2_next',
            displayName: 'S2 Next',
            type: ParameterType.ENUM,
            defaultValue: 3,
            group: 'State 2',
            description: 'Next state when S2 condition met',
            enumValues: [
                { label: 'Go S1', value: 1 },
                { label: 'Stay S2', value: 2 },
                { label: 'Go S3', value: 3 },
                { label: 'Go S4', value: 4 },
            ],
        },
        {
            id: 's2_condition',
            displayName: 'S2 Condition',
            type: ParameterType.ENUM,
            defaultValue: 0,
            group: 'State 2',
            description: 'Condition to trigger transition',
            enumValues: [
                { label: 'Always (on clock)', value: 0 },
                { label: 'Input A > 0.5', value: 1 },
                { label: 'Input B > 0.5', value: 2 },
                { label: 'Input A < 0.5', value: 3 },
                { label: 'Input B < 0.5', value: 4 },
            ],
        },
        // State 3 transitions
        {
            id: 's3_next',
            displayName: 'S3 Next',
            type: ParameterType.ENUM,
            defaultValue: 4,
            group: 'State 3',
            description: 'Next state when S3 condition met',
            enumValues: [
                { label: 'Go S1', value: 1 },
                { label: 'Go S2', value: 2 },
                { label: 'Stay S3', value: 3 },
                { label: 'Go S4', value: 4 },
            ],
        },
        {
            id: 's3_condition',
            displayName: 'S3 Condition',
            type: ParameterType.ENUM,
            defaultValue: 0,
            group: 'State 3',
            description: 'Condition to trigger transition',
            enumValues: [
                { label: 'Always (on clock)', value: 0 },
                { label: 'Input A > 0.5', value: 1 },
                { label: 'Input B > 0.5', value: 2 },
                { label: 'Input A < 0.5', value: 3 },
                { label: 'Input B < 0.5', value: 4 },
            ],
        },
        // State 4 transitions
        {
            id: 's4_next',
            displayName: 'S4 Next',
            type: ParameterType.ENUM,
            defaultValue: 1,
            group: 'State 4',
            description: 'Next state when S4 condition met',
            enumValues: [
                { label: 'Go S1', value: 1 },
                { label: 'Go S2', value: 2 },
                { label: 'Go S3', value: 3 },
                { label: 'Stay S4', value: 4 },
            ],
        },
        {
            id: 's4_condition',
            displayName: 'S4 Condition',
            type: ParameterType.ENUM,
            defaultValue: 0,
            group: 'State 4',
            description: 'Condition to trigger transition',
            enumValues: [
                { label: 'Always (on clock)', value: 0 },
                { label: 'Input A > 0.5', value: 1 },
                { label: 'Input B > 0.5', value: 2 },
                { label: 'Input A < 0.5', value: 3 },
                { label: 'Input B < 0.5', value: 4 },
            ],
        },
    ],

    ports: [
        { id: 'clock', displayName: 'CLK', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT, description: 'Trigger to evaluate transitions' },
        { id: 'reset', displayName: 'RST', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT, description: 'Jump to State 1' },
        { id: 'input_a', displayName: 'IN A', signalType: SignalType.CV, direction: PortDirection.INPUT, description: 'Control signal for conditions' },
        { id: 'input_b', displayName: 'IN B', signalType: SignalType.CV, direction: PortDirection.INPUT, description: 'Control signal for conditions' },
        { id: 'gate_1', displayName: 'G1', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT, description: 'High when in State 1' },
        { id: 'gate_2', displayName: 'G2', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT, description: 'High when in State 2' },
        { id: 'gate_3', displayName: 'G3', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT, description: 'High when in State 3' },
        { id: 'gate_4', displayName: 'G4', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT, description: 'High when in State 4' },
        { id: 'state_id', displayName: 'SID', signalType: SignalType.CV, direction: PortDirection.OUTPUT, description: 'Current state (1-4) as control voltage' },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Workflow',
};
