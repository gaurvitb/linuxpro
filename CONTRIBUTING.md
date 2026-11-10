# Contributing to LINUXPULSE

Thank you for your interest in contributing to LINUXPULSE!

## Code of Conduct

Please be respectful and constructive in all discussions, pull requests, and issues.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/linuxpulse.git
   cd linuxpulse
   ```
3. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## Development Workflow

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate  |  Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Building & Checking
```bash
# Verify frontend builds without errors:
cd frontend
npm run build
```

## Security Guidelines

- **Never commit credentials:** No API keys, tokens, passwords, or SSH private keys.
- **Never add commands to the executor without review:** All commands must pass through `ALLOWLISTED_COMMANDS` in `backend/app/core/executor.py`.
- **Preserve DEMO mode fallbacks:** Any new endpoint must provide high-fidelity demo data when real VMs are offline.

## Pull Request Checklist

- [ ] Code follows existing style and patterns
- [ ] `npm run build` passes with zero errors
- [ ] No `.env` or sensitive files included
- [ ] Commit messages are descriptive and follow conventional commits (e.g., `feat:`, `fix:`, `docs:`)
- [ ] Updated documentation if applicable
