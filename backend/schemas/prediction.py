from pydantic import BaseModel
from typing import Literal
from datetime import date


class DailyPrediction(BaseModel):
    day: str
    date: str
    value: int


class InfluencingFactor(BaseModel):
    name: str
    importance: int
    correlation: Literal["positive", "negative"]


class PredictionResponse(BaseModel):
    predictions: list[DailyPrediction]
    total: int
    average: int
    stdDev: str
    factors: list[InfluencingFactor]


class PredictionRequest(BaseModel):
    site: str
    variety: str
    sector: str
    plantType: str
    plantationDate: str
    selectedDate: str
