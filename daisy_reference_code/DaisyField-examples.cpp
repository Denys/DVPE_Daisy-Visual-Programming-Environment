
Daisy Field Examples:

KeyboardTest
Midi
Nimbus
chorus
flanger
modalvoice
phaser
sampler
stringvoice
README.md

__________________________________________
Daisy Field
Programmable Mini Desktop Synthesizer

Runs off 9V adaptor (included).

Features
Stereo Audio I/O (Line Level)
Headphone Output
Master Volume control
Soft-key Keyboard (1 octave) with LEDs under each key.
8 Knobs
4 CV inputs
2 CV outputs
TRS MIDI In and Out
Gate In and Gate Out
Two buttons, and 1 toggle
USB Micro (x2 -- one on Seed, one on Field)
MicroSD Port
All headers have additional female pin for jumping out to other (custom) hardware
Project Ideas
Poly Synth
Eight step sequencer

__________________________________________

# Keyboard Test

## Author

Shensley

## Description
Keyboard based synth with 13 note polyphony, and built in reverb.
Oscillators are each Bandlimited Saw waves.

[Source Code](https://github.com/electro-smith/DaisyExamples/tree/master/field/KeyboardTest)

## Controls

| Control | Description |
| --- | --- |
| SW 1 2 |  Octave up/down |
| Keyboard buttons | Chromatic keyboard |

__________________________________________

#include "daisy_field.h"
#include "daisysp.h"

#define NUM_VOICES 16

using namespace daisy;

DaisyField hw;


struct voice
{
    void Init(float samplerate)
    {
        osc_.Init(samplerate);
        amp_ = 0.0f;
        osc_.SetAmp(0.7f);
        osc_.SetWaveform(daisysp::Oscillator::WAVE_POLYBLEP_SAW);
        on_ = false;
    }
    float Process()
    {
        float sig;
        amp_ += 0.0025f * ((on_ ? 1.0f : 0.0f) - amp_);
        sig = osc_.Process() * amp_;
        return sig;
    }
    void set_note(float nn) { osc_.SetFreq(daisysp::mtof(nn)); }

    daisysp::Oscillator osc_;
    float               amp_, midibase_;
    bool                on_;
};

voice   v[NUM_VOICES];
uint8_t buttons[16];
// Use bottom row to set major scale
// Top row chromatic notes, and the inbetween notes are just the octave.
float scale[16]   = {0.f,
                   2.f,
                   4.f,
                   5.f,
                   7.f,
                   9.f,
                   11.f,
                   12.f,
                   0.f,
                   1.f,
                   3.f,
                   0.f,
                   6.f,
                   8.f,
                   10.f,
                   0.0f};
float active_note = scale[0];

int8_t octaves = 0;

static daisysp::ReverbSc verb;
// Use two side buttons to change octaves.
float kvals[8];
float cvvals[4];

void AudioCallback(AudioHandle::InterleavingInputBuffer  in,
                   AudioHandle::InterleavingOutputBuffer out,
                   size_t                                size)
{
    bool trig, use_verb;
    trig = false;
    hw.ProcessAnalogControls();
    hw.ProcessDigitalControls();
    if(hw.GetSwitch(DaisyField::SW_1)->RisingEdge())
    {
        octaves -= 1;
        trig = true;
    }
    if(hw.GetSwitch(DaisyField::SW_2)->RisingEdge())
    {
        octaves += 1;
        trig = true;
    }
    use_verb = true;

    for(int i = 0; i < 8; i++)
    {
        kvals[i] = hw.GetKnobValue(i);
        if(i < 4)
        {
            cvvals[i] = hw.GetCvValue(i);
        }
    }

    if(octaves < 0)
        octaves = 0;
    if(octaves > 4)
        octaves = 4;

    if(trig)
    {
        for(int i = 0; i < NUM_VOICES; i++)
        {
            v[i].set_note((12.0f * octaves) + 24.0f + scale[i]);
        }
    }
    for(size_t i = 0; i < 16; i++)
    {
        v[i].on_ = hw.KeyboardState(i);
    }
    float sig, send;
    float wetl, wetr;
    for(size_t i = 0; i < size; i += 2)
    {
        sig = 0.0f;
        for(int i = 0; i < NUM_VOICES; i++)
        {
            if(i != 8 && i != 11 && i != 15)
                sig += v[i].Process();
        }
        send = sig * 0.35f;
        verb.Process(send, send, &wetl, &wetr);
        //        wetl = wetr = sig;
        if(!use_verb)
            wetl = wetr = 0.0f;
        out[i]     = (sig + wetl) * 0.5f;
        out[i + 1] = (sig + wetr) * 0.5f;
    }
}

void UpdateLeds(float *knob_vals)
{
    // knob_vals is exactly 8 members
    size_t knob_leds[] = {
        DaisyField::LED_KNOB_1,
        DaisyField::LED_KNOB_2,
        DaisyField::LED_KNOB_3,
        DaisyField::LED_KNOB_4,
        DaisyField::LED_KNOB_5,
        DaisyField::LED_KNOB_6,
        DaisyField::LED_KNOB_7,
        DaisyField::LED_KNOB_8,
    };
    size_t keyboard_leds[] = {
        DaisyField::LED_KEY_A1,
        DaisyField::LED_KEY_A2,
        DaisyField::LED_KEY_A3,
        DaisyField::LED_KEY_A4,
        DaisyField::LED_KEY_A5,
        DaisyField::LED_KEY_A6,
        DaisyField::LED_KEY_A7,
        DaisyField::LED_KEY_A8,
        DaisyField::LED_KEY_B2,
        DaisyField::LED_KEY_B3,
        DaisyField::LED_KEY_B5,
        DaisyField::LED_KEY_B6,
        DaisyField::LED_KEY_B7,
    };
    for(size_t i = 0; i < 8; i++)
    {
        hw.led_driver.SetLed(knob_leds[i], knob_vals[i]);
    }
    for(size_t i = 0; i < 13; i++)
    {
        hw.led_driver.SetLed(keyboard_leds[i], 1.f);
    }
    hw.led_driver.SwapBuffersAndTransmit();
}

int main(void)
{
    float sr;
    hw.Init();
    sr = hw.AudioSampleRate();
    // Initialize controls.
    octaves = 2;
    for(int i = 0; i < NUM_VOICES; i++)
    {
        v[i].Init(sr);
        v[i].set_note((12.0f * octaves) + 24.0f + scale[i]);
    }

    verb.Init(sr);
    verb.SetFeedback(0.94f);
    verb.SetLpFreq(8000.0f);

    hw.StartAdc();
    hw.StartAudio(AudioCallback);

    for(;;)
    {
        UpdateLeds(kvals);
        System::Delay(1);
        hw.seed.dac.WriteValue(DacHandle::Channel::ONE,
                               hw.GetKnobValue(0) * 4095);
        hw.seed.dac.WriteValue(DacHandle::Channel::TWO,
                               hw.GetKnobValue(1) * 4095);
    }
}


__________________________________________


# Midi

## Author

Shensley

## Description

Polyphonic MIDI Synth
24 voices of polyphony. Each voice is a band-limited saw waveform running through a state variable filter.

[Source Code](https://github.com/electro-smith/DaisyExamples/tree/master/field/Midi)

## Controls

| Control | Description |
| --- | --- |
| Button 1 | Choke all voices |
| Knob 1 | Filter Cutoff |
| MIDI Input | Note In/Note Off messages with Simple Polyphony (no voice stealing) |

__________________________________________

#include "daisy_field.h"
#include "daisysp.h"
#include <string>

using namespace daisy;
using namespace daisysp;

DaisyField hw;

class Voice
{
  public:
    Voice() {}
    ~Voice() {}
    void Init(float samplerate)
    {
        active_ = false;
        osc_.Init(samplerate);
        osc_.SetAmp(0.75f);
        osc_.SetWaveform(Oscillator::WAVE_POLYBLEP_SAW);
        env_.Init(samplerate);
        env_.SetSustainLevel(0.5f);
        env_.SetTime(ADSR_SEG_ATTACK, 0.005f);
        env_.SetTime(ADSR_SEG_DECAY, 0.005f);
        env_.SetTime(ADSR_SEG_RELEASE, 0.2f);
        filt_.Init(samplerate);
        filt_.SetFreq(6000.f);
        filt_.SetRes(0.6f);
        filt_.SetDrive(0.8f);
    }

    float Process()
    {
        if(active_)
        {
            float sig, amp;
            amp = env_.Process(env_gate_);
            if(!env_.IsRunning())
                active_ = false;
            sig = osc_.Process();
            filt_.Process(sig);
            return filt_.Low() * (velocity_ / 127.f) * amp;
        }
        return 0.f;
    }

    void OnNoteOn(float note, float velocity)
    {
        note_     = note;
        velocity_ = velocity;
        osc_.SetFreq(mtof(note_));
        active_   = true;
        env_gate_ = true;
    }

    void OnNoteOff() { env_gate_ = false; }

    void SetCutoff(float val) { filt_.SetFreq(val); }

    inline bool  IsActive() const { return active_; }
    inline float GetNote() const { return note_; }

  private:
    Oscillator osc_;
    Svf        filt_;
    Adsr       env_;
    float      note_, velocity_;
    bool       active_;
    bool       env_gate_;
};

template <size_t max_voices>
class VoiceManager
{
  public:
    VoiceManager() {}
    ~VoiceManager() {}

    void Init(float samplerate)
    {
        for(size_t i = 0; i < max_voices; i++)
        {
            voices[i].Init(samplerate);
        }
    }

    float Process()
    {
        float sum;
        sum = 0.f;
        for(size_t i = 0; i < max_voices; i++)
        {
            sum += voices[i].Process();
        }
        return sum;
    }

    void OnNoteOn(float notenumber, float velocity)
    {
        Voice *v = FindFreeVoice();
        if(v == NULL)
            return;
        v->OnNoteOn(notenumber, velocity);
    }

    void OnNoteOff(float notenumber, float velocity)
    {
        for(size_t i = 0; i < max_voices; i++)
        {
            Voice *v = &voices[i];
            if(v->IsActive() && v->GetNote() == notenumber)
            {
                v->OnNoteOff();
            }
        }
    }

    void FreeAllVoices()
    {
        for(size_t i = 0; i < max_voices; i++)
        {
            voices[i].OnNoteOff();
        }
    }

    void SetCutoff(float all_val)
    {
        for(size_t i = 0; i < max_voices; i++)
        {
            voices[i].SetCutoff(all_val);
        }
    }


  private:
    Voice  voices[max_voices];
    Voice *FindFreeVoice()
    {
        Voice *v = NULL;
        for(size_t i = 0; i < max_voices; i++)
        {
            if(!voices[i].IsActive())
            {
                v = &voices[i];
                break;
            }
        }
        return v;
    }
};

static VoiceManager<24> voice_handler;

void AudioCallback(AudioHandle::InterleavingInputBuffer  in,
                   AudioHandle::InterleavingOutputBuffer out,
                   size_t                                size)
{
    float sum = 0.f;
    hw.ProcessDigitalControls();
    hw.ProcessAnalogControls();
    if(hw.GetSwitch(hw.SW_1)->FallingEdge())
    {
        voice_handler.FreeAllVoices();
    }
    voice_handler.SetCutoff(250.f + hw.GetKnobValue(hw.KNOB_1) * 8000.f);

    for(size_t i = 0; i < size; i += 2)
    {
        sum        = 0.f;
        sum        = voice_handler.Process() * 0.5f;
        out[i]     = sum;
        out[i + 1] = sum;
    }
}

// Typical Switch case for Message Type.
void HandleMidiMessage(MidiEvent m)
{
    switch(m.type)
    {
        case NoteOn:
        {
            NoteOnEvent p = m.AsNoteOn();
            // Note Off can come in as Note On w/ 0 Velocity
            if(p.velocity == 0.f)
            {
                voice_handler.OnNoteOff(p.note, p.velocity);
            }
            else
            {
                voice_handler.OnNoteOn(p.note, p.velocity);
            }
        }
        break;
        case NoteOff:
        {
            NoteOnEvent p = m.AsNoteOn();
            voice_handler.OnNoteOff(p.note, p.velocity);
        }
        break;
        default: break;
    }
}

// Main -- Init, and Midi Handling
int main(void)
{
    // Init
    float samplerate;
    hw.Init();
    samplerate = hw.AudioSampleRate();
    voice_handler.Init(samplerate);

    //display
    const char str[] = "Midi";
    char *     cstr  = (char *)str;
    hw.display.WriteString(cstr, Font_7x10, true);
    hw.display.Update();

    // Start stuff.
    hw.midi.StartReceive();
    hw.StartAdc();
    hw.StartAudio(AudioCallback);
    for(;;)
    {
        hw.midi.Listen();
        // Handle MIDI Events
        while(hw.midi.HasEvents())
        {
            HandleMidiMessage(hw.midi.PopEvent());
        }
    }
}

__________________________________________

Nimbus
Note: This is a bootloader app. In order to run this on the daisy you first need to install the Daisy bootloader.

To install the bootloader on the Daisy:

Connect to the Daisy as usual via the Web Programmer
Click the advanced button in the Programming Section
Click "Flash Bootloader Image"
Once the bootloader has been programmed. You can load this program to the daisy by following the following steps:

Press reset on the daisy, the USR LED will briefly pulse
While the LED is pulsing, press boot to force the daisy to stay in the bootloader. The LED will blink rapidly to indicate you are staying in the bootloader.
The Daisy will now appear in the list of USB devices available (As either STM32 Firmware Update, or Daisy Bootloader)
Once connected, you can click program as usual.
Author
Ported by Gregor Noriskin to the Field from the port by Ben Sergentanis

Originally by Emilie Gillet

Description
Nimbus is a port of Mutable Instrument's Clouds. Clouds is a granular audio processor, specializing in making huge clouds of sound from even the tiniest source. Nimbus for Field uses all 8 knobs to control Clouds' parameters. Values of each parameter are shown on the OLED when the knob controlling that value is moved (unless it is currently CV mapped), or by navigating to the specific parameter page with SW1 and SW2. Nimbus for Field also uses the keys to select the current Playback Mode and Quality, and engage freeze, silence, bypass and shift. Shift is used to allow for the adjustment of additional parameters using the knobs. If a knob does not control an alternate parameter it will just adjust its default parameter. Reverb is currently the only parameter that requires shift to change. All knobs implement a parameter "catch" scheme, and will only start adjusting a parameter when the knob is close to what the currently set value of that parameter is. This will be noticeable when you power the Field on, when you enter and exit Shift, and when un-mapping CV. Given that the Field only has one Gate In, which is used to trigger Clouds, CV1 In is used to toggle freeze (with a voltage of 3.5V or above). The code includes a mechanism to only freeze when the voltage is high, as opposed to toggling freeze. This port also allows you to map one or more of the parameters to CV In 2, 3 and 4. You can map as many parameters as you like to each of the CVs inputs, but cannot map a parameter to more than one CV input.

Originally ported by Ben Sergentanis from pichenettes/eurorack

Controls
Control	Description	Comment
Knob 1	Change Position Parameter	
Knob 2	Change Size Parameter	
Knob 3	Change Parameter	
Knob 4	Change DensityParameter	
Knob 5	Change Texture Parameter	
Knob 6	Change Dry/Wet Parameter	
Knob 7	Change Stereo Spread Parameter	
Knob 8	Change Feedback Parameter	
Knob 8 + Shift	Change Reverb Parameter	
SW 1	Navigate to previous Parameter Page	
SW 2	Navigate to next Parameter Page	
KEY A1	Select Granular Playback Mode	
KEY A2	Select Pitch Shift/Time Stretch Playback Mode	
KEY A3	Select Looping Delay Playback Mode	
KEY A4	Select Spectral Processor Playback Mode	
KEY A5	Hold to map and unmap parameter to CV2	Only one parameter can be mapped or unmapped for each key press
KEY A6	Hold to map and unmap parameter to CV3	Only one parameter can be mapped or unmapped for each key press
KEY A7	Hold to map and unmap parameter to CV4	Only one parameter can be mapped or unmapped for each key press
KEY A8	Toggle Shift	Lit when on
KEY B1	Select 16 bit Stereo Playback Quality	
KEY B2	Select 16 bit Mono Playback Quality	
KEY B3	Select 8bit u-law Stereo Playback Quality	
KEY B4	Select 8bit u-law Mono Playback Quality	
KEY B6	Toggle Freeze	Lit when on
KEY B7	Toggle Silence	Lit when on
KEY B8	Toggle Bypass	Lit when bypassed
Gate In 1	Cloud Gate In	
CV In 1	Freeze Gate In	Triggers at 3.5V
Audio In 1	Left In 1	
Audio In 2	Right In 1	
Audio Out 1	Left Out 1	
Audio Out 2	Right Out 1	
Display
The display will automatically jump to the page that contains the parameter you are currently editing, and you can navigate between pages using SW1 and SW2. This will not happen for shift, freeze, silence or bypass.

Splash Screen
Because sometimes you gotta be reminded what code is running on you Daisy.

Parameters Screen 1
This screen shows the values of parameters:

position
size
pitch
Parameters Screen 2
This screen shows the values of parameters:

density
texture
dry/wet
Parameters Screen 3
This screen shows the values of parameters:

stereo spread
feedback
reverb
The code also contains a mechanism for showing the parameters as integer values between 0 and 100.

Buttons Screen 1
This screen shows the current setting for Playback Mode and Quality.

Buttons Screen 2
This screen shows the current toggled state of:

shift
freeze
silence
bypass
Refer to the Clouds Manual for more information on these controls.

CV2 Parameter Mapping Screen
This screen shows the current parameters that are mapped to CV In 2.

CV3 Parameter Mapping Screen
This screen shows the current parameters that are mapped to CV In 3.

CV4 Parameter Mapping Screen
This screen shows the current parameters that are mapped to CV In 4.

Scope Screen
This screen shows the current CPU utilization and a simple scope showing the current audio output.

Freeze
Freeze can be forced on by hitting the B6 key. Freeze will stay on until the key is hit again or if CV1 is connected and a voltage below 3.5v is detected.

Mode
You can select from Nimbus' four alternate modes here. These are:

Granular
Pitch Shift / Time Stretch
Looping Delay
Spectral Processor
Refer to the Clouds Manual section on "The Infamous Alternate Modes".

Quality
You can also select from four quality / mono stereo modes. These are:

16 bit Stereo
16 bit Mono
8bit u-law Stereo
8bit u-law Mono
Refer to the Clouds Manual section on "Audio Quality".

CV In to Parameter Mapping
You can modulate any or all of the 9 Nimbus parameters with CV In 2, 3, and 4 (1 is reserved for Freeze). To map a parameter just hold down the key associated with the CV you wish to map and then move the knob associated with the parameter. The CV mapping keys are not lit but will be when you hold them down. Once you have finished mapping a parameter, release the key. You can only map or unmap one parameter for each hold of the key. To unmap a parameter just press the key again and move the knob. When a parameter is mapped, input from the knob is ignored and the LED will be dark. The display will still show changes in the parameter values though. You can see which parameters are currently mapped by navigating to each of the CV mapping pages.

__________________________________________

#include "daisy_field.h"
#include "daisysp.h"
#include "granular_processor.h"

//#define SHOW_KNOB_VALUES
#define TOGGLE_FREEZE_ON_HIGH //as opposed to Freezing only while the gate is open

#define AUDIO_BLOCK_SIZE 32 //DO NOT CHANGE!

#define MAIN_LOOP_DELAY 6                      //milliseconds
#define OLED_LED_UPDATE_DELAY 5                //in Frames not milliseconds
#define CV_FREEZE_UPDATE_DEBOUNCE_INTERVAL 500 //milliseconds
#define CV_FREEZE_TRIGGER_THRESHOLD 0.65f //TODO: make these last 2 parameters

#define NUM_KNOBS 8
#define NUM_PARAMS 9
#define NUM_PAGES 10

#define KNOB_CHANGE_TOLERANCE .001f
#define KNOB_CATCH_TOLERANCE .075f

#define DISPLAY_WIDTH 128
#define DISPLAY_HEIGHT 60
#define HEADER_HEIGHT 10
#define LEFT_BORDER_WIDTH 2
#define PARAM_NAME_COL_WIDTH 70
#define ROW_HEIGHT 14
#define SKINNY_ROW_HEIGHT 13
#define DEFAULT_FONT Font_7x10
#define SMALL_FONT Font_6x8
#define CHECKBOX_SIZE 8
#define CHECKBOX_MARGIN 3
#define VALUE_BAR_HEIGHT 10
#define VALUE_BAR_WIDTH 55
#define VALUE_BAR_MARGIN 3
#define MAPPED_PARAM_CONTAINER_WIDTH 18
#define MAX_SCOPE_HEIGHT 60

#define PARAM_BUFFER_SIZE 8

using namespace daisysp;
using namespace daisy;

enum DEVICE_STATE
{
    RUNNING,
    CV_MAPPING,
};

enum DISPLAY_PAGE
{
    SPLASH,
    PARAMETERS1TO3,
    PARAMETERS4TO6,
    PARAMETERS7TO9,
    BUTTONS1,
    BUTTONS2,
    CV_MAPPINGS2,
    CV_MAPPINGS3,
    CV_MAPPINGS4,
    SCOPE,
};

enum DISPLAY_ROW
{
    ROW_1 = 1,
    ROW_2,
    ROW_3,
    ROW_4,
};

enum
{
    PLAYBACK_QUAL_16B_ST = 0,
    PLAYBACK_QUAL_16B_MO = 1,
    PLAYBACK_QUAL_8B_ST  = 2,
    PLAYBACK_QUAL_8B_MO  = 3,
};

enum
{
    LED_PLAYBACK_QUAL_16B_ST        = 0,
    LED_PLAYBACK_QUAL_16B_MO        = 1,
    LED_PLAYBACK_QUAL_8B_ST         = 2,
    LED_PLAYBACK_QUAL_8B_MO         = 3,
    LED_MAP_CV_2                    = 4,
    LED_MAP_CV_3                    = 5,
    LED_MAP_CV_4                    = 6,
    LED_SHIFT                       = 7,
    LED_BYPASS                      = 8,
    LED_SILENCE                     = 9,
    LED_FREEZE                      = 10,
    LED_PLAYBACK_MODE_SPECTRAL      = 12,
    LED_PLAYBACK_MODE_LOOPING_DELAY = 13,
    LED_PLAYBACK_MODE_STRETCH       = 14,
    LED_PLAYBACK_MODE_GRANULAR      = 15,
};

enum
{
    BUTTON_PLAYBACK_MODE_GRANULAR      = 0,
    BUTTON_PLAYBACK_MODE_STRETCH       = 1,
    BUTTON_PLAYBACK_MODE_LOOPING_DELAY = 2,
    BUTTON_PLAYBACK_MODE_SPECTRAL      = 3,
    BUTTON_FREEZE                      = 5,
    BUTTON_SILENCE                     = 6,
    BUTTON_BYPASS                      = 7,
    BUTTON_PLAYBACK_QUAL_16B_ST        = 8,
    BUTTON_PLAYBACK_QUAL_16B_MO        = 9,
    BUTTON_PLAYBACK_QUAL_8B_ST         = 10,
    BUTTON_PLAYBACK_QUAL_8B_MO         = 11,
    BUTTON_MAP_CV_2                    = 12,
    BUTTON_MAP_CV_3                    = 13,
    BUTTON_MAP_CV_4                    = 14,
    BUTTON_SHIFT                       = 15,
};

enum MAPPABLE_CVS
{
    NONE,
    CV2,
    CV3,
    CV4,
};

inline float Constrain(float var, float min, float max)
{
    if(var < min)
    {
        var = min;
    }
    else if(var > max)
    {
        var = max;
    }
    return var;
}

class ParamControl
{
  public:
    ParamControl() {}
    ~ParamControl() {}

    void Init(const char*    name,
              const char*    abbreviated_name,
              AnalogControl* knob,
              int            led,
              bool           shifted,
              bool           has_alternate,
              Parameters*    params,
              int            param_num,
              DISPLAY_PAGE   display_page,
              MAPPABLE_CVS   mapped_cv = NONE)
    {
        display_name_     = name;
        abbreviated_name_ = abbreviated_name;
        knob_             = knob;
        led_              = led;
        shifted_          = shifted;
        has_alternate_    = has_alternate;
        params_           = params;
        param_num_        = param_num;
        param_val_        = 0.5f;
        display_page_     = display_page;
        mapped_cv_        = mapped_cv;
        knob_val_         = 0.f;
        knob_val_changed_ = false;
    }

    bool HasParamChanged() { return param_val_changed_; }
    bool HasKnobChanged() { return knob_val_changed_; }
    bool HasAlternate() { return has_alternate_; }

    bool ControlChange(float newval, bool catch_val = true)
    {
        auto delta = fabsf(newval - param_val_);
        auto ret
            = delta > KNOB_CHANGE_TOLERANCE && delta < KNOB_CATCH_TOLERANCE;

        if(ret)
        {
            param_val_         = newval;
            param_val_changed_ = true;

#ifdef SHOW_KNOB_VALUES
            snprintf(val_str, PARAM_BUFFER_SIZE, "%d", int(param_val_ * 100));
#endif
        }
        else
        {
            param_val_changed_ = false;
        };
        return ret;
    }

    const char* GetDisplayName() { return display_name_; }
    const char* GetAbbreviatedName() { return abbreviated_name_; }
    int         GetLed() const { return led_; }
    float       GetValue() { return param_val_; }
    char*       GetValueAsString() { return val_str; }
    int         GetParamNum() { return param_num_; }
    bool        IsShifted() { return shifted_; }

    DISPLAY_PAGE GetDisplayPage() { return display_page_; }

    MAPPABLE_CVS GetMappedCV() { return mapped_cv_; }
    void         SetMappedCV(MAPPABLE_CVS mapped_cv) { mapped_cv_ = mapped_cv; }

    void Process()
    {
        float val;

        auto new_knob_val = knob_->Process();
        knob_val_changed_
            = fabsf(new_knob_val - knob_val_) > KNOB_CHANGE_TOLERANCE;
        knob_val_ = new_knob_val;

        if(mapped_cv_ == NONE)
        {
            val = new_knob_val;

            if(!ControlChange(val))
            {
                return;
            }
        }
        else
        {
            //Ignore the knob setting if parameter is mapped to a CV since param_val will be set by the CV
            //TODO: Use the knob as an offset to the incoming CV value
            val = param_val_;
        }

        switch(param_num_)
        {
            case 0: params_->position = val; break;
            case 1: params_->size = val; break;
            case 2:
                params_->pitch = powf(9.798f * (val - .5f), 2.f);
                params_->pitch *= val < .5f ? -1.f : 1.f;
                break;
            case 3: params_->density = val; break;
            case 4: params_->texture = val; break;
            case 5: params_->dry_wet = val; break;
            case 6: params_->stereo_spread = val; break;
            case 7: params_->feedback = val; break;
            case 8: params_->reverb = val; break;
        }
    }

  private:
    const char*    display_name_;
    const char*    abbreviated_name_;
    AnalogControl* knob_;
    int            led_;
    bool           shifted_;
    bool           has_alternate_;
    Parameters*    params_;
    int            param_num_;
    float          param_val_;
    bool           param_val_changed_;
    float          knob_val_;
    bool           knob_val_changed_;
    char           val_str[PARAM_BUFFER_SIZE];

    DISPLAY_PAGE display_page_;
    MAPPABLE_CVS mapped_cv_;
};

GranularProcessorClouds processor;
DaisyField              field;

// Pre-allocate big blocks in main memory and CCM. No malloc here.
uint8_t block_mem[118784];
uint8_t block_ccm[65536 - 128];

float        cpu_usage                        = 0.f;
char         cpu_usage_str[PARAM_BUFFER_SIZE] = "";
bool         param_val_changed_;
ParamControl param_controls[NUM_PARAMS];
Parameters*  parameters;
DEVICE_STATE current_device_state = RUNNING;
MAPPABLE_CVS currently_mapping_cv = NONE;
bool         can_map[4]           = {true};
int          oled_led_update_gate = 0;
DISPLAY_PAGE current_display_page;
bool is_silenced, is_bypassed, is_shifted, is_frozen_by_button, is_frozen_by_cv;
float scope_buffer[AUDIO_BLOCK_SIZE] = {0.f};

uint32_t last_freeze_cv_update;

void Controls();
void UpdateLEDs();
void UpdateOLED();
void ProcessButtons();

int Mod(int n, int m)
{
    return ((n % m) + m) % m;
}

void AudioCallback(AudioHandle::InputBuffer  in,
                   AudioHandle::OutputBuffer out,
                   size_t                    size)
{
    uint32_t start = System::GetTick();

    Controls();

    FloatFrame input[size];
    FloatFrame output[size];

    for(size_t i = 0; i < size; i++)
    {
        input[i].l  = in[0][i] * .5f;
        input[i].r  = in[1][i] * .5f;
        output[i].l = output[i].r = 0.f;
    }

    processor.Process(input, output, size);

    for(size_t i = 0; i < size; i++)
    {
        out[0][i]       = output[i].l;
        out[1][i]       = output[i].r;
        scope_buffer[i] = (out[0][i] + out[1][i]) * .5f;
    }

    cpu_usage += 0.03f * (((System::GetTick() - start) / 200.f) - cpu_usage);
}

void InitParams()
{
    param_controls[0].Init("Position:",
                           "Po",
                           &field.knob[0],
                           DaisyField::LED_KNOB_1,
                           false,
                           false,
                           parameters,
                           0,
                           DISPLAY_PAGE::PARAMETERS1TO3);

    param_controls[1].Init("Size:",
                           "Sz",
                           &field.knob[1],
                           DaisyField::LED_KNOB_2,
                           false,
                           false,
                           parameters,
                           1,
                           DISPLAY_PAGE::PARAMETERS1TO3);

    param_controls[2].Init("Pitch:",
                           "Pi",
                           &field.knob[2],
                           DaisyField::LED_KNOB_3,
                           false,
                           false,
                           parameters,
                           2,
                           DISPLAY_PAGE::PARAMETERS1TO3);

    param_controls[3].Init("Density:",
                           "Dn",
                           &field.knob[3],
                           DaisyField::LED_KNOB_4,
                           false,
                           false,
                           parameters,
                           3,
                           DISPLAY_PAGE::PARAMETERS4TO6);

    param_controls[4].Init("Texture:",
                           "Tx",
                           &field.knob[4],
                           DaisyField::LED_KNOB_5,
                           false,
                           false,
                           parameters,
                           4,
                           DISPLAY_PAGE::PARAMETERS4TO6);

    param_controls[5].Init("Dry/Wet:",
                           "DW",
                           &field.knob[5],
                           DaisyField::LED_KNOB_6,
                           false,
                           false,
                           parameters,
                           5,
                           DISPLAY_PAGE::PARAMETERS4TO6);

    param_controls[6].Init("Spread:",
                           "Sp",
                           &field.knob[6],
                           DaisyField::LED_KNOB_7,
                           false,
                           false,
                           parameters,
                           6,
                           DISPLAY_PAGE::PARAMETERS7TO9);

    param_controls[7].Init("Feedback:",
                           "Fb",
                           &field.knob[7],
                           DaisyField::LED_KNOB_8,
                           false,
                           true,
                           parameters,
                           7,
                           DISPLAY_PAGE::PARAMETERS7TO9);

    param_controls[8].Init("Reverb:",
                           "Rv",
                           &field.knob[7],
                           DaisyField::LED_KNOB_8,
                           true,
                           true,
                           parameters,
                           8,
                           DISPLAY_PAGE::PARAMETERS7TO9);
}

int main(void)
{
    field.Init();
    field.SetAudioBlockSize(AUDIO_BLOCK_SIZE);
    float sample_rate = field.AudioSampleRate();

    //init the luts
    InitResources(sample_rate);

    processor.Init(sample_rate,
                   block_mem,
                   sizeof(block_mem),
                   block_ccm,
                   sizeof(block_ccm));

    parameters = processor.mutable_parameters();

    processor.set_playback_mode(PLAYBACK_MODE_GRANULAR);
    processor.set_quality(0);

    InitParams();

    //Process all params once to set inital state
    for(int i = NUM_PARAMS - 1; i >= 0; i--)
    {
        param_controls[i].Process();
    }

    current_display_page = SPLASH;
    UpdateOLED();

    //Delay for a second to show the splash screen
    System::Delay(1000);

    field.StartAdc();
    field.StartAudio(AudioCallback);

    while(1)
    {
        processor.Prepare();

        //Since we dont need to update the UI on every execution of the loop only update every nth iteration
        oled_led_update_gate
            = Mod(oled_led_update_gate + 1, OLED_LED_UPDATE_DELAY);
        if(oled_led_update_gate == OLED_LED_UPDATE_DELAY - 1)
        {
            UpdateLEDs();
            UpdateOLED();
        }

        //And we probably dont need to call Prepare so often so we can sleep a bit
        System::Delay(MAIN_LOOP_DELAY);
    }
}

void RenderParams(DISPLAY_PAGE page)
{
    int offset = 0;
    for(int i = 0; i < NUM_PARAMS; i++)
    {
        if(param_controls[i].GetDisplayPage() == page)
        {
            field.display.SetCursor(LEFT_BORDER_WIDTH,
                                    (offset + 1) * ROW_HEIGHT);
            field.display.WriteString(
                param_controls[i].GetDisplayName(), DEFAULT_FONT, true);

            field.display.DrawRect(PARAM_NAME_COL_WIDTH,
                                   (offset + 1) * ROW_HEIGHT,
                                   PARAM_NAME_COL_WIDTH + VALUE_BAR_WIDTH,
                                   ((offset + 1) * ROW_HEIGHT)
                                       + VALUE_BAR_HEIGHT,
                                   true);

            field.display.DrawRect(
                PARAM_NAME_COL_WIDTH,
                (offset + 1) * ROW_HEIGHT,
                PARAM_NAME_COL_WIDTH
                    + int(param_controls[i].GetValue() * VALUE_BAR_WIDTH),
                ((offset + 1) * ROW_HEIGHT) + VALUE_BAR_HEIGHT,
                true,
                true);

#ifdef SHOW_KNOB_VALUES
            // Show the knob vaules overlayed on the value bars
            field.display.SetCursor(PARAM_NAME_COL_WIDTH + 20,
                                    ((offset + 1) * ROW_HEIGHT) + 2);
            field.display.WriteString(
                param_controls[i].GetValueAsString(), Font_6x8, true);
#endif
            ++offset;
        }
    }
}

inline void RenderSplash()
{
    field.display.SetCursor(17, 20);
    field.display.WriteString("NIMBUS", Font_16x26, true);
}

inline void RenderCpuUsage()
{
    snprintf(cpu_usage_str,
             cpu_usage,
             "%02d%%",
             int(0.0001f * cpu_usage * (field.seed.AudioSampleRate())
                 / field.seed.AudioBlockSize()));
    field.display.SetCursor(80, 0);
    field.display.WriteString("CPU:", SMALL_FONT, true);
    field.display.SetCursor(105, 0);
    field.display.WriteString(cpu_usage_str, SMALL_FONT, true);
}

inline void RenderCVMappings(MAPPABLE_CVS cv)
{
    if(cv == NONE)
    {
        return;
    }

    int x_offset = 0;
    int y_offset = 1;
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_HEIGHT);
    for(int i = 0; i < NUM_PARAMS; i++)
    {
        if(param_controls[i].GetMappedCV() == cv)
        {
            field.display.SetCursor(
                LEFT_BORDER_WIDTH + (x_offset * MAPPED_PARAM_CONTAINER_WIDTH)
                    + 3,
                (y_offset * ROW_HEIGHT) + 3);
            field.display.WriteString(
                param_controls[i].GetAbbreviatedName(), SMALL_FONT, true);
            field.display.DrawRect(
                LEFT_BORDER_WIDTH + (x_offset * MAPPED_PARAM_CONTAINER_WIDTH),
                (y_offset * ROW_HEIGHT),
                LEFT_BORDER_WIDTH + (x_offset * MAPPED_PARAM_CONTAINER_WIDTH)
                    + 16,
                (y_offset * ROW_HEIGHT) + 12,
                true);
            x_offset++;
            if(x_offset * MAPPED_PARAM_CONTAINER_WIDTH > DISPLAY_WIDTH / 2)
            {
                x_offset = 0;
                y_offset++;
            }
        }
    }
}

inline void RenderButtons1()
{
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_HEIGHT);
    field.display.WriteString("Quality:", SMALL_FONT, true);
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_2 * SKINNY_ROW_HEIGHT);
    field.display.DrawRect(0,
                           (ROW_2 * SKINNY_ROW_HEIGHT) - VALUE_BAR_MARGIN,
                           DISPLAY_WIDTH,
                           (ROW_2 * SKINNY_ROW_HEIGHT) + VALUE_BAR_HEIGHT,
                           true,
                           true);

    auto currentPlaybackQuality = processor.quality();

    switch(currentPlaybackQuality)
    {
        case PLAYBACK_QUAL_16B_ST:
            field.display.WriteString("16 bit Stereo", SMALL_FONT, false);
            break;
        case PLAYBACK_QUAL_16B_MO:
            field.display.WriteString("16 bit Mono", SMALL_FONT, false);
            break;
        case PLAYBACK_QUAL_8B_ST:
            field.display.WriteString("8bit u-law Stereo", SMALL_FONT, false);
            break;
        case PLAYBACK_QUAL_8B_MO:
            field.display.WriteString("8bit u-law Mono", SMALL_FONT, false);
            break;
        default: break;
    }

    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_3 * SKINNY_ROW_HEIGHT);
    field.display.WriteString("Playback Mode:", SMALL_FONT, true);
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_4 * SKINNY_ROW_HEIGHT);
    field.display.DrawRect(0,
                           (ROW_4 * SKINNY_ROW_HEIGHT) - VALUE_BAR_MARGIN,
                           DISPLAY_WIDTH,
                           (ROW_4 * SKINNY_ROW_HEIGHT) + VALUE_BAR_HEIGHT,
                           true,
                           true);

    auto currentPlaybackMode = processor.playback_mode();
    switch(currentPlaybackMode)
    {
        case PLAYBACK_MODE_GRANULAR:
            field.display.WriteString("Granular", SMALL_FONT, false);
            break;
        case PLAYBACK_MODE_STRETCH:
            field.display.WriteString("Shift and Stretch", SMALL_FONT, false);
            break;
        case PLAYBACK_MODE_LOOPING_DELAY:
            field.display.WriteString("Looping Delay", SMALL_FONT, false);
            break;
        case PLAYBACK_MODE_SPECTRAL:
            field.display.WriteString("Spectral Processor", SMALL_FONT, false);
            break;
        default: break;
    }
}

