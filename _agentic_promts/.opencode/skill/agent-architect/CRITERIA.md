# Agent Quality Criteria Reference

Complete evaluation criteria for agent design (60 criteria from UAE v1.0 + 50 from UPE v3.0).

---

## Core Architecture (1-5) — ALWAYS EVALUATE FIRST

| # | Criterion | Red Flags | Evaluation Questions |
|---|-----------|-----------|---------------------|
| 1 | **Environment Compatibility** | Assumes tools not available on target platforms | Does the agent specify fallbacks for unavailable tools? |
| 2 | **Capability Degradation** | No fallback when features unavailable | What happens when a required tool is missing? |
| 3 | **State Persistence Design** | Relies on memory that doesn't persist across sessions | How does the agent resume after interruption? |
| 4 | **Tool Abstraction Quality** | Hardcoded tool names instead of abstractions | Are tools referenced by platform-agnostic variables? |
| 5 | **Security Boundary Definition** | No limits on file access, command execution, or data exposure | What can the agent NOT do? |

---

## Agent Identity (6-12)

| # | Criterion | Evaluation Focus | Good Example |
|---|-----------|------------------|--------------|
| 6 | Purpose Clarity | Single, well-defined agent purpose | "Analyzes database queries for performance issues" |
| 7 | Scope Definition | Clear boundaries of what agent does/doesn't do | In-scope/Out-of-scope lists |
| 8 | Expertise Domain | Defined knowledge domain and limitations | "Expert in PostgreSQL, familiar with MySQL" |
| 9 | Persona Consistency | Stable voice, tone, and behavior | Professional, concise, proactive |
| 10 | Authority Level | Clear decision-making boundaries | "Can modify files, cannot delete" |
| 11 | Autonomy Specification | When to proceed vs. ask for input | Autonomy gates defined |
| 12 | Failure Identity | How agent behaves when it cannot complete task | Graceful degradation protocol |

---

## Tool Orchestration (13-22)

| # | Criterion | Evaluation Focus | Warning Signs |
|---|-----------|------------------|---------------|
| 13 | Tool Selection Logic | Right tool for each task type | Using shell for file reads |
| 14 | Tool Sequencing | Correct order of operations | Dependencies not respected |
| 15 | Tool Combination | Effective multi-tool workflows | Redundant tool calls |
| 16 | Tool Error Handling | Graceful failure and recovery | No try/catch patterns |
| 17 | Tool Efficiency | Minimal tool calls for result | Excessive intermediate steps |
| 18 | Tool Abstraction | Platform-agnostic tool references | Hardcoded tool names |
| 19 | Fallback Chains | Alternative paths when tools fail | Single point of failure |
| 20 | Parallel Execution | Independent operations run concurrently | Sequential when parallel possible |
| 21 | Tool Discovery | Dynamic tool availability checking | Assumes all tools exist |
| 22 | Tool Result Validation | Verify tool outputs before proceeding | Unchecked tool results |

---

## State Management (23-32)

| # | Criterion | Evaluation Focus | Implementation |
|---|-----------|------------------|----------------|
| 23 | Session State Design | Within-session progress tracking | Progress variables |
| 24 | Cross-Session Persistence | State survives session restarts | CHECKPOINT.md file |
| 25 | Checkpoint Strategy | Regular progress saves | Every N steps or milestones |
| 26 | Recovery Protocol | Resume from interruption | "ON SESSION START" routine |
| 27 | State File Format | Readable, parseable state format | Markdown or JSON |
| 28 | State Conflict Resolution | Handle concurrent modifications | Timestamp-based merging |
| 29 | State Cleanup | Remove stale/obsolete state | Archive old checkpoints |
| 30 | State Versioning | Track state schema changes | Version field in checkpoint |
| 31 | Minimal State Principle | Store only what's necessary | No redundant data |
| 32 | State Location Strategy | Where state files live | `.agent/` directory |

---

## Workflow Design (33-42)

| # | Criterion | Evaluation Focus | Pattern |
|---|-----------|------------------|---------|
| 33 | Task Decomposition | Complex tasks broken into steps | Numbered step lists |
| 34 | Execution Order | Correct dependency handling | DAG-like flow |
| 35 | Loop Design | Iteration patterns (for, while, until) | FOR each file IN... |
| 36 | Branching Logic | Conditional execution paths | IF condition THEN... |
| 37 | Termination Conditions | Clear completion criteria | Success/Failure/Handoff |
| 38 | Progress Reporting | User visibility into progress | Status updates |
| 39 | Intermediate Outputs | Useful partial results | Incremental deliverables |
| 40 | Workflow Resumability | Can restart from any point | Step-level checkpoints |
| 41 | Workflow Composition | Combine sub-workflows | Modular phases |
| 42 | Workflow Validation | Verify workflow correctness | Pre-execution checks |

