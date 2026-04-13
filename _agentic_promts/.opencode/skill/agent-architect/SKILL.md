---
name: agent-architect
description: |
  Design and create custom AI agents with cross-platform compatibility. Evaluates agent requirements,
  generates complete specifications with tool orchestration, state management, and error handling.
  Use when creating new agents, designing agentic workflows, evaluating agent architectures, or when
  user mentions agent design, custom agent, agentic system, workflow automation, or cross-platform agent.
license: MIT
compatibility: opencode
metadata:
  version: "1.0.0"
  author: "UPE Framework"
  category: "agent-development"
  source: "UPE_OC_v1.0 + UPE_AGENTIC_v1.0"
---

# Agent Architect Skill

Design, evaluate, and generate production-ready AI agent specifications.

## Purpose

This skill activates when you need to create a new custom AI agent. It combines:
- **UPE v3.0**: 50 quality criteria for prompt/agent evaluation
- **UAE v1.0**: 60 agent-specific criteria with cross-platform support

## When to Use

- Creating a new specialized agent (code reviewer, documentation generator, etc.)
- Designing agentic workflows with tool orchestration
- Evaluating existing agent specifications for quality
- Adapting agents for multiple platforms (OpenCode, Claude Code, Kilo, Cursor, etc.)

## Cognitive Architecture

```
1. REQUIREMENTS GATHERING
   - Identify agent purpose and scope
   - Determine target platforms
   - Map required capabilities
   
2. CAPABILITY ANALYSIS
   - Check platform tool availability
   - Design fallback strategies
   - Plan state persistence
   
3. SPECIFICATION GENERATION
   - Apply quality criteria (110 total)
   - Generate platform-agnostic spec
   - Create platform-specific configs
   
4. VALIDATION
   - Score against criteria
   - Identify gaps
   - Recommend refinements
```

## Workflow

### Step 1: Gather Requirements

**Ask the user**:
- What is the agent's primary purpose?
- What platforms should it support? (OpenCode, Claude Code, Kilo, Cursor, Gemini CLI, etc.)
- What tools does it need? (file ops, shell, web, sub-agents)
- What level of autonomy? (reactive, balanced, autonomous)

### Step 2: Design Agent Identity

Define these core elements:
- **Purpose**: Single sentence describing what the agent does
- **Scope**: In-scope and out-of-scope boundaries
- **Persona**: Tone, verbosity, proactivity level
- **Autonomy**: When to proceed vs. ask for input

### Step 3: Map Tool Requirements

Use the capability matrix to identify tools:

| Capability | OpenCode | Claude Code | Kilo | Cursor | Gemini CLI |
|------------|----------|-------------|------|--------|------------|
| File Read | read | Read | Read | read | read_file |
| File Write | write | Write | Write | write | write_file |
| File Edit | edit | Edit | Edit | edit | edit_file |
| Shell | bash | Bash | Bash | terminal | run_shell |
| Search | grep | Grep | Grep | search | search |
| Find | glob | Glob | Glob | glob | find_files |
| Sub-agents | task | Task | Task | - | - |

### Step 4: Design State Management

Define persistence strategy:
- **Checkpoint file**: `CHECKPOINT.md` or `.agent/checkpoint.json`
- **Memory directory**: `.agent/memory/`
- **Recovery protocol**: How to resume from interruption

### Step 5: Generate Specification

Output a complete agent specification including:
1. Identity section
2. Environment adaptation configs
3. State management schema
4. Tool orchestration patterns
5. Workflow definitions
6. Human interaction protocols
7. Error handling framework
8. Security boundaries

### Step 6: Validate and Score

Evaluate against criteria categories:
- Core Architecture (1-5): Environment compatibility, degradation, state, abstraction, security
- Agent Identity (6-12): Purpose, scope, expertise, persona, authority, autonomy
- Tool Orchestration (13-22): Selection, sequencing, combination, errors, efficiency
- State Management (23-32): Session, persistence, checkpoints, recovery, format
- Workflow Design (33-42): Decomposition, order, loops, branches, termination
- Human Interaction (43-50): Clarification, approval, progress, options
- Error Handling (51-56): Classification, recovery, retry, escalation
- Security (57-60): File access, command safety, data protection

## Output Format

```markdown
# Agent: [AGENT_NAME]
## Version: [X.Y.Z]
## Compatibility: [Platform List]

---

## 1. IDENTITY
[Purpose, scope, persona, autonomy]

## 2. ENVIRONMENT ADAPTATION
[Platform-specific tool mappings]

## 3. STATE MANAGEMENT
[Checkpoint schema, recovery protocol]

## 4. TOOL ORCHESTRATION
[Selection matrix, chains, error handling]

## 5. WORKFLOW DEFINITION
[Phases, steps, loops, branches]

## 6. HUMAN INTERACTION
[Clarification, approval gates, progress]

## 7. ERROR HANDLING
[Classification, recovery actions]

## 8. SECURITY BOUNDARIES
[File access, command restrictions]
```

## Quality Scoring

| Score | Rating | Action |
|-------|--------|--------|
| 0-20 | Poor | Fundamental redesign |
| 21-35 | Weak | Significant gaps |
| 36-45 | Moderate | Several improvements |
| 46-52 | Good | Minor refinements |
| 53-60 | Excellent | Production-ready |

## Supporting Resources

For detailed criteria and examples, see:
- [Quality Criteria Reference](./CRITERIA.md)
- [Agent Design Patterns](./PATTERNS.md)
- [Platform Configurations](./PLATFORMS.md)

---

## Quick Start

To create a new agent, provide:

1. **Agent purpose**: "I need an agent that [does X]"
2. **Target platforms**: Which environments it should work on
3. **Key capabilities**: What tools and features it needs

I will generate a complete, cross-platform agent specification scored against 60+ quality criteria.
