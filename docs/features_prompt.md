# Techcorner.Tech CV Bank Feature Prompt

Use this prompt to onboard developers with what already exists in the repository. It summarises the end-to-end features, safeguards, and demo capabilities implemented so far.

## Purpose and Workflow
- **Mission:** Maintain a consented CV bank that stays dormant until a corporate client submits a job description (JD). Only then does the system anonymise PII, run matching, and return a human-reviewable shortlist.
- **Flow:** CV intake via explicit-consent form → storage in a dedicated CV store with retention controls → JD intake + parsing → deterministic matching and scoring → explanation-rich shortlist for recruiter oversight.

## Data Intake and Privacy
- **CV capture:** Structured fields for identity (non-scoring), education, experience, industry, skills, salary expectation, location/relocation, certifications, work history, languages/awards, upload date, and optional social links.
- **Consent + minimisation:** Intake explicitly records processing consent, collects only needed attributes, and omits sensitive signals (e.g., nationality) from ranking. PII (name, profile links) is removed before matching.
- **Retention + deletion:** CV records track retention periods and enforce deletion eligibility checks before retrieval.

## Storage and APIs
- **Dedicated CV store:** In-memory reference implementation with create/list/query operations that require valid consent and respect retention windows.
- **Scoped access:** Store and pipeline APIs make it easy to swap in a real database without changing business logic while keeping CV data isolated from other platform data.

## JD Intake and Parsing
- **Structured JD model:** Title, location, education/field requirements, required/preferred skills, minimum experience, salary range, employment type, relocation support, and industry.
- **LLM-friendly parsing hooks:** Pipeline utilities accept raw JD text and normalise it into the structured model, ready for embedding- or rule-based enrichment.

## Matching and Scoring
- **Preprocessing:** Normalises degree levels, industries, and cities; strips PII before evaluation; extracts skills/work elements for semantic matching.
- **Criteria:** Education alignment, experience years/field, skill similarity (weights configurable), location vs. relocation openness, salary fit, and industry match. Nationality is excluded from scoring to avoid bias.
- **Weights and transparency:** Default weighting prioritises skills and experience; every candidate receives a per-criterion breakdown, rationales, and a total match percentage.

## Shortlisting and Oversight
- **Shortlist output:** Ranked candidates with match scores, qualification summaries, location/relocation notes, salary alignment, and gap highlights. Designed for recruiter review, not autonomous hiring.
- **Explainability:** Human-readable explanations accompany scores to support transparency commitments.
- **Human-in-the-loop:** Pipeline stops at shortlist; recruiters decide whom to contact. Hooks allow audit logging and fairness checks.

## Demo and Usage
- **End-to-end demo:** `examples/demo.py` ingests sample candidates, stores them with consent, parses a sample JD, anonymises PII, runs matching, and prints a ranked shortlist with explanations.
- **Zero-dependency runtime:** Pure Python; run `python -m compileall src examples` then `python examples/demo.py` to exercise the flow.

## Responsible AI Controls
- **Transparency:** Documentation and output messaging clarify that AI assists screening and how scores are derived.
- **Bias mitigation:** Excludes sensitive attributes from scoring and enables periodic auditing of data/weights.
- **Security & compliance:** Guidance for encryption in transit/at rest, strict access controls, and GDPR/EU AI Act-aligned consent + retention policies.

## Extensibility Notes
- Swap the in-memory store with a real database behind the same interface.
- Replace deterministic scoring with embedding models (e.g., Nomic embed-text, Google embedding-gemma) while keeping explainability surfaces.
- Integrate monitoring for bias/fairness and add red-team style evaluations before production.
