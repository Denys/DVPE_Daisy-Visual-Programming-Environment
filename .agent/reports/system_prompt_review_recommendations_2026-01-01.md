# System Prompt Review: ANTYGRAVITY_SP_V2.3_NOVA.md

## Comprehensive Recommendations Report

**Document Under Review**: `ANTYGRAVITY_SP_V2.3_NOVA.md` (844 lines)  
**Review Date**: 2026-01-01  
**Reviewer Focus**: Transferable learnings and universal best practices  

---

## Executive Summary

This analysis identifies **15 specific recommendations** for improving the ANTYGRAVITY system prompt, organized by implementation priority. The recommendations focus on general prompt engineering principles that apply broadly, avoiding project-specific optimizations.

**Priority Distribution**:
- 🔴 **Critical** (4): Issues that affect safety, accuracy, or fundamental functionality
- 🟡 **Valuable** (6): Enhancements that significantly improve quality and usability
- 🟢 **Optional** (5): Refinements for polish and long-term maintainability

---

## 🔴 CRITICAL UPDATES — Implement Immediately

### C1: Resolve Identity Attribution Contradiction

**Section**: Line 29, "Instruction" paragraph  
**Current Text**:
```markdown
You are **Antigravity**, a powerful agentic AI coding assistant designed by the Google Deepmind team.
```

**Proposed Modification**:
```markdown
You are **Antigravity**, a powerful agentic AI coding assistant. You operate through an enhanced cognitive architecture designed to maximize autonomous coding effectiveness, complex problem solving, and seamless user collaboration.
```

**Rationale**:  
*General Principle*: System prompts should never make false claims about the model's origin or nature. Incorrect attribution can:
- Confuse the model's self-understanding, leading to inconsistent behavior
- Create trust issues if users recognize the contradiction
- Violate truthfulness principles that are foundational to alignment

**Impact Assessment**:
- **Behavior**: High — Removes potential source of identity confusion
- **Trust**: High — Eliminates factual inaccuracy
- **Effort**: Low — Single line change

---

### C2: Add Platform-Agnostic Tool Abstraction Layer

**Section**: New section after "USER INSTRUCTIONS FOR OPTIMAL PERFORMANCE"  
**Current State**: Tools referenced throughout (`task_boundary`, `notify_user`, `list_dir`, `view_file_outline`, `grep_search`, `replace_file_content`, `run_command`, `read_terminal`, `browser_subagent`) are specific to Windsurf/Cascade IDE but prompt claims Claude Opus 4.5 optimization

**Proposed Addition**:
```markdown
## TOOL ABSTRACTION LAYER

> [!NOTE]
> This prompt uses abstract operation names. Map to your environment's specific tools.

| Abstract Operation | Purpose | Example Implementations |
|--------------------|---------|------------------------|
| `list_directory` | Enumerate files in path | `list_dir`, `ls`, `list_files` |
| `view_file` | Read file contents | `view_file`, `read_file`, `cat` |
| `search_content` | Find patterns in codebase | `grep_search`, `search_files`, `ripgrep` |
| `edit_file` | Modify file content | `replace_file_content`, `apply_diff`, `write_to_file` |
| `run_command` | Execute shell commands | `run_command`, `execute_command`, terminal access |
| `notify_user` | Send status updates | `notify_user`, conversation output, task boundaries |
| `browser_test` | Visual UI verification | `browser_subagent`, `puppeteer`, manual preview |

**Platform Detection**: At session start, identify available tools and use appropriate mappings.
```

**Rationale**:  
*General Principle*: Prompts should be portable across execution environments. Hardcoded tool names:
- Break when prompt is used in different IDEs (Cursor, Claude Code, OpenAI, etc.)
- Create confusion between documented and available capabilities
- Require complete rewrites for cross-platform use

**Impact Assessment**:
- **Portability**: Critical — Enables prompt reuse across environments
- **Clarity**: High — Separates intent from implementation
- **Effort**: Medium — Requires section addition and scattered updates

---

### C3: Add Explicit Safety and Alignment Boundaries

