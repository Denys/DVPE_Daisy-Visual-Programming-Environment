# UPE v3.0 APPENDICES
## Technique Categories & Example Evaluations

---

## APPENDIX A: PROMPTING TECHNIQUE CATEGORIES (v3.0 Updated)

### Overview

The 14 technique categories have been updated for 2025 capabilities, adding techniques for extended thinking, tool orchestration, memory integration, and agentic workflows. New techniques marked with 🆕.

---

### Category 1: Foundation Techniques

Core prompting methods that form the basis of all interactions.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Zero-Shot Prompting** | Direct instruction without examples | Simple, well-defined tasks |
| **Few-Shot Prompting** | Include examples to guide behavior | Pattern-following tasks, format specification |
| **Dynamic Few-Shot** | Select examples based on query similarity | Large example pools, diverse task types |
| **Direct Instruction** | Explicit step-by-step commands | Procedural tasks, compliance-critical |
| **Chain-of-Thought (CoT)** | "Think step by step" reasoning | Complex reasoning, math, logic |
| **Self-Consistency** | Generate multiple reasoning paths, aggregate | High-stakes decisions, uncertainty reduction |
| **Auto-CoT** | Automatically generate reasoning chains | Scaling CoT without manual examples |
| 🆕 **Extended Thinking** | Dedicated reasoning phase before response | Complex multi-step problems, deep analysis |
| 🆕 **Thinking Budget Control** | Specify thinking duration/depth | Balance speed vs. thoroughness |

**v3.0 Addition**: Extended thinking is now a first-class technique with explicit budget control. Use when task complexity justifies inference cost.

---

### Category 2: Advanced Reasoning Chains

Sophisticated reasoning structures for complex problem-solving.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Logical CoT** | Explicit logical operators in reasoning | Formal logic, argument analysis |
| **Chain-of-Symbol** | Symbolic representation in reasoning | Math, formal systems, code logic |
| **Tree-of-Thoughts** | Branch and explore multiple paths | Creative problems, optimization |
| **Graph-of-Thought** | Non-linear reasoning with connections | Complex systems, relationship analysis |
| **System 2 Attention** | Deliberate, focused analysis | Ambiguous inputs, critical details |
| **Multi-Hop Reasoning** | Chain inferences across facts | Knowledge synthesis, QA |
| **Analogical Reasoning** | Map known solutions to new problems | Novel problems with similar precedents |
| **Causal Reasoning Chains** | Trace cause-effect relationships | Root cause analysis, prediction |
| 🆕 **Extended Thinking + Tools** | Interleave reasoning with tool use | Research tasks, verification chains |
| 🆕 **Recursive Decomposition** | Break problem, solve parts, recompose | Large-scale analysis, document processing |

**v3.0 Addition**: Extended thinking now supports tool use during reasoning phase—model can search, fetch, calculate mid-thought.

---

### Category 3: Augmented Generation

Enhance responses with external knowledge and verification.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Retrieval-Augmented Generation (RAG)** | Fetch relevant context before generating | Knowledge-intensive tasks |
| **ReAct** | Interleave Reasoning and Acting (tool use) | Agentic tasks, multi-step execution |
| **Chain-of-Verification (CoVe)** | Verify claims within response | Factual accuracy critical |
| **Chain-of-Note (CoN)** | Generate notes before synthesis | Document analysis, research |
| **Chain-of-Knowledge (CoK)** | Explicit knowledge retrieval steps | Domain expertise tasks |
| **Knowledge-Augmented Generation** | Integrate structured knowledge | Technical documentation, standards |
| **Context-Enriched Generation** | Layer multiple context sources | Complex background required |
| **Multi-Source Integration** | Synthesize across diverse sources | Research, comparative analysis |
| 🆕 **Memory-Augmented Generation** | Load persistent memory before generating | Multi-session projects, personalization |
| 🆕 **MCP-Augmented Generation** | Integrate MCP server data in real-time | Enterprise integrations, live data |

**v3.0 Addition**: Memory Tool enables true cross-session context. MCP provides standardized access to 75+ external systems.

---

### Category 4: Interactive & Adaptive

Techniques that adjust based on user input and context.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Active-Prompt** | Request clarification proactively | Ambiguous inputs |
| **Automatic Prompt Engineering (APE)** | Self-optimize prompt structure | Iterative refinement |
| **Dynamic Prompt Adjustment** | Modify approach mid-conversation | Evolving requirements |
| **Feedback-Loop Prompting** | Incorporate user feedback iteratively | Collaborative refinement |
| **Progressive Refinement** | Build response incrementally | Complex deliverables |
| **Iterative Improvement** | Multiple passes with enhancement | Quality-critical outputs |
| **Adaptive Context Management** | Adjust context window usage dynamically | Long conversations |
| **User-Guided Refinement** | Explicit user steering points | Preference-sensitive tasks |
| 🆕 **Checkpoint-Based Interaction** | Pause for user validation at key points | Long-running tasks, high-stakes |
| 🆕 **Multi-Assumption Clarification** | Stop if >1 assumption needed, ask with options | Prevent wrong-direction analysis |

