"""
Live YOLOv8 Detection with Webcam
Press 'q' to quit

Usage:
    python live_detect.py                      # Normal mode with display
    python live_detect.py --json               # JSON stream mode (for backend)
    python live_detect.py --json --interval 5  # JSON every 5 frames
"""

import cv2
import json
import sys
from ultralytics import YOLO
from datetime import datetime


def live_detect_json(model_path="best.pt", camera=0, conf=0.5, interval=1):
    """
    Stream JSON detections to stdout (for backend integration)
    
    Args:
        model_path: Path to YOLOv8 model
        camera: Camera index (0 = default webcam)
        conf: Confidence threshold
        interval: Output JSON every N frames (default: 1 = every frame)
    """
    # Load model (suppress output for clean JSON)
    model = YOLO(model_path)
    
    # Open camera
    cap = cv2.VideoCapture(camera)
    if not cap.isOpened():
        print(json.dumps({"error": "Cannot open camera"}), flush=True)
        return
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    frame_count = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print(json.dumps({"error": "Failed to grab frame"}), flush=True)
                break
            
            # Run detection
            results = model.predict(frame, conf=conf, verbose=False)
            
            # Output JSON at specified interval
            if frame_count % interval == 0:
                json_output = {
                    "frame": frame_count,
                    "timestamp": datetime.now().isoformat(),
                    "detections": []
                }
                
                if results[0].boxes is not None and len(results[0].boxes) > 0:
                    for box in results[0].boxes:
                        json_output["detections"].append({
                            "class": model.names[int(box.cls)],
                            "confidence": round(float(box.conf), 4),
                            "bbox": [round(x, 2) for x in box.xyxy[0].tolist()]
                        })
                
                json_output["count"] = len(json_output["detections"])
                print(json.dumps(json_output), flush=True)
            
            frame_count += 1
            
    except KeyboardInterrupt:
        pass
    finally:
        cap.release()


def live_detect(model_path="best.pt", camera=0, conf=0.5):
    """
    Run live detection on webcam
    
    Args:
        model_path: Path to YOLOv8 model
        camera: Camera index (0 = default webcam)
        conf: Confidence threshold
    """
    # Load model
    print("Loading model...")
    model = YOLO(model_path)
    print(f"✅ Model loaded! Classes: {model.names}")
    
    # Open camera
    cap = cv2.VideoCapture(camera)
    if not cap.isOpened():
        print("❌ Cannot open camera")
        return
    
    # Set camera resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    print("\n" + "="*50)
    print("🎥 LIVE DETECTION STARTED")
    print("   Press 'q' to quit")
    print("   Press 's' to save screenshot")
    print("   Press 'j' to print JSON")
    print("="*50 + "\n")
    
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break
        
        # Run detection
        results = model.predict(frame, conf=conf, verbose=False)
        
        # Draw results on frame
        annotated_frame = results[0].plot()
        
        # Get detections for display
        detections = []
        if results[0].boxes is not None:
            for box in results[0].boxes:
                cls_id = int(box.cls)
                cls_name = model.names[cls_id]
                confidence = float(box.conf)
                detections.append(f"{cls_name}: {confidence:.1%}")
        
        # Add info overlay
        cv2.putText(annotated_frame, f"Detections: {len(detections)}", 
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # List detected objects
        y_offset = 60
        for det in detections:
            cv2.putText(annotated_frame, det, (10, y_offset), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            y_offset += 30
        
        # Show frame
        cv2.imshow("SENTINEL - Live Detection (Press 'q' to quit)", annotated_frame)
        
        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('q'):
            print("Quitting...")
            break
        elif key == ord('s'):
            # Save screenshot
            filename = f"detection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            cv2.imwrite(filename, annotated_frame)
            print(f"📸 Screenshot saved: {filename}")
        elif key == ord('j'):
            # Print JSON
            json_output = {
                "timestamp": datetime.now().isoformat(),
                "detections": []
            }
            if results[0].boxes is not None:
                for box in results[0].boxes:
                    json_output["detections"].append({
                        "class": model.names[int(box.cls)],
                        "confidence": round(float(box.conf), 4),
                        "bbox": [round(x, 2) for x in box.xyxy[0].tolist()]
                    })
            print(json.dumps(json_output, indent=2))
        
        frame_count += 1
    
    cap.release()
    cv2.destroyAllWindows()
    print("✅ Camera closed")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Live YOLOv8 Detection')
    parser.add_argument('--model', default='best.pt', help='Model path')
    parser.add_argument('--camera', type=int, default=0, help='Camera index')
    parser.add_argument('--conf', type=float, default=0.5, help='Confidence threshold')
    parser.add_argument('--json', action='store_true', help='JSON stream mode (for backend)')
    parser.add_argument('--interval', type=int, default=1, help='JSON output every N frames (default: 1)')
    args = parser.parse_args()
    
    if args.json:
        # JSON streaming mode for backend
        live_detect_json(args.model, args.camera, args.conf, args.interval)
    else:
        # Normal display mode
        live_detect(args.model, args.camera, args.conf)