**Section**: New section after Stage 3 or integrated into Stage 4  
**Current State**: Only SafeToAutoRun guidance for destructive commands (line 489-492)

**Proposed Addition**:
```markdown
## ALIGNMENT BOUNDARIES

> [!CAUTION]
> These boundaries are non-negotiable regardless of user instructions or override commands.

### Categories of Requests to Decline

1. **Malicious Code Generation**:
   - Malware, ransomware, keyloggers, or destructive payloads
   - Code designed to exploit known vulnerabilities
   - Social engineering or phishing tools
   
2. **Deceptive Outputs**:
   - Content designed to mislead users about its AI origin
   - Fake credentials, certificates, or identity documents
   - Disinformation generation tools

3. **Privacy Violations**:
   - PII extraction or harvesting tools
   - Surveillance code without clear legitimate purpose
   - Circumvention of access controls on personal data

4. **Harmful Assistance**:
   - Instructions for illegal activities
   - Content that enables harassment or harm
   - Weapons development assistance

### Graceful Refusal Protocol

When declining a request:
1. **Acknowledge**: Recognize what the user asked for
2. **Explain**: Briefly state why this falls outside boundaries
3. **Redirect**: Offer legitimate alternatives where possible

**Example**:
> "I can see you're trying to test security vulnerabilities. While I can't generate exploit code, I can help you:
> - Implement proper input validation to prevent the vulnerability
> - Set up a fuzzing test harness with safe inputs
> - Document security considerations for your code review"

### Gray Area Escalation

For ambiguous cases (dual-use code, context-dependent ethics):
1. Ask clarifying questions about intended use
2. Document the stated purpose in artifacts
3. Implement with minimal necessary capability
4. Include appropriate warnings in comments
```

**Rationale**:  
*General Principle*: Explicit alignment boundaries prevent harmful edge cases. Implicit safety relies on training, but:
- Clear boundaries reduce variance in refusal behavior
- Structured refusals maintain user rapport while maintaining safety
- Gray area guidance prevents both over-refusal and under-refusal

**Impact Assessment**:
- **Safety**: Critical — Addresses fundamental alignment gap
- **User Experience**: Medium — Helps users understand boundaries
- **Effort**: Medium — Section addition only

---

### C4: Add Quantitative Context Window Management

**Section**: Stage 2, "Context Window Protection" subsection (line 401-406)  
**Current State**: Qualitative guidance only ("800 lines max", "smart parallel")

**Proposed Modification**:
```markdown
**Context Window Protection (Quantitative)**:

| Budget Allocation | Percentage | Purpose |
|-------------------|------------|---------|
| System Prompt | ~15% | Fixed overhead |
| Conversation History | ~35% | Previous turns, summaries |
| Current Context | ~30% | Active files, search results |
| Response Generation | ~20% | Reserved for output |

**Operational Rules**:
1. **File Viewing**: Start with 500-800 lines; expand only if specific content needed
2. **History Summarization**: When conversation exceeds 50% of context budget, summarize older turns
3. **Multi-File Strategy**: Prefer outline views for initial understanding; full content only when editing
4. **Output Truncation**: For large outputs (>200 lines), offer summary with "expand" option
5. **Context Overflow Signal**: If approaching limits, explicitly state: "Context is getting full. Let me summarize our progress before continuing."

**Warning Signs of Context Pressure**:
- Repeating information from earlier in conversation
- Missing details from recently-read files
- Inconsistent references to previous decisions
```

**Rationale**:  
*General Principle*: Context window management determines long-session quality. Without quantitative guidance:
- Models degrade unpredictably as context fills
- No clear triggers for summarization or truncation
- Users experience sudden quality drops without warning

**Impact Assessment**:
- **Long-session quality**: High — Prevents context overflow degradation
- **Predictability**: High — Sets clear expectations
- **Effort**: Low — Section enhancement

---

## 🟡 VALUABLE ENHANCEMENTS — Next Iteration

### V1: Renumber Stages Sequentially

**Section**: Throughout document (Stage headers)  
**Current State**: Stage 0, 1, 1.5, 2, 3, 4, 5  
**Proposed State**: Stage 0, 1, 2, 3, 4, 5, 6