**v3.0 Addition**: Checkpoint pattern critical for agentic workflows. Multi-assumption rule prevents token waste.

---

### Category 5: Tool Integration & Reasoning

Techniques for effective tool utilization.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Automatic Reasoning & Tool-Use (ART)** | Automated tool selection based on task | General tool-augmented tasks |
| **Contrastive Chain-of-Thought (CCoT)** | Compare with/without tool results | Tool value assessment |
| **Tool-Augmented Prompting** | Explicit tool usage instructions | Specific tool requirements |
| **Function Calling Integration** | Structured API/function invocation | System integration |
| **API-Aware Prompting** | Design prompts for API constraints | API-driven applications |
| **System Integration Chains** | Orchestrate across multiple systems | Enterprise workflows |
| **Multi-Tool Orchestration** | Coordinate multiple tools | Complex pipelines |
| 🆕 **Tool Search Discovery** | Dynamic tool finding via search | Large tool libraries (>10) |
| 🆕 **Programmatic Tool Calling** | Code-based tool orchestration | 5+ tool workflows |
| 🆕 **Parallel Tool Execution** | Concurrent independent operations | Efficiency-critical |
| 🆕 **Deferred Tool Loading** | Load definitions on-demand | Token conservation |
| 🆕 **Result Filtering Before Context** | Process tool output before injection | Large result sets |

**v3.0 Addition**: Tool Search, Programmatic Calling, and Parallel Execution are paradigm shifts from sequential tool use.

---

### Category 6: Consistency & Quality

Ensure reliable, high-quality outputs.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Output Consistency Checking** | Verify response internal consistency | Multi-part responses |
| **Cross-Validation Chains** | Validate across multiple sources/methods | High-stakes accuracy |
| **Quality Assurance Prompting** | Explicit quality criteria in prompt | Professional deliverables |
| **Error Detection & Correction** | Self-check and fix errors | Technical outputs |
| **Style Maintenance** | Consistent voice/format throughout | Long-form content |
| **Format Enforcement** | Strict output structure requirements | Structured data extraction |
| **Coherence Verification** | Check logical flow and connections | Complex arguments |
| 🆕 **Artifact Completeness Check** | Verify no truncation, all sections present | Code, documents |
| 🆕 **Citation Validation** | Verify claims match cited sources | Research, factual content |

**v3.0 Addition**: Artifact completeness critical for code/document generation. Citation validation for search-augmented responses.

---

### Category 7: Emotional & Tone Management

Handle interpersonal and communicative aspects.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Empathy-Based Prompting** | Acknowledge emotional context | Support, sensitive topics |
| **Tone Modulation** | Adjust formality/warmth dynamically | Audience adaptation |
| **Sentiment-Aware Generation** | Respond appropriately to user sentiment | Customer service, support |
| **Cultural Sensitivity Chains** | Consider cultural context | Global audiences |
| **Personality Alignment** | Match specified personality traits | Persona-based interactions |
| **Emotional Intelligence Integration** | Read and respond to emotional cues | Relationship-building |
| **Context-Appropriate Voice** | Match situational requirements | Professional vs. casual |
| 🆕 **Expertise-Level Calibration** | Match technical depth to user level | Technical communication |
| 🆕 **Peer-to-Peer Technical Mode** | Skip fundamentals for experts | Expert users |

**v3.0 Addition**: Expertise calibration prevents over-explanation for advanced users.

---

### Category 8: Code & Technical

Specialized techniques for programming and technical tasks.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Scratchpad Prompting** | Working space for intermediate steps | Complex calculations |
| **Program-of-Thoughts** | Express reasoning as executable code | Computational problems |
| **SCoT (Structure Chain-of-Thought)** | Structured reasoning for code | Algorithm design |
| **Chain-of-Code** | Generate code step-by-step with explanation | Teaching, documentation |
| **Test-Driven Prompting** | Specify tests before implementation | Quality-critical code |
| **Documentation Generation** | Create docs alongside code | Maintainable code |
| **Code Review Chains** | Systematic code analysis | Quality assurance |
| **Architecture Design Patterns** | Apply known patterns | System design |
| 🆕 **REPL-Verified Generation** | Execute code to verify correctness | Calculations, data processing |
| 🆕 **Bash-Augmented Development** | Use shell for file operations, testing | File-based tasks |
| 🆕 **Artifact-Based Code Delivery** | Complete, runnable code in artifacts | Production code |
| 🆕 **Skills-Based Generation** | Load skill folders for specialized output | docx, pptx, xlsx, pdf |

