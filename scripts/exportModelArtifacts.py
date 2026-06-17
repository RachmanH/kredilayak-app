import json
import numpy as np
import joblib
import pandas as pd
from tensorflow import keras

model = keras.models.load_model("mlp_credit_risk_model.keras")
preprocessor = joblib.load("credit_preprocessor.pkl")
topsis_config = joblib.load("topsis_config.pkl")
benchmark_df = pd.read_csv("credit_ranking_topsis_result.csv")

weights = model.get_weights()

mlp_layers = []
for i in range(0, len(weights), 2):
    mlp_layers.append({
        "weights": weights[i].tolist(),
        "biases": weights[i + 1].tolist(),
    })

scaler = preprocessor.named_transformers_["numeric"]
encoder = preprocessor.named_transformers_["categorical"]

numeric_columns = [
    "average_eligible_emi",
    "average_usable_salary",
    "average_monthly_credit",
    "employment_tenure_years",
    "average_month_end_balance",
    "bounce_count",
    "gambling_transaction_count",
    "active_loans_count",
    "has_credit_card",
    "has_personal_loan",
    "has_home_loan",
    "credit_exposure_intensity",
    "average_obligation_to_income_ratio",
    "credit_score",
]

categorical_columns = ["income_stability", "employer_category"]

ohe_categories = {}
for idx, col in enumerate(categorical_columns):
    ohe_categories[col] = encoder.categories_[idx].tolist()

feature_order = preprocessor.get_feature_names_out().tolist()

credit_model = {
    "feature_columns": numeric_columns + categorical_columns,
    "numeric_columns": numeric_columns,
    "categorical_columns": categorical_columns,
    "scaler": {
        "mean": scaler.mean_.tolist(),
        "scale": scaler.scale_.tolist(),
    },
    "encoder_categories": ohe_categories,
    "feature_order": feature_order,
    "mlp": {
        "input_dim": 21,
        "layers": mlp_layers,
    },
    "risk_labels": {0: "Low Risk", 1: "Medium Risk", 2: "High Risk"},
}

topsis_json = {
    "criteria": topsis_config["criterion"].tolist(),
    "types": topsis_config["type"].tolist(),
    "weights": topsis_config["normalized_weight"].tolist(),
}

benchmark_columns = [
    "credit_score",
    "average_usable_salary",
    "average_eligible_emi",
    "employment_tenure_years",
    "average_month_end_balance",
    "average_obligation_to_income_ratio",
    "active_loans_count",
    "credit_exposure_intensity",
    "bounce_count",
    "high_risk_probability",
]

benchmark_data = benchmark_df[benchmark_columns].to_dict(orient="records")

with open("creditModel.json", "w") as f:
    json.dump(credit_model, f, indent=2)

with open("topsisConfig.json", "w") as f:
    json.dump(topsis_json, f, indent=2)

with open("topsisBenchmark.json", "w") as f:
    json.dump(benchmark_data, f)

print(f"creditModel.json: {len(mlp_layers)} layers, input_dim=21")
print(f"  Scaler mean shape: {scaler.mean_.shape}")
print(f"  Encoder categories: {ohe_categories}")
print(f"  Feature order ({len(feature_order)}): {feature_order}")
print(f"topsisConfig.json: {len(topsis_json['criteria'])} criteria")
print(f"topsisBenchmark.json: {len(benchmark_data)} records")
print("Export complete.")
