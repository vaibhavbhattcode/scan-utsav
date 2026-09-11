import cv2
import numpy as np
from insightface.app import FaceAnalysis

class InsightFaceService:
    def __init__(self):
        # We use antelopev2 or buffalo_l. buffalo_l is the default high accuracy model.
        # Initialize the FaceAnalysis app (requires ONNX runtime)
        self.app = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
        # Prepare the model with detection size. Using 640x640 is standard.
        self.app.prepare(ctx_id=0, det_size=(640, 640))

    def check_blur(self, img_np: np.ndarray, box: list) -> float:
        x1, y1, x2, y2 = map(int, box)
        h, w = img_np.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        
        face_roi = img_np[y1:y2, x1:x2]
        if face_roi.size == 0:
            return 0.0
            
        gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()

    def get_embeddings(self, img_np: np.ndarray, is_selfie: bool = False):
        """
        Detects faces in the given numpy image (BGR format).
        Returns a list of dictionaries with embedding, bounding box, and quality metrics.
        """
        faces = self.app.get(img_np)
        results = []
        for face in faces:
            # 1. Detection Confidence Check
            if face.det_score < 0.60:
                if is_selfie:
                    raise ValueError(f"Face detection confidence too low ({face.det_score:.2f}). Please upload a clearer photo.")
                continue

            # 2. Size Validation
            box = face.bbox
            width = box[2] - box[0]
            height = box[3] - box[1]
            if width < 60 or height < 60:
                if is_selfie:
                    raise ValueError(f"Face is too small ({int(width)}x{int(height)}). Please get closer to the camera.")
                continue

            # 3. Pose Angle Validation
            if hasattr(face, 'pose') and face.pose is not None:
                pitch, yaw, roll = face.pose
                if abs(pitch) > 45 or abs(yaw) > 45:
                    if is_selfie:
                        raise ValueError("Extreme face angle detected. Please look straight at the camera.")
                    continue

            # 4. Blur Detection
            blur_score = self.check_blur(img_np, box)
            if blur_score < 30.0:
                if is_selfie:
                    raise ValueError(f"Image is too blurry (score: {blur_score:.1f}). Please hold the camera still.")
                continue

            # 5. Exact L2 Normalization
            raw_embedding = face.embedding
            norm = np.linalg.norm(raw_embedding)
            if norm == 0:
                continue
            normalized_embedding = (raw_embedding / norm).tolist()

            results.append({
                "embedding": normalized_embedding,
                "box": box.tolist(),
                "det_score": float(face.det_score),
                "age": int(getattr(face, 'age', 0)),
                "gender": "male" if getattr(face, 'sex', -1) == 1 else ("female" if getattr(face, 'sex', -1) == 0 else "unknown")
            })
            
        return results

# Singleton instance
insightface_service = InsightFaceService()