inline void RenderButtons2()
{
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_HEIGHT);

    field.display.WriteString("Shift:", SMALL_FONT, true);
    field.display.DrawRect(DISPLAY_WIDTH - CHECKBOX_SIZE - CHECKBOX_MARGIN,
                           (ROW_1 * SKINNY_ROW_HEIGHT) - 1,
                           DISPLAY_WIDTH - CHECKBOX_MARGIN,
                           (ROW_1 * SKINNY_ROW_HEIGHT) + CHECKBOX_SIZE,
                           true,
                           is_shifted);

    field.display.SetCursor(LEFT_BORDER_WIDTH, 2 * SKINNY_ROW_HEIGHT);

    field.display.WriteString("Freeze:", SMALL_FONT, true);
    field.display.DrawRect(DISPLAY_WIDTH - CHECKBOX_SIZE - CHECKBOX_MARGIN,
                           (ROW_2 * SKINNY_ROW_HEIGHT) - 1,
                           DISPLAY_WIDTH - CHECKBOX_MARGIN,
                           (ROW_2 * SKINNY_ROW_HEIGHT) + CHECKBOX_SIZE,
                           true,
                           processor.frozen());

    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_3 * SKINNY_ROW_HEIGHT);

    field.display.WriteString("Silent:", SMALL_FONT, true);
    field.display.DrawRect(DISPLAY_WIDTH - CHECKBOX_SIZE - CHECKBOX_MARGIN,
                           (ROW_3 * SKINNY_ROW_HEIGHT) - 1,
                           DISPLAY_WIDTH - CHECKBOX_MARGIN,
                           (ROW_3 * SKINNY_ROW_HEIGHT) + CHECKBOX_SIZE,
                           true,
                           is_silenced);

    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_4 * SKINNY_ROW_HEIGHT);
    field.display.WriteString("Bypass:", SMALL_FONT, true);

    field.display.DrawRect(DISPLAY_WIDTH - CHECKBOX_SIZE - CHECKBOX_MARGIN,
                           (ROW_4 * SKINNY_ROW_HEIGHT) - 1,
                           DISPLAY_WIDTH - CHECKBOX_MARGIN,
                           (ROW_4 * SKINNY_ROW_HEIGHT) + CHECKBOX_SIZE,
                           true,
                           is_bypassed);
}

