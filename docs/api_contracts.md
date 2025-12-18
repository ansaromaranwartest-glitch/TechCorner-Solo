# API Contracts (Reference)

API surface designed for clear consent handling, data minimisation, and human oversight. All responses include `request_id` and version headers (`X-Model-Version`, `X-Policy-Version`).

## Authentication

- **Public CV Intake**: reCAPTCHA/Turnstile + rate limits.
- **Client (B2B) APIs**: OAuth2 client credentials or mTLS. Roles: `recruiter`, `admin`, `auditor`.

## CV intake

`POST /v1/cvs`

Request body (minimum viable fields):

```json
{
  "full_name": "Required for identification; excluded from scoring",
  "nationality": "Stored for eligibility checks, not for scoring",
  "city": "Paris",
  "country": "France",
  "highest_degree": "MSc",
  "field_of_study": "Computer Science",
  "graduation_year": 2020,
  "field_of_work": "Software Engineering",
  "willing_to_relocate": "open to EU relocation",
  "social_link": "https://linkedin.com/in/example",
  "min_salary": 60000,
  "experience_years": 5,
  "skills": ["Python", "ML", "PostgreSQL"],
  "work_history": [
    {
      "title": "Software Engineer",
      "employer": "Example Corp",
      "city": "Paris",
      "start_date": "2018-01-01",
      "end_date": "2023-01-01"
    }
  ],
  "certifications": ["AWS SAA"],
  "languages": ["English", "French"],
  "additional": "Volunteer mentor, hackathon wins",
  "consent": {
    "accepted": true,
    "policy_version": "2024-08",
    "timestamp": "2024-11-10T12:00:00Z"
  }
}
```

Responses:
- `201 Created`: `{ "candidate_id": "uuid", "request_id": "..." }`
- `400 Bad Request`: validation errors; redact PII in logs.

## Candidate deletion (right to be forgotten)

`DELETE /v1/cvs/{candidate_id}`
- Soft-delete then purge across primary DB, object storage, and caches.
- Background job verifies deletion and emits audit event.

## JD intake

`POST /v1/jds`

Request body (required fields):

```json
{
  "title": "Data Engineer",
  "location": "Berlin, DE",
  "required_education": "BSc Computer Science",
  "required_skills": ["Python", "ETL", "Airflow"],
  "preferred_skills": ["Spark", "DBT"],
  "min_experience_years": 3,
  "salary_range": {"min": 55000, "max": 75000},
  "employment_type": "full-time",
  "relocation_support": true,
  "industry": "Technology",
  "raw_jd": "Full text for traceability"
}
```

Responses:
- `201 Created`: `{ "jd_id": "uuid", "request_id": "..." }`
- `422 Unprocessable Entity`: missing mandatory attributes.

## Matching request

`POST /v1/match`

```json
{
  "jd_id": "uuid",
  "max_results": 20,
  "weights": {
    "skills": 0.45,
    "experience": 0.25,
    "education": 0.1,
    "location": 0.1,
    "salary": 0.1
  }
}
```

Response example:

```json
{
  "request_id": "...",
  "matches": [
    {
      "candidate_id": "uuid",
      "score": 0.82,
      "explanations": {
        "skills": "7/8 required skills matched; strong overlap in ETL + Airflow",
        "experience": "5 years vs required 3",
        "education": "BSc Computer Science meets requirement",
        "location": "Berlin-based; relocation not needed",
        "salary": "Expectation 60k within offered range"
      },
      "highlights": {
        "skills": ["Airflow", "Python", "ETL"],
        "experience": "Built pipelines for 20TB/day data",
        "location": "Berlin"
      },
      "gaps": ["No Spark experience"],
      "anonymised": true
    }
  ]
}
```

## Audit & fairness endpoints

- `GET /v1/audit/requests/{request_id}`: retrieve lineage (models, prompts, weights) for a decision.
- `POST /v1/audit/bias-report`: trigger or upload fairness metrics for regulators.

## Error handling conventions

- Include `correlation_id` and redact PII in logs and traces.
- Use structured errors: `{ "error": "invalid_field", "field": "min_salary", "message": "must be positive" }`.
