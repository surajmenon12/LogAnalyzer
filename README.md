# Plivo Log Analysis Dashboard

A full-stack dashboard for monitoring and analyzing call, message, and SIP trunk logs.

## Tech Stack

- **Backend:** Python + FastAPI (async) + SQLAlchemy + asyncpg
- **Database:** PostgreSQL 16 (Docker)
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + Recharts

## Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Seed the database with sample data
python -m app.seed.seed_data

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open Dashboard

Navigate to http://localhost:3000

API docs available at http://localhost:8000/docs

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/logs/calls` | Call logs with filters & pagination |
| `GET /api/logs/messages` | Message logs with filters & pagination |
| `GET /api/logs/sip-trunks` | SIP trunk logs with filters & pagination |
| `GET /api/analytics/overview` | Aggregated overview stats |
| `GET /api/analytics/trends` | Time-series trend data |
| `GET /api/analytics/carriers` | Per-carrier performance |
| `GET /api/export/csv` | CSV export |
| `GET /api/health` | Health check |

## Sample Data

The seed script generates:
- 500 call logs
- 300 message logs
- 200 SIP trunk records
- 8 carriers across 4 regions (US-East, US-West, EU-West, APAC)
- Spread over the last 30 days
