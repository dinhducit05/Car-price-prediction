from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
MODEL_PATH = BASE_DIR / "models" / "car_price_model.pkl"
DATA_PATH = BASE_DIR / "data" / "cars.csv"

FEATURES = [
    "brand",
    "model",
    "model_year",
    "mileage_km",
    "fuel_type",
    "transmission",
    "engine_size",
    "body_type",
    "seats",
    "condition",
]

NUMERIC_FEATURES = {
    "model_year": int,
    "mileage_km": float,
    "engine_size": float,
    "seats": int,
}

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")


@lru_cache(maxsize=1)
def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Không tìm thấy model tại {MODEL_PATH}")
    return joblib.load(MODEL_PATH)


@lru_cache(maxsize=1)
def load_model_catalog():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Không tìm thấy dữ liệu xe tại {DATA_PATH}")

    catalog_frame = pd.read_csv(DATA_PATH, usecols=["brand", "model"], encoding="utf-8-sig")
    catalog_frame = catalog_frame.dropna().drop_duplicates()

    return {
        brand: sorted(group["model"].astype(str).str.strip().unique().tolist())
        for brand, group in catalog_frame.groupby("brand")
    }


@lru_cache(maxsize=1)
def load_model_brands():
    model = load_model()
    preprocessor = model.named_steps["preprocessor"]
    categorical_pipeline = preprocessor.named_transformers_["categorical"]
    encoder = categorical_pipeline.named_steps["onehot"]
    categorical_features = list(preprocessor.transformers_[1][2])
    brand_index = categorical_features.index("brand")
    return sorted(str(brand) for brand in encoder.categories_[brand_index])


def validate_payload(payload):
    if not isinstance(payload, dict):
        return None, ["Body phải là một JSON object."]

    errors = []
    cleaned = {}

    for feature in FEATURES:
        value = payload.get(feature)
        if value is None or (isinstance(value, str) and not value.strip()):
            errors.append(f"Thiếu trường bắt buộc: {feature}")
            continue

        if feature in NUMERIC_FEATURES:
            try:
                cleaned[feature] = NUMERIC_FEATURES[feature](value)
            except (TypeError, ValueError):
                errors.append(f"{feature} phải là một giá trị số hợp lệ")
        else:
            cleaned[feature] = str(value).strip()

    if errors:
        return None, errors

    if not 1990 <= cleaned["model_year"] <= 2026:
        errors.append("model_year phải nằm trong khoảng 1990–2026")
    if cleaned["mileage_km"] < 0:
        errors.append("mileage_km không được là số âm")
    if not 0 < cleaned["engine_size"] <= 10:
        errors.append("engine_size phải lớn hơn 0 và không vượt quá 10 lít")
    if not 2 <= cleaned["seats"] <= 16:
        errors.append("seats phải nằm trong khoảng 2–16")

    return (cleaned, []) if not errors else (None, errors)


@app.get("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "model_exists": MODEL_PATH.exists()})


@app.get("/api/models")
def car_models():
    brand = request.args.get("brand", "").strip()
    if not brand:
        return jsonify({"error": "Thiếu query parameter: brand"}), 400

    try:
        models = load_model_catalog().get(brand, [])
    except Exception:
        app.logger.exception("Không thể đọc danh mục dòng xe")
        return jsonify({"error": "Không thể tải danh sách dòng xe."}), 500

    return jsonify({"brand": brand, "models": models})


@app.get("/api/brands")
def car_brands():
    try:
        brands = load_model_brands()
    except Exception:
        app.logger.exception("Không thể đọc danh mục hãng xe")
        return jsonify({"error": "Không thể tải danh sách hãng xe."}), 500

    return jsonify({"brands": brands})


@app.post("/api/predict")
def predict():
    payload, errors = validate_payload(request.get_json(silent=True))
    if errors:
        return jsonify({"error": "Dữ liệu đầu vào không hợp lệ", "details": errors}), 400

    try:
        input_frame = pd.DataFrame([payload], columns=FEATURES)
        predicted_price = float(load_model().predict(input_frame)[0])
    except Exception:
        app.logger.exception("Không thể dự đoán giá xe")
        return jsonify({"error": "Model không thể xử lý yêu cầu dự đoán."}), 500

    return jsonify(
        {
            "predicted_price_vnd": round(predicted_price),
            "predicted_price_million": round(predicted_price / 1_000_000, 2),
        }
    )


@app.get("/<path:path>")
def frontend_assets(path):
    return send_from_directory(FRONTEND_DIR, path)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
