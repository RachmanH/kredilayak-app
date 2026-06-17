"""
Manual export Keras MLP model ke format TensorFlow.js Layers.
Tidak bergantung pada tensorflowjs package — langsung generate model.json + weights.
Jalankan: PYENV_VERSION=envpython11 python scripts/exportTfjsManual.py
"""

import json
import struct
import os
import numpy as np

# Load weights dari creditModel.json (sudah diekstrak dari .keras)
with open("src/data/creditModel.json") as f:
    cm = json.load(f)

layers = cm["mlp"]["layers"]
output_dir = "public/tfjs_model"
os.makedirs(output_dir, exist_ok=True)

# Build model.json (TF.js Layers format)
model_json = {
    "format": "layers-model",
    "generatedBy": "keras v2.21.0",
    "convertedBy": "custom-export v1.0",
    "modelTopology": {
        "class_name": "Sequential",
        "config": {
            "name": "sequential",
            "layers": []
        }
    },
    "weightsManifest": [{
        "paths": ["weights.bin"],
        "weights": []
    }]
}

topo_layers = model_json["modelTopology"]["config"]["layers"]
weight_manifest = model_json["weightsManifest"][0]["weights"]

# Input layer
topo_layers.append({
    "class_name": "InputLayer",
    "config": {
        "name": "input_layer",
        "batch_input_shape": [None, 21],
        "dtype": "float32",
        "sparse": False
    }
})

# Dense layers
layer_configs = [
    {"units": 64, "activation": "relu", "name": "dense_1"},
    {"units": 32, "activation": "relu", "name": "dense_2"},
    {"units": 16, "activation": "relu", "name": "dense_3"},
    {"units": 3, "activation": "softmax", "name": "dense_output"},
]

all_weight_data = []

for i, (lc, layer_data) in enumerate(zip(layer_configs, layers)):
    w = np.array(layer_data["weights"], dtype=np.float32)
    b = np.array(layer_data["biases"], dtype=np.float32)

    kernel_name = f"{lc['name']}/kernel"
    bias_name = f"{lc['name']}/bias"

    weight_manifest.append({
        "name": kernel_name,
        "shape": list(w.shape),
        "dtype": "float32"
    })
    weight_manifest.append({
        "name": bias_name,
        "shape": list(b.shape),
        "dtype": "float32"
    })

    all_weight_data.append(w.tobytes())
    all_weight_data.append(b.tobytes())

    topo_layers.append({
        "class_name": "Dense",
        "config": {
            "name": lc["name"],
            "units": lc["units"],
            "activation": lc["activation"],
            "use_bias": True,
            "kernel_initializer": {"class_name": "GlorotUniform", "config": {"seed": None}},
            "bias_initializer": {"class_name": "Zeros", "config": {}},
            "dtype": "float32"
        }
    })

# Write model.json
with open(os.path.join(output_dir, "model.json"), "w") as f:
    json.dump(model_json, f, indent=2)

# Write weights.bin (concatenate all weight arrays)
with open(os.path.join(output_dir, "weights.bin"), "wb") as f:
    for data in all_weight_data:
        f.write(data)

print(f"Exported to {output_dir}/")
for fn in sorted(os.listdir(output_dir)):
    size = os.path.getsize(os.path.join(output_dir, fn))
    print(f"  {fn} ({size:,} bytes)")
print("Done!")
