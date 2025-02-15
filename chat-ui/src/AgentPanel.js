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

  // For the popup to show references
  const [showReferencePopup, setShowReferencePopup] = useState(false); 
  const [highlightedEmailText, setHighlightedEmailText] = useState(""); 
  const [referenceTitle, setReferenceTitle] = useState(""); // can store the clicked phrase

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatLoading]);

  useEffect(() => {
    if (!event || !event.emails || event.emails.length === 0) return;
    const mergedEmails = JSON.stringify(event.emails);
    (async function handleUpload() {
      try {
        const res = await uploadEmailsToRagie(mergedEmails);
        setRagieUploaded(true);
      } catch (err) {
        console.error("Error uploading emails to Ragie:", err);
      }
    })();
  }, [event]);

  /**
   * 2) The new function that calls GPT again to link the summary phrases
   *    to references in the original email. In your real prompt,
   *    you'll want GPT to return a structure or HTML that maps summary phrases 
   *    to the original text. 
   *    This example simply returns JSON with each "keyword/phrase" 
   *    plus the substring from the email, plus an HTML snippet you can render.
   */
  const fetchReferencedSummary = async (originalEmail, summary) => {
    try {
      const systemPrompt = `
        You are a "summary linking" agent.
        Given the original email below and a summary,
        produce a JSON object with an "annotatedSummary" field 
        containing valid HTML in which each key phrase in the summary is wrapped in 
        <span class="refLink" data-ref="..."> ... </span>
        The data-ref attribute should hold a snippet or location from the original email.

        Example minimal JSON:
        {
          "annotatedSummary": "Here is a <span class='refLink' data-ref='original snippet here'>key phrase</span> we found..."
        }

        Also ensure it is a valid JSON (no extra text).
      `;

      const userContent = `
Original Email:
"""${originalEmail}"""

Summary:
"${summary}"
      `;

      const response = await getOpenAiChatCompletion({
        systemPrompt,
        userContent,
        model: "gpt-4o-mini",
        maxTokens: 400,
        temperature: 0.3,
      });

      console.log("Referenced summary response:", response);

      // The response is expected to be JSON of the form:
      // {
      //   "annotatedSummary": "<p>some text <span class='refLink' data-ref='...'/> more text </p>"
      // }
      const data = JSON.parse(response);
      return data.annotatedSummary || summary; 
    } catch (error) {
      console.error("Error in fetchReferencedSummary:", error);
      // fallback: just return the summary
      return summary;
    }
  };

  /**
   * 1) The original fetch for the summarization. 
   *    After we get the summary, we also do the "linking" call.
   */
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

      // Save the standard summary
      setOpenAIResponse(data);

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
      secondFunction(content);
    }
  };

  const secondFunction = async (content) => {
    // 3) Call the second GPT to link summary phrases -> original email text
    const linkedSummary = await fetchReferencedSummary(content, openAIResponse.summary);

    setOpenAIResponse((prev) => ({

      ...prev,
      summary: linkedSummary,
    })); // clear the previous response

  }

  // On event load, do quick summarization
  useEffect(() => {
    if (event && event.summary) {
      (async () => {
        await fetchOpenAIResponse(event.summary);
      })();
    }
  }, [event]);

  // The normal handleSendMessage
  const handleSendMessage = async () => {
    sendMessage(message, "USER");
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

    conversationHistory.push({ role: "user", content: message });

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

      sendMessage(assistantMessage, "AI");
    } catch (error) {
      console.error("Error during AI completion:", error);
    } finally {
      setIsChatLoading(false);
      setMessage("");
    }
  };

  // Quick Reply
  const handleActionClick = async (actionText) => {
    if (!ragieUploaded) {
      alert("Emails have not yet been uploaded to Ragie or failed to upload.");
      return;
    }
    try {
      setIsChatLoading(true);
      sendMessage(actionText, "USER");

      // Just for example we pass last 5 emails
      const chunkText = JSON.stringify(event.emails.slice(-5));

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
        model: "gpt-4o-mini",
        maxTokens: 300,
        temperature: 0.7,
      });

      const draftReplyJson = JSON.parse(draftReply);
      const email = draftReplyJson.email;
      const replies = draftReplyJson.replies;

      sendMessage(email, "AI");
      setReplies(replies);
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

  /**
   * Handler for reference clicks in the annotated summary. 
   * We read `data-ref` to know which portion to highlight, then show a popup.
   */
  const handleReferenceClick = (event) => {
    const refSpan = event.target.closest("span.refLink");
    if (!refSpan) return;
    const snippet = refSpan.getAttribute("data-ref");
    const phrase = refSpan.textContent || "";

    // Example approach: highlight snippet in the original email
    // For simplicity, let's use the first email in event.emails
    // You can adjust to whichever email or the entire thread.
    if (!event.emails || event.emails.length === 0) return;

    const originalEmail = event.emails[0].text || ""; 
    // We'll do a naive highlight: replace snippet with <mark>snippet</mark>

    const safeSnippet = (snippet || "").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlightRegex = new RegExp(safeSnippet, "gi");
    const highlighted = originalEmail.replace(highlightRegex, (match) => `<mark>${match}</mark>`);

    setHighlightedEmailText(highlighted);
    setReferenceTitle(phrase);
    setShowReferencePopup(true);
  };

  // Close the reference popup
  const closeReferencePopup = () => {
    setShowReferencePopup(false);
    setHighlightedEmailText("");
    setReferenceTitle("");
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
            {/* 
              Instead of just showing openAIResponse.summary, 
              we show annotatedSummary (the clickable version) if available. 
            */}
            <p className="summaryText">
              <FaRegFileAlt className="summaryIcon" />
                <span
                  onClick={handleReferenceClick} 
                  // The onClick can bubble up from spans inside 
                  // (you can also attach to each span individually)
                  dangerouslySetInnerHTML={{ __html: openAIResponse.summary }}
                />
              
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
            <div
              key={m.id}
              className={`chatBubble ${senderClass}`}
              dangerouslySetInnerHTML={{ __html: displayedText }}
            />
          );
        })}

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
          placeholder="Ask me anything"
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

      {/* 4) A simple popup/modal to show the original email text with highlight */}
      {showReferencePopup && (
        <div className="popupBackdrop" onClick={closeReferencePopup}>
          <div className="popupModal" onClick={(e) => e.stopPropagation()}>
            <h4>Reference for: {referenceTitle}</h4>
            <div
              className="highlightedEmailView"
              dangerouslySetInnerHTML={{ __html: highlightedEmailText }}
            />
            <button onClick={closeReferencePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPanel;
