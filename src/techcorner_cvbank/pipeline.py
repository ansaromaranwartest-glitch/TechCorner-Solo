"""Reference pipeline orchestration for the CV bank.

This module demonstrates how to combine intake validation, anonymisation, JD
parsing, and candidate matching while keeping humans in control.
"""

from __future__ import annotations

from dataclasses import replace
from datetime import datetime
from typing import Iterable, List

from .matching import DEFAULT_WEIGHTS, match_candidate
from .models import Candidate, ConsentRecord, JobDescription, SalaryRange


def intake_candidate(raw: dict) -> Candidate:
    """Create a Candidate object from raw form data with consent enforcement.

    This function performs minimal normalisation and ensures consent is present
    before any downstream processing can occur.
    """

    consent_raw = raw.get("consent", {})
    consent = ConsentRecord(
        accepted=bool(consent_raw.get("accepted")),
        policy_version=str(consent_raw.get("policy_version", "")),
        timestamp=consent_raw.get("timestamp", datetime.utcnow()),
    )

    candidate = Candidate(
        candidate_id=str(raw["candidate_id"]),
        full_name=raw.get("full_name", ""),
        nationality=raw.get("nationality"),
        city=raw.get("city", ""),
        country=raw.get("country"),
        highest_degree=raw.get("highest_degree"),
        field_of_study=raw.get("field_of_study"),
        graduation_year=raw.get("graduation_year"),
        field_of_work=raw.get("field_of_work"),
        willing_to_relocate=raw.get("willing_to_relocate"),
        social_link=raw.get("social_link"),
        min_salary=raw.get("min_salary"),
        experience_years=raw.get("experience_years"),
        skills=list(raw.get("skills", [])),
        work_history=list(raw.get("work_history", [])),
        certifications=list(raw.get("certifications", [])),
        languages=list(raw.get("languages", [])),
        additional=raw.get("additional"),
        consent=consent,
        upload_date=raw.get("upload_date", datetime.utcnow()),
    )
    candidate.assert_consent()
    return candidate


def parse_job_description(raw: dict) -> JobDescription:
    """Parse and normalise a raw JD payload.

    In production this would call an LLM-backed extractor with deterministic
    post-processing; here we accept already-structured payloads for clarity.
    """

    salary = raw.get("salary_range", {})
    salary_range = SalaryRange(min=salary.get("min"), max=salary.get("max"))

    return JobDescription(
        jd_id=str(raw["jd_id"]),
        title=raw.get("title", ""),
        location=raw.get("location", ""),
        required_education=raw.get("required_education"),
        required_skills=list(raw.get("required_skills", [])),
        preferred_skills=list(raw.get("preferred_skills", [])),
        min_experience_years=raw.get("min_experience_years"),
        salary_range=salary_range,
        employment_type=raw.get("employment_type"),
        relocation_support=bool(raw.get("relocation_support", False)),
        industry=raw.get("industry"),
        raw_jd=raw.get("raw_jd"),
    )


def shortlist_candidates(candidates: Iterable[Candidate], jd: JobDescription, max_results: int = 20):
    """Return a ranked shortlist with anonymised candidates and explanations."""

    scored: List = []
    for candidate in candidates:
        # Ensure PII is not used in matching and that consent is present.
        candidate.assert_consent()
        scored.append(match_candidate(candidate, jd, weights=DEFAULT_WEIGHTS))

    ranked = sorted(scored, key=lambda r: r.score, reverse=True)
    return ranked[:max_results]


def enforce_retention(candidate: Candidate, retention_days: int, now: datetime | None = None) -> Candidate:
    """Return a candidate marked for purge after retention is exceeded.

    This is a placeholder that would integrate with background jobs to delete
    data and propagate tombstones across caches.
    """

    current_time = now or datetime.utcnow()
    expiry = candidate.upload_date or current_time
    if (current_time - expiry).days >= retention_days:
        # In production, mark for deletion instead of returning the candidate.
        raise ValueError("Candidate record exceeds retention window")
    return replace(candidate)
