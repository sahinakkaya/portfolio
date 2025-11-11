import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { chat } from '../../lib/config';

const StyledChatContainer = styled.div`
  height: 50vh;
  max-height: 500px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.fonts.SFMono};
  border: 1px solid ${({ theme }) => theme.colors.lightestNavy};
  border-radius: 4px;
  padding: 20px;
  background-color: rgba(10, 25, 47, 0.5);
  position: relative;

  @media (max-width: 768px) {
    height: 400px;
    min-height: 350px;
    padding: 15px;
  }

  @media (max-width: 480px) {
    height: 350px;
    min-height: 300px;
    padding: 12px;
  }
`;

const StyledMessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.slate};
    border-radius: 3px;
  }
`;

const StyledEmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.slate};
  font-size: 13px;
  opacity: 0.5;

  &:before {
    content: '$ ';
    color: ${({ theme }) => theme.colors.green};
  }
`;

const StyledMessage = styled.div`
  display: flex;
  gap: 8px;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-prompt {
    color: ${({ theme }) => theme.colors.green};
    font-size: 13px;
    flex-shrink: 0;

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }

  .message-content {
    flex: 1;
    color: ${({ $isUser, theme }) =>
      $isUser ? theme.colors.green : theme.colors.lightestSlate};
    font-size: 13px;
    line-height: 1.6;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }

  &.error .message-content {
    color: #ff6464;
  }
`;

const StyledInputArea = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.colors.lightestNavy};
  padding-top: 15px;

  .input-prompt {
    color: ${({ theme }) => theme.colors.green};
    font-size: 13px;
    flex-shrink: 0;

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }

  input {
    flex: 1;
    background-color: transparent;
    border: none;
    padding: 0;
    color: ${({ theme }) => theme.colors.green};
    font-family: ${({ theme }) => theme.fonts.SFMono};
    font-size: 13px;
    caret-color: ${({ theme }) => theme.colors.green};

    &::placeholder {
      color: ${({ theme }) => theme.colors.slate};
      opacity: 0.5;
    }

    &:focus {
      outline: none;
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }
`;

const StyledInfoIcon = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  transition: ${({ theme }) => theme.transition};

  &:hover {
    svg {
      stroke: ${({ theme }) => theme.colors.green};
    }
  }

  &:hover + div {
    opacity: 1;
  }

  @media (max-width: 480px) {
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: ${({ theme }) => theme.colors.slate};
    fill: none;
    transition: ${({ theme }) => theme.transition};

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const StyledTooltip = styled.div`
  position: absolute;
  top: 34px;
  right: 10px;
  background-color: ${({ theme }) => theme.colors.lightNavy};
  border: 1px solid ${({ theme }) => theme.colors.green};
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.lightSlate};
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 10;

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 8px 10px;
    white-space: normal;
    width: 200px;
    right: 8px;
    top: 28px;
  }
`;

// Generate UUID v4
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const Chat = () => {
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesAreaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize: Generate UUID and fetch token
  useEffect(() => {
    const initializeChat = async () => {
      // Generate UUID
      const newUserId = generateUUID();
      setUserId(newUserId);

      try {
        // Fetch token
        const response = await fetch(
          `${chat.apiUrl}/token?userid=${encodeURIComponent(newUserId)}`,
          {
            method: 'POST',
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.token) {
          setToken(data.token);
        } else {
          throw new Error('No token in response');
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        addMessage('error', `Failed to connect: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Connect WebSocket when token is available
  useEffect(() => {
    if (!token || !userId) return;

    const fullUrl = `${chat.wsUrl}?token=${encodeURIComponent(
      token
    )}&userid=${encodeURIComponent(userId)}`;

    try {
      const websocket = new WebSocket(fullUrl);

      websocket.onopen = () => {
        setConnected(true);
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'response') {
            addMessage('received', data.content);
          } else if (data.type === 'error') {
            addMessage('error', data.message);
          }
        } catch (e) {
          console.error('Failed to parse message:', e);
          addMessage('error', 'Failed to parse server response');
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        addMessage('error', 'Connection error occurred');
      };

      websocket.onclose = () => {
        setConnected(false);
        setWs(null);
      };
    } catch (e) {
      console.error('Failed to connect:', e);
      addMessage('error', `Failed to connect: ${e.message}`);
    }

    // Cleanup
    return () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [token, userId]);

  const addMessage = (type, content) => {
    setMessages((prev) => [...prev, { type, content, id: Date.now() }]);
  };

  const sendMessage = () => {
    const content = inputValue.trim();

    if (!content) return;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      addMessage('error', 'Not connected to server');
      return;
    }

    const message = {
      type: 'message',
      content: content,
      userid: userId,
    };

    try {
      ws.send(JSON.stringify(message));
      addMessage('sent', content);
      setInputValue('');
    } catch (e) {
      addMessage('error', `Failed to send message: ${e.message}`);
      console.error('Send error:', e);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <StyledChatContainer>
      <StyledInfoIcon>
        <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="8" />
        </svg>
      </StyledInfoIcon>
      <StyledTooltip>
        AI responses may not be accurate. This is just a fun project!
      </StyledTooltip>
      <StyledMessagesArea ref={messagesAreaRef}>
        {messages.length === 0 && !isLoading ? (
          <StyledEmptyState>type a message to start...</StyledEmptyState>
        ) : (
          messages.map((message) => (
            <StyledMessage
              key={message.id}
              $isUser={message.type === 'sent'}
              className={message.type === 'error' ? 'error' : ''}
            >
              <div className="message-prompt">
                {message.type === 'sent' ? '$' : message.type === 'error' ? '!' : '>'}
              </div>
              <div className="message-content">{message.content}</div>
            </StyledMessage>
          ))
        )}
      </StyledMessagesArea>

      <StyledInputArea>
        <div className="input-prompt">$</div>
        <input
          type="text"
          placeholder="type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!connected}
        />
      </StyledInputArea>
    </StyledChatContainer>
  );
};

export default Chat;