inline void RenderScope()
{
    int prev_x = 0;
    int prev_y = (DISPLAY_HEIGHT + HEADER_HEIGHT) / 2;
    for(size_t i = 0; i < AUDIO_BLOCK_SIZE; i++)
    {
        int y = std::min(std::max((DISPLAY_HEIGHT + HEADER_HEIGHT) / 2
                                      - int(scope_buffer[i] * MAX_SCOPE_HEIGHT),
                                  0),
                         DISPLAY_HEIGHT);
        int x = i * DISPLAY_WIDTH / AUDIO_BLOCK_SIZE;
        if(i != 0)
        {
            field.display.DrawLine(prev_x, prev_y, x, y, true);
        }
        prev_x = x;
        prev_y = y;
    }
}

void UpdateOLED()
{
    field.display.Fill(false);

    if(current_display_page != SPLASH)
    {
        field.display.DrawLine(
            0, HEADER_HEIGHT, DISPLAY_WIDTH, HEADER_HEIGHT, true);
        field.display.SetCursor(0, 0);
    }

    switch(current_display_page)
    {
        case SPLASH: RenderSplash(); break;

        case PARAMETERS1TO3:
            field.display.WriteString("Paramters Page 1", DEFAULT_FONT, true);
            RenderParams(PARAMETERS1TO3);
            break;

        case PARAMETERS4TO6:
            field.display.WriteString("Paramters Page 2", DEFAULT_FONT, true);
            RenderParams(PARAMETERS4TO6);
            break;

        case PARAMETERS7TO9:
            field.display.WriteString("Paramters Page 3", DEFAULT_FONT, true);
            RenderParams(PARAMETERS7TO9);
            break;

        case BUTTONS1:
            field.display.WriteString("Buttons Page 1", DEFAULT_FONT, true);
            RenderButtons1();
            break;

        case BUTTONS2:
            field.display.WriteString("Buttons Page 2", DEFAULT_FONT, true);
            RenderButtons2();
            break;

        case CV_MAPPINGS2:
            field.display.WriteString("CV2 Mappings", DEFAULT_FONT, true);
            RenderCVMappings(CV2);
            break;

        case CV_MAPPINGS3:
            field.display.WriteString("CV3 Mappings", DEFAULT_FONT, true);
            RenderCVMappings(CV3);
            break;

        case CV_MAPPINGS4:
            field.display.WriteString("CV4 Mappings", DEFAULT_FONT, true);
            RenderCVMappings(CV4);
            break;

        case SCOPE:
            field.display.WriteString("Scope", DEFAULT_FONT, true);
            RenderCpuUsage();
            RenderScope();
            break;

        default: break;
    }

    field.display.Update();
}

