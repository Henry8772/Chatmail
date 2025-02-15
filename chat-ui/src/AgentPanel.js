// AgentPanel.jsx

import React, { useState, useEffect } from "react";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import "./AgentPanel.css"; // Assume you will customize the chat UI styles here
import { FaRegFileAlt, FaRegLightbulb } from "react-icons/fa";
import { getOpenAiChatCompletion } from "./llm_caller"; // <--- Import from your new file


const ragieApiKey = process.env.REACT_APP_RAGIE_API_KEY;

// A custom scope for our Ragie docs, so we can search them.
const RAGIE_SCOPE = "myEventScope";

const AgentPanel = ({
  event,
  messages,
  setMessages,
  message,
  setMessage,
  onSendMessage,
  emailListVisible,
  toggleEmailList,
}) => {
  const [openAIResponse, setOpenAIResponse] = useState({
    summary: "",
    suggestion: "",
    replies: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [ragieUploaded, setRagieUploaded] = useState(false);

  // -----------------------------
  // 1) Upload emails to Ragie
  // -----------------------------
  useEffect(() => {
    if (!event || !event.emails || event.emails.length === 0) return;

    // Merge all emails into one text for demonstration.
    const mergedEmails = event.emails.join("\n\n---\n\n");

    (async function uploadEmailsToRagie() {
      try {
        // Create form data
        const formData = new FormData();
        // Provide custom scope or metadata. 
        // "scope" is what we can filter on in the retrieval request.
        formData.append("metadata", JSON.stringify({ scope: RAGIE_SCOPE }));
        formData.append(
          "file",
          new Blob([mergedEmails], { type: "text/plain" }),
          "emails.txt"
        );
        formData.append("mode", "fast"); // or "slow"

        const res = await fetch("https://api.ragie.ai/documents", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ragieApiKey}`,
          },
          body: formData,
        });

        if (!res.ok) {
          console.error("Ragie upload failed:", res.status, res.statusText);
          return;
        }
        setRagieUploaded(true);
        console.log("Uploaded emails to Ragie successfully!");
      } catch (err) {
        console.error("Error uploading emails to Ragie:", err);
      }
    })();
  }, [event]);

  // -----------------------------
  // 2) When event loads, we also get a quick summarization from GPT
  // -----------------------------
  const fetchOpenAIResponse = async (content) => {
    setIsLoading(true);
    try {
      const systemPrompt = `You are a helpful assistant. You will ONLY respond in valid JSON with the following format, no extra text:
      {
        "summary": "string",
        "suggestion": "string",
        "replies": ["string", "string", ...]
      }`;

      // Combine that system prompt with the user content
      const userContent = `Generate a concise summary, suggestion, and possible replies for the following email content:\n\n${content}`;

      // Call our helper
      const assistantMessage = await getOpenAiChatCompletion({
        systemPrompt,
        userContent,
        model: "gpt-4o-mini",
        maxTokens: 300,
        temperature: 0.7,
      });

      const data = JSON.parse(assistantMessage);
      return data;
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      return {
        summary: "Failed to generate summary.",
        suggestion: "Failed to generate suggestion.",
        replies: ["No replies available."],
      };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (event && event.summary) {
      (async () => {
        const newData = await fetchOpenAIResponse(event.summary);
        setOpenAIResponse(newData);
      })();
    }
  }, [event]);

  // -----------------------------
  // 3) Summarize on-demand
  // -----------------------------
  const handleSendMessage = async () => {
    const trimmedMessage = message.trim().toLowerCase();

    if (trimmedMessage === "/summarize") {
      const newData = await fetchOpenAIResponse(event.summary || "");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Summary: ${newData.summary}\nSuggestion: ${newData.suggestion}\nReplies: ${newData.replies.join(", ")}`,
        },
      ]);
      setMessage("");
    } else {
      onSendMessage();
    }
  };

  // -----------------------------
  // 4) When user clicks a "reply" button,
  //    we do a RAGIE retrieval + GPT draft
  // -----------------------------
  const handleActionClick = async (actionText) => {
    if (!ragieUploaded) {
      alert("Emails have not yet been uploaded to Ragie or failed to upload.");
      return;
    }

    try {
      setIsLoading(true);

      // 4a) Query Ragie for relevant chunks
      const retrievalRes = await fetch("https://api.ragie.ai/retrievals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + ragieApiKey,
        },
        body: JSON.stringify({
          query: actionText,
          rerank: true,
          filter: { scope: RAGIE_SCOPE },
        }),
      });

      if (!retrievalRes.ok) {
        console.error(
          `Failed to retrieve data from Ragie API: ${retrievalRes.status} ${retrievalRes.statusText}`
        );
        return;
      }

      const data = await retrievalRes.json();
      const chunkText = data.scored_chunks.map((chunk) => chunk.text).join("\n\n");
      
      // 4b) Use chunkText + user actionText to get GPT to draft a reply
      const systemPrompt = `You are "Ragie AI", a friendly AI assistant. 
      Here is all the information from the relevant documents:
      ===
      ${chunkText}
      ===
      The user wants to craft an email reply based on the above. 
      Draft a concise, polite, and professional email response. 
      Write your answer as pure text (no JSON).`;
      
      const draftReply = await getOpenAiChatCompletion({
        systemPrompt,             // the system instructions
        userContent: actionText,  // the user's short query or button text
        model: "gpt-4o",          // which model to use
        maxTokens: 300,
        temperature: 0.7,
      });
      


      // 4c) Add the GPT draft to the conversation
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `**Draft Reply:**\n${draftReply}`,
        },
      ]);
    } catch (err) {
      console.error("Error retrieving from Ragie or drafting reply:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // UI RENDER
  // -----------------------------
  if (!event) {
    return (
      <div className="chatContainer">
        <div className="chatHeader">No Event Selected</div>
      </div>
    );
  }

  return (
    <div className="chatContainer">
      {/* Chat Header */}
      <div className="chatHeader">
        <h3>{event.title}</h3>

        {isLoading ? (
          <div className="loadingContainer">
            <p className="loadingText">Thinking...</p>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <p className="summaryText">
              <FaRegFileAlt className="summaryIcon" />{" "}
              {openAIResponse.summary}
            </p>
            <p className="suggestionText">
              <FaRegLightbulb className="suggestionIcon" />{" "}
              {openAIResponse.suggestion}
            </p>
          </>
        )}
      </div>

      {/* Toggle Email List */}
      <div className="toggleEmailList">
        <span className="toggleText">
          {emailListVisible ? "Hide Email List" : "Show Email List"}
        </span>
        <Toggle
          checked={emailListVisible}
          onChange={toggleEmailList}
          icons={false}
        />
      </div>

      {/* The Chat Messages */}
      <div className="chatMessages">
        {messages.map((m) => (
          <div key={m.id} className="chatBubble">
            {m.text}
          </div>
        ))}
      </div>

      {/* GPT Quick Replies */}
      <div className="chatQuickReplies">
        <strong>Replies:</strong>
        <div className="replyButtons">
          {openAIResponse.replies.map((action, index) => {
            // Optionally truncate the button label
            const buttonLabel =
              action.length > 40 ? action.slice(0, 37) + "..." : action;
            return (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className="replyButton"
              >
                {buttonLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Input */}
      <div className="chatInputArea">
        <input
          type="text"
          placeholder='Type "/summarize" or any message...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage} className="chatSendButton">
          Send
        </button>
      </div>
    </div>
  );
};

export default AgentPanel;
