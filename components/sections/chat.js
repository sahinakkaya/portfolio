import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { chat } from '../../lib/config';

const StyledChatSection = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  padding: 50px 0;

  @media (max-width: 768px) {
    padding: 40px 0;
  }

  @media (max-width: 480px) {
    padding: 30px 0;
  }
`;

const StyledChatContainer = styled.div`
  height: 50vh;
  max-height: 500px;
  min-height: 300px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    height: 400px;
    min-height: 350px;
  }

  @media (max-width: 480px) {
    height: 350px;
    min-height: 300px;
  }
`;

const StyledMessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;

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
  font-size: ${({ theme }) => theme.fontSizes.small};
  opacity: 0.5;
`;

const StyledMessage = styled.div`
  display: flex;
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

  .message-content {
    padding: 8px 0;
    max-width: 90%;
    align-self: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
    color: ${({ $isUser, theme }) =>
      $isUser ? theme.colors.green : theme.colors.lightestSlate};
    font-size: ${({ theme }) => theme.fontSizes.small};
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 480px) {
      font-size: 13px;
    }
  }

  &.error .message-content {
    color: #ff6464;
    opacity: 0.8;
  }
`;

const StyledInputArea = styled.div`
  display: flex;
  gap: 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.lightestNavy};
  padding-top: 15px;

  input {
    flex: 1;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.slate};
    padding: 8px 0;
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
      border-bottom-color: ${({ theme }) => theme.colors.green};
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      font-size: 13px;
    }
  }

  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.green};
    font-family: ${({ theme }) => theme.fonts.SFMono};
    font-size: ${({ theme }) => theme.fontSizes.small};
    cursor: pointer;
    transition: ${({ theme }) => theme.transition};
    padding: 0;

    &:hover:not(:disabled) {
      opacity: 0.7;
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
      <StyledChatContainer>
        <StyledMessagesArea>
          {messages.length === 0 && !isLoading ? (
            <StyledEmptyState>Start chatting...</StyledEmptyState>
          ) : (
            messages.map((message) => (
              <StyledMessage
                key={message.id}
                $isUser={message.type === 'sent'}
                className={message.type === 'error' ? 'error' : ''}
              >
                <div className="message-content">{message.content}</div>
              </StyledMessage>
            ))
          )}
          <div ref={messagesEndRef} />
        </StyledMessagesArea>

        <StyledInputArea>
          <input
            type="text"
            placeholder="Message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!connected}
          />
          <button onClick={sendMessage} disabled={!connected || !inputValue.trim()}>
            →
          </button>
        </StyledInputArea>
      </StyledChatContainer>
    </StyledChatSection>
  );
};

export default Chat;
