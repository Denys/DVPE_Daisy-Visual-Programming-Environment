# Launch Development Servers

## Goal
Start the DVPE frontend and backend development servers for local development.

## Inputs
None required - uses existing project configuration.

## Execution Tools
Use the `/launch-dev-servers` workflow or manually:
1. Frontend: `cd dvpe_CLD && npm run dev`
2. Backend: `cd dvpe && python -m uvicorn main:app --reload`

## Outputs
- Frontend available at `http://localhost:5173`
- Backend API at `http://localhost:8000`

## Edge Cases
- **Port already in use**: Kill existing processes or use alternate ports
- **Missing dependencies**: Run `npm install` or `pip install -r requirements.txt`
- **Tailwind CSS errors**: Ensure Tailwind v3.4 is installed (not v4)

## Timing
- Frontend startup: ~5 seconds
- Backend startup: ~3 seconds

## Learnings
_Updated as issues are discovered._
