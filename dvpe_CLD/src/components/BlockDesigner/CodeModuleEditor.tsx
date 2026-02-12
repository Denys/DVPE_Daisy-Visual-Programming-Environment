/**
 * Code Module Editor
 * Monaco-based C++ code editor for custom code modules
 * Uses lazy loading to avoid bundle size issues
 */

import React, { Suspense, lazy, useState, useCallback, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Code2, Settings2, Info } from 'lucide-react';
import { CodeModuleDefinition, PortBinding } from '@/types/customBlock';
import { SignalType, PortDirection } from '@/types/blocks';
import { PortBindingEditor, validateAllBindings } from './PortBindingEditor';

// Lazy load Monaco editor to avoid bundle size issues
const Editor = lazy(() => import('@monaco-editor/react'));

interface CodeModuleEditorProps {
    value: CodeModuleDefinition;
    onChange: (value: CodeModuleDefinition) => void;
    height?: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    portErrors: Record<string, string>;
}

// Default starter code template
const DEFAULT_CPP_CODE = `// Custom Code Module
// Write your C++ code here
// Access inputs/outputs using the port variable names you define

// Example: Simple gain stage
// float input;   // declared as input port
// float output;  // declared as output port
// float gain;    // declared as parameter

// output = input * gain;
`;

// Monaco editor loader config
// const loaderConfig = {
//     paths: {
//         vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
//     }
// };

// C++ language configuration for Monaco
// const cppLanguageConfig = {
//     comments: {
//         lineComment: '//',
//         blockComment: ['/*', '*/']
//     },
//     brackets: [
//         ['{', '}'],
//         ['[', ']'],
//         ['(', ')']
//     ],
//     autoClosingPairs: [
//         { open: '{', close: '}' },
//         { open: '[', close: ']' },
//         { open: '(', close: ')' },
//         { open: '"', close: '"' },
//         { open: "'", close: "'" }
//     ]
// };

// Editor loading fallback
const EditorLoading = () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-400">Loading editor...</span>
        </div>
    </div>
);

// Editor error fallback - unused but kept for future use
// const EditorError = ({ error }: { error: Error }) => (
//     <div className="flex items-center justify-center h-full bg-gray-900 p-4">
//         <div className="flex flex-col items-center gap-3 text-center">
//             <AlertCircle className="text-red-500" size={32} />
//             <span className="text-red-400 font-medium">Failed to load editor</span>
//             <span className="text-sm text-gray-500">{error.message}</span>
//         </div>
//     </div>
// );

export function validateCodeModule(codeModule: CodeModuleDefinition): ValidationResult {
    const errors: string[] = [];

    // Validate port bindings
    const portErrors = validateAllBindings(codeModule.portBindings);

    // Check for ports without bindings
    if (codeModule.portBindings.length === 0) {
        errors.push('At least one port binding is required');
    }

    // Validate C++ code
    if (!codeModule.cppCode || codeModule.cppCode.trim() === '') {
        errors.push('C++ code cannot be empty');
    }

    // Check for at least one input and one output (warning, not error)
    const hasInput = codeModule.portBindings.some(p => p.direction === PortDirection.INPUT);
    const hasOutput = codeModule.portBindings.some(p => p.direction === PortDirection.OUTPUT);

    if (!hasInput) {
        errors.push('Warning: No input ports defined');
    }
    if (!hasOutput) {
        errors.push('Warning: No output ports defined');
    }

    // Basic C++ syntax checks
    const code = codeModule.cppCode || '';
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
        errors.push('Mismatched braces in C++ code');
    }

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
        errors.push('Mismatched parentheses in C++ code');
    }

    return {
        isValid: errors.filter(e => !e.startsWith('Warning:')).length === 0 && Object.keys(portErrors).length === 0,
        errors,
        portErrors
    };
}

