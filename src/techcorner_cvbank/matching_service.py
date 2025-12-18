"""Service orchestration for JD intake and candidate matching."""

from __future__ import annotations

from typing import Iterable, List, Sequence

from .matching import match_candidate
from .models import Candidate, JobDescription, MatchResult


class MatchingService:
    """Combine a candidate source with JD matching and explanations."""

    def __init__(self, candidates: Iterable[Candidate]):
        self._candidates = list(candidates)

    def shortlist(self, jd: JobDescription, max_results: int = 20) -> List[MatchResult]:
        scored: List[MatchResult] = []
        for candidate in self._candidates:
            scored.append(match_candidate(candidate, jd))
        scored.sort(key=lambda r: r.score, reverse=True)
        return scored[:max_results]


def format_results(results: Sequence[MatchResult]) -> str:
    """Human-readable summary for CLI/demo use."""

    lines: List[str] = []
    for rank, result in enumerate(results, start=1):
        lines.append(f"#{rank} Candidate {result.candidate_id}: score {result.score:.2f}")
        lines.append(f"  Skills: {result.explanations.skills}")
        lines.append(f"  Experience: {result.explanations.experience}")
        lines.append(f"  Education: {result.explanations.education}")
        lines.append(f"  Location: {result.explanations.location}")
        lines.append(f"  Salary: {result.explanations.salary}")
        if result.gaps:
            lines.append(f"  Gaps: {', '.join(result.gaps)}")
        lines.append("")
    return "\n".join(lines)

