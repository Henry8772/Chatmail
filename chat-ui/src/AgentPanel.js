// AgentPanel.jsx
import React, { useState, useEffect } from "react";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import "./AgentPanel.css";
import { OpenAI } from "openai";
import { FaRegFileAlt, FaRegLightbulb } from "react-icons/fa";


// WARNING: This is not secure if you ever deploy it. Use a backend server instead.
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

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

  /**
   * Calls GPT to produce structured JSON:
   * {
   *   "summary": "string",
   *   "suggestion": "string",
   *   "replies": ["string", ...]
   * }
   */
  const fetchOpenAIResponse = async (content) => {
    setIsLoading(true);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant. You will ONLY respond in valid JSON with the following format, no extra text:
            For the summary, we expect a concise summary of the email content, we must preserve the key details.
            For the replies, we expect a concise words of advice or action items, no more than 4 words. For example: "Confirm", "Reject", "Ask for more details", etc.,

{
  "summary": "string",
  "suggestion": "string",
  "replies": ["string", "string", ...]
}`,
          },
          {
            role: "user",
            content: `Generate a concise summary, suggestion, and possible replies for the following email content:\n\n${content}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      // The assistant's JSON response
      const assistantMessage = response.choices[0].message.content;
      const data = JSON.parse(assistantMessage);
      return data;
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      // Return fallback if JSON parse fails or request fails
      return {
        summary: "Failed to generate summary.",
        suggestion: "Failed to generate suggestion.",
        replies: ["No replies available."],
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch GPT data when event.summary changes
  useEffect(() => {
    if (event && event.summary) {
      (async () => {
        const newData = await fetchOpenAIResponse(event.summary);
        setOpenAIResponse(newData);
      })();
    }
  }, [event]);

  /**
   * Intercept the "/summarize" command in the input.  
   * If typed, we fetch new GPT data and insert the details into messages.
   */
  const handleSendMessage = async () => {
    const trimmedMessage = message.trim().toLowerCase();

    if (trimmedMessage === "/summarize") {
      const newData = await fetchOpenAIResponse(event.summary || "");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Summary: ${newData.summary}\nSuggestion: ${newData.suggestion}\nreplies: ${newData.replies.join(", ")}`,
        },
      ]);
      setMessage("");
    } else {
      // Otherwise, call the existing send logic
      onSendMessage();
    }
  };

  /**
   * When clicking a quick action (derived from GPT replies array),
   * we add that action text to the messages.
   */
  const handleActionClick = (actionText) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: actionText,
      },
    ]);
  };

  if (!event) {
    return (
      <div className="agentPanel">
        <div className="agentHeader">No Event Selected</div>
      </div>
    );
  }

  return (
    <div className="agentPanel">
      {/* Event Title */}
      <div className="agentHeader">
        <h3>{event.title}</h3>
        
        {/* If GPT is loading, show a spinner; otherwise show the summary & suggestion */}
        {isLoading ? (
          <div className="loadingContainer">
            <p className="loadingText">Analyzing email...</p>
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

      {/* Original Suggestion from event, if you still want to show it */}
      {/* <p className="eventSuggestion">Original Suggestion: {event.suggestion}</p> */}

      {/* Toggle Email List */}
      <div className="toggleEmailList">
        <span className="toggleText">
          {emailListVisible ? "Hide Email List" : "Show Email List"}
        </span>
        <Toggle checked={emailListVisible} onChange={toggleEmailList} icons={false} />
      </div>

      {/* Display existing conversation messages */}
      <div className="agentMessages">
        {messages.map((m) => (
          <div key={m.id} className="agentMessageBubble">
            {m.text}
          </div>
        ))}
      </div>

      {/* Replace the old quickReplies with GPT's "replies" */}
      <div className="agentQuickReplies">
        <strong>Replies:</strong>
        <div className="replyButtons">
          {openAIResponse.replies.map((action, index) => {
            // Optionally truncate very long replies for button text
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

      {/* Input and Send button */}
      <div className="agentInputArea">
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
        <button onClick={handleSendMessage} className="sendButton">
          Send
        </button>
      </div>
    </div>
  );
};

export default AgentPanel;