**v3.0 Addition**: Skills system provides specialized templates for document generation.

---

### Category 9: Optimization & Performance

Maximize efficiency and effectiveness.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Optimization by Prompting** | Guide model toward optimal solutions | Constrained optimization |
| **Token Efficiency** | Minimize tokens while preserving quality | Cost/latency sensitive |
| **Response Time Optimization** | Design for speed | Real-time applications |
| **Resource Usage Management** | Balance capability vs. cost | Production systems |
| **Parallel Processing Chains** | Design for concurrent execution | Scalable systems |
| **Caching Strategies** | Leverage prompt caching | Repeated patterns |
| **Performance Monitoring** | Track and optimize metrics | Continuous improvement |
| 🆕 **Context Window Budgeting** | Allocate tokens across operations | Complex workflows |
| 🆕 **Tool Call Minimization** | Reduce inference passes | Latency-critical |
| 🆕 **Programmatic Orchestration** | Code-based multi-tool for efficiency | 5+ tool chains |

**v3.0 Addition**: Context window management critical for agentic workflows with many tool calls.

---

### Category 10: User Intent & Understanding

Accurately interpret what users actually need.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Rephrase and Respond** | Confirm understanding before answering | Complex requests |
| **Intent Classification** | Categorize user intent explicitly | Multi-intent handling |
| **Context Window Management** | Prioritize relevant context | Long conversations |
| **Ambiguity Resolution** | Identify and address ambiguities | Unclear requests |
| **Clarification Chains** | Systematic clarification process | Complex requirements |
| **User Preference Learning** | Adapt to stated preferences | Personalization |
| **Personalization Patterns** | Apply known user characteristics | Returning users |
| 🆕 **Memory-Based Personalization** | Load user history for context | Cross-session users |
| 🆕 **Concrete Option Clarification** | Ask with specific examples, not open-ended | Efficient disambiguation |

**v3.0 Addition**: Memory enables true personalization across sessions. Concrete options prevent vague clarification loops.

---

### Category 11: Metacognition & Reflection

Self-awareness and improvement capabilities.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Take a Step Back** | Abstract before diving into details | Complex problems |
| **Self-Reflection Chains** | Evaluate own reasoning quality | Quality-critical |
| **Error Analysis** | Systematic error identification | Debugging, improvement |
| **Learning from Mistakes** | Apply lessons from failures | Iterative refinement |
| **Strategy Adjustment** | Modify approach based on results | Adaptive workflows |
| **Process Improvement** | Refine methodology over time | Long-term optimization |
| **Outcome Evaluation** | Assess results against goals | Performance tracking |
| 🆕 **Agentic Self-Monitoring** | Track progress in multi-step execution | Autonomous tasks |
| 🆕 **Interruption Recovery** | Resume from saved state after context reset | Long-running agents |

**v3.0 Addition**: Agentic self-monitoring essential for autonomous workflows. Interruption recovery via memory persistence.

---

### Category 12: Safety & Ethics

Ensure responsible AI behavior.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Ethical Boundary Enforcement** | Explicit ethical constraints | Sensitive domains |
| **Bias Detection & Mitigation** | Identify and reduce biases | Fairness-critical |
| **Content Safety Chains** | Multi-step safety verification | Public-facing outputs |
| **Privacy-Preserving Prompting** | Protect sensitive information | Data handling |
| **Responsible AI Guidelines** | Apply organizational policies | Enterprise deployment |
| **Harmful Content Prevention** | Block dangerous outputs | Safety-critical |
| **Ethical Decision Making** | Structured ethical reasoning | Moral dilemmas |
| 🆕 **Tool Permission Verification** | Confirm authorization before tool use | Agentic systems |
| 🆕 **MCP Scope Validation** | Verify OAuth scopes before operations | External integrations |

**v3.0 Addition**: Tool and MCP permission verification critical for agentic systems with external access.

---

### Category 13: Multi-Modal Integration

Handle diverse input/output types.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Vision-Language Prompting** | Combine image and text reasoning | Image analysis |
| **Audio-Text Integration** | Process audio with text context | Transcription, audio analysis |
| **Multi-Modal Chain-of-Thought** | Reason across modalities | Complex multi-modal tasks |
| **Cross-Modal Verification** | Validate across input types | Accuracy-critical |
| **Modal Switching Strategies** | Transition between modalities | Flexible workflows |
| **Format Translation** | Convert between formats | Data transformation |
| **Media Understanding** | Analyze images, PDFs, documents | Document processing |
| 🆕 **Artifact Type Selection** | Choose optimal output format | Deliverable creation |
| 🆕 **Skills-Based Format Generation** | Use Skills for docx, pptx, xlsx, pdf | Professional documents |

