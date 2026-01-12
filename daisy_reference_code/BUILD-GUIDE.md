# FM-Granular Synthesizer - Build and Flash Guide

## Prerequisites

1. **ARM GCC Toolchain**
   ```bash
   # Check if installed
   arm-none-eabi-gcc --version
   ```
   
   If not installed, download from: https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm

2. **libDaisy and DaisySP**
   ```bash
   cd ~
   git clone https://github.com/electro-smith/libDaisy.git
   git clone https://github.com/electro-smith/DaisySP.git
   
   cd libDaisy
   make
   
   cd ../DaisySP
   make
   ```

3. **DFU-Util** (for flashing)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install dfu-util
   
   # macOS
   brew install dfu-util
   
   # Windows
   # Download from https://dfu-util.sourceforge.net/
   ```

## Build Instructions

### 1. Set up project structure

```bash
# From DVPE root directory
mkdir -p ~/daisy_projects/fm_granular
cp fm_granular_main.cpp ~/daisy_projects/fm_granular/
cp Makefile ~/daisy_projects/fm_granular/
cd ~/daisy_projects/fm_granular
```

### 2. Update Makefile paths

Edit the Makefile to point to your libDaisy and DaisySP locations:

```makefile
LIBDAISY_DIR = ~/libDaisy
DAISYSP_DIR = ~/DaisySP
```

### 3. Build firmware

```bash
cd ~/daisy_projects/fm_granular
make clean
make
```

**Expected output:**
```
arm-none-eabi-gcc compiling...
...
text    data     bss     dec     hex filename
48392    928   51200   100520   18878 build/fm_granular.elf
```

### 4. Flash to Daisy Field

**Method A: DFU (USB)**
```bash
# Put Daisy Field in bootloader mode:
# 1. Hold BOOT button
# 2. Press RESET button
# 3. Release both buttons

make program-dfu
```

**Method B: Serial (if using ST-Link)**
```bash
make program-serial
```

## Usage

### Basic Operation

1. **Power on** - Daisy Field boots with firmware
2. **Press KEY 1 or KEY 2** - Trigger voices
3. **Turn knobs** to shape the sound:
   - KNOB 1: FM Ratio (harmonic content)
   - KNOB 2: FM Index (modulation depth)
   - KNOB 3: Granular Formant (spectral peak)
   - KNOB 4: Grain Shape (texture)
   - KNOB 5: Filter Cutoff
   - KNOB 6: Filter Resonance
   - KNOB 7: Overdrive Drive
   - KNOB 8: Reverb Mix

### Sound Presets

**Bell Tones**
- KNOB 1: 12 o'clock (ratio ~4)
- KNOB 2: 9 o'clock (index ~2)
- KNOB 5: 3 o'clock (cutoff ~8kHz)
- KNOB 8: 2 o'clock (reverb ~0.6)

**Metallic Textures**
- KNOB 1: 2 o'clock (ratio ~6)
- KNOB 2: Maximum (index 10)
- KNOB 4: 3 o'clock (shape ~0.9)
- KNOB 7: 2 o'clock (drive ~0.5)

**Evolving Pads**
- KNOB 3: 10 o'clock (formant ~400Hz)
- KNOB 4: 12 o'clock (shape ~0.3)
- KNOB 8: Maximum (reverb ~0.8)

## Troubleshooting

### Compilation Errors

**Error: libDaisy not found**
```bash
# Update Makefile LIBDAISY_DIR path
# Ensure libDaisy is compiled: cd ~/libDaisy && make
```

**Error: DaisySP not found**
```bash
# Update Makefile DAISYSP_DIR path
# Ensure DaisySP is compiled: cd ~/DaisySP && make
```

### Flashing Errors

**Error: No DFU device found**
```bash
# Ensure Daisy is in bootloader mode
# Try different USB cable/port
lsusb | grep DFU  # Should show "0483:df11"
```

**Error: Permission denied**
```bash
# Linux: Add udev rule
sudo cp ~/libDaisy/99-daisy.rules /etc/udev/rules.d/
sudo udevadm control --reload-rules
```

### Audio Issues

**No sound output**
- Check audio cable connections
- Verify KNOB 5 (cutoff) is not at minimum
- Ensure KNOB 6 (resonance) < 0.9 (avoids self-oscillation)

**Clicking/popping**
- Reduce KNOB 7 (overdrive)
- Lower sample count in code (block size 48 → 32)

## Development Notes

### CPU Usage
Current estimate: ~35% @ 48kHz sample rate  
Headroom available for additional features

### Memory Usage
- SDRAM: ReverbSc delay lines (~50KB)
- SRAM: All other modules (~5KB)
- Flash: ~48KB program size

### Future Enhancements
- Add LFO for automated modulation
- Implement 4-voice polyphony with voice stealing
- Add preset storage via QSPI flash
- External CV inputs for modulation

## References

- [Daisy Wiki](https://github.com/electro-smith/DaisyWiki/wiki)
- [DaisySP Documentation](https://electro-smith.github.io/DaisySP/index.html)
- [Daisy Forum](https://forum.electro-smith.com/)

---

**Firmware Version:** 1.0  
**Last Updated:** 2025-12-13