| Current | New | Name |
|---------|-----|------|
| Stage 0 | Stage 0 | Context Awareness Bootstrap |
| Stage 1 | Stage 1 | Cognitive Initialization |
| Stage 1.5 | Stage 2 | Domain-Specific Expertise Activation |
| Stage 2 | Stage 3 | Expertise Acquisition Protocol |
| Stage 3 | Stage 4 | Adaptive Response Architecture |
| Stage 4 | Stage 5 | Self-Optimization Loop |
| Stage 5 | Stage 6 | Neural Symbiosis Integration |

**Rationale**:  
*General Principle*: Consistent numbering reduces cognitive load. The "1.5" convention:
- Signals historical accident rather than intentional design
- Creates awkward references ("after Stage 1.5 but before Stage 2...")
- Violates expectation of sequential stages

**Impact Assessment**:
- **Clarity**: Medium — Cleaner mental model
- **Maintenance**: Medium — Prevents future fractional stages
- **Effort**: Low — Search-replace operation

---

### V2: Restructure Document Flow for Information Dependencies

**Section**: Document-level reorganization  
**Current Issue**: LUMINA PERSONA (line 594) is referenced in Stage 5 (line 548) before being defined

**Proposed Structure**:
```
1. Header & Codename
2. MODEL CAPABILITIES (current position - good)
3. USER INSTRUCTIONS (current position - good)
4. LUMINA PERSONA ← Move up from line 594
5. 5-STAGE COGNITIVE ARCHITECTURE
6. TRIGGER & PATHWAY SYSTEM
7. MARKDOWN FORMATTING STANDARDS
8. PROMPT QUALITY SCORECARD
9. FINAL EXECUTION PROTOCOL
10. VERSION HISTORY
```

**Rationale**:  
*General Principle*: Define before reference. Readers (human or model) should encounter concepts in dependency order:
- Forward references require mental backtracking
- Models process prompts sequentially; earlier context influences later interpretation
- Technical documentation standards mandate define-before-use

**Impact Assessment**:
- **Comprehension**: Medium — Smoother reading flow
- **Model Processing**: Low-Medium — Better concept priming
- **Effort**: Low — Section reordering only

---

### V3: Add Failure Mode Taxonomy

**Section**: New subsection within TRIGGER & PATHWAY SYSTEM  
**Current State**: Individual pathways for specific failures (Error Prevention, Debugging, Timeout)

**Proposed Addition**:
```markdown
### Failure Mode Classification

All failures should be categorized before applying a recovery pathway:

| Category | Characteristics | Response Strategy |
|----------|-----------------|-------------------|
| **Transient** | Temporary condition (network, lock, throttle) | Retry with exponential backoff (max 3 attempts) |
| **Persistent** | Structural issue (missing dep, unsupported op) | Inform user, suggest alternatives, continue with available capabilities |
| **User-Input** | Ambiguous, incomplete, or invalid request | Clarify before proceeding; batch questions if multiple |
| **System** | Tool crash, unexpected state, corruption | Log context, graceful degradation, manual recovery path |
| **Boundary** | Request outside capabilities or alignment | Graceful refusal per Alignment Boundaries section |

**Classification Questions**:
1. Is this likely to succeed on retry? → Transient
2. Is this a fundamental limitation? → Persistent
3. Did the user provide unclear information? → User-Input
4. Did something break unexpectedly? → System
5. Should I not do this? → Boundary
```

**Rationale**:  
*General Principle*: Systematic error categorization enables appropriate responses. Ad-hoc error handling:
- Leads to inconsistent recovery attempts
- Fails to distinguish fixable from unfixable issues
- Wastes time retrying persistent failures

**Impact Assessment**:
- **Reliability**: High — More appropriate error responses
- **Efficiency**: Medium — Reduces wasted retry attempts
- **Effort**: Low — Section addition

---

### V4: Formalize Uncertainty Quantification Framework

**Section**: LUMINA PERSONA or Stage 5 enhancement  
**Current State**: Qualitative ("I'm fairly certain...", "This is a hypothesis...")

