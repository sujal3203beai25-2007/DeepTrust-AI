# DeepTrust AI — corrected source package

## Implemented fixes
- Removed filename-based fabricated speech transcripts. Dual-Risk now optionally uses actual faster-whisper transcription (CPU tiny model, downloaded on first run). If ASR is unavailable, it reports partial analysis rather than a fabricated scam score.
- Removed hardcoded JWT signing secret fallback. A unique development secret is generated in `backend/.env` on first launch; configure a secure external secret for production.
- Added a backend dependency manifest, including matplotlib, SQLAlchemy asyncio/greenlet and faster-whisper.
- Removed bulky build dependencies, local database, uploads and reports from the distributed archive.

## Not fixed / not validated
- Heuristic detectors are NOT verified implementations of AASIST, ResNet, DeBERTa or a 3D neural model. Model names and accuracy claims in the application may still be misleading. Do not present claimed metrics as measured results.
- Frontend/backend integration, every button, performance and AI accuracy have not been end-to-end validated.
- SMTP reset fallback is still a development-only feature; do not deploy publicly without securing it.
- Demo seeded scan records are illustrative, not real measured scans.
- `localStorage` authentication remains and is not production hardened.
- Whisper model downloads require internet on first use and may be slow on CPU.

## Windows CMD startup
1. `cd backend`
2. `python -m venv .venv`
3. `.venv\Scripts\activate.bat`
4. `python -m pip install -r requirements.txt`
5. `python -m uvicorn app.main:app --reload --port 8000`
6. In another terminal: `cd frontend`, `npm install`, `npm run dev`
7. Visit `http://localhost:5173` and `http://127.0.0.1:8000/docs`.

## Test before presenting
Register/login/logout; upload real audio and verify words; test image/video/text scans; report export; history; invalid uploads; mobile; refresh; demo vs real scans; frontend build.
