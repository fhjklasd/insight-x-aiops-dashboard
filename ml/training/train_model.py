import torch
import torch.nn as nn
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from data_loader import load_data

# --------------------
# Load dataset
# --------------------
X, y = load_data("../data/server_metrics.csv")

# --------------------
# Train-test split
# --------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# --------------------
# Feature scaling
# --------------------
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# --------------------
# Convert to tensors
# --------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

X_train = torch.tensor(X_train, dtype=torch.float32).to(device)
y_train = torch.tensor(y_train.values, dtype=torch.float32).to(device)

X_test = torch.tensor(X_test, dtype=torch.float32).to(device)
y_test = torch.tensor(y_test.values, dtype=torch.float32).to(device)

# --------------------
# Neural Network
# --------------------
model = nn.Sequential(
    nn.Linear(X_train.shape[1], 32),
    nn.ReLU(),
    nn.Linear(32, 16),
    nn.ReLU(),
    nn.Linear(16, 1),
    nn.Sigmoid()
).to(device)

loss_fn = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# --------------------
# Training loop
# --------------------
epochs = 30
for epoch in range(epochs):
    optimizer.zero_grad()
    predictions = model(X_train).squeeze()
    loss = loss_fn(predictions, y_train)
    loss.backward()
    optimizer.step()

    print(f"Epoch {epoch+1}/{epochs} | Loss: {loss.item():.4f}")

# --------------------
# Evaluation
# --------------------
with torch.no_grad():
    test_preds = model(X_test).squeeze()
    test_preds = (test_preds > 0.5).float()
    accuracy = (test_preds == y_test).float().mean()

print(f"✅ Test Accuracy: {accuracy.item() * 100:.2f}%")

# --------------------
# Save model + scaler
# --------------------
torch.save(model.state_dict(), "../models/incident_model.pt")
joblib.dump(scaler, "../models/scaler.pkl")

print("🔥 Model and scaler saved successfully")
