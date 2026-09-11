import os
import requests
import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager
from routers import faces

NEXT_JS_URL = os.environ.get("NEXT_JS_URL", "http://localhost:3000")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Synchronizing FAISS indices from MongoDB...")
    try:
        # Fetch embeddings grouped by event from Next.js internal API
        res = requests.get(f"{NEXT_JS_URL}/api/internal/embeddings", timeout=10)
        if res.ok:
            data = res.json().get("data", {})
            total_indexed = 0
            for event_id, embeddings_data in data.items():
                sync_req = {"eventId": event_id, "embeddingsData": embeddings_data}
                # Use the router function directly to sync
                faces.sync_index(faces.SyncIndexRequest(**sync_req))
                total_indexed += sum([len(item["embeddings"]) for item in embeddings_data])
            print(f"Successfully synchronized {total_indexed} faces into FAISS across {len(data)} events.")
        else:
            print(f"Failed to sync FAISS indices: {res.status_code} {res.text}")
    except Exception as e:
        print(f"Error during FAISS sync: {e}")
    yield
    print("Shutting down AI Engine...")

app = FastAPI(
    title="ScanUtsav Python AI Face Recognition Engine",
    description="High-Precision Face Recognition Microservice using InsightFace & FAISS",
    version="3.0.0",
    lifespan=lifespan
)

app.include_router(faces.router)

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "ScanUtsav Python AI Engine",
        "version": "3.0.0",
        "model": "insightface-buffalo_l"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting ScanUtsav Python AI Face Recognition Engine on http://0.0.0.0:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port)