export const CodeModuleEditor: React.FC<CodeModuleEditorProps> = ({
    value,
    onChange,
    // height = '400px' // Reserved for future use
}) => {
    const [activeTab, setActiveTab] = useState<'code' | 'ports'>('code');

    // Ensure value has defaults
    const codeModule = useMemo(() => ({
        ...value,
        cppCode: value.cppCode || DEFAULT_CPP_CODE,
        portBindings: value.portBindings || [],
        stateVariables: value.stateVariables || []
    }), [value]);

    // Validate on every change
    const validation = useMemo(() =>
        validateCodeModule(codeModule),
        [codeModule]
    );

    const handleCodeChange = useCallback((newCode: string | undefined) => {
        onChange({
            ...codeModule,
            cppCode: newCode || ''
        });
    }, [codeModule, onChange]);

    const handlePortBindingsChange = useCallback((newBindings: PortBinding[]) => {
        onChange({
            ...codeModule,
            portBindings: newBindings
        });
    }, [codeModule, onChange]);

    // Monaco editor options
    const editorOptions = useMemo(() => ({
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on' as const,
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: false,
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        wordBasedSuggestions: 'currentDocument' as const,
        parameterHints: { enabled: true },
        hover: { enabled: true },
        formatOnType: true,
        formatOnPaste: true,
        renderWhitespace: 'selection' as const,
        folding: true,
        foldingStrategy: 'auto' as const,
        showFoldingControls: 'always' as const,
        matchBrackets: 'always' as const,
        autoClosingBrackets: 'always' as const,
        autoClosingQuotes: 'always' as const,
        autoIndent: 'full' as const,
        smoothScrolling: true,
        cursorBlinking: 'smooth' as const,
        cursorSmoothCaretAnimation: 'on' as const,
        theme: 'vs-dark'
    }), []);

    // Generate port variable documentation
    const portDocumentation = useMemo(() => {
        if (codeModule.portBindings.length === 0) return null;

        return (
            <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                <h4 className="font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Info size={14} />
                    Available Variables
                </h4>
                <div className="space-y-1">
                    {codeModule.portBindings.map(binding => {
                        const prefix = binding.signalType === SignalType.CV ? 'cv' :
                            binding.signalType === SignalType.TRIGGER ? 'bool' : 'float';
                        return (
                            <div key={binding.id} className="flex items-center gap-2 text-xs">
                                <span className={`w-2 h-2 rounded-full ${
                                    binding.signalType === SignalType.AUDIO ? 'bg-cyan-500' :
                                        binding.signalType === SignalType.CV ? 'bg-yellow-500' :
                                            'bg-orange-500'
                                }`} />
                                <code className="text-blue-400">{prefix} {binding.id}</code>
                                <span className="text-gray-500">- {binding.displayName}</span>
                                <span className={`ml-auto text-xs ${
                                    binding.direction === PortDirection.INPUT ? 'text-blue-400' : 'text-green-400'
                                }`}>
                                    {binding.direction === PortDirection.INPUT ? '← input' : 'output →'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }, [codeModule.portBindings]);

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            {/* Tab Bar */}
            <div className="flex items-center border-b border-gray-700 bg-gray-800">
                <button
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'code'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                    }`}
                >
                    <Code2 size={16} />
                    C++ Code
                </button>
                <button
                    onClick={() => setActiveTab('ports')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'ports'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                    }`}
                >
                    <Settings2 size={16} />
                    Port Bindings
                    {codeModule.portBindings.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                            {codeModule.portBindings.length}
                        </span>
                    )}
                </button>

                {/* Validation Status */}
                <div className="ml-auto px-4 flex items-center gap-2">
                    {validation.isValid ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                            <CheckCircle2 size={14} />
                            Valid
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                            <AlertCircle size={14} />
                            {validation.errors.filter(e => !e.startsWith('Warning:')).length > 0
                                ? `${validation.errors.filter(e => !e.startsWith('Warning:')).length} error(s)`
                                : 'Invalid'
                            }
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'code' ? (
                    <div className="h-full flex flex-col">
                        {/* Editor */}
                        <div className="flex-1 min-h-0">
                            <Suspense fallback={<EditorLoading />}>
                                <Editor
                                    height="100%"
                                    language="cpp"
                                    value={codeModule.cppCode}
                                    onChange={handleCodeChange}
                                    options={editorOptions}
                                    loading={<EditorLoading />}
                                />
                            </Suspense>
                        </div>

                        {/* Port Documentation Panel */}
                        {portDocumentation && (
                            <div className="border-t border-gray-700 p-3 max-h-40 overflow-y-auto">
                                {portDocumentation}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-4">
                        <PortBindingEditor
                            bindings={codeModule.portBindings}
                            onChange={handlePortBindingsChange}
                            errors={validation.portErrors}
                        />
                    </div>
                )}
            </div>

            {/* Error Footer */}
            {(validation.errors.length > 0 || Object.keys(validation.portErrors).length > 0) && (
                <div className="border-t border-gray-700 bg-gray-800/50 p-3 max-h-32 overflow-y-auto">
                    {validation.errors.map((error, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-2 text-sm ${
                                error.startsWith('Warning:') ? 'text-yellow-400' : 'text-red-400'
                            }`}
                        >
                            {error.startsWith('Warning:') ? (
                                <AlertCircle size={14} className="text-yellow-400" />
                            ) : (
                                <AlertCircle size={14} />
                            )}
                            {error}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CodeModuleEditor;