**v3.0 Addition**: Skills system provides production-quality document generation across formats.

---

### Category 14: Format Transition Handling

Manage output structure and format changes.

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Nested Format Handling** | Manage formats within formats | Complex documents |
| **Hybrid Output Management** | Combine prose, code, data | Mixed deliverables |
| **Seamless Transitions** | Smooth format changes | Multi-section outputs |
| 🆕 **Artifact vs. Inline Decision** | Choose artifact or inline response | Output strategy |
| 🆕 **Create vs. Update Logic** | When to create new vs. update existing | Iterative development |
| 🆕 **Present Files Integration** | Deliver files to user properly | File-based outputs |
| 🆕 **State Management in Artifacts** | React state, not localStorage | Interactive artifacts |

**v3.0 Addition**: Artifact lifecycle management critical for modern Claude usage.

---

### Technique Selection Guide

```
START
  │
  ├─ Simple factual question?
  │   └─ Zero-Shot or Direct Instruction
  │
  ├─ Complex reasoning required?
  │   ├─ Time-sensitive? → Chain-of-Thought
  │   └─ Can use extra latency? → Extended Thinking
  │
  ├─ Current information needed?
  │   └─ RAG → web_search → CoVe for verification
  │
  ├─ Multi-step task with tools?
  │   ├─ 1-2 tools? → Sequential tool use
  │   ├─ 3-4 tools? → ReAct pattern
  │   └─ 5+ tools? → Programmatic Tool Calling
  │
  ├─ Cross-session context needed?
  │   └─ Memory-Augmented Generation
  │
  ├─ External integrations?
  │   └─ MCP-Augmented Generation
  │
  ├─ Deliverable creation?
  │   ├─ Code >20 lines? → Artifact (code type)
  │   ├─ Document? → Skills-Based Generation
  │   └─ Interactive? → Artifact (React type)
  │
  └─ User intent unclear?
      └─ Multi-Assumption Clarification with concrete options
```

---

## APPENDIX B: EXAMPLE EVALUATIONS

### Example 1: Basic Prompt Evaluation

**Submitted Prompt**:
```
You are a helpful coding assistant. Help users with their programming questions.
```

---

#### 1. Prompt Breakdown

A minimal coding assistant prompt. Specifies role (coding assistant) and general purpose (help with programming). Lacks specificity on languages, tools, output format, or behavioral constraints.

#### 2. Evaluation Against Quality Criteria

**Core Alignment (1-3)**

| Criterion | Rating | Assessment |
|-----------|--------|------------|
| Model Capability Alignment | ✔ | No impossible capabilities assumed |
| Metric Realism | ⚠ | "Helpful" is subjective, no observable criteria |
| Implementation Viability | ✔ | Instructions executable |

**Fundamental Quality (4-15)**

| Criterion | Rating | Assessment |
|-----------|--------|------------|
| Task Fidelity | ⚠ | Targets general need but too broad |
| Accuracy | N/A | No accuracy guidance provided |
| Relevance | ✔ | Aligned with coding assistance |
| Consistency | ⚠ | No style/format guidance for consistency |
| Coherence | ✔ | Simple, coherent instruction |
| Specificity | ❌ | Lacks detail on languages, formats, depth |
| Clarity of Instructions | ✔ | Clear but minimal |
| Context Utilization | ❌ | No context handling guidance |
| Error Handling | ❌ | No error handling protocol |
| Resource Efficiency | N/A | No efficiency guidance |
| User Experience | ⚠ | No UX guidance beyond "helpful" |
| Robustness | ❌ | No edge case handling |

**Technical Integration (26-34)**

| Criterion | Rating | Assessment |
|-----------|--------|------------|
| Tool Integration | ❌ | No tool usage guidance |
| Artifact Management | ❌ | No artifact strategy |
| File Processing | ❌ | No file handling guidance |

**Agentic & Persistence (43-50)**

| Criterion | Rating | Assessment |
|-----------|--------|------------|
| All criteria | ❌ | No agentic features addressed |

#### 3. Tool Orchestration Assessment

| Dimension | Rating | Assessment |
|-----------|--------|------------|
| Tool Discovery Strategy | ❌ | No tools mentioned |
| Artifact Strategy | ❌ | No code artifact guidance |
| Memory Strategy | ❌ | No session continuity |

#### 4. Strengths Analysis

1. Simple, clear role definition
2. No impossible capability assumptions
3. Easy to understand

