# TechCorner-Solo

AI-powered CV bank blueprint and reference implementation for the Techcorner.Tech platform. This repository contains:

- A responsible-by-design architecture for collecting, storing, and matching CVs only when a company requests recruitment.
- Data models and matching utilities in Python to demonstrate scoring, explainability, and anonymisation workflows.
- API and operational guidelines aligned to consent, data minimisation, transparency, and human oversight principles.

## Repository layout

- `docs/` — architecture, compliance controls, and API contracts.
- `src/techcorner_cvbank/` — Python reference models and matching logic (no external dependencies required).

## Quickstart (reference code)

Run the dependency-free reference code:

```bash
python -m compileall src
python examples/demo.py
```

`examples/demo.py` shows end-to-end intake → storage → JD parsing → anonymised matching with transparent explanations.
