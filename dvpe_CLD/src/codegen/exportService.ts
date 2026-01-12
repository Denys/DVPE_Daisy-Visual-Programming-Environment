/**
 * Export Service
 * Orchestrates code generation and file export
 * Ported from dvpe with type adaptations for dvpe_CLD
 */

import { CodeGenerator, GeneratedCode, PatchGraph } from './CodeGenerator';

// ============================================================================
// TYPES
// ============================================================================

export interface ExportResult {
    success: boolean;
    files: Map<string, string>;
    errors: string[];
    warnings: string[];
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export a patch to C++ files
 */
export async function exportPatch(patch: PatchGraph): Promise<ExportResult> {
    try {
        const generator = new CodeGenerator(patch);
        const generated = generator.generate();

        if (generated.errors.length > 0) {
            return {
                success: false,
                files: new Map(),
                errors: generated.errors,
                warnings: generated.warnings,
            };
        }

        const files = new Map<string, string>();
        files.set('main.cpp', generated.mainCpp);
        files.set('Makefile', generated.makefile);

        return {
            success: true,
            files,
            errors: [],
            warnings: generated.warnings,
        };
    } catch (error) {
        return {
            success: false,
            files: new Map(),
            errors: [`Export failed: ${error}`],
            warnings: [],
        };
    }
}

/**
 * Download a file in the browser
 */
export function downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download all files from an export result
 */
export function downloadExport(result: ExportResult): void {
    if (!result.success) {
        throw new Error(result.errors.join('\n'));
    }

    result.files.forEach((content, filename) => {
        downloadFile(content, filename);
    });
}

/**
 * Preview generated code without downloading
 */
export function previewCode(patch: PatchGraph): GeneratedCode {
    const generator = new CodeGenerator(patch);
    return generator.generate();
}