#### 5. Identified Gaps & Refinements

**Critical Gaps**:
- No tool integration (should use artifacts for code)
- No error handling
- No specificity on languages, formats, depth
- No context utilization guidance

**Pathway Activations**:
- T3: Format Adaptation (code output needs structure)
- T3: Persona Consistency (expertise level undefined)
- T2: Tool Selection (artifacts for code)

#### 6. Refined Prompt

```markdown
# Coding Assistant

You are an expert programming assistant. Help users with code questions, debugging, and development tasks.

## Core Behaviors

1. **Clarify Before Coding**: If requirements are ambiguous or >1 interpretation exists, ask with concrete options before writing code.

2. **Code Delivery**:
   - Code snippets <20 lines: inline with explanation
   - Code >20 lines: create artifact (application/vnd.ant.code with language attribute)
   - Always include: language, purpose comment, key logic explanation

3. **Language Handling**:
   - If language not specified, ask or infer from context
   - Default to Python for general algorithms, JavaScript for web
   - Match user's existing code style when editing

4. **Error Handling**:
   - Debug requests: ask for error message and relevant code
   - Explain root cause before fix
   - Provide prevention guidance

5. **Tool Usage**:
   - Use `repl` for calculations >5 digits or data analysis
   - Use `web_search` for library documentation if uncertain
   - Use `create_file` for complete scripts user wants to save

6. **Response Structure**:
   - Lead with solution, explain after
   - Include runnable examples
   - Note edge cases and limitations
```

#### 7. Effectiveness Rating

| Version | Score | Assessment |
|---------|-------|------------|
| **Baseline** | 3/10 | Minimal, no tool integration, no specificity |
| **Refined** | 8/10 | Clear behaviors, tool guidance, error handling |

**Score Breakdown**:

| Category | Baseline | Refined | Delta |
|----------|----------|---------|-------|
| Core (1-3) | 2/3 | 3/3 | +1 |
| Fundamental (4-15) | 4/12 | 10/12 | +6 |
| Advanced (16-25) | 2/10 | 6/10 | +4 |
| Technical (26-34) | 0/9 | 6/9 | +6 |
| Tool-Specific (35-42) | 0/8 | 6/8 | +6 |
| Agentic (43-50) | 0/8 | 2/8 | +2 |
| **TOTAL** | 8/50 | 33/50 | +25 |

---

### Example 2: Tool-Heavy Prompt Evaluation

**Submitted Prompt**:
```
You are a research assistant. When users ask questions, search the web for current information, analyze documents they upload, and provide comprehensive answers with citations.
```

---

#### 1. Prompt Breakdown

Research assistant with web search, document analysis, and citation requirements. Covers multiple tool categories but lacks orchestration strategy and specificity.

#### 2. Evaluation Against Quality Criteria

**Core Alignment (1-3)**

| Criterion | Rating | Assessment |
|-----------|--------|------------|
| Model Capability Alignment | ✔ | All capabilities exist |
| Metric Realism | ⚠ | "Comprehensive" subjective |
| Implementation Viability | ✔ | Executable |

**Tool-Specific (35-42)**

| Criterion | Rating | Assessment |
|-----------|--------|------------|
| Tool Appropriateness | ⚠ | Correct tools identified but no selection logic |
| Tool Combination Strategy | ❌ | No orchestration guidance |
| Tool Error Handling | ❌ | No fallback for failed searches |
| Tool Performance Optimization | ❌ | No efficiency guidance |
| Search Strategy Effectiveness | ❌ | No query formulation guidance |
| Artifact Decision Quality | ❌ | No artifact strategy for reports |

**Agentic & Persistence (43-50)**

| Criterion | Rating | Assessment |
|-----------|--------|------------|
| Context Window Management | ❌ | No token budgeting for multi-source |
| Parallel Execution Strategy | ❌ | Could parallelize searches |
| Fallback Chain Design | ❌ | No degradation strategy |

#### 3. Tool Orchestration Assessment

| Dimension | Rating | Assessment |
|-----------|--------|------------|
| Tool Discovery Strategy | N/A | Known tools, not discovery-based |
| Orchestration Method | ❌ | No method specified (sequential assumed) |
| Fallback Design | ❌ | No error handling |
| Memory Strategy | ❌ | No multi-session support |

#### 4. Pathway Activations

- T2: Tool Selection (multi-tool task)
- T2: Parallel Execution (independent searches possible)
- T2: Fallback Chain (search may fail)
- T3: Knowledge Verification (citation accuracy)
- T3: Format Adaptation (research report format)

#### 5. Refined Prompt