void UpdateLEDs()
{
    for(int i = 0; i < 8; i++)
    {
        if(param_controls[i].GetMappedCV() == NONE)
        {
            field.led_driver.SetLed(param_controls[i].GetLed(),
                                    param_controls[i].GetValue());
        }
        else
        {
            //LED is dark if the parameter is mapped to CV
            field.led_driver.SetLed(param_controls[i].GetLed(), 0.f);
        }
    }

    auto currentPlaybackMode = processor.playback_mode();

    field.led_driver.SetLed(
        LED_PLAYBACK_MODE_GRANULAR,
        currentPlaybackMode == PLAYBACK_MODE_GRANULAR ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_MODE_STRETCH,
        currentPlaybackMode == PLAYBACK_MODE_STRETCH ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_MODE_LOOPING_DELAY,
        currentPlaybackMode == PLAYBACK_MODE_LOOPING_DELAY ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_MODE_SPECTRAL,
        currentPlaybackMode == PLAYBACK_MODE_SPECTRAL ? 1.f : 0.5f);

    auto currentPlaybackQuality = processor.quality();

    field.led_driver.SetLed(
        LED_PLAYBACK_QUAL_16B_ST,
        currentPlaybackQuality == PLAYBACK_QUAL_16B_ST ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_QUAL_16B_MO,
        currentPlaybackQuality == PLAYBACK_QUAL_16B_MO ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_QUAL_8B_ST,
        currentPlaybackQuality == PLAYBACK_QUAL_8B_ST ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_QUAL_8B_MO,
        currentPlaybackQuality == PLAYBACK_QUAL_8B_MO ? 1.f : 0.5f);

    field.led_driver.SetLed(LED_MAP_CV_2,
                            current_device_state == CV_MAPPING
                                    && currently_mapping_cv == CV2
                                ? 1.f
                                : 0.f);
    field.led_driver.SetLed(LED_MAP_CV_3,
                            current_device_state == CV_MAPPING
                                    && currently_mapping_cv == CV3
                                ? 1.f
                                : 0.f);
    field.led_driver.SetLed(LED_MAP_CV_4,
                            current_device_state == CV_MAPPING
                                    && currently_mapping_cv == CV4
                                ? 1.f
                                : 0.f);

    field.led_driver.SetLed(LED_FREEZE, processor.frozen() ? 1.f : 0.5f);
    field.led_driver.SetLed(LED_SILENCE, is_silenced ? 1.f : 0.5f);
    field.led_driver.SetLed(LED_BYPASS, is_bypassed ? 1.f : 0.5f);
    field.led_driver.SetLed(LED_SHIFT, is_shifted ? 1.f : 0.5f);

    field.led_driver.SwapBuffersAndTransmit();
}

void ProcessParam(ParamControl& pc, bool auto_page_change)
{
    pc.Process();

    switch(current_device_state)
    {
        case RUNNING:
            if(pc.HasKnobChanged())
            {
                //If control is mapped to CV then don't change the page when its value is changed
                if(pc.GetMappedCV() == NONE && auto_page_change)
                {
                    current_display_page = pc.GetDisplayPage();
                }
            }
            break;

        case CV_MAPPING:
            if(can_map[currently_mapping_cv] == true)
            {
                //The knob has changed from the last iteration so we are mapping
                if(pc.HasKnobChanged())
                {
                    //If control has not been mapped yet or mapped to another CV then map it to the new CV
                    if(pc.GetMappedCV() != currently_mapping_cv)
                    {
                        pc.SetMappedCV(currently_mapping_cv);
                        //Only allow one mapping action per key press
                        can_map[currently_mapping_cv] = false;
                    }
                    else
                    {
                        //If the control is already mapped and the knob has been moved then unmap it
                        pc.SetMappedCV(NONE);
                        //Only allow one mapping action per key press
                        can_map[currently_mapping_cv] = false;
                    }
                }
            }
            break;

        default: break;
    }
}

void ProcessParams(bool auto_page_change = true)
{
    for(int i = NUM_PARAMS - 1; i >= 0; i--)
    {
        if((is_shifted
            && (param_controls[i].IsShifted()
                || !param_controls[i].HasAlternate()))
           || (!is_shifted && !param_controls[i].IsShifted()))
        {
            ProcessParam(param_controls[i], auto_page_change);
        }
    }
}

void ProcessButtons()
{
    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_QUAL_16B_ST))
    {
        processor.set_quality(PLAYBACK_QUAL_16B_ST);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_QUAL_16B_MO))
    {
        processor.set_quality(PLAYBACK_QUAL_16B_MO);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_QUAL_8B_ST))
    {
        processor.set_quality(PLAYBACK_QUAL_8B_ST);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_QUAL_8B_MO))
    {
        processor.set_quality(PLAYBACK_QUAL_8B_MO);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_MODE_GRANULAR))
    {
        processor.set_playback_mode(PLAYBACK_MODE_GRANULAR);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_MODE_STRETCH))
    {
        processor.set_playback_mode(PLAYBACK_MODE_STRETCH);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_MODE_LOOPING_DELAY))
    {
        processor.set_playback_mode(PLAYBACK_MODE_LOOPING_DELAY);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_MODE_SPECTRAL))
    {
        processor.set_playback_mode(PLAYBACK_MODE_SPECTRAL);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_FREEZE))
    {
        is_frozen_by_button = !is_frozen_by_button;
        processor.ToggleFreeze();
        //current_display_page = BUTTONS2;
    }

    if(field.KeyboardRisingEdge(BUTTON_SILENCE))
    {
        is_silenced = !is_silenced;
        processor.set_silence(is_silenced);
        //current_display_page = BUTTONS2;
    }

    if(field.KeyboardRisingEdge(BUTTON_BYPASS))
    {
        is_bypassed = !is_bypassed;
        processor.set_bypass(is_bypassed);
        //current_display_page = BUTTONS2;
    }

    if(field.KeyboardRisingEdge(BUTTON_SHIFT))
    {
        is_shifted = !is_shifted;
        //current_display_page = BUTTONS2;
    }

    if(field.sw[0].RisingEdge())
    {
        current_display_page
            = DISPLAY_PAGE(Mod(current_display_page - 1, NUM_PAGES));
    }

    if(field.sw[1].RisingEdge())
    {
        current_display_page
            = DISPLAY_PAGE(Mod(current_display_page + 1, NUM_PAGES));
    }

    if(field.KeyboardRisingEdge(BUTTON_MAP_CV_2))
    {
        current_device_state = CV_MAPPING;
        currently_mapping_cv = CV2;
        can_map[CV2]         = true;
        current_display_page = CV_MAPPINGS2;
    }

    if(field.KeyboardFallingEdge(BUTTON_MAP_CV_2))
    {
        current_device_state = RUNNING;
        currently_mapping_cv = NONE;
    }

    if(field.KeyboardRisingEdge(BUTTON_MAP_CV_3))
    {
        current_device_state = CV_MAPPING;
        currently_mapping_cv = CV3;
        can_map[CV3]         = true;
        current_display_page = CV_MAPPINGS3;
    }

    if(field.KeyboardFallingEdge(BUTTON_MAP_CV_3))
    {
        current_device_state = RUNNING;
        currently_mapping_cv = NONE;
    }

    if(field.KeyboardRisingEdge(BUTTON_MAP_CV_4))
    {
        current_device_state = CV_MAPPING;
        currently_mapping_cv = CV4;
        can_map[CV4]         = true;
        current_display_page = CV_MAPPINGS4;
    }

    if(field.KeyboardFallingEdge(BUTTON_MAP_CV_4))
    {
        current_device_state = RUNNING;
        currently_mapping_cv = NONE;
    }

    processor.set_silence(is_silenced);
    processor.set_bypass(is_bypassed);
}

void ProcessGatesTriggersCv()
{
    //Using CV1 in as a gate to freeze and unfreeze the processor
    //0.7f should map to 3.5 volts for HIGH state
    //Debounced
    if(!is_frozen_by_button)
    {
#ifdef TOGGLE_FREEZE_ON_HIGH
        //Has the debounce interval elapsed? If not then we just disregard this value
        if(System::GetNow()
           > last_freeze_cv_update + CV_FREEZE_UPDATE_DEBOUNCE_INTERVAL)
        {
            auto  cv1               = field.GetCv(field.CV_1);
            float new_freeze_cv_val = cv1->Process();
            if(new_freeze_cv_val > CV_FREEZE_TRIGGER_THRESHOLD)
            {
                //Toggle freeze for the processor if the gate is held high
                is_frozen_by_cv    = !is_frozen_by_cv;
                parameters->freeze = is_frozen_by_cv;
            }
            last_freeze_cv_update = System::GetNow();
        }
#else
        auto  cv1               = field.GetCv(field.CV_1);
        float new_freeze_cv_val = cv1->Process();
        //Only freeze the processor while the gate is held high
        parameters->freeze = is_frozen_by_cv
            = (new_freeze_cv_val > GATE_TRIGGER_THRESHOLD);
#endif
    }
    else
    {
        is_frozen_by_cv = false;
    }

    parameters->trigger = field.gate_in.Trig();
    parameters->gate    = field.gate_in.State();

    //Send CV to all the mapped parameters
    for(int i = 0; i < NUM_PARAMS; i++)
    {
        if(param_controls[i].GetMappedCV() != NONE)
        {
            float cv_value = field.GetCvValue(param_controls[i].GetMappedCV());
            float clamped_cv_value = Constrain(cv_value, 0.0f, 1.0f);
            param_controls[i].ControlChange(clamped_cv_value);
            param_controls[i].Process();
        }
    }
}

void Controls()
{
    field.ProcessAllControls();
    ProcessParams();
    ProcessGatesTriggersCv();
    ProcessButtons();
}

__________________________________________

#include "daisy_field.h"
#include "daisysp.h"
#include "granular_processor.h"

//#define SHOW_KNOB_VALUES
#define TOGGLE_FREEZE_ON_HIGH //as opposed to Freezing only while the gate is open

#define AUDIO_BLOCK_SIZE 32 //DO NOT CHANGE!

#define MAIN_LOOP_DELAY 6                      //milliseconds
#define OLED_LED_UPDATE_DELAY 5                //in Frames not milliseconds
#define CV_FREEZE_UPDATE_DEBOUNCE_INTERVAL 500 //milliseconds
#define CV_FREEZE_TRIGGER_THRESHOLD 0.65f //TODO: make these last 2 parameters

#define NUM_KNOBS 8
#define NUM_PARAMS 9
#define NUM_PAGES 10

#define KNOB_CHANGE_TOLERANCE .001f
#define KNOB_CATCH_TOLERANCE .075f

#define DISPLAY_WIDTH 128
#define DISPLAY_HEIGHT 60
#define HEADER_HEIGHT 10
#define LEFT_BORDER_WIDTH 2
#define PARAM_NAME_COL_WIDTH 70
#define ROW_HEIGHT 14
#define SKINNY_ROW_HEIGHT 13
#define DEFAULT_FONT Font_7x10
#define SMALL_FONT Font_6x8
#define CHECKBOX_SIZE 8
#define CHECKBOX_MARGIN 3
#define VALUE_BAR_HEIGHT 10
#define VALUE_BAR_WIDTH 55
#define VALUE_BAR_MARGIN 3
#define MAPPED_PARAM_CONTAINER_WIDTH 18
#define MAX_SCOPE_HEIGHT 60

#define PARAM_BUFFER_SIZE 8

using namespace daisysp;
using namespace daisy;

enum DEVICE_STATE
{
    RUNNING,
    CV_MAPPING,
};

