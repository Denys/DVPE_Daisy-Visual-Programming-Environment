# Agent Design Patterns

Common architectural patterns for different agent types.

---

## Pattern 1: Task-Specific Agent

**Use Case**: Single-purpose automation (code review, testing, linting)

### Characteristics
```yaml
Identity: Narrow scope, deep expertise
Tools: Minimal set, well-defined
State: Simple checkpoint
Workflow: Linear with clear termination
Autonomy: High within narrow scope
```

### Template
```markdown
# Agent: [Task]Agent

## Purpose
[Single specific task]

## Scope
**In Scope**: [Narrow list]
**Out of Scope**: Everything else

## Workflow
1. Receive input
2. Validate input
3. Execute task
4. Return result

## Tools Required
- ${FILE_READ}
- ${FILE_WRITE}
- [1-2 task-specific tools]

## State
Minimal - single checkpoint at completion
```

### Example Agents
- CodeReviewAgent
- LintFixerAgent
- TestRunnerAgent
- DocumentationGeneratorAgent

---

## Pattern 2: Workflow Orchestrator Agent

**Use Case**: Multi-step processes (CI/CD, deployment, migration)

### Characteristics
```yaml
Identity: Coordination role, broad oversight
Tools: Broad set, composable
State: Rich checkpoint with phase tracking
Workflow: Branching with parallel paths
Autonomy: Moderate - checkpoints at phase transitions
```

### Template
```markdown
# Agent: [Process]OrchestratorAgent

## Purpose
Coordinate multi-step [process] workflow

## Phases
1. **Preparation**: Gather inputs, validate prerequisites
2. **Execution**: Run main workflow steps
3. **Validation**: Verify results
4. **Cleanup**: Finalize and report

## Workflow Pattern
```
PHASE 1: Preparation
  ├─ Step 1.1: Validate inputs
  ├─ Step 1.2: Check prerequisites
  └─ CHECKPOINT: Ready to execute

PHASE 2: Execution (Parallel where possible)
  ├─ Step 2.1: [Task A] ──┐
  ├─ Step 2.2: [Task B] ──┼─ Wait for all
  ├─ Step 2.3: [Task C] ──┘
  └─ CHECKPOINT: Execution complete

PHASE 3: Validation
  ├─ Step 3.1: Verify outputs
  ├─ Step 3.2: Run tests
  └─ CHECKPOINT: Validated

PHASE 4: Cleanup
  ├─ Step 4.1: Generate report
  └─ Step 4.2: Archive artifacts
```

## State Schema
```markdown
### Current Phase: [1-4]
### Phase Status
- [x] Preparation: COMPLETE
- [ ] Execution: IN_PROGRESS (Step 2.2)
- [ ] Validation: PENDING
- [ ] Cleanup: PENDING

### Parallel Execution Status
| Task | Status | Result |
|------|--------|--------|
| Task A | COMPLETE | Success |
| Task B | RUNNING | - |
| Task C | PENDING | - |
```
```

### Example Agents
- DeploymentOrchestratorAgent
- MigrationOrchestratorAgent
- ReleaseOrchestratorAgent

---

## Pattern 3: Knowledge Worker Agent

**Use Case**: Research, analysis, documentation

### Characteristics
```yaml
Identity: Analytical, thorough, methodical
Tools: Read-heavy, search-focused
State: Accumulated knowledge base
Workflow: Iterative refinement
Autonomy: Low - frequent human checkpoints
```

### Template
```markdown
# Agent: [Domain]AnalystAgent

## Purpose
Research and analyze [domain] to produce [deliverable]

## Knowledge Accumulation
State builds across sessions:
- Findings log
- Source references
- Decision rationale
- Open questions

## Workflow Pattern
```
LOOP until complete:
  1. IDENTIFY knowledge gaps
  2. SEARCH for information
  3. ANALYZE findings
  4. UPDATE knowledge base
  5. CHECKPOINT
  6. ASK user: Continue or sufficient?
```

## State Schema
```markdown
### Research Progress
**Topic**: [Current focus]
**Depth**: [Surface/Moderate/Deep]

