"""
YOLOv8 Detection with JSON Output
For backend integration
"""

import json
import cv2
import os
import argparse
from pathlib import Path
from datetime import datetime
from ultralytics import YOLO


def detect_to_json(model_path, source, output_json=None, conf_thres=0.5, img_size=640):
    """
    Run YOLOv8 detection and return results as JSON
    
    Args:
        model_path: Path to YOLOv8 model (.pt)
        source: Path to image/folder/video
        output_json: Optional path to save JSON file
        conf_thres: Confidence threshold
        img_size: Input image size
    
    Returns:
        dict: Detection results in JSON format
    """
    
    # Load model
    model = YOLO(model_path)
    
    # Get source files
    source_path = Path(source)
    if source_path.is_file():
        if source_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp']:
            files = [source_path]
            is_video = False
        elif source_path.suffix.lower() in ['.mp4', '.avi', '.mov', '.mkv']:
            files = [source_path]
            is_video = True
        else:
            files = [source_path]
            is_video = False
    else:
        files = list(source_path.glob('*.jpg')) + list(source_path.glob('*.png'))
        is_video = False
    
    # Results container
    results_json = {
        "model": str(model_path),
        "timestamp": datetime.now().isoformat(),
        "confidence_threshold": conf_thres,
        "detections": []
    }
    
    # Run inference
    for file_path in files:
        results = model.predict(
            source=str(file_path),
            conf=conf_thres,
            imgsz=img_size,
            verbose=False
        )
        
        for result in results:
            frame_detections = {
                "source": str(file_path.name),
                "image_width": result.orig_shape[1],
                "image_height": result.orig_shape[0],
                "objects": []
            }
            
            if result.boxes is not None and len(result.boxes) > 0:
                boxes = result.boxes.xyxy.cpu().numpy()  # x1, y1, x2, y2
                confs = result.boxes.conf.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy().astype(int)
                
                for i, (box, conf, cls) in enumerate(zip(boxes, confs, classes)):
                    x1, y1, x2, y2 = box
                    obj = {
                        "id": i,
                        "class_id": int(cls),
                        "class_name": result.names[cls],
                        "confidence": round(float(conf), 4),
                        "bbox": {
                            "x1": round(float(x1), 2),
                            "y1": round(float(y1), 2),
                            "x2": round(float(x2), 2),
                            "y2": round(float(y2), 2),
                            "width": round(float(x2 - x1), 2),
                            "height": round(float(y2 - y1), 2)
                        }
                    }
                    frame_detections["objects"].append(obj)
            
            frame_detections["count"] = len(frame_detections["objects"])
            results_json["detections"].append(frame_detections)
    
    # Save to file if specified
    if output_json:
        with open(output_json, 'w') as f:
            json.dump(results_json, f, indent=2)
        print(f"✅ Results saved to: {output_json}")
    
    return results_json


def detect_single_image(model_path, image_path, conf_thres=0.5):
    """
    Quick detection on a single image - returns simple JSON
    Useful for API endpoints
    """
    model = YOLO(model_path)
    results = model.predict(source=image_path, conf=conf_thres, verbose=False)
    
    detections = []
    for result in results:
        if result.boxes is not None:
            for i, box in enumerate(result.boxes):
                detections.append({
                    "class": result.names[int(box.cls)],
                    "confidence": round(float(box.conf), 4),
                    "bbox": [round(x, 2) for x in box.xyxy[0].tolist()]
                })
    
    return {
        "success": True,
        "count": len(detections),
        "detections": detections
    }


def process_video_stream(model_path, video_source=0, conf_thres=0.5, callback=None):
    """
    Process video stream (webcam or file) with callback for each frame
    
    Args:
        model_path: Path to model
        video_source: 0 for webcam, or path to video file
        conf_thres: Confidence threshold
        callback: Function to call with JSON results for each frame
    """
    model = YOLO(model_path)
    cap = cv2.VideoCapture(video_source)
    
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        results = model.predict(source=frame, conf=conf_thres, verbose=False)
        
        frame_json = {
            "frame": frame_count,
            "timestamp": datetime.now().isoformat(),
            "detections": []
        }
        
        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    frame_json["detections"].append({
                        "class": result.names[int(box.cls)],
                        "confidence": round(float(box.conf), 4),
                        "bbox": [round(x, 2) for x in box.xyxy[0].tolist()]
                    })
        
        frame_json["count"] = len(frame_json["detections"])
        
        if callback:
            callback(frame_json)
        else:
            print(json.dumps(frame_json))
        
        frame_count += 1
        
        # Press 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='YOLOv8 Detection with JSON Output')
    parser.add_argument('--model', type=str, required=True, help='Path to model weights (.pt)')
    parser.add_argument('--source', type=str, required=True, help='Image/folder/video path')
    parser.add_argument('--output', type=str, default='detections.json', help='Output JSON file')
    parser.add_argument('--conf', type=float, default=0.5, help='Confidence threshold')
    parser.add_argument('--imgsz', type=int, default=640, help='Image size')
    
    args = parser.parse_args()
    
    results = detect_to_json(
        model_path=args.model,
        source=args.source,
        output_json=args.output,
        conf_thres=args.conf,
        img_size=args.imgsz
    )
    
    print(f"\n📊 Detection Summary:")
    print(f"   Total images: {len(results['detections'])}")
    total_objects = sum(d['count'] for d in results['detections'])
    print(f"   Total objects: {total_objects}")
