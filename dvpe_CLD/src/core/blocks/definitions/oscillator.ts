/**
 * Oscillator Block Definition
 * daisysp::Oscillator - Band-limited multi-waveform oscillator
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

export const OscillatorBlock: BlockDefinition = {
  // Identity
  id: 'oscillator',
  className: 'daisysp::Oscillator',
  displayName: 'OSCILLATOR',
  category: BlockCategory.SOURCES,

  // C++ Code Generation
  headerFile: 'daisysp.h',
  namespace: 'daisysp',
  initMethod: 'Init',
  initParams: ['sample_rate'],
  processMethod: 'Process',
  processReturnType: 'float',

  // Parameters
  parameters: [
    {
      id: 'freq',
      displayName: 'Frequency',
      type: ParameterType.FLOAT,
      cppSetter: 'SetFreq',
      cppGetter: 'GetFreq',
      defaultValue: 440.0,
      range: {
        min: 20.0,
        max: 20000.0,
        step: 1.0,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 'Hz',
      cvModulatable: true,
      group: 'Main',
      description: 'Oscillator frequency in Hz',
    },
    {
      id: 'amp',
      displayName: 'Amplitude',
      type: ParameterType.FLOAT,
      cppSetter: 'SetAmp',
      defaultValue: 0.5,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Main',
      description: 'Output amplitude (0-1)',
    },
    {
      id: 'waveform',
      displayName: 'Waveform',
      type: ParameterType.ENUM,
      cppSetter: 'SetWaveform',
      defaultValue: 'WAVE_POLYBLEP_SAW',
      enumValues: [
        { label: 'Sine', value: 'WAVE_SIN', cppValue: 'Oscillator::WAVE_SIN' },
        { label: 'Triangle', value: 'WAVE_TRI', cppValue: 'Oscillator::WAVE_TRI' },
        { label: 'Saw', value: 'WAVE_SAW', cppValue: 'Oscillator::WAVE_SAW' },
        { label: 'Ramp', value: 'WAVE_RAMP', cppValue: 'Oscillator::WAVE_RAMP' },
        { label: 'Square', value: 'WAVE_SQUARE', cppValue: 'Oscillator::WAVE_SQUARE' },
        { label: 'PolyBLEP Tri', value: 'WAVE_POLYBLEP_TRI', cppValue: 'Oscillator::WAVE_POLYBLEP_TRI' },
        { label: 'PolyBLEP Saw', value: 'WAVE_POLYBLEP_SAW', cppValue: 'Oscillator::WAVE_POLYBLEP_SAW' },
        { label: 'PolyBLEP Square', value: 'WAVE_POLYBLEP_SQUARE', cppValue: 'Oscillator::WAVE_POLYBLEP_SQUARE' },
      ],
      group: 'Main',
      description: 'Waveform shape (use PolyBLEP variants for anti-aliased output)',
    },
    {
      id: 'pw',
      displayName: 'Pulse Width',
      type: ParameterType.FLOAT,
      cppSetter: 'SetPw',
      defaultValue: 0.5,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Modulation',
      description: 'Pulse width for square wave (0-1)',
    },
  ],

  // Ports
  ports: [
    {
      id: 'freq_cv',
      displayName: 'FREQ CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Frequency modulation input',
    },
    {
      id: 'amp_cv',
      displayName: 'AMP CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Amplitude modulation input',
    },
    {
      id: 'pw_cv',
      displayName: 'PW CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Pulse width modulation input',
    },
    {
      id: 'out',
      displayName: 'OUT',
      signalType: SignalType.AUDIO,
      direction: PortDirection.OUTPUT,
      cppMethod: 'Process',
      description: 'Audio output',
    },
  ],

  // Visual
  colorScheme: BlockColorScheme.AUDIO,
  icon: 'Waves',

  // Documentation
  description: 'Band-limited oscillator with multiple waveforms',
  documentation: `
The Oscillator class provides alias-free waveforms using PolyBLEP anti-aliasing.
Use PolyBLEP waveforms (WAVE_POLYBLEP_SAW, WAVE_POLYBLEP_TRI, WAVE_POLYBLEP_SQUARE) 
for cleaner sound at high frequencies.

Frequency can be modulated via the FREQ_CV input for FM synthesis or vibrato.
Amplitude can be modulated for tremolo effects.
Pulse width modulation is available for square wave variants.
  `.trim(),
};
