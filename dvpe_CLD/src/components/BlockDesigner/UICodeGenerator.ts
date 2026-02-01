/**
 * UICodeGenerator - Generate C++ code from UI layout
 * Phase 13.2: Day 5 - Code Generation Integration
 * 
 * Converts UIElements into C++ OLED display code for Daisy.
 */

import { UIElement, UIElementType } from '../../types/uiElement';

export interface UICodeGeneratorOptions {
    /** Target display type */
    displayType: 'oled_128x64' | 'oled_128x32' | 'custom';

    /** Custom display dimensions (for custom type) */
    customDimensions?: { width: number; height: number };

    /** Generate comments in code */
    includeComments?: boolean;

    /** Parameter prefix for generated getters */
    parameterPrefix?: string;
}

export interface GeneratedUICode {
    /** Include statements */
    includes: string[];

    /** State variable declarations */
    stateVars: string[];

    /** UI drawing function body */
    drawFunction: string;

    /** Update function (for animations) */
    updateFunction?: string;
}

/**
 * Generate C++ display code from UI elements.
 */
export function generateUICode(
    elements: UIElement[],
    options: UICodeGeneratorOptions = { displayType: 'oled_128x64' }
): GeneratedUICode {
    const { includeComments = true, parameterPrefix = 'param_' } = options;

    // Display dimensions for bounds checking (reserved for future use)
    /*
    const displayWidth = displayType === 'oled_128x32' ? 128 :
        displayType === 'oled_128x64' ? 128 :
            options.customDimensions?.width ?? 128;
    const displayHeight = displayType === 'oled_128x32' ? 32 :
        displayType === 'oled_128x64' ? 64 :
            options.customDimensions?.height ?? 64;
    */

    const includes: string[] = [];
    const stateVars: string[] = [];
    const drawLines: string[] = [];

    // Sort elements by z-index for proper layering
    const sortedElements = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

    if (includeComments) {
        drawLines.push('// Clear display');
    }
    drawLines.push('display.Fill(false);');
    drawLines.push('');

    for (const element of sortedElements) {
        const code = generateElementCode(element, parameterPrefix, includeComments);
        if (code) {
            drawLines.push(code);
            drawLines.push('');
        }
    }

    if (includeComments) {
        drawLines.push('// Refresh display');
    }
    drawLines.push('display.Update();');

    return {
        includes,
        stateVars,
        drawFunction: drawLines.join('\n'),
    };
}

function generateElementCode(
    element: UIElement,
    parameterPrefix: string,
    includeComments: boolean
): string {
    const x = Math.round(element.position.x);
    const y = Math.round(element.position.y);
    const w = Math.round(element.size.width);
    const h = Math.round(element.size.height);

    const lines: string[] = [];

    if (includeComments && element.label) {
        lines.push(`// ${element.label}`);
    }

    switch (element.type) {
        case UIElementType.ROTARY_KNOB:
            lines.push(...generateKnobCode(element, x, y, w, h, parameterPrefix));
            break;

        case UIElementType.SLIDER:
            lines.push(...generateSliderCode(element, x, y, w, h, parameterPrefix));
            break;

        case UIElementType.TEXT_LABEL:
            lines.push(...generateLabelCode(element, x, y));
            break;

        case UIElementType.LED_INDICATOR:
            lines.push(...generateLEDCode(element, x, y, w, parameterPrefix));
            break;

        case UIElementType.NUMERIC_DISPLAY:
            lines.push(...generateNumericCode(element, x, y, w, parameterPrefix));
            break;

        case UIElementType.TOGGLE:
            lines.push(...generateToggleCode(element, x, y, w, h, parameterPrefix));
            break;

        case UIElementType.VU_METER:
            lines.push(...generateVUMeterCode(element, x, y, w, h, parameterPrefix));
            break;

        case UIElementType.GROUP_BOX:
            lines.push(...generateGroupBoxCode(element, x, y, w, h));
            break;

        default:
            if (includeComments) {
                lines.push(`// TODO: Implement ${element.type}`);
            }
    }

    return lines.join('\n');
}

// === Element-specific generators ===

function generateKnobCode(
    element: UIElement,
    x: number,
    y: number,
    w: number,
    h: number,
    parameterPrefix: string
): string[] {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const radius = Math.min(w, h) / 2 - 2;
    const binding = element.binding;
    const valueGetter = binding ? `${parameterPrefix}${binding.target.parameterId}` : '0.5f';

    return [
        `// Draw knob at (${cx}, ${cy})`,
        `float knobValue = ${valueGetter};`,
        `int knobRadius = ${Math.round(radius)};`,
        `display.DrawCircle(${Math.round(cx)}, ${Math.round(cy)}, knobRadius, true);`,
        `float angle = -2.356f + knobValue * 4.712f; // -135° to +135°`,
        `int px = ${Math.round(cx)} + (knobRadius - 2) * cosf(angle);`,
        `int py = ${Math.round(cy)} + (knobRadius - 2) * sinf(angle);`,
        `display.DrawLine(${Math.round(cx)}, ${Math.round(cy)}, px, py, true);`,
    ];
}

