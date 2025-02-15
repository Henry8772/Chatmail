import os
import uvicorn

from fastapi import FastAPI, File, Form, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

# Load your Ragie API key from environment or however you want
RAGIE_API_KEY = os.getenv("RAGIE_API_KEY", "YOUR_RAGIE_API_KEY_HERE")
RAGIE_SCOPE = "myEventScope"

RAGIE_UPLOAD_URL = "https://api.ragie.ai/documents"
RAGIE_RETRIEVAL_URL = "https://api.ragie.ai/retrievals"

app = FastAPI()

# Configure CORS so your React frontend can call the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify ["http://localhost:3000"] if you want to lock down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RagieRetrieveRequest(BaseModel):
    query: str
    rerank: bool
    filter: dict

@app.post("/api/uploadEmails")
async def upload_emails_to_ragie(
    metadata: str = Form(...),
    file: UploadFile = File(...),
    mode: str = Form(...),
):
    """
    Proxies the POST request to Ragie to upload files.
    """
    # The `metadata` should already be JSON string from your client
    # We'll forward it directly.
    headers = {
        "Authorization": f"Bearer {RAGIE_API_KEY}",
    }

    files = {
        # metadata is text; we can pass (filename, fileobj, content_type),
        # or in this case (None, string, 'application/json') if we want
        "metadata": (None, metadata, "application/json"),
        "file": (file.filename, file.file, file.content_type or "text/plain"),
        "mode": (None, mode),
    }

    # Post form data to Ragie
    res = requests.post(RAGIE_UPLOAD_URL, headers=headers, files=files)

    if not res.ok:
        return {
            "error": True,
            "message": f"Ragie upload failed: {res.status_code} {res.reason}",
        }

    return {
        "error": False,
        "status": res.status_code,
        "text": res.text,
        "status_text": res.reason,
    }


@app.post("/api/retrieveRelevantChunks")
async def retrieve_relevant_chunks(req: RagieRetrieveRequest):
    """
    Proxies the POST request to Ragie to retrieve relevant chunks.
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {RAGIE_API_KEY}",
    }

    payload = {
        "query": req.query,
        "rerank": req.rerank,
        "filter": req.filter,
    }

    res = requests.post(RAGIE_RETRIEVAL_URL, headers=headers, json=payload)

    if not res.ok:
        return {
            "error": True,
            "message": f"Failed to retrieve data: {res.status_code} {res.reason}",
        }

    # Return the JSON from Ragie directly
    return res.json()

# run this
# uvicorn main:app --host 0.0.0.0 --port 8000

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)