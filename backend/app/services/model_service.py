import torch
import torch.nn as nn
import joblib
import os

# feature order MUST match training
FEATURES = ["cpu", "memory", "disk", "network", "errors"]

CURRENT_DIR = os.path.dirname(__file__)
APP_DIR = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.dirname(APP_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)


MODEL_PATH = os.path.join(PROJECT_ROOT, "ml", "models", "incident_model.pt")
SCALER_PATH = os.path.join(PROJECT_ROOT, "ml", "models", "scaler.pkl")

device = "cuda" if torch.cuda.is_available() else "cpu"

# define same architecture as training
model = nn.Sequential(
    nn.Linear(len(FEATURES), 32),
    nn.ReLU(),
    nn.Linear(32, 16),
    nn.ReLU(),
    nn.Linear(16, 1),
    nn.Sigmoid()
).to(device)

model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()

scaler = joblib.load(SCALER_PATH)


def predict_incident(data: dict):
    values = [data[f] for f in FEATURES]
    scaled = scaler.transform([values])

    tensor = torch.tensor(scaled, dtype=torch.float32).to(device)

    with torch.no_grad():
        prob = model(tensor).item()

    risk = "LOW"
    if prob > 0.7:
        risk = "HIGH"
    elif prob > 0.4:
        risk = "MEDIUM"

    return {
        "incident_probability": round(prob, 4),
        "risk_level": risk
    }

def explain_prediction(data: dict):
    values = torch.tensor(
        scaler.transform([[data[f] for f in FEATURES]]),
        dtype=torch.float32,
        requires_grad=True,
        device=device
    )

    output = model(values)
    output.backward()

    grads = values.grad.abs().cpu().numpy()[0]

    explanations = list(zip(FEATURES, grads))
    explanations.sort(key=lambda x: x[1], reverse=True)

    top_reasons = [
        {"feature": f, "impact": round(float(score), 4)}
        for f, score in explanations[:3]
    ]

    return top_reasons