```markdown
# Research Assistant

You are an expert research analyst providing well-sourced, comprehensive answers.

## Research Protocol

### 1. Query Analysis
- Decompose complex questions into searchable components
- Identify: factual claims needing verification, current events, stable knowledge
- **If >1 interpretation possible**: ask with concrete options before researching

### 2. Source Strategy

| Information Type | Tool | Approach |
|------------------|------|----------|
| Current events, recent data | `web_search` | Multiple queries, cross-reference |
| User documents | `view` uploaded files | Extract relevant sections |
| Specific URLs mentioned | `web_fetch` | Full page retrieval |
| Past conversation context | `conversation_search` | If user references prior discussion |
| Google Drive documents | `google_drive_search` | Internal document research |

### 3. Search Execution

**Query Formulation**:
- Keep queries concise (1-6 words optimal)
- Start broad, narrow if needed
- Never use site: or quotes unless user specifies

**Parallel Strategy**:
- If 3+ independent queries needed, plan all before executing
- Execute searches, then synthesize (reduces inference passes)

**Fallback Chain**:
1. Primary search fails → reformulate query
2. Still no results → broaden terms
3. Topic too recent → acknowledge, provide context available
4. Never claim "no information exists" without 2+ query attempts

### 4. Synthesis Protocol

**Citation Requirements**:
- Wrap ALL claims from sources in `` tags
- Never quote >15 words directly — paraphrase
- One quote per source maximum
- Prioritize primary sources over aggregators

**Response Structure**:
- Lead with key findings (executive summary)
- Support with evidence (cited)
- Acknowledge limitations and gaps
- Suggest follow-up if incomplete

### 5. Deliverable Format

| Output Type | Format |
|-------------|--------|
| Brief answer | Inline with citations |
| Research summary (>500 words) | Markdown artifact |
| Data analysis | Artifact with tables/charts |
| Report for external use | Markdown artifact, formal structure |

### 6. Error Handling

| Scenario | Response |
|----------|----------|
| Search returns no relevant results | State clearly, suggest alternative queries |
| Conflicting sources | Present both views with citations |
| User document unreadable | Explain issue, request alternative format |
| Topic beyond knowledge + search | Acknowledge limitation honestly |
```

#### 6. Effectiveness Rating

| Version | Score | Assessment |
|---------|-------|------------|
| **Baseline** | 4/10 | Tools mentioned, no orchestration |
| **Refined** | 8.5/10 | Complete protocol, fallbacks, parallel strategy |

**Score Breakdown**:

| Category | Baseline | Refined | Delta |
|----------|----------|---------|-------|
| Core (1-3) | 2/3 | 3/3 | +1 |
| Fundamental (4-15) | 6/12 | 10/12 | +4 |
| Advanced (16-25) | 3/10 | 7/10 | +4 |
| Technical (26-34) | 3/9 | 8/9 | +5 |
| Tool-Specific (35-42) | 2/8 | 7/8 | +5 |
| Agentic (43-50) | 0/8 | 5/8 | +5 |
| **TOTAL** | 16/50 | 40/50 | +24 |

---

### Example 3: Agentic Workflow Prompt Evaluation

**Submitted Prompt**:
```
You are an autonomous coding agent. Given a task, break it down, implement the solution, test it, and deliver working code. Work independently until complete.
```

---

#### 1. Prompt Breakdown

Agentic coding prompt with autonomy emphasis. Mentions decomposition, implementation, testing, and delivery. Critical gap: no checkpoints, no memory, no error recovery, no scope limits.

#### 2. Evaluation Against Quality Criteria

**Core Alignment (1-3)**

| Criterion | Rating | Assessment |
|-----------|--------|------------|
| Model Capability Alignment | ⚠ | "Autonomous" may imply capabilities beyond scope |
| Metric Realism | ❌ | "Working code" not observable in single response |
| Implementation Viability | ⚠ | Depends on task scope |

**Agentic & Persistence (43-50)**

| Criterion | Rating | Assessment |
|-----------|--------|------------|
| Persistent Memory Integration | ❌ | No memory for long tasks |
| Agentic Loop Design | ⚠ | Loop implied but not structured |
| Context Window Management | ❌ | No token budget for long execution |
| Fallback Chain Design | ❌ | No error recovery |
| State Persistence Strategy | ❌ | No interruption handling |

#### 3. Critical Issues

1. **No Human Checkpoints**: "Work independently until complete" is dangerous for complex tasks
2. **No Memory Integration**: Long tasks will lose context
3. **No Scope Limits**: Could attempt infinite loops
4. **No Error Recovery**: Single failure crashes workflow
5. **No Progress Persistence**: Context reset loses all work

#### 4. Pathway Activations

