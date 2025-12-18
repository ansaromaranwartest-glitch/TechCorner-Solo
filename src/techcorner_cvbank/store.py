"""Simple in-memory store for candidate data with consent and retention checks."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, Iterable, List, Optional

from .models import Candidate


class InMemoryCVStore:
    """Lightweight repository for candidates.

    This avoids external dependencies while demonstrating consent enforcement,
    retention-aware listing, and deletion hooks. For production, replace with a
    database-backed implementation and auditing.
    """

    def __init__(self, retention_days: int = 365):
        self._data: Dict[str, Candidate] = {}
        self.retention_days = retention_days

    def add(self, candidate: Candidate) -> None:
        candidate.assert_consent()
        self._data[candidate.candidate_id] = candidate

    def delete(self, candidate_id: str) -> bool:
        return self._data.pop(candidate_id, None) is not None

    def get(self, candidate_id: str) -> Optional[Candidate]:
        return self._data.get(candidate_id)

    def active_candidates(self, now: Optional[datetime] = None) -> List[Candidate]:
        """Return candidates that are within the retention window."""

        now = now or datetime.utcnow()
        cutoff = now - timedelta(days=self.retention_days)
        active: List[Candidate] = []
        for candidate in self._data.values():
            candidate.assert_consent()
            uploaded = candidate.upload_date or now
            if uploaded >= cutoff:
                active.append(candidate)
        return active

    def __iter__(self) -> Iterable[Candidate]:
        return iter(self._data.values())

