from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.predict import router as predict_router

app = FastAPI(title="INSIGHT-X : AI Incident Predictor")

# -------------------------
# CORS CONFIG (IMPORTANT)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for demo
    allow_credentials=True,
    allow_methods=["*"],  # allow POST, OPTIONS, etc.
    allow_headers=["*"],
)

app.include_router(predict_router)

@app.get("/")
def root():
    return {"status": "AI Incident Predictor is LIVE 🚀"}