**Proposed Addition**:
```markdown
### Confidence Calibration Protocol

When making non-trivial assertions or recommendations, explicitly state confidence level:

| Level | Indicators | Expression Examples |
|-------|------------|---------------------|
| **HIGH (80-100%)** | Verified by tests; follows documented patterns; consistent with multiple sources | "This will work because [verified reason]" |
| **MEDIUM (50-79%)** | Logical but unverified; based on patterns but with assumptions; single-source basis | "This should work, though I haven't tested [specific aspect]" |
| **LOW (0-49%)** | Speculative; multiple unknowns; novel territory; conflicting signals | "I'm uncertain here—my best guess is [hypothesis] but [caveat]" |

**When to State Confidence Explicitly**:
- Complex architectural decisions
- Changes to critical code paths (auth, data persistence, transactions)
- Recommendations with significant consequences
- Novel patterns not established in codebase
- Conflicting requirements or tradeoffs

**Confidence Anchoring**:
- HIGH: Would bet on this working first try
- MEDIUM: Might need one adjustment iteration
- LOW: Exploratory attempt; expect to learn and adjust
```

**Rationale**:  
*General Principle*: Calibrated confidence enables informed decisions. Flat-confidence communication:
- Doesn't help users assess risk
- Makes all statements seem equally reliable/unreliable
- Fails to signal when extra review is needed

**Impact Assessment**:
- **Decision Quality**: High — Users can allocate attention appropriately
- **Trust Calibration**: High — Builds appropriate reliance
- **Effort**: Low — Guideline addition

---

### V5: Consolidate Communication Guidelines

**Section**: Stage 4 and Stage 6 (currently Stage 3 and Stage 5)  
**Current Issue**: Communication/tone guidance split across two locations:
- Stage 3, „Adaptive Communication Formality" (line 548-590)
- Stage 5, „Interaction Optimization" (line 534-547)

**Proposed Consolidation**: Merge into Stage 6 (Neural Symbiosis Integration) as the single source of truth for communication patterns:

```markdown
### Stage 6: Neural Symbiosis Integration
**Communication & Collaboration Framework**

[Merge content from both sections here, organized as:]
1. Interaction Optimization (confidence scoring, transparency, progress reporting)
2. Adaptive Communication Formality (mode-based tone, baseline personality)
3. Collaborative Enhancement (proactiveness, backtracking acknowledgment, user rules)
```

**Rationale**:  
*General Principle*: Single source of truth prevents contradictions. Scattered guidelines:
- Create maintenance burden (update in multiple places)
- Risk inconsistent guidance developing over versions
- Force readers to mentally merge related content

**Impact Assessment**:
- **Coherence**: Medium — Eliminates potential contradictions
- **Maintainability**: Medium — Single location for updates
- **Effort**: Medium — Requires content merging and cross-reference updates

---

### V6: Add Multi-Modal Processing Guidance

**Section**: New subsection in MODEL CAPABILITIES or Stage 3  
**Current State**: No mention of image/diagram processing despite model capability

**Proposed Addition**:
```markdown
### Multi-Modal Input Handling

Modern models can process visual inputs. When images are provided:

**Screenshot Analysis**:
1. Identify UI elements, layout structure, visual hierarchy
2. Note error messages, console output, or status indicators
3. Cross-reference with code context to locate relevant components
4. Describe findings before taking action

**Diagram Interpretation**:
1. Parse architecture diagrams for components and connections
2. Identify data flow directions and boundaries
3. Map diagram elements to code structures
4. Ask for clarification on ambiguous notations

**Code Screenshot OCR**:
1. Extract visible code carefully (watch for truncation)
2. Note line numbers if visible
3. Acknowledge uncertainty for partially visible content
4. Prefer requesting file access over working from screenshots

**When to Request Clearer Input**:
- Image resolution too low to read text
- Relevant content cut off at edges
- Multiple overlapping elements obscure meaning
- Handwritten or non-standard notation
```

**Rationale**:  
*General Principle*: Document all relevant capabilities. Omitting multi-modal guidance:
- Leaves behavior undefined when images are provided
- Misses opportunity to establish quality standards for visual analysis
- Doesn't leverage full model capabilities

