import pandas as pd
from feature_config import FEATURES

def load_data(path):
    df = pd.read_csv(path)
    
    missing = set(FEATURES) - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    X = df[FEATURES]
    y = df["incident"]
    return X, y
