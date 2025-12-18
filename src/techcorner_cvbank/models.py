"""Data models for the Techcorner.Tech CV bank.

These models intentionally avoid external dependencies while providing type
clarity and helper methods for anonymisation and basic validation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import List, Optional, Sequence


@dataclass(slots=True)
class ConsentRecord:
    accepted: bool
    policy_version: str
    timestamp: datetime

    def is_valid(self) -> bool:
        """Return True when consent is present and policy version is set."""

        return self.accepted and bool(self.policy_version)


@dataclass(slots=True)
class SalaryRange:
    min: Optional[int] = None
    max: Optional[int] = None

    def contains(self, expected: Optional[int]) -> bool:
        if expected is None:
            return True
        if self.min is not None and expected < self.min:
            return False
        if self.max is not None and expected > self.max:
            return False
        return True


@dataclass(slots=True)
class WorkEntry:
    title: str
    employer: str
    city: str
    start_date: date
    end_date: Optional[date] = None


@dataclass(slots=True)
class Candidate:
    candidate_id: str
    full_name: str
    nationality: Optional[str]
    city: str
    country: Optional[str]
    highest_degree: Optional[str]
    field_of_study: Optional[str]
    graduation_year: Optional[int]
    field_of_work: Optional[str]
    willing_to_relocate: Optional[str]
    social_link: Optional[str]
    min_salary: Optional[int]
    experience_years: Optional[float]
    skills: List[str]
    work_history: List[WorkEntry] = field(default_factory=list)
    certifications: List[str] = field(default_factory=list)
    languages: List[str] = field(default_factory=list)
    additional: Optional[str] = None
    consent: Optional[ConsentRecord] = None
    upload_date: Optional[datetime] = None

    def anonymised_view(self) -> "Candidate":
        """Return a shallow anonymised copy suitable for matching.

        PII such as name and social links are removed; the candidate_id is
        retained for traceability in downstream audit logs.
        """

        return Candidate(
            candidate_id=self.candidate_id,
            full_name="ANONYMIZED",
            nationality=self.nationality,
            city=self.city,
            country=self.country,
            highest_degree=self.highest_degree,
            field_of_study=self.field_of_study,
            graduation_year=self.graduation_year,
            field_of_work=self.field_of_work,
            willing_to_relocate=self.willing_to_relocate,
            social_link=None,
            min_salary=self.min_salary,
            experience_years=self.experience_years,
            skills=list(self.skills),
            work_history=list(self.work_history),
            certifications=list(self.certifications),
            languages=list(self.languages),
            additional=self.additional,
            consent=self.consent,
            upload_date=self.upload_date,
        )

    def assert_consent(self) -> None:
        if not self.consent or not self.consent.is_valid():
            raise ValueError("Consent is required before processing candidate data")


@dataclass(slots=True)
class JobDescription:
    jd_id: str
    title: str
    location: str
    required_education: Optional[str]
    required_skills: List[str]
    preferred_skills: List[str]
    min_experience_years: Optional[float]
    salary_range: SalaryRange
    employment_type: Optional[str]
    relocation_support: bool
    industry: Optional[str]
    raw_jd: Optional[str] = None


@dataclass(slots=True)
class MatchExplanation:
    skills: str
    experience: str
    education: str
    location: str
    salary: str
    industry: str


@dataclass(slots=True)
class MatchResult:
    candidate_id: str
    score: float
    explanations: MatchExplanation
    highlights: dict[str, Sequence[str]]
    gaps: List[str]
    anonymised: bool