enum DISPLAY_PAGE
{
    SPLASH,
    PARAMETERS1TO3,
    PARAMETERS4TO6,
    PARAMETERS7TO9,
    BUTTONS1,
    BUTTONS2,
    CV_MAPPINGS2,
    CV_MAPPINGS3,
    CV_MAPPINGS4,
    SCOPE,
};

enum DISPLAY_ROW
{
    ROW_1 = 1,
    ROW_2,
    ROW_3,
    ROW_4,
};

enum
{
    PLAYBACK_QUAL_16B_ST = 0,
    PLAYBACK_QUAL_16B_MO = 1,
    PLAYBACK_QUAL_8B_ST  = 2,
    PLAYBACK_QUAL_8B_MO  = 3,
};

enum
{
    LED_PLAYBACK_QUAL_16B_ST        = 0,
    LED_PLAYBACK_QUAL_16B_MO        = 1,
    LED_PLAYBACK_QUAL_8B_ST         = 2,
    LED_PLAYBACK_QUAL_8B_MO         = 3,
    LED_MAP_CV_2                    = 4,
    LED_MAP_CV_3                    = 5,
    LED_MAP_CV_4                    = 6,
    LED_SHIFT                       = 7,
    LED_BYPASS                      = 8,
    LED_SILENCE                     = 9,
    LED_FREEZE                      = 10,
    LED_PLAYBACK_MODE_SPECTRAL      = 12,
    LED_PLAYBACK_MODE_LOOPING_DELAY = 13,
    LED_PLAYBACK_MODE_STRETCH       = 14,
    LED_PLAYBACK_MODE_GRANULAR      = 15,
};

enum
{
    BUTTON_PLAYBACK_MODE_GRANULAR      = 0,
    BUTTON_PLAYBACK_MODE_STRETCH       = 1,
    BUTTON_PLAYBACK_MODE_LOOPING_DELAY = 2,
    BUTTON_PLAYBACK_MODE_SPECTRAL      = 3,
    BUTTON_FREEZE                      = 5,
    BUTTON_SILENCE                     = 6,
    BUTTON_BYPASS                      = 7,
    BUTTON_PLAYBACK_QUAL_16B_ST        = 8,
    BUTTON_PLAYBACK_QUAL_16B_MO        = 9,
    BUTTON_PLAYBACK_QUAL_8B_ST         = 10,
    BUTTON_PLAYBACK_QUAL_8B_MO         = 11,
    BUTTON_MAP_CV_2                    = 12,
    BUTTON_MAP_CV_3                    = 13,
    BUTTON_MAP_CV_4                    = 14,
    BUTTON_SHIFT                       = 15,
};

enum MAPPABLE_CVS
{
    NONE,
    CV2,
    CV3,
    CV4,
};

inline float Constrain(float var, float min, float max)
{
    if(var < min)
    {
        var = min;
    }
    else if(var > max)
    {
        var = max;
    }
    return var;
}

class ParamControl
{
  public:
    ParamControl() {}
    ~ParamControl() {}

    void Init(const char*    name,
              const char*    abbreviated_name,
              AnalogControl* knob,
              int            led,
              bool           shifted,
              bool           has_alternate,
              Parameters*    params,
              int            param_num,
              DISPLAY_PAGE   display_page,
              MAPPABLE_CVS   mapped_cv = NONE)
    {
        display_name_     = name;
        abbreviated_name_ = abbreviated_name;
        knob_             = knob;
        led_              = led;
        shifted_          = shifted;
        has_alternate_    = has_alternate;
        params_           = params;
        param_num_        = param_num;
        param_val_        = 0.5f;
        display_page_     = display_page;
        mapped_cv_        = mapped_cv;
        knob_val_         = 0.f;
        knob_val_changed_ = false;
    }

    bool HasParamChanged() { return param_val_changed_; }
    bool HasKnobChanged() { return knob_val_changed_; }
    bool HasAlternate() { return has_alternate_; }

    bool ControlChange(float newval, bool catch_val = true)
    {
        auto delta = fabsf(newval - param_val_);
        auto ret
            = delta > KNOB_CHANGE_TOLERANCE && delta < KNOB_CATCH_TOLERANCE;

        if(ret)
        {
            param_val_         = newval;
            param_val_changed_ = true;

#ifdef SHOW_KNOB_VALUES
            snprintf(val_str, PARAM_BUFFER_SIZE, "%d", int(param_val_ * 100));
#endif
        }
        else
        {
            param_val_changed_ = false;
        };
        return ret;
    }

    const char* GetDisplayName() { return display_name_; }
    const char* GetAbbreviatedName() { return abbreviated_name_; }
    int         GetLed() const { return led_; }
    float       GetValue() { return param_val_; }
    char*       GetValueAsString() { return val_str; }
    int         GetParamNum() { return param_num_; }
    bool        IsShifted() { return shifted_; }

    DISPLAY_PAGE GetDisplayPage() { return display_page_; }

    MAPPABLE_CVS GetMappedCV() { return mapped_cv_; }
    void         SetMappedCV(MAPPABLE_CVS mapped_cv) { mapped_cv_ = mapped_cv; }

    void Process()
    {
        float val;

        auto new_knob_val = knob_->Process();
        knob_val_changed_
            = fabsf(new_knob_val - knob_val_) > KNOB_CHANGE_TOLERANCE;
        knob_val_ = new_knob_val;

        if(mapped_cv_ == NONE)
        {
            val = new_knob_val;

            if(!ControlChange(val))
            {
                return;
            }
        }
        else
        {
            //Ignore the knob setting if parameter is mapped to a CV since param_val will be set by the CV
            //TODO: Use the knob as an offset to the incoming CV value
            val = param_val_;
        }

        switch(param_num_)
        {
            case 0: params_->position = val; break;
            case 1: params_->size = val; break;
            case 2:
                params_->pitch = powf(9.798f * (val - .5f), 2.f);
                params_->pitch *= val < .5f ? -1.f : 1.f;
                break;
            case 3: params_->density = val; break;
            case 4: params_->texture = val; break;
            case 5: params_->dry_wet = val; break;
            case 6: params_->stereo_spread = val; break;
            case 7: params_->feedback = val; break;
            case 8: params_->reverb = val; break;
        }
    }

  private:
    const char*    display_name_;
    const char*    abbreviated_name_;
    AnalogControl* knob_;
    int            led_;
    bool           shifted_;
    bool           has_alternate_;
    Parameters*    params_;
    int            param_num_;
    float          param_val_;
    bool           param_val_changed_;
    float          knob_val_;
    bool           knob_val_changed_;
    char           val_str[PARAM_BUFFER_SIZE];

    DISPLAY_PAGE display_page_;
    MAPPABLE_CVS mapped_cv_;
};

GranularProcessorClouds processor;
DaisyField              field;

// Pre-allocate big blocks in main memory and CCM. No malloc here.
uint8_t block_mem[118784];
uint8_t block_ccm[65536 - 128];

float        cpu_usage                        = 0.f;
char         cpu_usage_str[PARAM_BUFFER_SIZE] = "";
bool         param_val_changed_;
ParamControl param_controls[NUM_PARAMS];
Parameters*  parameters;
DEVICE_STATE current_device_state = RUNNING;
MAPPABLE_CVS currently_mapping_cv = NONE;
bool         can_map[4]           = {true};
int          oled_led_update_gate = 0;
DISPLAY_PAGE current_display_page;
bool is_silenced, is_bypassed, is_shifted, is_frozen_by_button, is_frozen_by_cv;
float scope_buffer[AUDIO_BLOCK_SIZE] = {0.f};

uint32_t last_freeze_cv_update;

void Controls();
void UpdateLEDs();
void UpdateOLED();
void ProcessButtons();

int Mod(int n, int m)
{
    return ((n % m) + m) % m;
}

void AudioCallback(AudioHandle::InputBuffer  in,
                   AudioHandle::OutputBuffer out,
                   size_t                    size)
{
    uint32_t start = System::GetTick();

    Controls();

    FloatFrame input[size];
    FloatFrame output[size];

    for(size_t i = 0; i < size; i++)
    {
        input[i].l  = in[0][i] * .5f;
        input[i].r  = in[1][i] * .5f;
        output[i].l = output[i].r = 0.f;
    }

    processor.Process(input, output, size);

    for(size_t i = 0; i < size; i++)
    {
        out[0][i]       = output[i].l;
        out[1][i]       = output[i].r;
        scope_buffer[i] = (out[0][i] + out[1][i]) * .5f;
    }

    cpu_usage += 0.03f * (((System::GetTick() - start) / 200.f) - cpu_usage);
}

void InitParams()
{
    param_controls[0].Init("Position:",
                           "Po",
                           &field.knob[0],
                           DaisyField::LED_KNOB_1,
                           false,
                           false,
                           parameters,
                           0,
                           DISPLAY_PAGE::PARAMETERS1TO3);

    param_controls[1].Init("Size:",
                           "Sz",
                           &field.knob[1],
                           DaisyField::LED_KNOB_2,
                           false,
                           false,
                           parameters,
                           1,
                           DISPLAY_PAGE::PARAMETERS1TO3);

    param_controls[2].Init("Pitch:",
                           "Pi",
                           &field.knob[2],
                           DaisyField::LED_KNOB_3,
                           false,
                           false,
                           parameters,
                           2,
                           DISPLAY_PAGE::PARAMETERS1TO3);

    param_controls[3].Init("Density:",
                           "Dn",
                           &field.knob[3],
                           DaisyField::LED_KNOB_4,
                           false,
                           false,
                           parameters,
                           3,
                           DISPLAY_PAGE::PARAMETERS4TO6);

    param_controls[4].Init("Texture:",
                           "Tx",
                           &field.knob[4],
                           DaisyField::LED_KNOB_5,
                           false,
                           false,
                           parameters,
                           4,
                           DISPLAY_PAGE::PARAMETERS4TO6);

    param_controls[5].Init("Dry/Wet:",
                           "DW",
                           &field.knob[5],
                           DaisyField::LED_KNOB_6,
                           false,
                           false,
                           parameters,
                           5,
                           DISPLAY_PAGE::PARAMETERS4TO6);

    param_controls[6].Init("Spread:",
                           "Sp",
                           &field.knob[6],
                           DaisyField::LED_KNOB_7,
                           false,
                           false,
                           parameters,
                           6,
                           DISPLAY_PAGE::PARAMETERS7TO9);

    param_controls[7].Init("Feedback:",
                           "Fb",
                           &field.knob[7],
                           DaisyField::LED_KNOB_8,
                           false,
                           true,
                           parameters,
                           7,
                           DISPLAY_PAGE::PARAMETERS7TO9);

    param_controls[8].Init("Reverb:",
                           "Rv",
                           &field.knob[7],
                           DaisyField::LED_KNOB_8,
                           true,
                           true,
                           parameters,
                           8,
                           DISPLAY_PAGE::PARAMETERS7TO9);
}

int main(void)
{
    field.Init();
    field.SetAudioBlockSize(AUDIO_BLOCK_SIZE);
    float sample_rate = field.AudioSampleRate();

    //init the luts
    InitResources(sample_rate);

    processor.Init(sample_rate,
                   block_mem,
                   sizeof(block_mem),
                   block_ccm,
                   sizeof(block_ccm));

    parameters = processor.mutable_parameters();

    processor.set_playback_mode(PLAYBACK_MODE_GRANULAR);
    processor.set_quality(0);

    InitParams();

    //Process all params once to set inital state
    for(int i = NUM_PARAMS - 1; i >= 0; i--)
    {
        param_controls[i].Process();
    }

    current_display_page = SPLASH;
    UpdateOLED();

    //Delay for a second to show the splash screen
    System::Delay(1000);

    field.StartAdc();
    field.StartAudio(AudioCallback);

    while(1)
    {
        processor.Prepare();

        //Since we dont need to update the UI on every execution of the loop only update every nth iteration
        oled_led_update_gate
            = Mod(oled_led_update_gate + 1, OLED_LED_UPDATE_DELAY);
        if(oled_led_update_gate == OLED_LED_UPDATE_DELAY - 1)
        {
            UpdateLEDs();
            UpdateOLED();
        }

        //And we probably dont need to call Prepare so often so we can sleep a bit
        System::Delay(MAIN_LOOP_DELAY);
    }
}

void RenderParams(DISPLAY_PAGE page)
{
    int offset = 0;
    for(int i = 0; i < NUM_PARAMS; i++)
    {
        if(param_controls[i].GetDisplayPage() == page)
        {
            field.display.SetCursor(LEFT_BORDER_WIDTH,
                                    (offset + 1) * ROW_HEIGHT);
            field.display.WriteString(
                param_controls[i].GetDisplayName(), DEFAULT_FONT, true);

            field.display.DrawRect(PARAM_NAME_COL_WIDTH,
                                   (offset + 1) * ROW_HEIGHT,
                                   PARAM_NAME_COL_WIDTH + VALUE_BAR_WIDTH,
                                   ((offset + 1) * ROW_HEIGHT)
                                       + VALUE_BAR_HEIGHT,
                                   true);

            field.display.DrawRect(
                PARAM_NAME_COL_WIDTH,
                (offset + 1) * ROW_HEIGHT,
                PARAM_NAME_COL_WIDTH
                    + int(param_controls[i].GetValue() * VALUE_BAR_WIDTH),
                ((offset + 1) * ROW_HEIGHT) + VALUE_BAR_HEIGHT,
                true,
                true);

#ifdef SHOW_KNOB_VALUES
            // Show the knob vaules overlayed on the value bars
            field.display.SetCursor(PARAM_NAME_COL_WIDTH + 20,
                                    ((offset + 1) * ROW_HEIGHT) + 2);
            field.display.WriteString(
                param_controls[i].GetValueAsString(), Font_6x8, true);
#endif
            ++offset;
        }
    }
}

inline void RenderSplash()
{
    field.display.SetCursor(17, 20);
    field.display.WriteString("NIMBUS", Font_16x26, true);
}

