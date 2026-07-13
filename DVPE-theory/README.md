# DVPE Theory

Engineering references for DSP algorithms, control mappings, and implementation constraints used by DVPE blocks.

## Guitar delay study

| Document | Role | Authority |
|---|---|---|
| [`guitar-delay-algorithms-theory-and-parameters.md`](guitar-delay-algorithms-theory-and-parameters.md) | Formula → derivation → practical values → DVPE mapping → verification | **Canonical Markdown implementation reference** |
| [`guitar_delay_algorithms_research_report.html`](guitar_delay_algorithms_research_report.html) | Detailed visual report with inline SVG diagrams and academic references | **Canonical visual research report** |
| [`archive/guitar-delay-algorithms-chat-transcript.md`](archive/guitar-delay-algorithms-chat-transcript.md) | Original PR #1 research transcript, diagrams, and addendum | Historical provenance only |
| [`archive/guitar-delay-practical-parameters.md`](archive/guitar-delay-practical-parameters.md) | Original PR #2 parameter/range note | Historical provenance only |

## Maintenance rule

Update the canonical Markdown file when formulas, defaults, ranges, constraints, or DVPE metadata change. The archive files preserve source history and should not be independently maintained as competing specifications.

Parameter values are classified inside the canonical document as:

- `SRC`: directly source-supported;
- `DERIVED`: calculated from an explicit formula or target;
- `REC`: recommended DVPE/Daisy starting point requiring target verification.
