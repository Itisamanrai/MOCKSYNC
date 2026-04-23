import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { socket } from "../services/socket";
import { getAIFeedback } from "../services/ai";
import styles from "./Room.module.css";

const Room = () => {
  const [code, setCode] = useState(`// Start coding here
`);
  const { roomId } = useParams();
  const normalizedRoomId = (roomId || "").trim().toUpperCase();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const codeDebounceRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const [isRoomReady, setIsRoomReady] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiError, setAiError] = useState("");
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    if (!normalizedRoomId) return;
    setIsRoomReady(false);

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          text: data.message,
          fromSelf: false,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    };

    const handleCodeUpdate = (data) => {
      const incomingCode = typeof data?.code === "string" ? data.code : "";
      setCode(incomingCode);
    };

    const handleTimerStarted = (data) => {
      const duration = Number(data?.duration);
      const endsAt = Number(data?.endsAt);
      const remainingTime = Number(data?.remainingTime);

      if (
        !Number.isFinite(duration) ||
        duration <= 0 ||
        !Number.isFinite(endsAt) ||
        endsAt <= Date.now()
      ) {
        return;
      }

      setTimeLeft(
        Number.isFinite(remainingTime) && remainingTime >= 0
          ? remainingTime
          : duration,
      );
      setTimerEndsAt(endsAt);
      setIsTimerRunning(true);
    };

    const handleTimerReset = (data) => {
      const duration = Number(data?.duration);
      setTimerEndsAt(null);
      setIsTimerRunning(false);
      setTimeLeft(
        Number.isFinite(duration) && duration > 0 ? duration : 30 * 60,
      );
    };

    const handleRoomJoined = (data) => {
      if ((data?.room || "") === normalizedRoomId) setIsRoomReady(true);
    };
    socket.on("room_joined", handleRoomJoined);
    socket.on("timer_started", handleTimerStarted);
    socket.on("timer_reset", handleTimerReset);
    socket.on("code_update", handleCodeUpdate);
    socket.on("receive_message", handleReceiveMessage);

    // Emit join after listeners are attached to avoid missing fast server ack.
    socket.emit("join_room", normalizedRoomId);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("code_update", handleCodeUpdate);
      socket.off("timer_started", handleTimerStarted);
      socket.off("timer_reset", handleTimerReset);
      socket.off("room_joined", handleRoomJoined);
    };
  }, [normalizedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (codeDebounceRef.current) {
        clearTimeout(codeDebounceRef.current);
      }
    };
  }, [normalizedRoomId]);

  useEffect(() => {
    if (!isTimerRunning || !timerEndsAt) return;

    const updateTimeLeft = () => {
      const remaining = Math.max(
        0,
        Math.ceil((timerEndsAt - Date.now()) / 1000),
      );
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setIsTimerRunning(false);
        setTimerEndsAt(null);
      }
    };

    updateTimeLeft();
    const tick = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(tick);
  }, [isTimerRunning, timerEndsAt]);

  const sendMessage = () => {
    if (!normalizedRoomId || !message.trim()) return;

    const payload = {
      room: normalizedRoomId,
      message: message.trim(),
    };

    socket.emit("send_message", payload);

    setMessages((prev) => [
      ...prev,
      {
        text: payload.message,
        fromSelf: true,
        time: new Date().toLocaleTimeString(),
      },
    ]);

    setMessage("");
  };

  const requestAiFeedback = async () => {
    const textForReview = answerText.trim();
    if (!textForReview) {
      setAiError("Write your answer first, then request feedback.");
      setAiFeedback("");
      return;
    }

    try {
      setIsAiLoading(true);
      setAiError("");

      const response = await getAIFeedback(textForReview);
      setAiFeedback(response.feedback || "No feedback returned.");
    } catch (error) {
      setAiFeedback("");
      setAiError(error.message || "Failed to get AI feedback");
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const startTimer = () => {
    if (!normalizedRoomId) return;

    const duration = 30 * 60;
    socket.emit("timer_start", {
      room: normalizedRoomId,
      duration,
    });
  };

  const resetTimer = () => {
    if (!normalizedRoomId) return;

    socket.emit("timer_reset", {
      room: normalizedRoomId,
      duration: 30 * 60,
    });
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.headerLink}>Back to Dashboard</Link>
      <h1 className={styles.heading}>Room Page</h1>
      <p className={styles.roomId}>Room ID: {normalizedRoomId}</p>

      <div className={styles.timerSection}>
        <h3 className={styles.timerLabel}>Timer: {formatTime(timeLeft)}</h3>
        <button 
          className={styles.button}
          onClick={startTimer} 
          disabled={!isRoomReady || isTimerRunning}
        >
          Start Timer
        </button>
        <button className={styles.button} onClick={resetTimer}>Reset</button>
      </div>

      <div className={styles.mainLayout}>
        {/* LEFT PANEL: Chat */}
        <div className={styles.leftPanel}>
          <h3 className={styles.panelHeading}>Messages</h3>
          <div className={styles.messagesContainer}>
            {messages.map((msg, index) => (
              <p
                key={index}
                className={`${styles.messageItem} ${
                  msg.fromSelf ? styles.messageItemSelf : styles.messageItemPeer
                }`}
              >
                <span className={styles.messageAuthor}>
                  {msg.fromSelf ? "You" : "Peer"}
                </span>{" "}
                [{msg.time}]: {msg.text}
              </p>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.messageInputGroup}>
            <input
              type="text"
              className={styles.messageInput}
              placeholder="Type message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Send
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Code Editor + Answer + AI Feedback */}
        <div className={styles.rightPanel}>
          <h3 className={styles.panelHeading}>Code Editor</h3>
          <textarea
            value={code}
            className={styles.codeEditor}
            onChange={(e) => {
              const nextCode = e.target.value;
              setCode(nextCode);

              if (!normalizedRoomId) return;

              if (codeDebounceRef.current) {
                clearTimeout(codeDebounceRef.current);
              }

              codeDebounceRef.current = setTimeout(() => {
                socket.emit("code_change", {
                  room: normalizedRoomId,
                  code: nextCode,
                });
              }, 200);
            }}
            placeholder="Write your code here..."
          />

          <div className={styles.answerSection}>
            <h4 className={styles.sectionLabel}>
              Answer (for AI feedback):
            </h4>
            <textarea
              value={answerText}
              className={styles.answerInput}
              onChange={(e) => {
                setAnswerText(e.target.value);
                if (aiError) setAiError("");
                if (aiFeedback) setAiFeedback("");
              }}
              placeholder="Paste your final answer or explanation here..."
            />
          </div>

          <div className={styles.buttonContainer}>
            <button
              onClick={requestAiFeedback}
              disabled={isAiLoading}
              className={`${styles.aiFeedbackButton} ${
                isAiLoading
                  ? styles.aiFeedbackButtonLoading
                  : styles.aiFeedbackButtonReady
              }`}
            >
              {isAiLoading ? "Getting AI Feedback..." : "Get AI Feedback"}
            </button>
          </div>

          {aiError ? (
            <p className={styles.errorMessage}>{aiError}</p>
          ) : null}

          {aiFeedback ? (
            <div className={styles.feedbackBox}>
              <strong className={styles.feedbackTitle}>AI Feedback</strong>
              <p className={styles.feedbackContent}>{aiFeedback}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Room;