function generateSliderCode(
    element: UIElement,
    x: number,
    y: number,
    w: number,
    h: number,
    parameterPrefix: string
): string[] {
    const binding = element.binding;
    const valueGetter = binding ? `${parameterPrefix}${binding.target.parameterId}` : '0.5f';
    const isVertical = h > w;

    if (isVertical) {
        return [
            `// Vertical slider`,
            `float sliderValue = ${valueGetter};`,
            `display.DrawRect(${x}, ${y}, ${x + w}, ${y + h}, true, false);`,
            `int fillH = (int)(sliderValue * ${h - 2});`,
            `display.DrawRect(${x + 1}, ${y + h - 1} - fillH, ${x + w - 1}, ${y + h - 1}, true, true);`,
        ];
    }

    return [
        `// Horizontal slider`,
        `float sliderValue = ${valueGetter};`,
        `display.DrawRect(${x}, ${y}, ${x + w}, ${y + h}, true, false);`,
        `int fillW = (int)(sliderValue * ${w - 2});`,
        `display.DrawRect(${x + 1}, ${y + 1}, ${x + 1} + fillW, ${y + h - 1}, true, true);`,
    ];
}

function generateLabelCode(
    element: UIElement,
    x: number,
    y: number
): string[] {
    const text = element.label ?? 'Label';
    return [
        `display.SetCursor(${x}, ${y});`,
        `display.WriteString("${text}", Font_6x8, true);`,
    ];
}

function generateLEDCode(
    element: UIElement,
    x: number,
    y: number,
    w: number,
    parameterPrefix: string
): string[] {
    const binding = element.binding;
    const valueGetter = binding ? `${parameterPrefix}${binding.target.parameterId}` : 'false';
    const radius = Math.min(w, 10) / 2;

    return [
        `// LED indicator`,
        `bool ledOn = ${valueGetter} > 0.5f;`,
        `display.DrawCircle(${x + Math.round(radius)}, ${y + Math.round(radius)}, ${Math.round(radius)}, true, ledOn);`,
    ];
}

function generateNumericCode(
    element: UIElement,
    x: number,
    y: number,
    _w: number,
    parameterPrefix: string
): string[] {
    const binding = element.binding;
    const valueGetter = binding ? `${parameterPrefix}${binding.target.parameterId}` : '0.0f';
    const decimals = (element.config?.decimals as number) ?? 2;

    return [
        `// Numeric display`,
        `char numBuf[16];`,
        `snprintf(numBuf, sizeof(numBuf), "%.${decimals}f", ${valueGetter});`,
        `display.SetCursor(${x}, ${y});`,
        `display.WriteString(numBuf, Font_6x8, true);`,
    ];
}

function generateToggleCode(
    element: UIElement,
    x: number,
    y: number,
    w: number,
    h: number,
    parameterPrefix: string
): string[] {
    const binding = element.binding;
    const valueGetter = binding ? `${parameterPrefix}${binding.target.parameterId}` : 'false';

    return [
        `// Toggle switch`,
        `bool toggleOn = ${valueGetter} > 0.5f;`,
        `display.DrawRect(${x}, ${y}, ${x + w}, ${y + h}, true, false);`,
        `int thumbX = toggleOn ? ${x + w - h + 2} : ${x + 2};`,
        `display.DrawRect(thumbX, ${y + 2}, thumbX + ${h - 4}, ${y + h - 2}, true, true);`,
    ];
}

function generateVUMeterCode(
    element: UIElement,
    x: number,
    y: number,
    w: number,
    h: number,
    parameterPrefix: string
): string[] {
    const binding = element.binding;
    const valueGetter = binding ? `${parameterPrefix}${binding.target.parameterId}` : '0.0f';

    return [
        `// VU Meter`,
        `float vuLevel = ${valueGetter};`,
        `display.DrawRect(${x}, ${y}, ${x + w}, ${y + h}, true, false);`,
        `int segmentH = ${Math.round(h / 8)};`,
        `int activeSegs = (int)(vuLevel * 8);`,
        `for (int i = 0; i < activeSegs; i++) {`,
        `    int sy = ${y + h - 2} - i * segmentH;`,
        `    display.DrawRect(${x + 2}, sy - segmentH + 2, ${x + w - 2}, sy, true, true);`,
        `}`,
    ];
}

function generateGroupBoxCode(
    element: UIElement,
    x: number,
    y: number,
    w: number,
    h: number
): string[] {
    const label = element.label;
    const lines = [
        `// Group box`,
        `display.DrawRect(${x}, ${y + 4}, ${x + w}, ${y + h}, true, false);`,
    ];

    if (label) {
        lines.push(`display.SetCursor(${x + 4}, ${y});`);
        lines.push(`display.WriteString("${label}", Font_6x8, true);`);
    }

    return lines;
}

/**
 * Generate the complete UI render function.
 */
export function generateCompleteUIFunction(
    elements: UIElement[],
    functionName: string = 'DrawUI',
    options?: UICodeGeneratorOptions
): string {
    const code = generateUICode(elements, options);

    const lines = [
        `void ${functionName}() {`,
        ...code.drawFunction.split('\n').map(line => `    ${line}`),
        `}`,
    ];

    return lines.join('\n');
}