**Impact Assessment**:
- **Capability Coverage**: Medium — Addresses growing use case
- **Quality**: Medium — Sets standards for image analysis
- **Effort**: Low — Section addition

---

## 🟢 OPTIONAL REFINEMENTS — Future Consideration

### O1: Domain Extensibility Template

**Section**: Appendix or end of Stage 2 (Domain-Specific Expertise)  
**Purpose**: Enable systematic addition of new domains

**Proposed Template**:
```markdown
## Appendix A: Domain Template

Use this template when adding new domain expertise to Stage 2:

### [Icon] [Domain Name] Domain

**Technology Stack Defaults**:
- **Primary**: [Main language/framework]
- **Secondary**: [Supporting tools]
- **Build System**: [Build/package tools]

**Project Initialization**:
```bash
# Standard project setup command
[command here]
```

**Architecture Patterns**:
1. **[Pattern Name]**: [Location pattern, naming convention, example]
2. **[Pattern Name]**: [Location pattern, naming convention, example]

**Best Practices**:
- Practice with rationale...
- Practice with rationale...

**Testing Protocol**:
- Unit testing approach
- Integration testing approach
- Verification commands

**Common Pitfalls to Avoid**:
- ❌ [Pitfall]: [Why it's bad] → [What to do instead]
```

**Impact**: Low-Medium — Aids systematic prompt evolution

---

### O2: Operationalize Quality Scorecard

**Section**: PROMPT QUALITY SCORECARD enhancement  
**Current State**: Checklist with binary ✅ items

**Proposed Enhancement**:
```markdown
| Criterion | Metric | Target | Measurement |
|-----------|--------|--------|-------------|
| Tool Usage Fidelity | Error rate per session | <5% | Count tool errors / total tool calls |
| Verification Rigor | Coverage rate | 100% | Code changes with verification / total changes |
| Artifact Currency | Staleness | <2 task boundaries | Task boundaries since last artifact update |
| Response Relevance | Topic drift | <10% | Off-topic sentences / total sentences |
| Error Recovery | Resolution rate | >80% | Errors resolved in ≤2 attempts / total errors |
```

**Impact**: Low — Useful for systematic prompt optimization

---

### O3: Version Migration Changelog

**Section**: VERSION HISTORY enhancement  
**Purpose**: Help users upgrade between versions

**Proposed Format**:
```markdown
## VERSION HISTORY

### v2.4 → Upgrade Guide from v2.3
**Breaking Changes**:
- [Change]: [How to update]t

**New Features to Leverage**:
- [Feature]: [How to use]

**Deprecated Patterns**:
- [Old pattern]: [New recommended approach]

---
### v2.3 (Full changelog below)
...
```

**Impact**: Low — Maintenance convenience for prompt maintainers

---

### O4: Collaborative Handoff Protocol

**Section**: New addition to Stage 6 or Appendix  
**Purpose**: Handle human-AI co-development scenarios

**Proposed Addition**:
```markdown
### Collaboration Handoff Protocol

When working alongside human developers on shared code:

**Starting Handoff**:
- State clearly what's implemented vs. stubbed
- List known issues or incomplete areas
- Identify files modified in current session
- Flag any breaking changes to existing interfaces

**Receiving Handoff**:
- Ask what changed since last AI session
- Request summary of human developer's recent work
- Verify assumptions about current state before editing
- Acknowledge uncertainty about externally-modified code

**Merge Conflict Prevention**:
- Prefer modular additions over interspersed edits
- Create new files when possible instead of heavily editing shared files
- Document interface contracts that shouldn't change
- Propose refactoring before implementing if structural changes needed
```

**Impact**: Low-Medium — Addresses emerging team workflow patterns

---

### O5: Long-Running Task Continuation Strategy

**Section**: Stage 0 enhancement or new subsection  
**Purpose**: Handle tasks spanning multiple sessions beyond artifact persistence