inline void RenderCpuUsage()
{
    snprintf(cpu_usage_str,
             cpu_usage,
             "%02d%%",
             int(0.0001f * cpu_usage * (field.seed.AudioSampleRate())
                 / field.seed.AudioBlockSize()));
    field.display.SetCursor(80, 0);
    field.display.WriteString("CPU:", SMALL_FONT, true);
    field.display.SetCursor(105, 0);
    field.display.WriteString(cpu_usage_str, SMALL_FONT, true);
}

inline void RenderCVMappings(MAPPABLE_CVS cv)
{
    if(cv == NONE)
    {
        return;
    }

    int x_offset = 0;
    int y_offset = 1;
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_HEIGHT);
    for(int i = 0; i < NUM_PARAMS; i++)
    {
        if(param_controls[i].GetMappedCV() == cv)
        {
            field.display.SetCursor(
                LEFT_BORDER_WIDTH + (x_offset * MAPPED_PARAM_CONTAINER_WIDTH)
                    + 3,
                (y_offset * ROW_HEIGHT) + 3);
            field.display.WriteString(
                param_controls[i].GetAbbreviatedName(), SMALL_FONT, true);
            field.display.DrawRect(
                LEFT_BORDER_WIDTH + (x_offset * MAPPED_PARAM_CONTAINER_WIDTH),
                (y_offset * ROW_HEIGHT),
                LEFT_BORDER_WIDTH + (x_offset * MAPPED_PARAM_CONTAINER_WIDTH)
                    + 16,
                (y_offset * ROW_HEIGHT) + 12,
                true);
            x_offset++;
            if(x_offset * MAPPED_PARAM_CONTAINER_WIDTH > DISPLAY_WIDTH / 2)
            {
                x_offset = 0;
                y_offset++;
            }
        }
    }
}

inline void RenderButtons1()
{
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_HEIGHT);
    field.display.WriteString("Quality:", SMALL_FONT, true);
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_2 * SKINNY_ROW_HEIGHT);
    field.display.DrawRect(0,
                           (ROW_2 * SKINNY_ROW_HEIGHT) - VALUE_BAR_MARGIN,
                           DISPLAY_WIDTH,
                           (ROW_2 * SKINNY_ROW_HEIGHT) + VALUE_BAR_HEIGHT,
                           true,
                           true);

    auto currentPlaybackQuality = processor.quality();

    switch(currentPlaybackQuality)
    {
        case PLAYBACK_QUAL_16B_ST:
            field.display.WriteString("16 bit Stereo", SMALL_FONT, false);
            break;
        case PLAYBACK_QUAL_16B_MO:
            field.display.WriteString("16 bit Mono", SMALL_FONT, false);
            break;
        case PLAYBACK_QUAL_8B_ST:
            field.display.WriteString("8bit u-law Stereo", SMALL_FONT, false);
            break;
        case PLAYBACK_QUAL_8B_MO:
            field.display.WriteString("8bit u-law Mono", SMALL_FONT, false);
            break;
        default: break;
    }

    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_3 * SKINNY_ROW_HEIGHT);
    field.display.WriteString("Playback Mode:", SMALL_FONT, true);
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_4 * SKINNY_ROW_HEIGHT);
    field.display.DrawRect(0,
                           (ROW_4 * SKINNY_ROW_HEIGHT) - VALUE_BAR_MARGIN,
                           DISPLAY_WIDTH,
                           (ROW_4 * SKINNY_ROW_HEIGHT) + VALUE_BAR_HEIGHT,
                           true,
                           true);

    auto currentPlaybackMode = processor.playback_mode();
    switch(currentPlaybackMode)
    {
        case PLAYBACK_MODE_GRANULAR:
            field.display.WriteString("Granular", SMALL_FONT, false);
            break;
        case PLAYBACK_MODE_STRETCH:
            field.display.WriteString("Shift and Stretch", SMALL_FONT, false);
            break;
        case PLAYBACK_MODE_LOOPING_DELAY:
            field.display.WriteString("Looping Delay", SMALL_FONT, false);
            break;
        case PLAYBACK_MODE_SPECTRAL:
            field.display.WriteString("Spectral Processor", SMALL_FONT, false);
            break;
        default: break;
    }
}

inline void RenderButtons2()
{
    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_HEIGHT);

    field.display.WriteString("Shift:", SMALL_FONT, true);
    field.display.DrawRect(DISPLAY_WIDTH - CHECKBOX_SIZE - CHECKBOX_MARGIN,
                           (ROW_1 * SKINNY_ROW_HEIGHT) - 1,
                           DISPLAY_WIDTH - CHECKBOX_MARGIN,
                           (ROW_1 * SKINNY_ROW_HEIGHT) + CHECKBOX_SIZE,
                           true,
                           is_shifted);

    field.display.SetCursor(LEFT_BORDER_WIDTH, 2 * SKINNY_ROW_HEIGHT);

    field.display.WriteString("Freeze:", SMALL_FONT, true);
    field.display.DrawRect(DISPLAY_WIDTH - CHECKBOX_SIZE - CHECKBOX_MARGIN,
                           (ROW_2 * SKINNY_ROW_HEIGHT) - 1,
                           DISPLAY_WIDTH - CHECKBOX_MARGIN,
                           (ROW_2 * SKINNY_ROW_HEIGHT) + CHECKBOX_SIZE,
                           true,
                           processor.frozen());

    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_3 * SKINNY_ROW_HEIGHT);

    field.display.WriteString("Silent:", SMALL_FONT, true);
    field.display.DrawRect(DISPLAY_WIDTH - CHECKBOX_SIZE - CHECKBOX_MARGIN,
                           (ROW_3 * SKINNY_ROW_HEIGHT) - 1,
                           DISPLAY_WIDTH - CHECKBOX_MARGIN,
                           (ROW_3 * SKINNY_ROW_HEIGHT) + CHECKBOX_SIZE,
                           true,
                           is_silenced);

    field.display.SetCursor(LEFT_BORDER_WIDTH, ROW_4 * SKINNY_ROW_HEIGHT);
    field.display.WriteString("Bypass:", SMALL_FONT, true);

    field.display.DrawRect(DISPLAY_WIDTH - CHECKBOX_SIZE - CHECKBOX_MARGIN,
                           (ROW_4 * SKINNY_ROW_HEIGHT) - 1,
                           DISPLAY_WIDTH - CHECKBOX_MARGIN,
                           (ROW_4 * SKINNY_ROW_HEIGHT) + CHECKBOX_SIZE,
                           true,
                           is_bypassed);
}

inline void RenderScope()
{
    int prev_x = 0;
    int prev_y = (DISPLAY_HEIGHT + HEADER_HEIGHT) / 2;
    for(size_t i = 0; i < AUDIO_BLOCK_SIZE; i++)
    {
        int y = std::min(std::max((DISPLAY_HEIGHT + HEADER_HEIGHT) / 2
                                      - int(scope_buffer[i] * MAX_SCOPE_HEIGHT),
                                  0),
                         DISPLAY_HEIGHT);
        int x = i * DISPLAY_WIDTH / AUDIO_BLOCK_SIZE;
        if(i != 0)
        {
            field.display.DrawLine(prev_x, prev_y, x, y, true);
        }
        prev_x = x;
        prev_y = y;
    }
}

void UpdateOLED()
{
    field.display.Fill(false);

    if(current_display_page != SPLASH)
    {
        field.display.DrawLine(
            0, HEADER_HEIGHT, DISPLAY_WIDTH, HEADER_HEIGHT, true);
        field.display.SetCursor(0, 0);
    }

    switch(current_display_page)
    {
        case SPLASH: RenderSplash(); break;

        case PARAMETERS1TO3:
            field.display.WriteString("Paramters Page 1", DEFAULT_FONT, true);
            RenderParams(PARAMETERS1TO3);
            break;

        case PARAMETERS4TO6:
            field.display.WriteString("Paramters Page 2", DEFAULT_FONT, true);
            RenderParams(PARAMETERS4TO6);
            break;

        case PARAMETERS7TO9:
            field.display.WriteString("Paramters Page 3", DEFAULT_FONT, true);
            RenderParams(PARAMETERS7TO9);
            break;

        case BUTTONS1:
            field.display.WriteString("Buttons Page 1", DEFAULT_FONT, true);
            RenderButtons1();
            break;

        case BUTTONS2:
            field.display.WriteString("Buttons Page 2", DEFAULT_FONT, true);
            RenderButtons2();
            break;

        case CV_MAPPINGS2:
            field.display.WriteString("CV2 Mappings", DEFAULT_FONT, true);
            RenderCVMappings(CV2);
            break;

        case CV_MAPPINGS3:
            field.display.WriteString("CV3 Mappings", DEFAULT_FONT, true);
            RenderCVMappings(CV3);
            break;

        case CV_MAPPINGS4:
            field.display.WriteString("CV4 Mappings", DEFAULT_FONT, true);
            RenderCVMappings(CV4);
            break;

        case SCOPE:
            field.display.WriteString("Scope", DEFAULT_FONT, true);
            RenderCpuUsage();
            RenderScope();
            break;

        default: break;
    }

    field.display.Update();
}

void UpdateLEDs()
{
    for(int i = 0; i < 8; i++)
    {
        if(param_controls[i].GetMappedCV() == NONE)
        {
            field.led_driver.SetLed(param_controls[i].GetLed(),
                                    param_controls[i].GetValue());
        }
        else
        {
            //LED is dark if the parameter is mapped to CV
            field.led_driver.SetLed(param_controls[i].GetLed(), 0.f);
        }
    }

    auto currentPlaybackMode = processor.playback_mode();

    field.led_driver.SetLed(
        LED_PLAYBACK_MODE_GRANULAR,
        currentPlaybackMode == PLAYBACK_MODE_GRANULAR ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_MODE_STRETCH,
        currentPlaybackMode == PLAYBACK_MODE_STRETCH ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_MODE_LOOPING_DELAY,
        currentPlaybackMode == PLAYBACK_MODE_LOOPING_DELAY ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_MODE_SPECTRAL,
        currentPlaybackMode == PLAYBACK_MODE_SPECTRAL ? 1.f : 0.5f);

    auto currentPlaybackQuality = processor.quality();

    field.led_driver.SetLed(
        LED_PLAYBACK_QUAL_16B_ST,
        currentPlaybackQuality == PLAYBACK_QUAL_16B_ST ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_QUAL_16B_MO,
        currentPlaybackQuality == PLAYBACK_QUAL_16B_MO ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_QUAL_8B_ST,
        currentPlaybackQuality == PLAYBACK_QUAL_8B_ST ? 1.f : 0.5f);
    field.led_driver.SetLed(
        LED_PLAYBACK_QUAL_8B_MO,
        currentPlaybackQuality == PLAYBACK_QUAL_8B_MO ? 1.f : 0.5f);

    field.led_driver.SetLed(LED_MAP_CV_2,
                            current_device_state == CV_MAPPING
                                    && currently_mapping_cv == CV2
                                ? 1.f
                                : 0.f);
    field.led_driver.SetLed(LED_MAP_CV_3,
                            current_device_state == CV_MAPPING
                                    && currently_mapping_cv == CV3
                                ? 1.f
                                : 0.f);
    field.led_driver.SetLed(LED_MAP_CV_4,
                            current_device_state == CV_MAPPING
                                    && currently_mapping_cv == CV4
                                ? 1.f
                                : 0.f);

    field.led_driver.SetLed(LED_FREEZE, processor.frozen() ? 1.f : 0.5f);
    field.led_driver.SetLed(LED_SILENCE, is_silenced ? 1.f : 0.5f);
    field.led_driver.SetLed(LED_BYPASS, is_bypassed ? 1.f : 0.5f);
    field.led_driver.SetLed(LED_SHIFT, is_shifted ? 1.f : 0.5f);

    field.led_driver.SwapBuffersAndTransmit();
}

void ProcessParam(ParamControl& pc, bool auto_page_change)
{
    pc.Process();

    switch(current_device_state)
    {
        case RUNNING:
            if(pc.HasKnobChanged())
            {
                //If control is mapped to CV then don't change the page when its value is changed
                if(pc.GetMappedCV() == NONE && auto_page_change)
                {
                    current_display_page = pc.GetDisplayPage();
                }
            }
            break;

        case CV_MAPPING:
            if(can_map[currently_mapping_cv] == true)
            {
                //The knob has changed from the last iteration so we are mapping
                if(pc.HasKnobChanged())
                {
                    //If control has not been mapped yet or mapped to another CV then map it to the new CV
                    if(pc.GetMappedCV() != currently_mapping_cv)
                    {
                        pc.SetMappedCV(currently_mapping_cv);
                        //Only allow one mapping action per key press
                        can_map[currently_mapping_cv] = false;
                    }
                    else
                    {
                        //If the control is already mapped and the knob has been moved then unmap it
                        pc.SetMappedCV(NONE);
                        //Only allow one mapping action per key press
                        can_map[currently_mapping_cv] = false;
                    }
                }
            }
            break;

        default: break;
    }
}

void ProcessParams(bool auto_page_change = true)
{
    for(int i = NUM_PARAMS - 1; i >= 0; i--)
    {
        if((is_shifted
            && (param_controls[i].IsShifted()
                || !param_controls[i].HasAlternate()))
           || (!is_shifted && !param_controls[i].IsShifted()))
        {
            ProcessParam(param_controls[i], auto_page_change);
        }
    }
}

