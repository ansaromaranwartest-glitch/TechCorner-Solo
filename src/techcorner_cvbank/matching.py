"""Matching and scoring utilities for the CV bank.

The implementation focuses on transparency and deterministic fallbacks so that
recruiters can trust and interpret scores even when embedding services are
unavailable.
"""

from __future__ import annotations

from dataclasses import asdict
from typing import Dict, Iterable

from .models import Candidate, JobDescription, MatchExplanation, MatchResult

DEFAULT_WEIGHTS: Dict[str, float] = {
    "skills": 0.45,
    "experience": 0.25,
    "education": 0.1,
    "location": 0.1,
    "salary": 0.1,
}


def _normalise_term(term: str) -> str:
    return term.strip().lower()


def _normalise_list(values: Iterable[str]) -> set[str]:
    return {_normalise_term(v) for v in values if v}


def score_skills(candidate_skills: Iterable[str], jd_required: Iterable[str]) -> tuple[float, str]:
    c_skills = _normalise_list(candidate_skills)
    j_skills = _normalise_list(jd_required)
    if not j_skills:
        return 1.0, "No required skills provided; default full credit"
    intersection = len(c_skills & j_skills)
    score = intersection / len(j_skills)
    explanation = f"Matched {intersection}/{len(j_skills)} required skills"
    return score, explanation


def score_experience(candidate_years: float | None, required_years: float | None) -> tuple[float, str]:
    if required_years is None:
        return 1.0, "No minimum experience specified"
    if candidate_years is None:
        return 0.0, "Experience not provided"
    ratio = candidate_years / required_years if required_years else 1.0
    score = min(1.0, ratio)
    explanation = f"{candidate_years} years vs required {required_years}"
    return score, explanation


def score_education(candidate_degree: str | None, candidate_field: str | None, required: str | None) -> tuple[float, str]:
    if not required:
        return 1.0, "No education requirement provided"
    if not candidate_degree:
        return 0.0, "Candidate degree missing"
    cand = _normalise_term(candidate_degree)
    req = _normalise_term(required)
    score = 1.0 if req in cand or cand in req else 0.5
    explanation = f"Candidate degree '{candidate_degree}' compared to requirement '{required}'"
    if candidate_field:
        explanation += f"; field: {candidate_field}"
    return score, explanation


def score_location(candidate_city: str | None, willing_to_relocate: str | None, jd_location: str) -> tuple[float, str]:
    if not candidate_city:
        return 0.5, "Candidate city missing"
    cand = _normalise_term(candidate_city)
    jd = _normalise_term(jd_location)
    if cand == jd:
        return 1.0, "Candidate already in job location"
    if willing_to_relocate:
        return 0.8, f"Relocation willingness noted: {willing_to_relocate}"
    return 0.2, "Location mismatch and no relocation preference"


def score_salary(candidate_min: int | None, jd_min: int | None, jd_max: int | None) -> tuple[float, str]:
    if candidate_min is None:
        return 0.7, "Candidate salary missing; partial credit"
    if jd_max is not None and candidate_min > jd_max:
        return 0.0, f"Expectation {candidate_min} exceeds max {jd_max}"
    if jd_min is not None and candidate_min < jd_min:
        return 1.0, f"Expectation {candidate_min} within range ({jd_min}-{jd_max})"
    return 0.9, f"Expectation {candidate_min} within or near offered range"


def aggregate_score(weights: Dict[str, float], **scores: float) -> float:
    total_weight = sum(weights.values())
    if total_weight <= 0:
        raise ValueError("Weights must sum to a positive number")
    return sum(weights[k] * scores.get(k, 0.0) for k in weights) / total_weight


def match_candidate(candidate: Candidate, jd: JobDescription, weights: Dict[str, float] | None = None) -> MatchResult:
    candidate.assert_consent()
    effective_weights = weights or DEFAULT_WEIGHTS

    skill_score, skill_expl = score_skills(candidate.skills, jd.required_skills)
    exp_score, exp_expl = score_experience(candidate.experience_years, jd.min_experience_years)
    edu_score, edu_expl = score_education(candidate.highest_degree, candidate.field_of_study, jd.required_education)
    loc_score, loc_expl = score_location(candidate.city, candidate.willing_to_relocate, jd.location)
    sal_score, sal_expl = score_salary(candidate.min_salary, jd.salary_range.min, jd.salary_range.max)

    total = aggregate_score(
        effective_weights,
        skills=skill_score,
        experience=exp_score,
        education=edu_score,
        location=loc_score,
        salary=sal_score,
    )

    explanation = MatchExplanation(
        skills=skill_expl,
        experience=exp_expl,
        education=edu_expl,
        location=loc_expl,
        salary=sal_expl,
        industry=f"Industry noted: {jd.industry or 'n/a'}",
    )

    gaps = []
    if skill_score < 1.0:
        gaps.append("Some required skills missing")
    if exp_score < 1.0 and jd.min_experience_years:
        gaps.append("Experience below requirement")
    if loc_score < 0.5:
        gaps.append("Location misaligned")
    if sal_score == 0.0:
        gaps.append("Salary expectation above range")

    anonymised_candidate = candidate.anonymised_view()
    highlights = {
        "skills": anonymised_candidate.skills,
        "experience": [f"{anonymised_candidate.experience_years} years"],
        "location": [anonymised_candidate.city],
    }

    return MatchResult(
        candidate_id=anonymised_candidate.candidate_id,
        score=round(total, 4),
        explanations=explanation,
        highlights=highlights,
        gaps=gaps,
        anonymised=True,
    )


def as_dict(result: MatchResult) -> dict:
    """Return a serialisable dict representation of a match result."""

    payload = asdict(result)
    payload["explanations"] = asdict(result.explanations)
    return payload
