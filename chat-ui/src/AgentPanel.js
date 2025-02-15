// AgentPanel.jsx

import React, { useState, useEffect } from "react";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import "./AgentPanel.css";
import { FaRegFileAlt, FaRegLightbulb } from "react-icons/fa";
import { getOpenAiChatCompletion } from "./llm_caller";

// 1) Import your new Ragie helper functions
import { uploadEmailsToRagie, retrieveRelevantChunks } from "./ragie_caller";

const AgentPanel = ({
  event,
  messages,
  sendMessage,
  emailListVisible,
  toggleEmailList,
}) => {
  const [openAIResponse, setOpenAIResponse] = useState({
    summary: "",
    suggestion: "",
    replies: [],
  });
  const [message, setMessage] = useState('');


  const [isChatLoading, setIsChatLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // Track whether emails have been uploaded
  const [ragieUploaded, setRagieUploaded] = useState(false);

  // -----------------------------
  // 1) Upload emails to Ragie
  // -----------------------------
  useEffect(() => {
    if (!event || !event.emails || event.emails.length === 0) return;

    // Merge all emails into one text for demonstration
    const mergedEmails = event.emails.join("\n\n---\n\n");

    console.log("Uploading emails to Ragie...");

    (async function handleUpload() {
      try {
        const res = await uploadEmailsToRagie(mergedEmails);
        console.log("Ragie upload response:", res.status, res.statusText);

        // If we get here, it means upload succeeded
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

    sendMessage(message, "USER");

    const newData = await fetchOpenAIResponse(event.summary + "\n" +  message);
      

    sendMessage(newData, "AI");
    
  
  };

  // -----------------------------
  // 4) Handle Quick Reply
  // -----------------------------
  const handleActionClick = async (actionText) => {
    if (!ragieUploaded) {
      alert("Emails have not yet been uploaded to Ragie or failed to upload.");
      return;
    }

    try {
      setIsChatLoading(true);

      sendMessage(actionText, 'USER');



      // 4a) Query Ragie for relevant chunks
      const chunkText = await retrieveRelevantChunks(actionText);

      // 4b) Use chunkText + user actionText to get GPT to draft a reply
      const systemPrompt = `You are "Chatmail AI", a friendly AI assistant. 
      Here is all the information from the relevant documents:
      ===
      ${chunkText}
      ===
      The user wants to craft an email reply based on the above. 
      Draft a concise, polite, and professional email response. 
      Write your answer as pure text (no JSON).`;

      const draftReply = await getOpenAiChatCompletion({
        systemPrompt,
        userContent: actionText,
        model: "gpt-4o",
        maxTokens: 300,
        temperature: 0.7,
      });

      // 4c) Add the GPT draft to the conversation


      sendMessage(draftReply, "AI");
      

    } catch (err) {
      console.error("Error retrieving from Ragie or drafting reply:", err);
    } finally {
      setIsChatLoading(false);
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
        {messages.map((m) => {
          // Safely remove the first 6 characters, if they exist
          const displayText =
            m.text.length > 6 ? m.text.substring(6) : m.text;

          return (
            <div key={m.id} className="chatBubble">
              {displayText}
            </div>
          );
        })}
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
    </div> );
};

export default AgentPanel;