void ProcessButtons()
{
    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_QUAL_16B_ST))
    {
        processor.set_quality(PLAYBACK_QUAL_16B_ST);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_QUAL_16B_MO))
    {
        processor.set_quality(PLAYBACK_QUAL_16B_MO);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_QUAL_8B_ST))
    {
        processor.set_quality(PLAYBACK_QUAL_8B_ST);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_QUAL_8B_MO))
    {
        processor.set_quality(PLAYBACK_QUAL_8B_MO);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_MODE_GRANULAR))
    {
        processor.set_playback_mode(PLAYBACK_MODE_GRANULAR);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_MODE_STRETCH))
    {
        processor.set_playback_mode(PLAYBACK_MODE_STRETCH);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_MODE_LOOPING_DELAY))
    {
        processor.set_playback_mode(PLAYBACK_MODE_LOOPING_DELAY);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_PLAYBACK_MODE_SPECTRAL))
    {
        processor.set_playback_mode(PLAYBACK_MODE_SPECTRAL);
        current_display_page = BUTTONS1;
    }

    if(field.KeyboardRisingEdge(BUTTON_FREEZE))
    {
        is_frozen_by_button = !is_frozen_by_button;
        processor.ToggleFreeze();
        //current_display_page = BUTTONS2;
    }

    if(field.KeyboardRisingEdge(BUTTON_SILENCE))
    {
        is_silenced = !is_silenced;
        processor.set_silence(is_silenced);
        //current_display_page = BUTTONS2;
    }

    if(field.KeyboardRisingEdge(BUTTON_BYPASS))
    {
        is_bypassed = !is_bypassed;
        processor.set_bypass(is_bypassed);
        //current_display_page = BUTTONS2;
    }

    if(field.KeyboardRisingEdge(BUTTON_SHIFT))
    {
        is_shifted = !is_shifted;
        //current_display_page = BUTTONS2;
    }

    if(field.sw[0].RisingEdge())
    {
        current_display_page
            = DISPLAY_PAGE(Mod(current_display_page - 1, NUM_PAGES));
    }

    if(field.sw[1].RisingEdge())
    {
        current_display_page
            = DISPLAY_PAGE(Mod(current_display_page + 1, NUM_PAGES));
    }

    if(field.KeyboardRisingEdge(BUTTON_MAP_CV_2))
    {
        current_device_state = CV_MAPPING;
        currently_mapping_cv = CV2;
        can_map[CV2]         = true;
        current_display_page = CV_MAPPINGS2;
    }

    if(field.KeyboardFallingEdge(BUTTON_MAP_CV_2))
    {
        current_device_state = RUNNING;
        currently_mapping_cv = NONE;
    }

    if(field.KeyboardRisingEdge(BUTTON_MAP_CV_3))
    {
        current_device_state = CV_MAPPING;
        currently_mapping_cv = CV3;
        can_map[CV3]         = true;
        current_display_page = CV_MAPPINGS3;
    }

    if(field.KeyboardFallingEdge(BUTTON_MAP_CV_3))
    {
        current_device_state = RUNNING;
        currently_mapping_cv = NONE;
    }

    if(field.KeyboardRisingEdge(BUTTON_MAP_CV_4))
    {
        current_device_state = CV_MAPPING;
        currently_mapping_cv = CV4;
        can_map[CV4]         = true;
        current_display_page = CV_MAPPINGS4;
    }

    if(field.KeyboardFallingEdge(BUTTON_MAP_CV_4))
    {
        current_device_state = RUNNING;
        currently_mapping_cv = NONE;
    }

    processor.set_silence(is_silenced);
    processor.set_bypass(is_bypassed);
}

void ProcessGatesTriggersCv()
{
    //Using CV1 in as a gate to freeze and unfreeze the processor
    //0.7f should map to 3.5 volts for HIGH state
    //Debounced
    if(!is_frozen_by_button)
    {
#ifdef TOGGLE_FREEZE_ON_HIGH
        //Has the debounce interval elapsed? If not then we just disregard this value
        if(System::GetNow()
           > last_freeze_cv_update + CV_FREEZE_UPDATE_DEBOUNCE_INTERVAL)
        {
            auto  cv1               = field.GetCv(field.CV_1);
            float new_freeze_cv_val = cv1->Process();
            if(new_freeze_cv_val > CV_FREEZE_TRIGGER_THRESHOLD)
            {
                //Toggle freeze for the processor if the gate is held high
                is_frozen_by_cv    = !is_frozen_by_cv;
                parameters->freeze = is_frozen_by_cv;
            }
            last_freeze_cv_update = System::GetNow();
        }
#else
        auto  cv1               = field.GetCv(field.CV_1);
        float new_freeze_cv_val = cv1->Process();
        //Only freeze the processor while the gate is held high
        parameters->freeze = is_frozen_by_cv
            = (new_freeze_cv_val > GATE_TRIGGER_THRESHOLD);
#endif
    }
    else
    {
        is_frozen_by_cv = false;
    }

    parameters->trigger = field.gate_in.Trig();
    parameters->gate    = field.gate_in.State();

    //Send CV to all the mapped parameters
    for(int i = 0; i < NUM_PARAMS; i++)
    {
        if(param_controls[i].GetMappedCV() != NONE)
        {
            float cv_value = field.GetCvValue(param_controls[i].GetMappedCV());
            float clamped_cv_value = Constrain(cv_value, 0.0f, 1.0f);
            param_controls[i].ControlChange(clamped_cv_value);
            param_controls[i].Process();
        }
    }
}

void Controls()
{
    field.ProcessAllControls();
    ProcessParams();
    ProcessGatesTriggersCv();
    ProcessButtons();
}

__________________________________________

# Chorus

## Author

Ben Sergentanis

## Description

Chorus module demonstration for Daisy field

