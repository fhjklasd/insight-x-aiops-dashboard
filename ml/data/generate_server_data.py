import pandas as pd
import random

def generate_row(incident=False):
    if not incident:
        return {
            "cpu": random.uniform(20, 60),
            "memory": random.uniform(30, 70),
            "disk": random.uniform(20, 60),
            "network": random.uniform(50, 200),
            "errors": random.randint(0, 2),
            "incident": 0
        }
    else:
        return {
            "cpu": random.uniform(80, 100),
            "memory": random.uniform(75, 95),
            "disk": random.uniform(70, 95),
            "network": random.uniform(250, 500),
            "errors": random.randint(8, 20),
            "incident": 1
        }

data = []

# generate 1000 normal rows
for _ in range(1000):
    data.append(generate_row(False))

# generate 300 incident rows
for _ in range(300):
    data.append(generate_row(True))

df = pd.DataFrame(data)
df = df.sample(frac=1).reset_index(drop=True)  # shuffle

df.to_csv("server_metrics.csv", index=False)
print("✅ server_metrics.csv generated")
