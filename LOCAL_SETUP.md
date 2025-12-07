# SummerBerry Local Development Setup

## Project Structure

```
summerberry/
├── backend/              # FastAPI Python backend
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── frontend/             # React/Vite frontend (this Lovable export)
│   ├── src/
│   ├── package.json
│   └── ...
├── package.json          # Root package.json (use root-package.json)
└── LOCAL_SETUP.md
```

## Initial Setup

### 1. Export from Lovable to GitHub

Export this project and rename the folder to `frontend/`.

### 2. Create the root structure

```bash
# Create project root
mkdir summerberry
cd summerberry

# Move frontend
mv <exported-lovable-folder> frontend/

# Copy root package.json
cp frontend/root-package.json package.json

# Create backend folder (add your FastAPI code here)
mkdir backend
```

### 3. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install frontend dependencies
npm run install:all

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

## Running the Application

### Single Command (Both Frontend + Backend)

```bash
npm run dev
```

This will start:
- **Backend** (yellow): FastAPI on http://localhost:8000
- **Frontend** (cyan): Vite on http://localhost:8080

### Run Individually

```bash
# Backend only
npm run backend

# Frontend only
npm run frontend
```

## Environment Variables

Create a `.env.local` file in the `frontend/` folder:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## API Endpoints

The frontend expects the backend to provide:

```
POST /predict
Content-Type: application/json

Request:
{
  "site": "ADM" | "ALM" | "all",
  "sector": "string",
  "file_data": "base64_encoded_xlsx" (optional)
}

Response:
{
  "predictions": {
    "2025-01-15": 150,
    "2025-01-16": 175,
    ...
  },
  "total": 1050,
  "average": 150
}
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 8080 (frontend)
lsof -ti:8080 | xargs kill -9
```

### Python virtual environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
```
