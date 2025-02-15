// ragie_caller.js

// Instead of referencing process.env.REACT_APP_RAGIE_API_KEY (which is now in your FastAPI),
// we'll call the FastAPI routes at e.g. http://localhost:8000

const RAGIE_SCOPE = "myEventScope";

/**
 * Upload emails to Ragie (via FastAPI proxy).
 * @param {String} mergedEmails - The combined text of all emails to upload.
 * @returns {Promise<Response>} The fetch response, or throws an error.
 */
export async function uploadEmailsToRagie(mergedEmails) {
  // Create form data
  const formData = new FormData();
  formData.append("metadata", JSON.stringify({ scope: RAGIE_SCOPE }));
  formData.append(
    "file",
    new Blob([mergedEmails], { type: "text/plain" }),
    "emails.txt"
  );
  formData.append("mode", "fast"); // or "slow"

  // Call your FastAPI endpoint
  const res = await fetch("http://localhost:8000/api/uploadEmails", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }

  return res;
}

/**
 * Retrieve relevant chunks from Ragie (via FastAPI proxy).
 * @param {String} actionText - The user's short query or button text.
 * @returns {Promise<String>} The concatenated chunk text from Ragie.
 */
export async function retrieveRelevantChunks(actionText) {
  const retrievalRes = await fetch("http://localhost:8000/api/retrieveRelevantChunks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: actionText,
      rerank: true,
      filter: { scope: RAGIE_SCOPE },
    }),
  });

  if (!retrievalRes.ok) {
    throw new Error(
      `Failed to retrieve data: ${retrievalRes.status} ${retrievalRes.statusText}`
    );
  }

  const data = await retrievalRes.json();

  // "scored_chunks" might come directly from Ragie’s JSON
  const chunkText = data.scored_chunks
    ? data.scored_chunks.map((chunk) => chunk.text).join("\n\n")
    : "";
  return chunkText;
}
