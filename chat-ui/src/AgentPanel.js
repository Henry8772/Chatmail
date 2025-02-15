import React, { useState, useEffect, useRef } from "react";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import "./AgentPanel.css";
import { FaRegFileAlt, FaRegLightbulb } from "react-icons/fa";
import { getOpenAiChatCompletion } from "./llm_caller";
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
  const [message, setMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ragieUploaded, setRagieUploaded] = useState(false);
  const [replies, setReplies] = useState([]);

  const messagesEndRef = useRef(null);

  // 2. Whenever messages (or isChatLoading) changes, scroll the chat to the bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatLoading]);

  // Upload emails to Ragie
  useEffect(() => {
    if (!event || !event.emails || event.emails.length === 0) return;
    const mergedEmails = JSON.stringify(event.emails);
    console.log("Uploading emails to Ragie...", mergedEmails);
    (async function handleUpload() {
      try {
        const res = await uploadEmailsToRagie(mergedEmails);
        console.log("Ragie upload response:", res.status, res.statusText);
        setRagieUploaded(true);
        console.log("Uploaded emails to Ragie successfully!");
      } catch (err) {
        console.error("Error uploading emails to Ragie:", err);
      }
    })();
  }, [event]);

  // Summarization from GPT on load
  const fetchOpenAIResponse = async (content) => {
    setIsLoading(true);
    try {
      const systemPrompt = `You are a helpful assistant. You will ONLY respond in valid JSON with the following format, no extra text:
      User name is Alice, she is a senior product manager at ChatMail.
      For summary, write a concise summary that covers all the key points.
      For suggestions, write a suggestion that is actionable and helpful.
      For replies, write a replies that is concise with at max 4 words, each reflect different strategies.
      {
        "summary": "string",
        "suggestion": "string",
        "replies": ["string", "string", ...]
      }`;

      const userContent = `Generate a concise summary, suggestion, and possible replies for the following email content:\n\n${content}`;

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

  // On event load, do quick summarization
  useEffect(() => {
    if (event && event.summary) {
      (async () => {
        const newData = await fetchOpenAIResponse(event.summary);
        setOpenAIResponse(newData);
      })();
    }
  }, [event]);

  // Send message and handle conversation
  const handleSendMessage = async () => {
    // 1) Send the newly typed user message
    sendMessage(message, "USER");

    // 2) Build conversation array from ALL messages so far
    const conversationHistory = messages
      .map((m) => {
        if (m.text.startsWith("USER")) {
          return { role: "user", content: m.text.substring(6).trim() };
        } else if (m.text.startsWith("AI")) {
          return { role: "assistant", content: m.text.substring(6).trim() };
        }
        return null;
      })
      .filter(Boolean);

    // Also push the brand-new user message
    conversationHistory.push({ role: "user", content: message });

    // 3) Call your LLM with the complete conversation
    try {
      setIsChatLoading(true);

      const systemPrompt = `You are a helpful assistant who strictly returns valid answers.
Do not include additional commentary. Just answer.`;

      const assistantMessage = await getOpenAiChatCompletion({
        systemPrompt,
        conversation: conversationHistory,
        model: "gpt-4o-mini",
        maxTokens: 300,
        temperature: 0.7,
      });

      // 4) Send the assistant's new message
      sendMessage(assistantMessage, "AI");
    } catch (error) {
      console.error("Error during AI completion:", error);
    } finally {
      setIsChatLoading(false);
      setMessage("");
    }
  };

  // Handle Quick Reply
  const handleActionClick = async (actionText) => {
    if (!ragieUploaded) {
      alert("Emails have not yet been uploaded to Ragie or failed to upload.");
      return;
    }
    try {
      setIsChatLoading(true);
      sendMessage(actionText, "USER");

      // Query Ragie for relevant chunks
      // const chunkText = await retrieveRelevantChunks("Find details in emails related to " + actionText);
      // console.log("Retrieved chunk text:", chunkText);

      // Get last 5 emails 
      const chunkText = JSON.stringify(event.emails.slice(-5));

      // Use chunkText + user actionText to get GPT to draft a reply
      const systemPrompt = `You are "Chatmail AI," a friendly AI assistant. Below is information from the relevant documents:

===
${chunkText}
===

Based on this information, craft a concise, polite, and professional email reply, in correct rich-text email format. Then, suggest possible next steps or strategies Alice can take to move forward with this task. Ensure the replies options are concise with at max 4 words.

Provide your response in the following JSON format:

{
  "email": "string",
  "replies": ["string", "string", ...]
}`;

      const draftReply = await getOpenAiChatCompletion({
        systemPrompt,
        userContent: actionText,
        model: "gpt-4o",
        maxTokens: 300,
        temperature: 0.7,
      });

      const draftReplyJson = JSON.parse(draftReply);
      const email = draftReplyJson.email;
      const replies = draftReplyJson.replies;

      sendMessage(email, "AI");
      setReplies(replies);

      // **Ensure new replies are also stored in openAIResponse:**
      setOpenAIResponse((prev) => ({
        ...prev,
        replies,
      }));
    } catch (err) {
      console.error("Error retrieving from Ragie or drafting reply:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Render
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
            <p className="loadingText">Thinking</p>
            <div className="loadingDots">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : (
          <>
            <p className="summaryText">
              <FaRegFileAlt className="summaryIcon" /> {openAIResponse.summary}
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

      {/* Chat Messages */}
      <div className="chatMessages">
        {messages.map((m) => {
          let senderClass = "userMessage";
          let displayedText = m.text;

          if (m.text.startsWith("AI")) {
            senderClass = "aiMessage";
          } else if (m.text.startsWith("USER")) {
            senderClass = "userMessage";
          }

          displayedText = m.text.substring(6).trim();

          return (
            <div key={m.id} 
            className={`chatBubble ${senderClass}`}
            dangerouslySetInnerHTML={{ __html: displayedText }}>
              {/* {displayedText} */}
            </div>
          );
        })}

        {/* Show AI "thinking" bubble if needed */}
        {isChatLoading && (
          <div className="chatBubble aiMessage">
            <div className="loadingDots">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}

        {/* 
          NEW: Quick replies are now displayed as part 
          of the chat messages area, in a "systemMessage" bubble.
        */}
        {openAIResponse.replies && openAIResponse.replies.length > 0 && (
          <div className="systemMessage">
            <p className="quickRepliesLabel">Suggested replies:</p>
            <div className="replyButtons">
              {openAIResponse.replies.map((action, index) => {
                const buttonLabel =
                  action.length > 40 ? action.slice(0, 37) + "..." : action;
                return (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action)}
                    className="chatBubble replyButton"
                  >
                    {buttonLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chatInputArea">
        <input
          type="text"
          placeholder='Ask me anything'
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
