/**
 * FSM_4: Fixed 4-State Finite State Machine
 * 
 * A simple FSM with exactly 4 states (1, 2, 3, 4).
 * On each clock/trigger, evaluates conditions and transitions to next state.
 * Outputs gates indicating which state is active.
 * 
 * Typical applications:
 * - ADSR envelope sequencing
 * - Looper state management (Record → Overdub → Play → Stop)
 * - Beat repeater / glitch effects
 * - Generative structure (Verse → Chorus → Bridge → Outro)
 * 
 * Concatenatable: Chain multiple FSM_4 blocks to create larger state machines.
 */

import { BlockDefinition, BlockCategory, PortType } from '@/types/blocks';

export const fsm_4: BlockDefinition = {
  id: 'fsm_4',
  displayName: '4-State FSM',
  category: BlockCategory.UTILITY,
  description: 'Fixed 4-state finite state machine with configurable transitions',

  inputs: [
    { id: 'clock', name: 'Clock', type: PortType.GATE, description: 'Trigger to evaluate transitions' },
    { id: 'reset', name: 'Reset', type: PortType.GATE, description: 'Jump to State 1' },
    { id: 'input_a', name: 'Input A', type: PortType.CONTROL, description: 'Control signal for conditions' },
    { id: 'input_b', name: 'Input B', type: PortType.CONTROL, description: 'Control signal for conditions' },
  ],

  outputs: [
    { id: 'gate_1', name: 'Gate 1', type: PortType.GATE, description: 'High when in State 1' },
    { id: 'gate_2', name: 'Gate 2', type: PortType.GATE, description: 'High when in State 2' },
    { id: 'gate_3', name: 'Gate 3', type: PortType.GATE, description: 'High when in State 3' },
    { id: 'gate_4', name: 'Gate 4', type: PortType.GATE, description: 'High when in State 4' },
    { id: 'state_id', name: 'State ID', type: PortType.CONTROL, description: 'Current state (1-4) as control voltage' },
  ],

  parameters: [
    // State 1 transitions
    {
      id: 's1_next',
      name: 'S1 → Next',
      type: 'select',
      defaultValue: 2,
      options: [
        { value: 1, label: 'Stay S1' },
        { value: 2, label: 'Go S2' },
        { value: 3, label: 'Go S3' },
        { value: 4, label: 'Go S4' },
      ],
      description: 'Next state when S1 condition met',
      group: 'State 1',
    },
    {
      id: 's1_condition',
      name: 'S1 Condition',
      type: 'select',
      defaultValue: 0,
      options: [
        { value: 0, label: 'Always (on clock)' },
        { value: 1, label: 'Input A > 0.5' },
        { value: 2, label: 'Input B > 0.5' },
        { value: 3, label: 'Input A < 0.5' },
        { value: 4, label: 'Input B < 0.5' },
      ],
      description: 'Condition to trigger transition',
      group: 'State 1',
    },

    // State 2 transitions
    {
      id: 's2_next',
      name: 'S2 → Next',
      type: 'select',
      defaultValue: 3,
      options: [
        { value: 1, label: 'Go S1' },
        { value: 2, label: 'Stay S2' },
        { value: 3, label: 'Go S3' },
        { value: 4, label: 'Go S4' },
      ],
      description: 'Next state when S2 condition met',
      group: 'State 2',
    },
    {
      id: 's2_condition',
      name: 'S2 Condition',
      type: 'select',
      defaultValue: 0,
      options: [
        { value: 0, label: 'Always (on clock)' },
        { value: 1, label: 'Input A > 0.5' },
        { value: 2, label: 'Input B > 0.5' },
        { value: 3, label: 'Input A < 0.5' },
        { value: 4, label: 'Input B < 0.5' },
      ],
      description: 'Condition to trigger transition',
      group: 'State 2',
    },

    // State 3 transitions
    {
      id: 's3_next',
      name: 'S3 → Next',
      type: 'select',
      defaultValue: 4,
      options: [
        { value: 1, label: 'Go S1' },
        { value: 2, label: 'Go S2' },
        { value: 3, label: 'Stay S3' },
        { value: 4, label: 'Go S4' },
      ],
      description: 'Next state when S3 condition met',
      group: 'State 3',
    },
    {
      id: 's3_condition',
      name: 'S3 Condition',
      type: 'select',
      defaultValue: 0,
      options: [
        { value: 0, label: 'Always (on clock)' },
        { value: 1, label: 'Input A > 0.5' },
        { value: 2, label: 'Input B > 0.5' },
        { value: 3, label: 'Input A < 0.5' },
        { value: 4, label: 'Input B < 0.5' },
      ],
      description: 'Condition to trigger transition',
      group: 'State 3',
    },

    // State 4 transitions
    {
      id: 's4_next',
      name: 'S4 → Next',
      type: 'select',
      defaultValue: 1,
      options: [
        { value: 1, label: 'Go S1' },
        { value: 2, label: 'Go S2' },
        { value: 3, label: 'Go S3' },
        { value: 4, label: 'Stay S4' },
      ],
      description: 'Next state when S4 condition met',
      group: 'State 4',
    },
    {
      id: 's4_condition',
      name: 'S4 Condition',
      type: 'select',
      defaultValue: 0,
      options: [
        { value: 0, label: 'Always (on clock)' },
        { value: 1, label: 'Input A > 0.5' },
        { value: 2, label: 'Input B > 0.5' },
        { value: 3, label: 'Input A < 0.5' },
        { value: 4, label: 'Input B < 0.5' },
      ],
      description: 'Condition to trigger transition',
      group: 'State 4',
    },
  ],

  // C++ State Variables
  cppStateVars: `
    int state;        // Current state (1-4)
    bool prevClock;   // Previous clock state for edge detection
    bool prevReset;   // Previous reset state for edge detection
  `,

  // C++ Initialization
  cppInitMethod: `
    state = 1;
    prevClock = false;
    prevReset = false;
  `,

  // C++ Process (inline template)
  cppInlineProcess: `
    // Edge detection
    bool clockRising = {{clock}} > 0.5f && !prevClock;
    bool resetRising = {{reset}} > 0.5f && !prevReset;
    prevClock = {{clock}} > 0.5f;
    prevReset = {{reset}} > 0.5f;
    
    // Reset overrides everything
    if (resetRising) {
      state = 1;
    }
    // On clock rising edge, evaluate transitions
    else if (clockRising) {
      bool conditionMet = false;
      int nextState = state;
      
      switch (state) {
        case 1:
          nextState = {{s1_next}};
          switch ({{s1_condition}}) {
            case 0: conditionMet = true; break;  // Always
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
        state = nextState;
      }
    }
    
    // Set gate outputs
    {{gate_1}} = (state == 1) ? 1.0f : 0.0f;
    {{gate_2}} = (state == 2) ? 1.0f : 0.0f;
    {{gate_3}} = (state == 3) ? 1.0f : 0.0f;
    {{gate_4}} = (state == 4) ? 1.0f : 0.0f;
    
    // State ID output (normalized 0.25, 0.5, 0.75, 1.0)
    {{state_id}} = state * 0.25f;
  `,
};
