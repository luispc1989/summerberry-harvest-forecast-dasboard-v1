import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from io import BytesIO
from fastapi import UploadFile

from schemas.prediction import (
    PredictionResponse,
    DailyPrediction,
    InfluencingFactor
)
from models.prediction import get_model
from database import get_db_cursor


async def process_prediction(
    file: UploadFile,
    site: str,
    variety: str,
    sector: str,
    plant_type: str,
    plantation_date: str,
    selected_date: str
) -> PredictionResponse:
    """
    Process uploaded file and generate harvest predictions.
    
    This is the main service function that:
    1. Reads the uploaded CSV/XLSX file
    2. Queries additional data from MariaDB if needed
    3. Prepares features for the ML model
    4. Generates predictions
    5. Returns formatted response
    """
    
    # Parse the uploaded file
    df = await parse_upload_file(file)
    
    # Get additional data from MariaDB
    historical_data = get_historical_data(site, variety, sector, plantation_date)
    
    # Prepare features for prediction
    features = prepare_features(
        df=df,
        historical_data=historical_data,
        site=site,
        variety=variety,
        sector=sector,
        plant_type=plant_type,
        plantation_date=plantation_date,
        selected_date=selected_date
    )
    
    # Get model and make predictions
    model = get_model()
    predictions = model.predict(features)
    
    # Format predictions for response
    daily_predictions = format_daily_predictions(predictions, selected_date)
    
    # Calculate statistics
    total = int(np.sum(predictions))
    average = int(np.mean(predictions))
    std_dev = f"{np.std(predictions):.1f}"
    
    # Get feature importance as influencing factors
    factors = get_influencing_factors(model)
    
    return PredictionResponse(
        predictions=daily_predictions,
        total=total,
        average=average,
        stdDev=std_dev,
        factors=factors
    )


async def parse_upload_file(file: UploadFile) -> pd.DataFrame:
    """Parse uploaded CSV or XLSX file into a DataFrame."""
    content = await file.read()
    
    if file.filename.endswith('.csv'):
        df = pd.read_csv(BytesIO(content))
    elif file.filename.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(BytesIO(content))
    else:
        raise ValueError(f"Unsupported file format: {file.filename}")
    
    return df


def get_historical_data(
    site: str,
    variety: str,
    sector: str,
    plantation_date: str
) -> dict:
    """
    Query historical data from MariaDB.
    
    Customize this function based on your database schema.
    """
    try:
        with get_db_cursor() as cursor:
            # Example query - adjust to your schema
            query = """
                SELECT *
                FROM harvest_records
                WHERE site = %s
                  AND variety = %s
                  AND sector = %s
                  AND plantation_date = %s
                ORDER BY record_date DESC
                LIMIT 30
            """
            cursor.execute(query, (site, variety, sector, plantation_date))
            results = cursor.fetchall()
            
            return {
                "records": results,
                "count": len(results)
            }
    except Exception as e:
        print(f"Database query error: {e}")
        return {"records": [], "count": 0}


def prepare_features(
    df: pd.DataFrame,
    historical_data: dict,
    site: str,
    variety: str,
    sector: str,
    plant_type: str,
    plantation_date: str,
    selected_date: str
) -> np.ndarray:
    """
    Prepare feature matrix for ML model.
    
    Customize this function based on your model's expected features.
    """
    # Example: Create 7 rows (one per prediction day) with features
    n_days = 7
    
    # Site encoding
    site_encoded = 1 if site == 'alm' else 0
    
    # Variety encoding
    variety_map = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4}
    variety_encoded = variety_map.get(variety, 0)
    
    # Plant type encoding
    plant_type_map = {'gc': 0, 'gt': 1, 'lc': 2, 'rb': 3, 'sc': 4}
    plant_type_encoded = plant_type_map.get(plant_type, 0)
    
    # Sector hash
    sector_hash = sum(ord(c) for c in sector) % 100 / 100
    
    # Plantation age in days
    try:
        plantation_dt = datetime.strptime(plantation_date, '%Y-%m-%d')
        selected_dt = datetime.strptime(selected_date, '%Y-%m-%d')
        plantation_age = (selected_dt - plantation_dt).days
    except:
        plantation_age = 365
    
    # Build feature matrix
    features = []
    for day in range(n_days):
        day_features = [
            site_encoded,
            variety_encoded,
            plant_type_encoded,
            sector_hash,
            plantation_age + day,
            day  # day index
        ]
        
        # Add features from uploaded file if available
        if not df.empty and len(df.columns) > 0:
            # Example: use first numeric columns as additional features
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols[:5]:  # Limit to 5 columns
                day_features.append(df[col].mean())
        
        features.append(day_features)
    
    return np.array(features)


def format_daily_predictions(
    predictions: np.ndarray,
    selected_date: str
) -> list[DailyPrediction]:
    """Format predictions as daily records."""
    try:
        start_date = datetime.strptime(selected_date, '%Y-%m-%d')
    except:
        start_date = datetime.now()
    
    daily_predictions = []
    for i, value in enumerate(predictions):
        pred_date = start_date + timedelta(days=i)
        daily_predictions.append(DailyPrediction(
            day=f"Day {i + 1}",
            date=pred_date.strftime('%b %d'),
            value=int(value)
        ))
    
    return daily_predictions


def get_influencing_factors(model) -> list[InfluencingFactor]:
    """Get top influencing factors from model."""
    importance = model.get_feature_importance()
    
    # Define correlation direction for each factor
    correlations = {
        "Temperature": "positive",
        "Flower Abortion Rate": "negative",
        "Irrigation Volume": "positive",
        "Humidity": "positive",
        "Solar Radiation": "positive"
    }
    
    factors = []
    for name, imp in importance.items():
        factors.append(InfluencingFactor(
            name=name,
            importance=int(imp * 100),
            correlation=correlations.get(name, "positive")
        ))
    
    # Sort by importance and take top 5
    factors.sort(key=lambda x: x.importance, reverse=True)
    return factors[:5]
