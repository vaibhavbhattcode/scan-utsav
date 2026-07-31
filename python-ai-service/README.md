# ScanUtsav — Python Deep Learning AI Face Recognition Microservice

This microservice provides 99.6%+ high-precision deep learning face recognition and similarity search for ScanUtsav event photo albums.

---

## 🚀 Quick Start (Local Run)

1. **Install Dependencies**:
   ```bash
   cd python-ai-service
   pip install -r requirements.txt
   ```

2. **Run Python Server**:
   ```bash
   python app.py
   # Or using uvicorn:
   uvicorn app:app --host 0.0.0.0 --port 5000 --reload
   ```

3. **Verify Health**:
   Open `http://localhost:5000/health` in your browser.

4. **Connect to ScanUtsav**:
   Add this variable to your root ScanUtsav `.env` file:
   ```env
   PYTHON_FACE_AI_URL=http://localhost:5000
   ```

---

## 🐳 Docker Deployment

Build and run using Docker:

```bash
cd python-ai-service
docker build -t scanutsav-python-ai .
docker run -d -p 5000:5000 --name scanutsav-ai scanutsav-python-ai
```
