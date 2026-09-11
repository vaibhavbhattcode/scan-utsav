import faiss
import numpy as np
from typing import List, Tuple

class FaissService:
    def __init__(self):
        # Dictionary mapping eventId to its FAISS index
        self.indexes = {}
        # Dictionary mapping eventId to a list of mediaIds
        self.media_maps = {}
        # Dictionary mapping eventId to raw embeddings for exact numpy rescoring
        self.raw_embeddings = {}
        # ArcFace output embedding dimension
        self.dim = 512

    def _get_or_create_index(self, event_id: str):
        if event_id not in self.indexes:
            # InnerProduct (cosine similarity since embeddings are normalized by insightface)
            self.indexes[event_id] = faiss.IndexFlatIP(self.dim)
            self.media_maps[event_id] = []
            self.raw_embeddings[event_id] = []
        return self.indexes[event_id], self.media_maps[event_id], self.raw_embeddings[event_id]

    def add_embeddings(self, event_id: str, media_id: str, embeddings: List[List[float]]):
        if not embeddings:
            return
        
        index, media_map, raw_list = self._get_or_create_index(event_id)
        
        vectors = np.array(embeddings).astype('float32')
        index.add(vectors)
        
        # Add media_id and raw embedding for each detected face
        for emb in embeddings:
            media_map.append(media_id)
            raw_list.append(emb)

    def search(self, event_id: str, query_embedding: List[float], top_k: int = 100, threshold: float = 0.70) -> List[Tuple[str, float]]:
        if event_id not in self.indexes or self.indexes[event_id].ntotal == 0:
            return []
            
        index, media_map, raw_list = self.indexes[event_id], self.media_maps[event_id], self.raw_embeddings[event_id]
        
        query_vector = np.array([query_embedding]).astype('float32')
        
        # search returns distances and indices
        k = min(top_k, index.ntotal)
        _, indices = index.search(query_vector, k)
        
        results = []
        for idx in indices[0]:
            if idx != -1:
                # Exact Numpy Cosine Similarity Rescoring
                exact_score = float(np.dot(query_embedding, raw_list[idx]))
                
                # Apply Strict Threshold
                if exact_score >= threshold:
                    results.append((media_map[idx], exact_score))
                    
        # Return unique mediaIds, taking the highest confidence if an image matched multiple faces
        unique_results = {}
        for mid, conf in results:
            if mid not in unique_results or conf > unique_results[mid]:
                unique_results[mid] = conf
                
        sorted_results = sorted(unique_results.items(), key=lambda item: item[1], reverse=True)
        return sorted_results

faiss_service = FaissService()