- T1: Safety Protocol (autonomy limits needed)
- T1: Error Recovery (critical for agentic)
- T2: Memory Integration (persistence needed)
- T2: Fallback Chain (error handling)
- T3: Validation Chain (test verification)

#### 5. Refined Prompt

```markdown
# Autonomous Coding Agent

You are a systematic coding agent that delivers working solutions through structured execution.

## Execution Architecture

### 1. Initialization (ALWAYS FIRST)
```
□ Check /memory for prior context on this task
□ Load any existing progress/state
□ Verify tool availability (bash, file ops, testing)
□ Assess task scope
```

### 2. Task Analysis

**Decomposition Protocol**:
1. Break task into discrete, testable subtasks
2. Identify dependencies between subtasks
3. Estimate complexity (simple: 1-3 steps, medium: 4-8, complex: 9+)

**Checkpoint Planning**:
- Simple tasks: Deliver complete
- Medium tasks: Checkpoint after core implementation
- Complex tasks: Checkpoint every 3-4 subtasks

**STOP CONDITIONS** (request human input):
- Task scope unclear or >1 interpretation
- Estimated >10 subtasks
- External dependencies unclear
- Security-sensitive operations needed

### 3. Implementation Loop

```
FOR each subtask:
    1. Implement with clear comments
    2. Test (unit test or manual verification)
    3. Log progress to memory (assume interruption possible)
    4. IF error:
        - Attempt fix (max 2 attempts)
        - IF still failing: checkpoint with error details
    5. IF checkpoint needed: present progress, ask to continue
```

### 4. Error Recovery Protocol

| Error Type | Response |
|------------|----------|
| Syntax error | Fix immediately, log fix |
| Logic error | Analyze, fix, add test case |
| Dependency missing | Report, suggest alternatives |
| Test failure | Debug, if >2 attempts checkpoint |
| Context limit approaching | Persist state, checkpoint |

### 5. Memory Integration

**Persist After Each Subtask**:
```
/memory/task_state.md:
- Current subtask: X of Y
- Completed: [list]
- Remaining: [list]
- Blockers: [if any]
- Key decisions: [for continuity]
```

**On Resume**:
- Load state first
- Verify prior work still valid
- Continue from last checkpoint

### 6. Tool Usage

| Operation | Tool | Notes |
|-----------|------|-------|
| File creation | `create_file` | Complete files, no truncation |
| File editing | `str_replace` | Precise edits only |
| Testing | `bash_tool` | Run tests, capture output |
| Reading | `view` | Check existing code |
| Delivery | `present_files` | Final output to user |

### 7. Delivery Protocol

**Before Final Delivery**:
```
□ All tests passing
□ Code complete (no TODOs, no truncation)
□ Dependencies documented
□ Usage instructions included
```

**Delivery Format**:
- Single-file: artifact with complete code
- Multi-file: create_file each, then present_files
- Include: README if >100 lines total

### 8. Autonomy Limits

**Proceed Autonomously**:
- Clear requirements, feasible scope
- Standard coding patterns
- <10 subtasks estimated

**Request Human Input**:
- Ambiguous requirements
- Architectural decisions with trade-offs
- >10 subtasks or >30 min estimated
- Security-sensitive code
- External service configuration
```

#### 6. Effectiveness Rating

| Version | Score | Assessment |
|---------|-------|------------|
| **Baseline** | 3/10 | Dangerous autonomy, no safeguards |
| **Refined** | 9/10 | Structured execution, checkpoints, memory, recovery |

**Score Breakdown**:

| Category | Baseline | Refined | Delta |
|----------|----------|---------|-------|
| Core (1-3) | 1/3 | 3/3 | +2 |
| Fundamental (4-15) | 4/12 | 10/12 | +6 |
| Advanced (16-25) | 3/10 | 8/10 | +5 |
| Technical (26-34) | 2/9 | 8/9 | +6 |
| Tool-Specific (35-42) | 1/8 | 7/8 | +6 |
| Agentic (43-50) | 1/8 | 8/8 | +7 |
| **TOTAL** | 12/50 | 44/50 | +32 |

---

### Example 4: MCP Integration Prompt Evaluation

**Submitted Prompt**:
```
You can access my Google Drive, Slack, and GitHub. Use these to help me with work tasks.
```

---

#### 1. Prompt Breakdown

MCP-enabled prompt with three integrations. Extremely minimal—no usage guidance, no orchestration, no error handling, no privacy considerations.

#### 2. Key Gaps

| Gap | Severity | Issue |
|-----|----------|-------|
| No MCP server specification | Critical | Which servers? URLs? |
| No authentication handling | Critical | What if scopes missing? |
| No cross-server orchestration | High | How to combine data? |
| No privacy guidance | High | Sensitive data handling? |
| No tool selection logic | Medium | When to use which? |

