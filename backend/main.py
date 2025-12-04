from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from schemas.prediction import PredictionResponse
from services.prediction import process_prediction
from database import test_connection

settings = get_settings()

app = FastAPI(
    title="SummerBerry ML API",
    description="Harvest prediction API for SummerBerry Dashboard",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    db_status = test_connection()
    return {
        "status": "healthy",
        "database": "connected" if db_status else "disconnected"
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    site: str = Form(...),
    variety: str = Form(...),
    sector: str = Form(...),
    plantType: str = Form(...),
    plantationDate: str = Form(...),
    selectedDate: str = Form(...)
):
    """
    Generate harvest predictions based on uploaded data and filters.
    
    - **file**: CSV or XLSX file with input data
    - **site**: Site identifier (adm/alm)
    - **variety**: Variety identifier (a-e)
    - **sector**: Sector identifier
    - **plantType**: Plant type (gc/gt/lc/rb/sc)
    - **plantationDate**: Plantation date (YYYY-MM-DD)
    - **selectedDate**: Date for prediction start (YYYY-MM-DD)
    """
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    allowed_extensions = ['.csv', '.xlsx', '.xls']
    if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        result = await process_prediction(
            file=file,
            site=site,
            variety=variety,
            sector=sector,
            plant_type=plantType,
            plantation_date=plantationDate,
            selected_date=selectedDate
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
