#pragma once
#include "daisy_field.h"
#include "daisysp.h"

namespace synth {

/**
 * @brief Portable User Interface handler for Daisy Field.
 * Handles LED mapping, Knob smoothing, and general UI helpers.
 */
class FieldUX {
public:
  FieldUX() {}
  ~FieldUX() {}

  /** @brief Initialize the UX handler with hardware pointer */
  void Init(daisy::DaisyField *hw);

  /**
   * @brief Process and smooth all 8 knobs.
   * @param values_out Array of 8 floats to store smoothed values (0.0-1.0)
   */
  void ProcessKnobs(float *values_out);

  /**
   * @brief Update keyboard and knob LEDs based on Arpeggiator state.
   * @param mode_idx 0-3 (Modes A1-A4)
   * @param octave_shift -1 to +2 (Octaves B1-B4)
   * @param note_leds Array of 4 float brightness values (A5-A8)
   * @param latch Latch state (SW1)
   * @param paused Pause state (SW2)
   * @param knob_values Array of 8 floats for knob brightness
   */
  void UpdateLeds(int mode_idx, int octave_shift, const float *note_leds,
                  bool latch, bool paused, const float *knob_values);

  /** @brief Helper to draw a consistent header on the OLED */
  void DrawHeader(const char *title, const char *subtitle, bool lfo_active,
                  daisy::OledDisplay &display);

private:
  daisy::DaisyField *hw_;
  float smooth_knobs_[8];
};

} // namespace synth
