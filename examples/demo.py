"""End-to-end demo for the Techcorner.Tech CV bank reference code."""

from __future__ import annotations

from datetime import datetime

from techcorner_cvbank.models import Candidate, ConsentRecord, JobDescription, SalaryRange
from techcorner_cvbank.matching_service import MatchingService, format_results
from techcorner_cvbank.store import InMemoryCVStore


def build_candidate(candidate_id: str, **kwargs) -> Candidate:
    consent = ConsentRecord(accepted=True, policy_version="2024-08", timestamp=datetime.utcnow())
    return Candidate(
        candidate_id=candidate_id,
        full_name=kwargs.get("full_name", ""),
        nationality=kwargs.get("nationality"),
        city=kwargs.get("city", ""),
        country=kwargs.get("country"),
        highest_degree=kwargs.get("highest_degree"),
        field_of_study=kwargs.get("field_of_study"),
        graduation_year=kwargs.get("graduation_year"),
        field_of_work=kwargs.get("field_of_work"),
        willing_to_relocate=kwargs.get("willing_to_relocate"),
        social_link=kwargs.get("social_link"),
        min_salary=kwargs.get("min_salary"),
        experience_years=kwargs.get("experience_years"),
        skills=list(kwargs.get("skills", [])),
        work_history=list(kwargs.get("work_history", [])),
        certifications=list(kwargs.get("certifications", [])),
        languages=list(kwargs.get("languages", [])),
        additional=kwargs.get("additional"),
        consent=consent,
        upload_date=datetime.utcnow(),
    )


def main() -> None:
    store = InMemoryCVStore(retention_days=365)
    store.add(
        build_candidate(
            "cand-1",
            full_name="Alex Example",
            city="Berlin",
            field_of_work="Data Engineering",
            highest_degree="BSc Computer Science",
            field_of_study="Computer Science",
            experience_years=5,
            min_salary=60000,
            skills=["Python", "ETL", "Airflow", "SQL"],
            willing_to_relocate="open to EU relocation",
        )
    )
    store.add(
        build_candidate(
            "cand-2",
            full_name="Sam Sample",
            city="Madrid",
            field_of_work="Data Engineering",
            highest_degree="MSc Data Science",
            field_of_study="Data Science",
            experience_years=3,
            min_salary=55000,
            skills=["Python", "Spark", "SQL"],
            willing_to_relocate="yes",
        )
    )

    jd = JobDescription(
        jd_id="jd-1",
        title="Data Engineer",
        location="Berlin",
        required_education="BSc Computer Science",
        required_skills=["Python", "ETL", "Airflow"],
        preferred_skills=["Spark"],
        min_experience_years=3,
        salary_range=SalaryRange(min=55000, max=75000),
        employment_type="full-time",
        relocation_support=True,
        industry="Technology",
        raw_jd="Data Engineer focused on pipelines",
    )

    service = MatchingService(store.active_candidates())
    results = service.shortlist(jd, max_results=5)
    print(format_results(results))


if __name__ == "__main__":
    main()