[Source Code](https://github.com/electro-smith/DaisyExamples/tree/master/field/chorus)

## Controls

| Control | Description | Comment |
| --- | --- | --- |
| Knob 1 | Spread | The amount of stereo spread. |
| Knob 2 | Lfo Freq | |
| Knob 3 | Lfo Depth | |
| Knob 4 - 5 | Delay Time | Change left and right delay times. |
| Knob 6 | Feedback amount | |
| Switch 1 | Effect On | Oled indicates effect on |

__________________________________________

#include "daisy_field.h"
#include "daisysp.h"

using namespace daisy;
using namespace daisysp;

DaisyField hw;
Chorus     ch;

bool effectOn;

float deltarget0, del0;
float deltarget1, del1;
float lfotarget, lfo;

void Controls()
{
    hw.ProcessAllControls();

    //knobs
    float k = hw.knob[0].Process() * .5f;
    ch.SetPan(.5f - k, .5f + k);

    k = hw.knob[1].Process();
    ch.SetLfoFreq(k * k * 20.f);

    lfotarget  = hw.knob[2].Process();
    deltarget0 = hw.knob[3].Process();
    deltarget1 = hw.knob[4].Process();

    ch.SetFeedback(hw.knob[5].Process());

    //activate / deactivate effect
    effectOn ^= hw.sw[0].RisingEdge();
}

void AudioCallback(AudioHandle::InputBuffer  in,
                   AudioHandle::OutputBuffer out,
                   size_t                    size)
{
    Controls();

    for(size_t i = 0; i < size; i++)
    {
        fonepole(del0, deltarget0, .0001f); //smooth these at audio rate
        fonepole(del1, deltarget1, .0001f);
        fonepole(lfo, lfotarget, .0001f);

        ch.SetLfoDepth(lfo);
        ch.SetDelay(del0, del1);

        ch.Process(in[0][i]);
        out[0][i] = effectOn ? ch.GetLeft() : in[0][i];
        out[1][i] = effectOn ? ch.GetRight() : in[0][i];
    }
}

int main(void)
{
    hw.Init();
    float sample_rate = hw.AudioSampleRate();

    ch.Init(sample_rate);

    deltarget0 = del0 = 0.f;
    deltarget1 = del1 = 0.f;
    lfotarget = lfo = 0.f;

    effectOn = true;

    hw.StartAdc();
    hw.StartAudio(AudioCallback);
    while(1)
    {
        hw.display.Fill(false);

        char cstr[15];
        sprintf(cstr, "Effect: %s", effectOn ? "On" : "Off");
        hw.display.SetCursor(0, 0);
        hw.display.WriteString(cstr, Font_7x10, true);

        hw.display.Update();
    }
}

__________________________________________

# Flanger Example

## Author

Ben Sergentanis

## Description

Flanger efffect for Daisy Field.

[Source Code](https://github.com/electro-smith/DaisyExamples/tree/master/field/flanger)

## Controls

| Control | Description |
| --- | --- |
| SW 1 |  Effect On/Off |
| Knob 1 | Delay Time |
| Knob 2 | Feedback Amount |
| Knob 3 | Lfo Frequency |
| Knob 4 | Lfo Depth |

__________________________________________

#include "daisy_field.h"
#include "daisysp.h"

using namespace daisy;
using namespace daisysp;

Flanger    flanger;
DaisyField hw;

bool effectOn = true;

float del, deltarget;
float lfo, lfotarget;

float knob_vals[4];
void  AudioCallback(AudioHandle::InputBuffer  in,
                    AudioHandle::OutputBuffer out,
                    size_t                    size)
{
    hw.ProcessAllControls();

    for(int i = 0; i < 4; i++)
    {
        knob_vals[i] = hw.knob[i].Process();
    }

    deltarget = hw.knob[0].Process();
    flanger.SetFeedback(hw.knob[1].Process());
    float val = hw.knob[2].Process();
    flanger.SetLfoFreq(val * val * 10.f);
    lfotarget = hw.knob[3].Process();

    effectOn ^= hw.sw[0].RisingEdge();

    for(size_t i = 0; i < size; i++)
    {
        fonepole(del, deltarget, .0001f); //smooth at audio rate
        flanger.SetDelay(del);

        fonepole(lfo, lfotarget, .0001f); //smooth at audio rate
        flanger.SetLfoDepth(lfo);

        out[0][i] = out[1][i] = effectOn ? flanger.Process(in[0][i]) : in[0][i];
    }
}

int main(void)
{
    hw.Init();
    float sample_rate = hw.AudioSampleRate();

    flanger.Init(sample_rate);

    del = deltarget = 0.f;
    lfo = lfotarget = 0.f;

    hw.StartAdc();
    hw.StartAudio(AudioCallback);
    while(1)
    {
        hw.display.Fill(false);

        char cstr[11];
        sprintf(cstr, "Effect %s", effectOn ? "On" : "Off");
        hw.display.SetCursor(0, 0);
        hw.display.WriteString(cstr, Font_7x10, true);

        hw.display.Update();

        size_t knob_leds[] = {
            DaisyField::LED_KNOB_1,
            DaisyField::LED_KNOB_2,
            DaisyField::LED_KNOB_3,
            DaisyField::LED_KNOB_4,
        };

        for(size_t i = 0; i < 4; i++)
        {
            hw.led_driver.SetLed(knob_leds[i], knob_vals[i]);
        }

        hw.led_driver.SwapBuffersAndTransmit();
    }
}

__________________________________________

# ModalVoice Field Example

## Author

Ben Sergentanis

## Description

Demonstrates Modal Voice with 12 tone keyboard and controls over parameters. 
Based on KeyboardTest.

## Controls

| Control | Description |
| --- | --- |
| SW 1 2 |  Octave up/down |
| Keyboard buttons | Chromatic keyboard |
| Knob 1 | Brightness |
| Knob 2 | Structure |
| Knob 3 | Damping |
| Knob 4 | Accent |

__________________________________________

#include "daisy_field.h"
#include "daisysp.h"

using namespace daisysp;
using namespace daisy;

#define NUM_CONTROLS 4

DaisyField hw;
ModalVoice modal;

uint8_t buttons[16];
// Use bottom row to set major scale
// Top row chromatic notes, and the inbetween notes are just the octave.
float scale[16]   = {0.f,
                   2.f,
                   4.f,
                   5.f,
                   7.f,
                   9.f,
                   11.f,
                   12.f,
                   0.f,
                   1.f,
                   3.f,
                   0.f,
                   6.f,
                   8.f,
                   10.f,
                   0.0f};
float active_note = scale[0];

int8_t octaves = 0;

// Use two side buttons to change octaves.
float kvals[NUM_CONTROLS];

void AudioCallback(AudioHandle::InputBuffer  in,
                   AudioHandle::OutputBuffer out,
                   size_t                    size)
{
    hw.ProcessAnalogControls();
    hw.ProcessDigitalControls();

    octaves += hw.sw[0].RisingEdge() ? -1 : 0;
    octaves += hw.sw[1].RisingEdge() ? 1 : 0;
    octaves = DSY_MIN(DSY_MAX(0, octaves), 4);

    for(int i = 0; i < NUM_CONTROLS; i++)
    {
        kvals[i] = hw.GetKnobValue(i);
    }

    modal.SetBrightness(kvals[0]);
    modal.SetStructure(kvals[1]);
    modal.SetDamping(kvals[2]);
    modal.SetAccent(kvals[3]);

    for(size_t i = 0; i < 16; i++)
    {
        if(hw.KeyboardRisingEdge(i) && i != 8 && i != 11 && i != 15)
        {
            modal.Trig();
            float m = (12.0f * octaves) + 24.0f + scale[i];
            modal.SetFreq(mtof(m));
        }
    }

    for(size_t i = 0; i < size; i++)
    {
        out[0][i] = out[1][i] = modal.Process();
    }
}

void UpdateLeds(float *knob_vals)
{
    // knob_vals is exactly 8 members
    size_t knob_leds[] = {
        DaisyField::LED_KNOB_1,
        DaisyField::LED_KNOB_2,
        DaisyField::LED_KNOB_3,
        DaisyField::LED_KNOB_4,
        DaisyField::LED_KNOB_5,
        DaisyField::LED_KNOB_6,
        DaisyField::LED_KNOB_7,
        DaisyField::LED_KNOB_8,
    };
    size_t keyboard_leds[] = {
        DaisyField::LED_KEY_A1,
        DaisyField::LED_KEY_A2,
        DaisyField::LED_KEY_A3,
        DaisyField::LED_KEY_A4,
        DaisyField::LED_KEY_A5,
        DaisyField::LED_KEY_A6,
        DaisyField::LED_KEY_A7,
        DaisyField::LED_KEY_A8,
        DaisyField::LED_KEY_B2,
        DaisyField::LED_KEY_B3,
        DaisyField::LED_KEY_B5,
        DaisyField::LED_KEY_B6,
        DaisyField::LED_KEY_B7,
    };
    for(size_t i = 0; i < 8; i++)
    {
        float val = i < NUM_CONTROLS ? knob_vals[i] : 0.f;
        hw.led_driver.SetLed(knob_leds[i], val);
    }
    for(size_t i = 0; i < 13; i++)
    {
        hw.led_driver.SetLed(keyboard_leds[i], 1.f);
    }
    hw.led_driver.SwapBuffersAndTransmit();
}

int main(void)
{
    float sr;
    hw.Init();
    sr = hw.AudioSampleRate();

    // Initialize controls.
    octaves = 2;

    modal.Init(sr);

    hw.StartAdc();
    hw.StartAudio(AudioCallback);

    for(;;)
    {
        UpdateLeds(kvals);
        System::Delay(6);
    }
}

__________________________________________


# Field Phaser Example

## Author

Ben Sergentanis

## Description

Phaser for Daisy Field

[Source Code](https://github.com/electro-smith/DaisyExamples/tree/master/field/phaser)
  
## Controls
| Control | Description | Comment |
| --- | --- | --- |
| Switch 1 | Effect On | |
| Knob 1 |  Dry/Wet | |
| Knob 2 | Number of Poles | 1 - 8 |
| Knob 3 |  Lfo Frequency | |
| Knob 4 |  Lfo Depth | |
| Knob 5 |  Phaser Frequency | |
| Knob 6 |  Feedback Amount | |

__________________________________________

#include "daisy_field.h"
#include "daisysp.h"

using namespace daisy;
using namespace daisysp;

DaisyField hw;
Phaser     phaser;

bool  effectOn;
float wet;

float freqtarget, freq;
float lfotarget, lfo;
int   numstages;

void Controls()
{
    hw.ProcessAllControls();

    wet = hw.knob[0].Process();

    numstages = 1 + (hw.knob[1].Process() * 8);
    phaser.SetPoles(numstages);

    float k = hw.knob[2].Process();
    phaser.SetLfoFreq(k * k * 20.f);
    lfo  = hw.knob[3].Process();
    k    = hw.knob[4].Process();
    freq = k * k * 7000; //0 - 10 kHz, square curve
    phaser.SetFeedback(hw.knob[5].Process());

    //footswitch
    effectOn ^= hw.sw[0].RisingEdge();
}

void AudioCallback(AudioHandle::InputBuffer  in,
                   AudioHandle::OutputBuffer out,
                   size_t                    size)
{
    Controls();

    for(size_t i = 0; i < size; i++)
    {
        fonepole(freq, freqtarget, .0001f); //smooth at audio rate
        phaser.SetFreq(freq);

        fonepole(lfo, lfotarget, .0001f); //smooth at audio rate
        phaser.SetLfoDepth(lfo);

        out[0][i] = in[0][i];
        out[1][i] = in[0][i];

        if(effectOn)
        {
            out[0][i] = out[1][i]
                = phaser.Process(in[0][i]) * wet + in[0][i] * (1.f - wet);
        }
    }
}

int main(void)
{
    hw.Init();
    float sample_rate = hw.AudioSampleRate();

    phaser.Init(sample_rate);

    effectOn   = true;
    wet        = .9f;
    freqtarget = freq = 0.f;
    lfotarget = lfo = 0.f;
    numstages       = 4;

    hw.StartAdc();
    hw.StartAudio(AudioCallback);
    while(1)
    {
        hw.display.Fill(false);

        char cstr[15];
        sprintf(cstr, "Effect: %s", effectOn ? "On" : "Off");
        hw.display.SetCursor(0, 0);
        hw.display.WriteString(cstr, Font_7x10, true);

        sprintf(cstr, "Dry/Wet: %d", (int)(wet * 101));
        hw.display.SetCursor(0, 20);
        hw.display.WriteString(cstr, Font_7x10, true);

        sprintf(cstr, "Num Poles: %d", numstages);
        hw.display.SetCursor(0, 10);
        hw.display.WriteString(cstr, Font_7x10, true);

        hw.display.Update();
    }
}

__________________________________________


# Sampler

## Author

Alex Virgona

## Description

Sampler example for Daisy field.
8 sample slots with a dedicated record and play button per slot.

[Source Code](https://github.com/electro-smith/DaisyExamples/tree/master/field/sampler)

## Controls

| Control | Description | Comment |
| --- | --- | --- |
| Keyboard Top Row | Record sample 1 - 8 | Only records while held |
| Keyboard Bottom Row | Play sample 1 - 8 | Only plays while held |

## Display

The display shows the numbers 1 - 8  on the top row for each sample slot.
On the second row a `+` will be shown under each number when that slot is recording.
On the third row a `>` will be shown under each number when that slot is playing.

__________________________________________


#pragma once
#ifndef SAMPLEBUFFER_H
#define SAMPLEBUFFER_H

#include <stddef.h>

/** Sample buffer with record and playback.

By: Alex Virgona
*/
template <size_t kBufferSize>
class SampleBuffer
{
  public:
    SampleBuffer() {}
    ~SampleBuffer() {}

    void Init()
    {
        Clear();
        recording_ = false;
        write_ptr_ = 0;
        playing_   = false;
        read_ptr_  = 0;
    }

    void Clear()
    {
        for(size_t i = 0; i < kBufferSize; i++)
        {
            buffer_[i] = 0.f;
        }
    }

    void Record(bool start = true)
    {
        if(start)
        {
            Clear();
        }
        recording_ = start;
        write_ptr_ = 0;
    }

    void Play(bool start = true)
    {
        playing_  = start;
        read_ptr_ = 0;
    }

    float Process(const float sample)
    {
        Write(sample);
        return Read();
    }

    void Write(const float sample)
    {
        if(recording_)
        {
            buffer_[write_ptr_] = sample;
            write_ptr_++;
            if(write_ptr_ >= kBufferSize)
            {
                recording_ = false;
                write_ptr_ = 0;
            }
        }
    }

    float Read()
    {
        if(playing_)
        {
            float out = buffer_[read_ptr_];
            read_ptr_++;
            if(read_ptr_ >= kBufferSize)
            {
                playing_  = false;
                read_ptr_ = 0;
            }
            return out;
        }
        else
        {
            return 0.f;
        }
    }

    bool IsPlaying() const { return playing_; }
    bool IsRecording() const { return recording_; }

  private:
    size_t write_ptr_;
    size_t read_ptr_;
    bool   playing_;
    bool   recording_;
    float  buffer_[kBufferSize];
};

#endif // SAMPLEBUFFER_H

__________________________________________

#include "daisy_field.h"
#include "daisysp.h"
#include "samplebuffer.h"
#include <array>

using namespace daisy;
using namespace daisysp;

#define NUM_BUFFERS 8
#define KEYBOARD_WIDTH 8
// 5 second sample buffers at 48kHz
#define BUFFER_SIZE (48000 * 5)

DaisyField hw;

// DSY_SDRAM_BSS macro puts objects on the SDRAM
// SDRAM has 64MB which is much more than the MCU memory
std::array<SampleBuffer<BUFFER_SIZE>, NUM_BUFFERS> DSY_SDRAM_BSS buffers;

void Controls()
{
    hw.ProcessAllControls();
    for(size_t i = 0; i < buffers.size(); i++)
    {
        // Handle lower key row as play buttons
        if(hw.KeyboardRisingEdge(i))
        {
            buffers[i].Play();
        }
        else if(hw.KeyboardFallingEdge(i))
        {
            // Remove this line to keep playing after key is released
            buffers[i].Play(false);
        }
        // Handle upper key row as record buttons
        if(hw.KeyboardRisingEdge(i + KEYBOARD_WIDTH))
        {
            buffers[i].Record();
        }
        else if(hw.KeyboardFallingEdge(i + KEYBOARD_WIDTH))
        {
            // Remove this line to keep recording after key is released
            buffers[i].Record(false);
        }
    }
}

void AudioCallback(AudioHandle::InputBuffer  in,
                   AudioHandle::OutputBuffer out,
                   size_t                    size)
{
    Controls();
    for(size_t i = 0; i < size; i++)
    {
        // Zero samples prior to summing
        out[0][i] = 0.f;
        out[1][i] = 0.f;
        for(auto &buffer : buffers)
        {
            // Record in mono
            float sample = buffer.Process((0.5 * in[0][i] + 0.5 * in[1][i]));
            // Sum all playback channels
            out[0][i] += sample;
            out[1][i] += sample;
        }
        // Feed stereo input through to output
        out[0][i] += in[0][i];
        out[1][i] += in[1][i];
    }
}

void InitSamplers()
{
    for(auto &buffer : buffers)
    {
        buffer.Init();
    }
}

void UpdateDisplay()
{
    static const char number_row[17] = " 1 2 3 4 5 6 7 8";
    static const char blank_row[17]  = "                ";
    char              recording_row[17];
    char              playing_row[17];
    strcpy(recording_row, blank_row);
    strcpy(playing_row, blank_row);

    for(size_t b = 0; b < buffers.size(); b++)
    {
        recording_row[2 * b + 1] = buffers[b].IsRecording() ? '+' : ' ';
        playing_row[2 * b + 1]   = buffers[b].IsPlaying() ? '>' : ' ';
    }
    hw.display.Fill(false);
    hw.display.SetCursor(0, 0);
    hw.display.WriteString(number_row, Font_7x10, true);
    hw.display.SetCursor(0, 10);
    hw.display.WriteString(recording_row, Font_7x10, true);
    hw.display.SetCursor(0, 20);
    hw.display.WriteString(playing_row, Font_7x10, true);
    hw.display.Update();
}

int main(void)
{
    hw.Init(); // Don't try to use SDRAM until after this Init function
    InitSamplers();
    hw.StartAdc();
    hw.StartAudio(AudioCallback);
    while(true)
    {
        UpdateDisplay();
        System::Delay(10);
    }
}


__________________________________________

# StringVoice Keyboard

## Author

Ben Sergentanis

## Description

Monophonic string keyboard with controls over string parameters.

## Controls

| Control | Description |
| --- | --- |
| SW 1 2 |  Octave up/down |
| Keyboard buttons | Chromatic keyboard |
| Knob 1 | Brightness | 
| Knob 2 | Structure | 
| Knob 3 | Damping | 
| Knob 4 | Accent | 

__________________________________________


#include "daisy_field.h"
#include "daisysp.h"

using namespace daisysp;
using namespace daisy;

#define NUM_CONTROLS 4

DaisyField  hw;
StringVoice str;

uint8_t buttons[16];
// Use bottom row to set major scale
// Top row chromatic notes, and the inbetween notes are just the octave.
float scale[16]   = {0.f,
                   2.f,
                   4.f,
                   5.f,
                   7.f,
                   9.f,
                   11.f,
                   12.f,
                   0.f,
                   1.f,
                   3.f,
                   0.f,
                   6.f,
                   8.f,
                   10.f,
                   0.0f};
float active_note = scale[0];

int8_t octaves = 0;

// Use two side buttons to change octaves.
float kvals[NUM_CONTROLS];

void AudioCallback(AudioHandle::InputBuffer  in,
                   AudioHandle::OutputBuffer out,
                   size_t                    size)
{
    hw.ProcessAnalogControls();
    hw.ProcessDigitalControls();

    octaves += hw.sw[0].RisingEdge() ? -1 : 0;
    octaves += hw.sw[1].RisingEdge() ? 1 : 0;
    octaves = DSY_MIN(DSY_MAX(0, octaves), 4);

    for(int i = 0; i < NUM_CONTROLS; i++)
    {
        kvals[i] = hw.GetKnobValue(i);
    }

    str.SetBrightness(kvals[0]);
    str.SetStructure(kvals[1]);
    str.SetDamping(kvals[2]);
    str.SetAccent(kvals[3]);

    for(size_t i = 0; i < 16; i++)
    {
        if(hw.KeyboardRisingEdge(i) && i != 8 && i != 11 && i != 15)
        {
            str.Trig();
            float m = (12.0f * octaves) + 24.0f + scale[i];
            str.SetFreq(mtof(m));
        }
    }

    for(size_t i = 0; i < size; i++)
    {
        out[0][i] = out[1][i] = str.Process();
    }
}

void UpdateLeds(float *knob_vals)
{
    // knob_vals is exactly 8 members
    size_t knob_leds[] = {
        DaisyField::LED_KNOB_1,
        DaisyField::LED_KNOB_2,
        DaisyField::LED_KNOB_3,
        DaisyField::LED_KNOB_4,
        DaisyField::LED_KNOB_5,
        DaisyField::LED_KNOB_6,
        DaisyField::LED_KNOB_7,
        DaisyField::LED_KNOB_8,
    };
    size_t keyboard_leds[] = {
        DaisyField::LED_KEY_A1,
        DaisyField::LED_KEY_A2,
        DaisyField::LED_KEY_A3,
        DaisyField::LED_KEY_A4,
        DaisyField::LED_KEY_A5,
        DaisyField::LED_KEY_A6,
        DaisyField::LED_KEY_A7,
        DaisyField::LED_KEY_A8,
        DaisyField::LED_KEY_B2,
        DaisyField::LED_KEY_B3,
        DaisyField::LED_KEY_B5,
        DaisyField::LED_KEY_B6,
        DaisyField::LED_KEY_B7,
    };
    for(size_t i = 0; i < 8; i++)
    {
        float val = i < NUM_CONTROLS ? knob_vals[i] : 0.f;
        hw.led_driver.SetLed(knob_leds[i], val);
    }
    for(size_t i = 0; i < 13; i++)
    {
        hw.led_driver.SetLed(keyboard_leds[i], 1.f);
    }
    hw.led_driver.SwapBuffersAndTransmit();
}

int main(void)
{
    float sr;
    hw.Init();
    sr = hw.AudioSampleRate();

    // Initialize controls.
    octaves = 2;

    str.Init(sr);

    hw.StartAdc();
    hw.StartAudio(AudioCallback);

    for(;;)
    {
        UpdateLeds(kvals);
        System::Delay(6);
    }
}

