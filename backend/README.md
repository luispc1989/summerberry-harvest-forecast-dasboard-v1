# SummerBerry ML Backend

FastAPI backend for harvest predictions with MariaDB integration.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Copy `.env.example` to `.env` and configure your MariaDB credentials:

```bash
cp .env.example .env
```

## Run

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /predict` - Generate harvest predictions
- `GET /health` - Health check

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── config.py            # Configuration and env variables
├── database.py          # MariaDB connection
├── models/
│   └── prediction.py    # ML model loader and inference
├── schemas/
│   └── prediction.py    # Pydantic schemas
├── services/
│   └── prediction.py    # Business logic
├── requirements.txt
└── .env.example
```
