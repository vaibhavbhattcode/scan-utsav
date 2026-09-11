import io
import base64
import requests
import os
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from services.insightface_service import insightface_service
from services.faiss_service import faiss_service

router = APIRouter()

class ProcessImageRequest(BaseModel):
    mediaId: str
    eventId: str
    mediaUrl: str

class FaceSearchRequest(BaseModel):
    eventId: str
    selfie: str

def fetch_image(url: str) -> np.ndarray:
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        # Decode directly to BGR for cv2/insightface
        img_array = np.asarray(bytearray(res.content), dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image")
        return img
    except Exception as e:
        raise ValueError(f"Could not fetch image: {e}")

def decode_base64_image(base64_str: str) -> np.ndarray:
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        img_data = base64.b64decode(base64_str)
        img_array = np.asarray(bytearray(img_data), dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image")
        return img
    except Exception as e:
        raise ValueError(f"Could not decode base64 image: {e}")

@router.post("/process-image")
def process_image(req: ProcessImageRequest):
    try:
        # Download image
        img = fetch_image(req.mediaUrl)
        
        # Get face embeddings
        faces = insightface_service.get_embeddings(img)
        
        # Extract just the embeddings to add to FAISS
        embeddings = [f["embedding"] for f in faces]
        
        if embeddings:
            faiss_service.add_embeddings(req.eventId, req.mediaId, embeddings)
            
        return {
            "success": True,
            "faces": faces
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/search-faces")
def search_faces(req: FaceSearchRequest):
    try:
        # Decode selfie
        if req.selfie.startswith("http"):
            img = fetch_image(req.selfie)
        else:
            img = decode_base64_image(req.selfie)
            
        # Get selfie embedding
        faces = insightface_service.get_embeddings(img, is_selfie=True)
        
        if not faces:
            return {"success": False, "error": "No face detected in the selfie."}
            
        if len(faces) > 1:
            return {"success": False, "error": f"Multiple faces ({len(faces)}) detected in the selfie. Please crop the photo to only show your face."}
            
        query_face = faces[0]
        query_embedding = query_face["embedding"]
        
        # Read configurable threshold
        threshold = float(os.getenv("FACE_MATCH_THRESHOLD", "0.70"))
        
        # Search FAISS with exact re-scoring
        matches = faiss_service.search(req.eventId, query_embedding, top_k=200, threshold=threshold)
        
        # Format results (matches is a list of tuples: (mediaId, confidence))
        results = [{"mediaId": mid, "confidence": round(conf * 100, 2)} for mid, conf in matches]
        
        diagnostic_logs = {
            "threshold_used": threshold,
            "selfie_det_score": query_face["det_score"],
            "total_matches": len(results)
        }
        
        return {
            "success": True,
            "count": len(results),
            "matches": results,
            "diagnostic_logs": diagnostic_logs
        }
    except ValueError as ve:
        # Return validation errors gracefully
        return {"success": False, "error": str(ve)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class SyncIndexRequest(BaseModel):
    eventId: str
    embeddingsData: List[Dict[str, Any]] # [{"mediaId": "123", "embeddings": [[...], [...]]}]

@router.post("/sync-index")
def sync_index(req: SyncIndexRequest):
    """
    Called by Next.js on Python service startup to rebuild the FAISS index from MongoDB.
    """
    count = 0
    for item in req.embeddingsData:
        media_id = item.get("mediaId")
        embeddings = item.get("embeddings", [])
        if media_id and embeddings:
            faiss_service.add_embeddings(req.eventId, media_id, embeddings)
            count += len(embeddings)
            
    return {"success": True, "facesIndexed": count}
