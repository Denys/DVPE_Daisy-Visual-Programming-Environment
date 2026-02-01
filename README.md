# DVPE - Daisy Visual Programming Environment

A visual block-based programming environment for creating audio patches on [Electro-Smith Daisy](https://www.electro-smith.com/) hardware. Design your synth with drag-and-drop blocks and export production-ready C++ code.

![DVPE Screenshot](dvpe_CLD/public/daisy-logo.svg)

---

## Features

- **50+ Audio Blocks**: Oscillators, filters, effects, drums, physical modeling, math utilities
- **Visual Patch Design**: Drag, connect, and configure blocks on an interactive canvas
- **Real-time Code Generation**: Export DaisySP-compatible C++ code
- **Daisy Field Target**: Optimized for Daisy Field hardware with knob/key/CV mappings
- **🆕 Block Designer**: Create custom blocks—the core architectural element of DVPE
  - **Utility Library**: 40+ primitives (math, logic, routing, state machines)
  - **Hierarchical Blocks**: Encapsulate block groups into reusable components
  - **Hybrid Code Modules**: Embed TypeScript/C++ for optimization-critical routines

---

## Step-by-Step: Run DVPE

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- npm (comes with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/DVPE_Daisy-Visual-Programming-Environment.git
cd DVPE_Daisy-Visual-Programming-Environment
```

### 2. Install Dependencies
```bash
cd dvpe_CLD
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to **http://localhost:5173** in your browser.

---

## Example Use: Create a Simple Synth

### Step 1: Add an Oscillator
1. In the **Block Library** (left panel), expand **Sources**
2. Drag **OSCILLATOR** onto the canvas
3. In the **Inspector** (right panel), set:
   - Frequency: `440` Hz
   - Waveform: `Saw`

### Step 2: Add a Filter
1. Drag **MOOG LADDER** from **Filters** onto the canvas
2. Connect the Oscillator's **OUT** port → Filter's **IN** port
3. Set filter cutoff to `1000` Hz

### Step 3: Add an Envelope
1. Drag **ADSR** from **Modulators** onto the canvas
2. Connect ADSR's **OUT** → MoogLadder's **CUTOFF CV** port
3. Set Attack: `0.01s`, Decay: `0.2s`, Sustain: `0.5`, Release: `0.3s`

### Step 4: Connect to Output
1. Drag **AUDIO OUTPUT** from **User I/O** onto the canvas
2. Connect MoogLadder's **OUT** → Audio Output's **LEFT** and **RIGHT**

### Step 5: Add a Trigger
1. Drag **KEY** from **User I/O** onto the canvas
2. Connect KEY's **GATE** → ADSR's **GATE** input
3. Set Key to `0` (first keyboard key on Daisy Field)

### Step 6: Export C++ Code
1. Click **Export C++** button in the toolbar
2. Download `main.cpp` and `Makefile`
3. Copy files to your Daisy project folder

### Step 7: Build & Flash
```bash
# In your Daisy project folder
make clean
make
make program-dfu
```

---

## Block Categories

| Category | Blocks |
|----------|--------|
| **Sources** | Oscillator, FM2, Particle, Grainlet, LFO, WhiteNoise, Dust |
| **Filters** | MoogLadder, SVF, OnePole, ATone |
| **Effects** | Delay, Reverb, Chorus, Flanger, Overdrive, Wavefolder, Compressor, Limiter, Fold, DCBlock |
| **Modulators** | ADSR, AD Env |
| **Drums** | HiHat, AnalogBassDrum, AnalogSnareDrum, SynthBassDrum, SynthSnareDrum |
| **Physical Modeling** | Drip, ModalVoice, StringVoice |
| **Math** | Add, Multiply, Subtract, Divide, Gain, Bypass |
| **Utility** | VCA, LinearVCA, Mixer, Mux, Demux, SampleDelay, CvToFreq |
| **User I/O** | AudioInput, AudioOutput, Knob, Key, Encoder, GateTriggerIn |

---

## Project Structure

```
DVPE_Daisy-Visual-Programming-Environment/
├── dvpe_CLD/                    # Main application
│   ├── src/
│   │   ├── components/          # React UI components
│   │   ├── core/blocks/         # Block definitions
│   │   ├── codegen/             # C++ code generator
│   │   └── store/               # Zustand state management
│   └── public/                  # Static assets
└── LICENSE                      # License file
```

---

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run unit tests
npm run lint     # Lint code
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.
