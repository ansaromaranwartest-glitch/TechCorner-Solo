# Techcorner.Tech CV Bank Architecture

This document outlines a responsible AI architecture for collecting CVs, storing them securely, and matching candidates to job descriptions only when corporate clients request recruitment. The design centres transparency, consent, data minimisation, and human oversight.

## High-level workflow

1. **Job seeker submits CV** via a consent-first web form.
2. **Data is validated and anonymised**, then stored in a **dedicated CV database** separate from other platform data.
3. **No matching runs until a client submits a job description (JD)**.
4. **JD intake and parsing** converts unstructured text to structured requirements.
5. **Matching service** normalises data, computes scores, and produces explanations.
6. **Recruiter review** ensures humans make final hiring decisions and communicate via secure channels.

## Components

- **Frontend (CV intake form)**
  - Mandatory consent checkbox with granular terms (processing, retention, deletion rights).
  - Minimal data capture aligned to purpose limitation.
  - Inline privacy notice explaining AI use and anonymisation.

- **API Gateway**
  - Exposes CV intake, deletion, JD submission, and match request endpoints.
  - OAuth2 or mTLS for B2B access; rate limiting and audit logging.

- **CV Ingestion Service**
  - Validates fields and performs PII tagging/anonymisation (names, social links) before persistence.
  - Writes to **CV Database** and **Consent Log** (including policy version and timestamp).

- **CV Database (separate datastore)**
  - Logical separation from platform data; encryption at rest and in transit.
  - Tables/collections: `candidates`, `skills`, `work_history`, `consent_log`, `retention_timers`.
  - Retention policies with automatic expiry; deletion requests cascade across tables and caches.

- **JD Intake & Parsing Service**
  - Accepts JDs, validates required attributes (title, location, skills, experience, salary range, relocation support, employment type).
  - Uses LLM-based extraction with deterministic post-processing to structured schemas.
  - Stores parsed JDs with provenance (source JD, parser version).

- **Matching & Scoring Service**
  - Normalises candidate and JD attributes (degrees, cities, industries).
  - Removes/anonymises PII before similarity computations.
  - Computes per-criterion scores and explanations; aggregates weighted match score.
  - Returns ranked shortlist with rationale; no automatic outreach.

- **Oversight & Audit Layer**
  - Dashboards for bias audits (e.g., disparate impact by gender/nationality proxies).
  - Traceability: request ID → parser version → model prompts → scoring weights.
  - Human-in-the-loop overrides for scores or exclusions.

## Data flows

```mermaid
flowchart TD
  A[CV Web Form] -->|consent + CV data| B[API Gateway]
  B --> C[CV Ingestion Service]
  C --> D[PII Tagging & Anonymiser]
  D --> E[CV Database (separate)]
  C --> F[Consent Log]
  G[Client JD Submission] --> B
  B --> H[JD Intake & Parser]
  H --> I[Structured JD Store]
  I --> J[Matching & Scoring]
  E --> J
  J --> K[Ranked Shortlist + Explanations]
  K --> L[Recruiter Review]
```

## Matching methodology

- **Signals** (example weights):
  - Skills similarity: 40–50%
  - Experience years/field: 20–25%
  - Education level/field: 10–15%
  - Location & relocation: 10–15%
  - Salary fit: 10%
  - Industry alignment: 5–10%
- **Techniques**:
  - Embedding similarity for skills/experience phrases (e.g., embedding-gemma, nomic embed-text) with deterministic fallbacks (Jaccard on normalised skills).
  - Rule-based guards: disqualify when salary expectation exceeds JD max or relocation is impossible.
  - Explainability: store per-signal subscores and textual rationales.

## Responsible AI controls

- **Consent & transparency**: Explicit opt-in, downloadable policy, and “how we use AI” disclosure.
- **Data minimisation**: Collect only necessary fields; anonymise PII before matching; separate keys for re-identification.
- **Retention**: Configurable TTL per jurisdiction; automated deletion workflows; candidate self-service deletion.
- **Bias auditing**: Scheduled fairness reports, feature importance monitoring, and bias mitigations (e.g., excluding nationality from scoring).
- **Human oversight**: Recruiters approve shortlists and outreach; override controls for scores; escalation paths for candidates.
- **Security**: TLS everywhere, KMS-backed encryption, least-privilege IAM, tamper-evident audit logs.

## Deployment considerations

- **Services**: Containerised microservices (ingestion, JD parser, matcher), deployed on Kubernetes with separate namespaces for CV data.
- **Storage**: Postgres for transactional CV data; object storage for raw CV files; Redis for ephemeral caches (no PII); all encrypted.
- **Observability**: Centralised logging (PII-scrubbed), metrics for latency and match quality, tracing with request IDs.
- **Model operations**: Track model versions, prompts, and evaluation sets; provide rollback; run red-team prompts for safety.

## Open questions / next steps

- Finalise jurisdiction-specific retention defaults.
- Choose primary embedding model and fallback strategy for offline mode.
- Define bias audit cadence and metrics (e.g., selection rate ratios per protected proxy attributes).
- Confirm consent language with legal and privacy teams.
