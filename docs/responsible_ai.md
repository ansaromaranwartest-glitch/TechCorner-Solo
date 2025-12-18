# Responsible AI and Compliance Controls

This checklist operationalises consent, data minimisation, transparency, human oversight, and bias mitigation for the CV bank.

## Consent and transparency

- Explicit opt-in checkbox and clear purposes (matching when requested, audit, deletion rights).
- “How AI is used” explainer shown before submission; include model versions in responses.
- Record `policy_version`, timestamp, and source (web/app) with every submission.

## Data minimisation

- Collect only fields required for matching; store PII separately from matchable attributes.
- Anonymise names/social links before similarity computation.
- Avoid storing raw CV files unless needed; if stored, encrypt and scrub after parsing.

## Retention and deletion

- Default retention timers by region; scheduled jobs purge expired records and related caches.
- Self-service deletion endpoint with audit proof; cascade deletes to logs where legally required.

## Security

- TLS in transit; envelope encryption with KMS for data at rest.
- Role-based access (recruiter/admin/auditor); no direct database access for client users.
- Tamper-evident audit logs for intake, matching requests, and deletions.

## Bias auditing and fairness

- Exclude nationality and other protected attributes from scoring inputs.
- Monitor selection rate ratios and score distributions across proxy groups.
- Periodic red-team prompts against JD parser and matcher to detect drift and bias.
- Maintain evaluation sets with demographic diversity; retrain or adjust weights as needed.

## Human oversight and accountability

- Recruiters must approve outreach; AI only recommends.
- Display explanations and per-criterion scores; allow human overrides and notes.
- Provide contact and appeal channels for candidates; log overrides for traceability.

## Logging and monitoring

- Correlate requests with IDs; scrub PII from logs and metrics.
- Track model versions, prompts, weights used per match.
- Alert on anomalous rejection rates or scoring spikes.