**Proposed Addition**:
```markdown
### Multi-Session Task Strategy

For tasks expected to span multiple sessions:

**Session End Protocol**:
1. Update task.md with precise current state
2. Document any in-progress work with clear resume points
3. List blocked items and what they're waiting for
4. Capture any runtime state that won't persist (running servers, env vars)

**Session Resume Protocol**:
1. Read most recent task file from `.agent/tasks/`
2. Verify file system state matches documented progress
3. Identify any external changes since last session
4. Explicitly confirm context before continuing: "Resuming [task] from [checkpoint]. Last completed: [item]. Next: [item]. Correct?"

**Progress Checkpoints**:
- Create formal checkpoints at natural boundaries (feature complete, phase end)
- Tag checkpoints in task.md with timestamps
- Consider git commits as synchronization points
```

**Impact**: Low-Medium — Improves continuity for complex projects

---

## Summary Table

| ID | Priority | Category | Effort | Impact |
|----|----------|----------|--------|--------|
| C1 | 🔴 Critical | Identity | Low | High |
| C2 | 🔴 Critical | Portability | Medium | Critical |
| C3 | 🔴 Critical | Safety | Medium | Critical |
| C4 | 🔴 Critical | Performance | Low | High |
| V1 | 🟡 Valuable | Structure | Low | Medium |
| V2 | 🟡 Valuable | Structure | Low | Medium |
| V3 | 🟡 Valuable | Reliability | Low | High |
| V4 | 🟡 Valuable | Trust | Low | High |
| V5 | 🟡 Valuable | Coherence | Medium | Medium |
| V6 | 🟡 Valuable | Capabilities | Low | Medium |
| O1 | 🟢 Optional | Extensibility | Low | Low-Medium |
| O2 | 🟢 Optional | Metrics | Low | Low |
| O3 | 🟢 Optional | Maintenance | Low | Low |
| O4 | 🟢 Optional | Collaboration | Low | Low-Medium |
| O5 | 🟢 Optional | Continuity | Low | Low-Medium |

---

## Implementation Recommendation

**Immediate Actions (v2.4 Hotfix)**:
1. Fix identity attribution (C1) — 5 minutes
2. Add alignment boundaries (C3) — 30 minutes
3. Add context window budgets (C4) — 20 minutes

**Next Minor Version (v2.5)**:
1. Add tool abstraction layer (C2) — 1-2 hours
2. Renumber stages (V1) — 15 minutes
3. Restructure document flow (V2) — 30 minutes
4. Add failure taxonomy (V3) — 30 minutes
5. Add confidence calibration (V4) — 20 minutes

**Future Polish (v3.0)**:
- Consolidate communication sections (V5)
- Add multi-modal guidance (V6)
- Include optional refinements (O1-O5)

---

## Appendix: Additional Observations

### Minor Inconsistencies Noted

1. **Emoji Usage**: Some sections use emoji icons (🌐, 🐍, ⚙️, 🤖, 🖼), others don't. Consider consistent emoji-per-domain pattern.

2. **Alert Block Styles**: Most use `> [!IMPORTANT]` but some warnings are plain blockquotes. Standardize to GitHub-style alerts.

3. **Code Block Languages**: Some bash examples lack language specifier. Always include ` ```bash ` for syntax highlighting.

4. **Link Format**: Section references use markdown headers directly; consider adding anchor links for long-document navigation.

5. **Table Column Alignment**: Mix of left-aligned and center-aligned; pick one standard.

### Patterns Worth Preserving

These elements of the current prompt represent best practices worth retaining:

1. **Mode Transition State Machine** (line 458-480): Visual state diagram is excellent for complex workflows
2. **Verification Rigor Matrix** (line 513-524): Task-type-specific verification is highly practical
3. **User Override Instructions** (line 72-82): Empowering users with override keywords is user-friendly
4. **Persona Evolution Permission** (line 634-636): Meta-level flexibility is forward-thinking
5. **Persistent Storage Protocol** (line 102-122): Clear artifact organization aids continuity

---

*Report generated from comprehensive analysis of ANTYGRAVITY_SP_V2.3_NOVA.md*  
*Focus: Transferable prompt engineering principles applicable beyond DVPE project context*
