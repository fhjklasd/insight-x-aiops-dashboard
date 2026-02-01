import time
import random
import requests

API_URL = "http://127.0.0.1:8000/predict"

def generate_metrics():
    # simulate fluctuating server behavior
    cpu = random.uniform(30, 95)
    memory = random.uniform(40, 90)
    disk = random.uniform(30, 85)
    network = random.uniform(80, 400)
    errors = random.randint(0, 15)

    return {
        "cpu": round(cpu, 2),
        "memory": round(memory, 2),
        "disk": round(disk, 2),
        "network": round(network, 2),
        "errors": errors
    }

print("🚀 Live Server Metric Simulation Started\n")

while True:
    metrics = generate_metrics()

    try:
        response = requests.post(API_URL, json=metrics)
        result = response.json()

        print("📊 METRICS:", metrics)
        print("⚠️  RISK:", result["risk_level"],
              "| PROB:", result["incident_probability"])
        print("🧠 TOP REASONS:", result["explanation"])
        print("-" * 60)

    except Exception as e:
        print("❌ API Error:", e)

    time.sleep(3)
