import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { CodeGenerator } from '@/codegen/CodeGenerator';
import type { SerializedProject } from '@/types';

describe('Field mapping subtractive example', () => {
    it('loads and generates Field mapping C++ without conflicts', () => {
        const examplePath = path.resolve(process.cwd(), 'examples', 'field_mapping_subtractive.dvpe');
        const project = JSON.parse(fs.readFileSync(examplePath, 'utf-8')) as SerializedProject;

        expect(project.version).toBe('1.0.0');
        expect(project.patch.metadata.targetHardware).toBe('field');
        expect(project.patch.hardwareConfig?.fieldControlMappings?.length).toBeGreaterThan(0);

        const result = new CodeGenerator(project.patch as any).generate();

        expect(result.errors).toEqual([]);
        expect(result.mainCpp).toContain('const int field_mapping_layer =');
        expect(result.mainCpp).toContain('hw.GetKnobValue(DaisyField::KNOB_1)');
        expect(result.mainCpp).toContain('hw.KeyboardState(0)');
        expect(result.mainCpp).toContain('const bool field_sw1_short_press = hw.GetSwitch(DaisyField::SW_1)->RisingEdge();');
        expect(result.mainCpp).toContain('if (field_sw1_short_press) accent_env.Trigger();');
        expect(result.mainCpp).toContain('if (hw.KeyboardRisingEdge(9)) field_toggle_B2_normal = (field_toggle_B2_normal + 1) % 3;');
        expect(result.mainCpp).toContain('hw.led_driver.SetLed(kFieldKeyLeds[9]');
    });
});