#### 3. Refined Prompt

```markdown
# Integrated Work Assistant

You have access to enterprise tools via MCP connectors. Use them strategically to assist with work tasks.

## Available Integrations

| Service | MCP Server | Primary Use |
|---------|------------|-------------|
| Google Drive | Connected | Documents, spreadsheets, presentations |
| Slack | Connected | Messages, channels, team context |
| GitHub | Connected | Repositories, issues, PRs, code |

## Integration Protocol

### 1. Tool Selection Logic

| Task Type | Primary Tool | Secondary |
|-----------|--------------|-----------|
| Document search/editing | Google Drive | - |
| Team communication context | Slack | - |
| Code-related tasks | GitHub | Google Drive (docs) |
| Cross-functional research | All three | Synthesize results |

### 2. Query Strategy

**Google Drive**:
- Use `google_drive_search` with specific api_query
- Fetch full docs with `google_drive_fetch` when needed
- Prefer Drive over web_search for internal documents

**Slack**:
- Search relevant channels for context
- Check recent discussions on topics
- Never share private messages externally

**GitHub**:
- Search repos for code context
- Check issues/PRs for project status
- Reference commit history for changes

### 3. Cross-Server Orchestration

**When combining sources**:
1. Query each relevant source
2. Synthesize findings (don't just concatenate)
3. Note source of each insight
4. Highlight conflicts between sources

### 4. Authentication Handling

| Scenario | Response |
|----------|----------|
| "Missing scopes" error | Explain what permission is needed, suggest user enable |
| Connection timeout | Retry once, then report issue |
| Partial access | Work with available data, note limitations |

### 5. Privacy & Security

**NEVER**:
- Share private Slack DMs in responses
- Expose API keys or secrets from repos
- Combine sensitive data from multiple sources without explicit request

**ALWAYS**:
- Confirm before accessing sensitive-looking documents
- Redact credentials if accidentally retrieved
- Note when information is internal/confidential

### 6. Response Format

**For integrated queries**:
```
## Summary
[Key findings synthesized]

## Sources
- **Drive**: [relevant docs]
- **Slack**: [relevant discussions]  
- **GitHub**: [relevant code/issues]

## Recommendations
[Actionable next steps]
```
```

#### 4. Effectiveness Rating

| Version | Score | Assessment |
|---------|-------|------------|
| **Baseline** | 2/10 | Dangerous minimal prompt, no safeguards |
| **Refined** | 8/10 | Structured MCP usage, privacy aware, orchestrated |

---

## APPENDIX C: QUICK REFERENCE CARDS

### Pathway Activation Quick Reference

```
USER SAYS/DOES                          → ACTIVATE PATHWAY
─────────────────────────────────────────────────────────────
References past conversation            → Memory Integration (T2)
Ambiguous request, multiple meanings    → Intent Clarification (T1)
Asks about sensitive/ethical topic      → Safety Protocol (T1)
Tool returns error                      → Error Recovery (T1)
Task needs 3+ tools                     → Tool Selection (T2)
Has >10 tools available                 → Consider Tool Search
Independent operations possible         → Parallel Execution (T2)
Multi-session project                   → Memory Integration (T2)
Needs specific output format            → Format Adaptation (T3)
Makes factual claims                    → Knowledge Verification (T3)
Playing specific role                   → Persona Consistency (T3)
Response too long                       → Token Efficiency (T4)
Domain expertise required               → Domain Adaptation (T5)
```

### Tool Selection Quick Reference

```
NEED                                    → TOOL
─────────────────────────────────────────────────────────────
Current information                     → web_search
Full webpage content                    → web_fetch
Past chat context                       → conversation_search / recent_chats
Internal documents                      → google_drive_search / google_drive_fetch
Complex calculation (6+ digits)         → repl
Data analysis (100+ rows)               → repl
Code >20 lines                          → artifact (code type)
Document for external use               → artifact (markdown type)
Interactive component                   → artifact (react type)
File delivery to user                   → present_files
External service integration            → MCP connector
Cross-session state                     → memory tool
User preference storage                 → memory_user_edits
```

### Criteria Priority Quick Reference

```
ALWAYS CHECK FIRST (Core 1-3):
□ No impossible capabilities assumed?
□ Success criteria observable?
□ Instructions executable?

THEN CHECK (Critical Gaps):
□ Tool integration appropriate?
□ Error handling defined?
□ Edge cases covered?
□ Format specified?

FOR AGENTIC PROMPTS (Must Have):
□ Checkpoints defined?
□ Memory integration?
□ Fallback chains?
□ Autonomy limits?
□ State persistence?
```

---

**END OF APPENDICES**
