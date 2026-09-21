# PubMed, literature and scholar evaluation

Use when: pubmed, literature review, gget, scholar evaluation.

Answer a research question with reproducible searches and source-supported evidence, without fabricating papers.

## Inspect first

- Question, population/system, outcomes and inclusion criteria
- Database query, dates, filters and identifiers
- Full text availability, study design, corrections/retractions and conflicts

## Method

1. Define the question and inclusion/exclusion criteria before searching. Record exact queries, database and retrieval date; deduplicate by stable identifiers.
2. Verify title, authors, date and DOI/PMID against the primary record. Read enough source content to support each claimed result and distinguish abstract-only access.
3. Extract study design, sample, comparison, effect/uncertainty and limitations. Separate association, mechanism and causal inference; examine contradictory results.
4. Use gget/database clients only when installed and document database/version/identifier mapping. Assess scholar output by relevant evidence and contribution, not a fabricated reputation score.

## Failure cases

- A search snippet is treated as a full-paper result.
- Retracted or corrected work is cited without checking status.
- Gene aliases map to the wrong organism or assembly.

## Verification

- Reproduce at least one exact query and resolve every cited identifier.
- Check that each conclusion is supported by the linked source.
- Mark unavailable full text and unresolved contradictions.

## Worked scenario

A review table records population, intervention, comparator, outcome and uncertainty for each included study rather than counting positive abstracts.

## Version-sensitive primary references

- [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/help/) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.ncbi.nlm.nih.gov](https://www.ncbi.nlm.nih.gov/books/NBK25501/) — Read the official source for the installed version before relying on a version-sensitive API.
- [github.com](https://github.com/pachterlab/gget) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
