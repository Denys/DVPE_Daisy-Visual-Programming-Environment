/**
 * Advanced Export Service
 * Sends DVPE-generated C++ firmware through an LLM correction pass
 * Supports Gemini, OpenAI, and Anthropic providers
 */

// ============================================================================
// TYPES
// ============================================================================

export type AIProvider = 'gemini' | 'openai' | 'anthropic';

export const AI_MODELS: Record<AIProvider, { id: string; label: string }[]> = {
  gemini: [
    { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
    { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
    { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
    { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash-Lite Preview' },
  ],
  openai: [
    { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini' },
    { id: 'gpt-5.5', label: 'GPT-5.5' },
    { id: 'gpt-5.4', label: 'GPT-5.4' },
    { id: 'gpt-5.4-nano', label: 'GPT-5.4 Nano' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-6-thinking', label: 'Claude Sonnet 4.6 (Thinking)' },
    { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    { id: 'claude-opus-4-7-thinking', label: 'Claude Opus 4.7 (Thinking)' },
  ],
};

export function getDefaultAIModel(provider: AIProvider): string {
  return AI_MODELS[provider][0].id;
}

export function isSupportedAIModel(provider: AIProvider, modelId: string): boolean {
  return AI_MODELS[provider].some((model) => model.id === modelId);
}

export function normalizeAIModel(provider: AIProvider, modelId: string): string {
  return isSupportedAIModel(provider, modelId) ? modelId : getDefaultAIModel(provider);
}

export interface AdvancedExportInput {
  mainCpp: string;
  makefile: string;
  projectName: string;
  targetHardware: string;
  provider: AIProvider;
  modelId: string;
}

export interface AdvancedExportOutput {
  mainCpp: string;
  makefile: string;
  linesChanged: number;
}

// ============================================================================
// LOCAL STORAGE KEY HELPERS
// ============================================================================

const KEY_PREFIX = 'dvpe_ai_key_';

export function getAIKey(provider: AIProvider): string {
  return localStorage.getItem(`${KEY_PREFIX}${provider}`) ?? '';
}

export function setAIKey(provider: AIProvider, key: string): void {
  if (key.trim()) {
    localStorage.setItem(`${KEY_PREFIX}${provider}`, key.trim());
  } else {
    localStorage.removeItem(`${KEY_PREFIX}${provider}`);
  }
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildPrompt(input: AdvancedExportInput): string {
  return `You are a Daisy DSP firmware expert applying the Noderr DVPE firmware specialization and the Daisy_QAE coding standard.

Review and correct the following C++ firmware and Makefile for the Daisy ${input.targetHardware} platform.

Corrections to apply:
- Use correct hardware header: daisy_field.h, daisy_pod.h, or daisy_seed.h based on target hardware "${input.targetHardware}"
- Fix any incorrect DaisySP API calls (method names, argument types, init patterns)
- Ensure correct AudioCallback signature: AudioHandle::InputBuffer in, AudioHandle::OutputBuffer out, size_t size
- Ensure Init() and Process() calls follow DaisySP conventions
- Ensure hw.Init(), hw.StartAudio(), hw.StartAdc() are called correctly in main()
- Fix Makefile: TARGET and CPP_SOURCES must match project name "${input.projectName}", relative paths ../../../libDaisy and ../../../DaisySP
- Remove any invalid or hallucinated includes or classes

IMPORTANT: Return ONLY raw code in the format below — no markdown fences, no commentary.

=== main.cpp ===
{corrected cpp here}

=== Makefile ===
{corrected Makefile here}

--- INPUT ---
=== main.cpp ===
${input.mainCpp}

=== Makefile ===
${input.makefile}`;
}

// ============================================================================
// RESPONSE PARSER
// ============================================================================

function parseResponse(raw: string, original: AdvancedExportOutput): AdvancedExportOutput {
  const cppMatch = raw.match(/=== main\.cpp ===([\s\S]*?)(?:=== Makefile ===|$)/);
  const makeMatch = raw.match(/=== Makefile ===([\s\S]*?)$/);

  const mainCpp = cppMatch?.[1]?.trim() ?? original.mainCpp;
  const makefile = makeMatch?.[1]?.trim() ?? original.makefile;

  // Count added/changed lines (rough diff)
  const origLines = original.mainCpp.split('\n').length;
  const newLines = mainCpp.split('\n').length;
  const linesChanged = Math.abs(newLines - origLines) +
    mainCpp.split('\n').filter((l, i) => l !== (original.mainCpp.split('\n')[i] ?? '')).length;

  return { mainCpp, makefile, linesChanged };
}

// ============================================================================
// PROVIDER CALLS
// ============================================================================

async function callGemini(prompt: string, modelId: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callOpenAI(prompt: string, modelId: string, apiKey: string): Promise<string> {
  const url = window.__TAURI__ ? 'https://api.openai.com/v1/chat/completions' : '/api/openai/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_completion_tokens: 8192,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callAnthropic(prompt: string, modelId: string, apiKey: string): Promise<string> {
  const isThinking = modelId.includes('thinking');
  const body: Record<string, unknown> = {
    model: modelId.replace('-thinking', ''),
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
  };
  if (isThinking) {
    body.thinking = { type: 'enabled', budget_tokens: 10000 };
    body.temperature = 1; // required for extended thinking
  }

  const url = window.__TAURI__ ? 'https://api.anthropic.com/v1/messages' : '/api/anthropic/v1/messages';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  // Extract text blocks only (skip thinking blocks)
  const text = data.content
    ?.filter((b: any) => b.type === 'text')
    ?.map((b: any) => b.text)
    ?.join('') ?? '';
  return text;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function advancedExportWithAI(
  input: AdvancedExportInput
): Promise<AdvancedExportOutput> {
  const apiKey = getAIKey(input.provider);
  if (!apiKey) {
    throw new Error(
      `No ${input.provider} API key configured. ` +
      `Open Inspector → Design tab → AI Export Settings to set your key.`
    );
  }

  const prompt = buildPrompt(input);
  let rawResponse = '';

  switch (input.provider) {
    case 'gemini':
      rawResponse = await callGemini(prompt, input.modelId, apiKey);
      break;
    case 'openai':
      rawResponse = await callOpenAI(prompt, input.modelId, apiKey);
      break;
    case 'anthropic':
      rawResponse = await callAnthropic(prompt, input.modelId, apiKey);
      break;
  }

  return parseResponse(rawResponse, {
    mainCpp: input.mainCpp,
    makefile: input.makefile,
    linesChanged: 0,
  });
}

// ============================================================================
// HARDWARE PREFIX HELPER
// ============================================================================

export function getHardwarePrefix(targetHardware: string): string {
  const hw = (targetHardware ?? '').toLowerCase();
  if (hw === 'field') return 'Field';
  if (hw === 'pod') return 'Pod';
  return 'Custom';
}