### Accumulated Knowledge
| Finding | Source | Confidence |
|---------|--------|------------|
| [fact] | [ref] | High/Med/Low |

### Open Questions
- [ ] Question 1
- [ ] Question 2

### Next Research Direction
[What to investigate next]
```
```

### Example Agents
- CodebaseAnalystAgent
- APIDocumentationAgent
- SecurityAuditAgent
- ArchitectureReviewAgent

---

## Pattern 4: Interactive Assistant Agent

**Use Case**: Pair programming, tutoring, guided tasks

### Characteristics
```yaml
Identity: Collaborative, educational, patient
Tools: Minimal intervention
State: Conversation context
Workflow: Reactive, user-driven
Autonomy: Very low - follows user lead
```

### Template
```markdown
# Agent: [Domain]AssistantAgent

## Purpose
Guide user through [domain] tasks interactively

## Interaction Style
- Ask before acting
- Explain reasoning
- Offer alternatives
- Confirm understanding

## Workflow Pattern
```
LOOP:
  1. WAIT for user input
  2. UNDERSTAND intent
  3. IF unclear: ASK clarifying question
  4. PROPOSE action with explanation
  5. WAIT for approval
  6. EXECUTE if approved
  7. EXPLAIN result
```

## Response Format
```
I understand you want to [interpretation].

Here's my suggested approach:
[Step-by-step plan]

Shall I proceed with this? Or would you prefer:
- Option A: [alternative]
- Option B: [alternative]
```
```

### Example Agents
- CodingTutorAgent
- GitGuideAgent
- RefactoringAssistantAgent
- DebugHelperAgent

---

## Pattern 5: Autonomous Executor Agent

**Use Case**: Background tasks, batch processing, scheduled jobs

### Characteristics
```yaml
Identity: Independent, reliable, self-healing
Tools: Full automation capability
State: Comprehensive checkpoint
Workflow: Self-healing, minimal human interaction
Autonomy: Very high - runs unattended
```

### Template
```markdown
# Agent: [Task]ExecutorAgent

## Purpose
Autonomously execute [task] without human intervention

## Autonomy Rules
**Proceed automatically**:
- All read operations
- Writes within scope
- Retries up to 3x
- Fallback to alternatives

**Stop and report**:
- Security boundary violations
- Unrecoverable errors
- Resource limits exceeded
- Unexpected states

## Self-Healing
```
ON ERROR:
  1. LOG error with full context
  2. CLASSIFY error type
  3. IF recoverable:
     - APPLY recovery action
     - RETRY from last checkpoint
  4. IF not recoverable:
     - SAVE state
     - REPORT to user
     - WAIT for intervention
```

## Checkpoint Frequency
- Every N operations (configurable)
- Before any destructive operation
- After successful phase completion
- On any error

## State Schema
```markdown
### Execution Status
**Started**: [timestamp]
**Last Checkpoint**: [timestamp]
**Operations**: [N] completed, [M] remaining

### Error Log
| Time | Error | Recovery | Result |
|------|-------|----------|--------|
| [ts] | [err] | [action] | Success/Fail |

### Resource Usage
- Files processed: [N]
- Time elapsed: [duration]
- Retries used: [N]
```
```

### Example Agents
- BatchProcessorAgent
- FileOrganizerAgent
- CodeFormatterAgent
- DependencyUpdaterAgent

---

## Pattern Selection Guide

| If your agent needs to... | Use Pattern |
|---------------------------|-------------|
| Do one thing well | Task-Specific |
| Coordinate multiple steps | Workflow Orchestrator |
| Research and analyze | Knowledge Worker |
| Guide users interactively | Interactive Assistant |
| Run unattended | Autonomous Executor |

## Hybrid Patterns

Many real agents combine patterns:

- **Research + Orchestration**: Gather info, then execute multi-step plan
- **Task + Interactive**: Do specific task with user guidance
- **Autonomous + Orchestration**: Unattended multi-phase processing

Design the primary pattern first, then layer in secondary characteristics.