---

## Human Interaction (43-50)

| # | Criterion | Evaluation Focus | Protocol |
|---|-----------|------------------|----------|
| 43 | Clarification Protocol | When and how to ask questions | >1 assumption = STOP and ask |
| 44 | Approval Gates | What requires human approval | Delete, push, >10 files |
| 45 | Progress Communication | How to report status | Milestone updates |
| 46 | Error Communication | How to report failures | Error code + context |
| 47 | Option Presentation | How to present choices | A/B/C with implications |
| 48 | Input Validation | Verify human inputs | Type and range checks |
| 49 | Interruption Handling | Respond to user interrupts | Pause/resume protocol |
| 50 | Handoff Protocol | When to escalate to human | Escalation triggers |

---

## Error Handling (51-56)

| # | Criterion | Evaluation Focus | Implementation |
|---|-----------|------------------|----------------|
| 51 | Error Classification | Categorize error types | E001-E007 codes |
| 52 | Error Recovery Actions | Specific fix for each error type | Recovery table |
| 53 | Retry Strategy | When and how to retry | Exponential backoff |
| 54 | Error Escalation | When to involve human | After N retries |
| 55 | Error Logging | Record errors for debugging | errors.md file |
| 56 | Graceful Degradation | Partial success when full fails | Fallback outputs |

---

## Security & Safety (57-60)

| # | Criterion | Evaluation Focus | Boundaries |
|---|-----------|------------------|------------|
| 57 | File Access Boundaries | Restrict to workspace | ALLOWED/FORBIDDEN paths |
| 58 | Command Execution Safety | Dangerous command prevention | Forbidden commands list |
| 59 | Data Exposure Prevention | No secrets in outputs | Sanitization rules |
| 60 | Resource Limits | Prevent runaway operations | Timeouts, max iterations |

---

## UPE Prompt Quality Criteria (Supplementary)

These 50 criteria from UPE v3.0 apply to the agent's instruction quality:

### Core Alignment (1-3)
- Model Capability Alignment
- Metric Realism
- Implementation Viability

### Fundamental Quality (4-15)
- Task Fidelity, Accuracy, Relevance
- Consistency, Coherence, Specificity
- Clarity of Instructions, Context Utilization
- Error Handling, Resource Efficiency
- User Experience, Robustness

### Advanced Capabilities (16-25)
- Scalability, Explainability
- Dynamic Response Handling
- Instruction Flexibility
- Self-Reflection Capability
- Iterative Refinement Support
- User Intent Recognition
- Goal Alignment Across Turns
- Multi-Modal Adaptability
- Inter-Format Consistency

### Technical Integration (26-34)
- API/Function Integration
- Artifact Management
- File Processing
- Tool Integration
- Format Transitions
- Ethical Alignment
- Technical Strategy
- Multi-Modal Handling
- Knowledge Integration

### Tool-Specific (35-42)
- Tool Appropriateness
- Tool Combination Strategy
- Tool Error Handling
- Tool Performance Optimization
- Search Strategy Effectiveness
- Artifact Decision Quality
- Analysis Tool Usage
- External Integration Quality

### Agentic & Persistence (43-50)
- Persistent Memory Integration
- External System Orchestration
- Agentic Loop Design
- Context Window Management
- Tool Discovery Efficiency
- Parallel Execution Strategy
- Fallback Chain Design
- State Persistence Strategy

---

## Scoring Guide

### Per-Criterion Scoring

| Score | Meaning |
|-------|---------|
| 0 | Not addressed at all |
| 0.5 | Partially addressed, significant gaps |
| 1 | Fully addressed |

### Category Weights

| Category | Max Score | Weight |
|----------|-----------|--------|
| Core Architecture | 5 | Critical |
| Agent Identity | 7 | High |
| Tool Orchestration | 10 | High |
| State Management | 10 | Medium |
| Workflow Design | 10 | Medium |
| Human Interaction | 8 | Medium |
| Error Handling | 6 | High |
| Security | 4 | Critical |
| **Total** | **60** | |

### Rating Tiers

| Score | Rating | Production Readiness |
|-------|--------|---------------------|
| 53-60 | Excellent | Ready for production |
| 46-52 | Good | Minor refinements needed |
| 36-45 | Moderate | Several improvements needed |
| 21-35 | Weak | Significant gaps to address |
| 0-20 | Poor | Fundamental redesign needed |
