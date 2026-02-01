# INSIGHT-X 🚀  
### AI-Powered AIOps Incident Prediction & Monitoring Dashboard

INSIGHT-X is a full-stack AIOps prototype that simulates real-time infrastructure monitoring, predicts incident risk using AI, and provides explainable insights through an enterprise-grade dashboard inspired by tools like Grafana and Datadog.

---

## 🔍 What INSIGHT-X Does

INSIGHT-X continuously monitors simulated service telemetry and:

- Predicts **incident risk probability** using an AI model
- Explains *why* a risk was detected (CPU, Memory, Errors, Network)
- Tracks **risk trends over time**
- Maintains an **incident timeline** of state changes
- Implements **noise-aware alerting** (avoids false positives)
- Visualizes **metric correlation** for root-cause analysis
- Supports **multi-service monitoring** (Auth, Payment, DB, Cache)

---

## 🧠 Why This Project Matters

Modern systems fail due to *patterns*, not single spikes.  
INSIGHT-X demonstrates how **AIOps principles** can be applied to:

- Reduce alert fatigue  
- Improve root-cause visibility  
- Build operator trust in AI decisions  

This project focuses on **explainability, correlation, and operational realism**.

---

## 🧱 System Architecture



Frontend (HTML/CSS/JS)
├── Live Dashboard
├── KPI Aggregation
├── Correlation & Timeline
└── Service Selector
↓
Backend (FastAPI)
├── /predict API
└── Model Inference
↓
AI Model (PyTorch)
├── Trained on synthetic + realistic data
└── Outputs probability + explanations


---

## 🖥️ Tech Stack

### Frontend
- HTML5
- CSS3 (Dark Grafana-style UI)
- Vanilla JavaScript (Canvas-based charts)

### Backend
- Python
- FastAPI
- Uvicorn

### AI / ML
- PyTorch
- NumPy
- Synthetic data generation
- GPU-supported training (RTX compatible)

---

## 📊 Key Dashboard Features

### 🔹 Incident Risk Panel
- Current risk level (LOW / MEDIUM / HIGH)
- Probability ring visualization

### 🔹 Incident Timeline
- Logs only **state transitions**
- Prevents noisy updates
- Color-coded severity

### 🔹 Smart Alerting
- Alerts trigger only if HIGH risk persists
- Suppresses transient spikes
- Realistic SRE alert logic

### 🔹 Metric Correlation View
- Mini sparklines for CPU, Memory, Errors, Network
- Helps visually identify causally related signals

### 🔹 Service Health KPIs
- Rolling averages (CPU, Memory)
- Error rate & throughput
- Severity-aware coloring

---

## ⚙️ Running the Project Locally

### 1️⃣ Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

2️⃣ Frontend

Simply open:

frontend/index.html


The dashboard will automatically start polling the backend.

🧪 Example API Request
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cpu": 75,
    "memory": 68,
    "disk": 55,
    "network": 220,
    "errors": 4
  }'

🎯 Project Goals

Demonstrate AIOps concepts in a simple, explainable way

Combine frontend, backend, and AI into one cohesive system

Build an industry-relevant, CV-worthy project

📌 Future Enhancements

Real infrastructure data ingestion (Prometheus)

Model retraining & drift detection

Service dependency graph

User authentication & saved views

Deployment with Docker

👨‍💻 Author

Sumit Shinde
Engineering Student | Full-Stack & AI Enthusiast

⭐ If you like this project

Give it a ⭐ on GitHub — it really helps!


