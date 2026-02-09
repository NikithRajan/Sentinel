# EdgeYOLO Intrusion Detection Training Setup
## Quick Setup and Training Guide

### Dataset Information
- **Dataset**: Intrusion-Detection.v1i.coco from Roboflow
- **Format**: COCO
- **Classes**: 3 (Drone, Human, Vehicle)
- **Training Images**: 16,412
- **Total Annotations**: 41,048

### Directory Structure
```
SENTINEL/
├── Intrusion-Detection/           # Dataset
│   ├── train/                     # Training images + annotations
│   ├── valid/                     # Validation images + annotations
│   └── test/                      # Test images + annotations
├── edgeyolo/                      # EdgeYOLO source code
├── params/
│   ├── dataset/
│   │   └── intrusion_detection.yaml    # Dataset config
│   ├── train/
│   │   └── train_intrusion_detection.yaml  # Training config
│   └── model/                     # Model architecture configs
├── train_intrusion_detection.py   # Training script
└── README.md                      # This file
```

### Prerequisites

1. **Python Environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Install PyTorch (with CUDA support)**
   ```bash
   # For CUDA 11.8
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   
   # For CUDA 12.1
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

3. **Install EdgeYOLO dependencies**
   ```bash
   cd edgeyolo
   pip install -r requirements.txt
   cd ..
   ```

4. **(Optional) Download Pretrained Weights**
   
   For transfer learning, download pretrained weights from:
   https://github.com/LSH9832/edgeyolo/releases
   
   Available models:
   - `edgeyolo_coco.pth` - Full model (~48M params)
   - `edgeyolo_m.pth` - Medium model (~22M params)
   - `edgeyolo_s.pth` - Small model (~8M params)
   - `edgeyolo_tiny.pth` - Tiny model (~3M params)
   
   Then update `params/train/train_intrusion_detection.yaml`:
   ```yaml
   weights: "path/to/edgeyolo_coco.pth"
   ```

### Training

**Option 1: Using the training script**
```bash
python train_intrusion_detection.py
```

**Option 2: Using EdgeYOLO directly**
```bash
cd edgeyolo
python train.py --cfg ../params/train/train_intrusion_detection.yaml
```

### Training Configuration

Key parameters in `params/train/train_intrusion_detection.yaml`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_epoch` | 300 | Total training epochs |
| `batch_size_per_gpu` | 8 | Batch size (adjust based on GPU memory) |
| `input_size` | [640, 640] | Input image size |
| `lr_per_img` | 0.00015625 | Base learning rate |
| `device` | [0] | GPU device IDs |
| `fp16` | true | Mixed precision training |

**Batch Size Recommendations:**
- RTX 3060 (12GB): 8-12
- RTX 3080 (10GB): 8-12
- RTX 3090 (24GB): 16-24
- RTX 4090 (24GB): 24-32

### Monitoring Training

Training logs and checkpoints are saved to:
```
output/intrusion_detection/
├── train.log              # Training logs
├── eval.yaml              # Evaluation results
├── best_ckpt.pth          # Best model checkpoint
└── last_epoch_ckpt.pth    # Latest checkpoint
```

### Evaluation

After training, evaluate the model:
```bash
cd edgeyolo
python evaluate.py --weights ../output/intrusion_detection/best_ckpt.pth \
                   --dataset ../params/dataset/intrusion_detection.yaml \
                   --batch 16 \
                   --device 0
```

### Inference/Detection

Run detection on images or video:
```bash
cd edgeyolo
python detect.py --weights ../output/intrusion_detection/best_ckpt.pth \
                 --source path/to/images_or_video \
                 --conf-thres 0.25 \
                 --nms-thres 0.45
```

### Export Model

Export to ONNX for deployment:
```bash
cd edgeyolo
python export.py --weights ../output/intrusion_detection/best_ckpt.pth \
                 --input-size 640 640 \
                 --batch 1
```

### Model Performance Expectations

Based on EdgeYOLO architecture:
- **EdgeYOLO**: ~50 FPS on RTX 3060, mAP ~45-55% (depending on dataset)
- **EdgeYOLO-S**: ~80 FPS, slightly lower mAP
- **EdgeYOLO-Tiny**: ~120 FPS, lower mAP but suitable for edge devices

### Troubleshooting

1. **CUDA Out of Memory**
   - Reduce `batch_size_per_gpu` in training config
   - Reduce `input_size` to [480, 480] or [416, 416]

2. **Slow Training**
   - Enable `fp16: true` for mixed precision
   - Increase `loader_num_workers`
   - Set `use_cache: true` in dataset config

3. **Poor Convergence**
   - Try pretrained weights for transfer learning
   - Adjust learning rate
   - Increase training epochs

### References

- [EdgeYOLO Repository](https://github.com/LSH9832/edgeyolo)
- [EdgeYOLO Paper](https://arxiv.org/abs/2302.07483)
- [Roboflow Dataset](https://roboflow.com)
