from fastapi import APIRouter
from app.models.prediction_schema import ServerMetrics
from app.services.model_service import predict_incident, explain_prediction

router = APIRouter()

@router.post("/predict")
def predict(data: ServerMetrics):
    prediction = predict_incident(data.dict())
    explanation = explain_prediction(data.dict())

    return {
        **prediction,
        "explanation": explanation
    }
