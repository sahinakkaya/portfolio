import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { chat } from '../../lib/config';

const StyledChatSection = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  padding: 100px 0;

  @media (max-width: 768px) {
    padding: 80px 0;
  }

  @media (max-width: 480px) {
    padding: 60px 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 40px;

    h2 {
      font-size: clamp(26px, 5vw, 32px);
      font-weight: 600;
      color: ${({ theme }) => theme.colors.lightestSlate};
      margin: 0;
      white-space: nowrap;

      &:before {
        content: '04. ';
        color: ${({ theme }) => theme.colors.green};
        font-family: ${({ theme }) => theme.fonts.SFMono};
        font-size: clamp(16px, 3vw, 20px);
        font-weight: 400;
        margin-right: 10px;
      }
    }

    &:after {
      content: '';
      display: block;
      width: 300px;
      height: 1px;
      margin-left: 20px;
      background-color: ${({ theme }) => theme.colors.lightestNavy};

      @media (max-width: 1080px) {
        width: 200px;
      }
      @media (max-width: 768px) {
        width: 100%;
      }
      @media (max-width: 600px) {
        margin-left: 10px;
      }
    }
  }
`;

const StyledChatContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.lightNavy};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 20px;
  height: 50vh;
  max-height: 500px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px -15px ${({ theme }) => theme.colors.navyShadow};

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

const StyledConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-family: ${({ theme }) => theme.fonts.SFMono};
  color: ${({ theme }) => theme.colors.slate};
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightestNavy};

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ $connected }) => ($connected ? '#64ffda' : '#8892b0')};
    box-shadow: ${({ $connected }) =>
      $connected ? '0 0 8px rgba(100, 255, 218, 0.5)' : 'none'};
  }
`;

const StyledMessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.navy};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.lightestNavy};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.slate};
    }
  }
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.slate};
  font-family: ${({ theme }) => theme.fonts.SFMono};
  font-size: ${({ theme }) => theme.fontSizes.small};
  text-align: center;
  padding: 20px;

  .icon {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
  }
`;

const StyledMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-badge {
    font-family: ${({ theme }) => theme.fonts.SFMono};
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: ${({ $isUser, theme }) =>
      $isUser ? theme.colors.green : theme.colors.lightSlate};
    align-self: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
  }

  .message-bubble {
    background-color: ${({ $isUser, theme }) =>
      $isUser ? theme.colors.transGreen : theme.colors.navy};
    border: 1px solid
      ${({ $isUser, theme }) =>
        $isUser ? theme.colors.green : theme.colors.lightestNavy};
    border-radius: 8px;
    padding: 10px 14px;
    max-width: 85%;
    align-self: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
    color: ${({ theme }) => theme.colors.lightestSlate};
    font-size: ${({ theme }) => theme.fontSizes.small};
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 480px) {
      max-width: 90%;
      padding: 8px 12px;
      font-size: 13px;
    }
  }

  &.error .message-bubble {
    background-color: rgba(255, 100, 100, 0.1);
    border-color: rgba(255, 100, 100, 0.3);
    color: #ff6464;
  }

  &.system .message-bubble {
    background-color: ${({ theme }) => theme.colors.highlight};
    border-color: ${({ theme }) => theme.colors.lightestNavy};
    color: ${({ theme }) => theme.colors.slate};
    font-style: italic;
    align-self: center;
    text-align: center;
  }
`;

const StyledInputArea = styled.div`
  display: flex;
  gap: 10px;

  input {
    flex: 1;
    background-color: ${({ theme }) => theme.colors.navy};
    border: 1px solid ${({ theme }) => theme.colors.lightestNavy};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: 12px 15px;
    color: ${({ theme }) => theme.colors.lightestSlate};
    font-family: ${({ theme }) => theme.fonts.Calibre};
    font-size: ${({ theme }) => theme.fontSizes.small};
    transition: ${({ theme }) => theme.transition};

    &::placeholder {
      color: ${({ theme }) => theme.colors.slate};
      opacity: 0.5;
    }

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.green};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      padding: 10px 12px;
      font-size: 13px;
    }
  }

  button {
    ${({ theme }) => theme.mixins.smallButton};
    padding: 12px 20px;
    white-space: nowrap;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover {
        background-color: transparent;
        transform: none;
      }
    }

    @media (max-width: 480px) {
      padding: 10px 16px;
      font-size: 12px;
    }
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
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <StyledChatSection>
      <div className="section-header">
        <h2>Chat with AI</h2>
      </div>

      <StyledChatContainer>
        <StyledConnectionStatus $connected={connected}>
          <div className="status-dot" />
          <span>{connected ? 'Connected' : 'Connecting...'}</span>
        </StyledConnectionStatus>

        <StyledMessagesArea>
          {messages.length === 0 && !isLoading ? (
            <StyledEmptyState>
              <div className="icon">💬</div>
              <p>Start chatting with AI...</p>
            </StyledEmptyState>
          ) : (
            messages.map((message) => (
              <StyledMessage
                key={message.id}
                $isUser={message.type === 'sent'}
                className={message.type === 'error' || message.type === 'system' ? message.type : ''}
              >
                {message.type === 'sent' && <div className="message-badge">YOU</div>}
                {message.type === 'received' && <div className="message-badge">AI</div>}
                <div className="message-bubble">{message.content}</div>
              </StyledMessage>
            ))
          )}
          <div ref={messagesEndRef} />
        </StyledMessagesArea>

        <StyledInputArea>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!connected}
          />
          <button onClick={sendMessage} disabled={!connected || !inputValue.trim()}>
            Send
          </button>
        </StyledInputArea>
      </StyledChatContainer>
    </StyledChatSection>
  );
};

export default Chat;
