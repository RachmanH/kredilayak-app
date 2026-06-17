"""
Konversi model Keras (.keras) ke format TensorFlow.js.
Jalankan: PYENV_VERSION=envpython11 python scripts/convertToTfjs.py
"""

import os
import tensorflowjs as tfjs
from tensorflow import keras

MODEL_PATH = "mlp_credit_risk_model.keras"
OUTPUT_DIR = "public/tfjs_model"

if not os.path.exists(MODEL_PATH):
    print(f"Error: {MODEL_PATH} tidak ditemukan.")
    exit(1)

os.makedirs(OUTPUT_DIR, exist_ok=True)

model = keras.models.load_model(MODEL_PATH)
model.summary()

tfjs.converters.save_keras_model(model, OUTPUT_DIR)

print(f"\nModel berhasil dikonversi ke: {OUTPUT_DIR}/")
for f in os.listdir(OUTPUT_DIR):
    size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
    print(f"  {f} ({size:,} bytes)")
print("\nSelesai.")
