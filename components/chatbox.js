"use client";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import MedicalIcon from "@mui/icons-material/MedicalServices";

export const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your First Aid Assistant. How can I help you with emergency advice today?",
    },
  ]);

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = { role: "user", content: message };
      setMessages([...messages, newMessage]);
      setMessage("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: [...messages, newMessage] }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let updatedMessage = "";
        const messageId = Date.now();

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: updatedMessage, id: messageId },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          updatedMessage += decoder.decode(value, { stream: true });

          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === messageId ? { ...msg, content: updatedMessage } : msg
            )
          );
        }

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, content: updatedMessage } : msg
          )
        );
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: "80%", md: "60%", lg: "50%" },
        bgcolor: "#FFFFFF", // White background for the chat area
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        position: "relative",
      }}
    >
      <Stack
        spacing={2}
        sx={{
          height: "400px",
          overflowY: "auto",
          padding: "8px",
        }}
      >
        {messages.map((msg, index) => (
          <Paper
            key={index}
            elevation={3}
            sx={{
              padding: "12px",
              backgroundColor: msg.role === "assistant" ? "#FFEBEE" : "#FFCDD2",
              color: "#000000",
              alignSelf: msg.role === "assistant" ? "flex-start" : "flex-end",
              borderRadius:
                msg.role === "assistant"
                  ? "12px 12px 12px 0px"
                  : "12px 12px 0px 12px",
              maxWidth: "80%",
            }}
          >
            {msg.content.split("\n").map((line, i) => (
              <Typography key={i} paragraph={i > 0}>
                {line}
              </Typography>
            ))}
          </Paper>
        ))}
        <div ref={messagesEndRef} />
      </Stack>

      <form onSubmit={sendMessage} style={{ width: "100%" }}>
        <Stack direction="row" spacing={2} mt={2}>
          <TextField
            label="Type your message..."
            fullWidth
            variant="filled"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              sx: {
                backgroundColor: "#E0F2F1",
                color: "#000000",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#B2DFDB",
                },
                "& .MuiInputLabel-root": {
                  color: "#004D40",
                },
                "& .MuiFilledInput-underline:before": {
                  borderBottomColor: "transparent",
                },
                "& .MuiFilledInput-underline:after": {
                  borderBottomColor: "#FF4C4C",
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#FF4C4C",
              color: "#FFFFFF",
              borderRadius: "8px",
              "&:hover": {
                bgcolor: "#C62828",
              },
            }}
          >
            Send
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
