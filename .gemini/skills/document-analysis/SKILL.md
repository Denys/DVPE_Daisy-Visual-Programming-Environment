---
name: document-analysis
description: |
  Analyze, index, and map reference documents for quick repeated access using Gemini's logic.
  Extract structure, key entities, and cross-references from PDFs, markdown, and code.
  Enhances standard analysis with web search for latest documentation versions.
  Use when: indexing reference books, technical manuals, or project docs.
  keywords: document analysis, index, pdf, search, reference, extraction
---

# Document Analysis and Indexing Skill (Gemini Enhanced)

## Overview
Create reusable indexes from reference documents to speed up information retrieval.
**Gemini Enhancements**: Verify document currency via web search and augment local docs with online API references.

## Directives Used
- `directives/analyze_document_structure.md`
- `directives/create_document_index.md`
- `directives/query_document_index.md`

## Workflow

### Step 1: Verification & Analysis
**Action**: Check if document is up-to-date.
**Gemini Search**: "latest version of [Document Title]"
**Directive**: `directives/analyze_document_structure.md`
**Input**: Document path
**Output**: Structure map + version check note

### Step 2: Create Index
**Directive**: `directives/create_document_index.md`
**Input**: Structure map
**Output**: `.tmp/indexes/{document_name}_index.json`
1. Extract entities (classes, methods).
2. **Gemini Augmentation**: If entities seem deprecated (based on search), flag them in the index.
3. Build JSON index.

### Step 3: Query & Contextualize
**Directive**: `directives/query_document_index.md`
**Input**: Query + index file
**Output**: Answer with references
1. Match query to index.
2. Return code/text snippets.
3. **Gemini Check**: If result is a code library, `search("[Library] [Function] best practices 2026")` to ensure usage is modern.

## Validation
- [ ] Document version verified
- [ ] Index created
- [ ] Search-augmented context provided

## Resources
- [Index Format Schema](./INDEX_FORMAT.md)
