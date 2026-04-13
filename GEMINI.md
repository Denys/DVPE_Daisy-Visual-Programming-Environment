# GEMINI — Gemini Specific Instructions for DVPE

> Combined system prompt: AGENTS.md (architecture) + GEMINI.md (this file - tool tactics) + DAISY_EXPERT_SP_v5.2.md (domain expertise)

---

## PART 1: Agent Architecture

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency.

### The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- SOPs written in Markdown, live in `directives/`
- Define goals, inputs, tools/scripts to use, outputs, and edge cases.

**Layer 2: Orchestration (Decision making)**
- This is you (Gemini). Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, and update directives with learnings.

**Layer 3: Execution (Doing the work)**
- Deterministic Python scripts in `execution/`
- Handle API calls, data processing, file operations, and hardware builds.
- Use scripts instead of manual work whenever possible.

---

## PART 2: Gemini CLI Optimization

### Platform Identification
**You are using Gemini CLI if you have**:
- Native search integration (`google_web_search`)
- Multimodal input capabilities (screenshots, diagrams)
- Google Workspace integration (Docs, Sheets, Drive)

### Unique Capabilities & Optimal Usage

#### Native Search Integration (SEARCH-FIRST)
**Use native search BEFORE creating/updating directives or fixing bugs.**
- Search for: "DaisySP [module] best practices 2025", "STM32H7 GPIO configuration patterns", etc.
- Always verify latest library versions and known issues on the Electrosmith forum.

#### Multimodal Input Processing
- **Screenshots to Code**: Analyze UI screenshots (like visual programming blocks) to generate matching C++ code.
- **Diagrams to Architecture**: Parse system architecture diagrams to generate project structures and directives.

#### Google Workspace Deliverables
- Store final reports, DSP analysis, or project documentation in **Google Docs/Sheets** rather than just local files.
- Update `CHECKPOINT.md` with these cloud URLs.

---

## PART 3: Domain Expertise (Swappable)

Currently active: **DAISY_EXPERT_SP_v5.2.md**

**To switch focus**:
- **DVPE Application**: Refer to `_agentic_promts/DAISY_EXPERT_AGENT_v1.1.md`
- **C++ Projects**: Refer to `_agentic_promts/DAISY_EXPERT_SP_v5.2.md`

---

## Session Checklist

- [ ] Read `AGENTS.md` (universal instructions)
- [ ] Read `GEMINI.md` (this file)
- [ ] Read `CHECKPOINT.md` (project state)
- [ ] Read `dvpe_bugs.md` (known issues)
- [ ] Search before creating/updating directives
- [ ] Use `google_web_search` for current Daisy documentation
- [ ] Store deliverables in Google Workspace with documented URLs
