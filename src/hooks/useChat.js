import { useState, useRef, useEffect } from 'react';
import { isSystemMessage, removeDuplicateMessages } from '../utils/chatUtils';
import { getLanguage } from '../locales/i18n';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationTitle, setCurrentConversationTitle] = useState('');
  const [hintCount, setHintCount] = useState(0);
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  // Generate a unique session ID when component mounts
  useEffect(() => {
    if (!sessionId && !isInitialized) {
      setIsInitialized(true);
      createNewChat();
    }
  }, [sessionId, isInitialized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset hint count when starting a new conversation
  useEffect(() => {
    if (messages.length === 0) {
      setHintCount(0);
      setShowAnswerInput(false);
    } else {
      // Show answer input when there are messages (even first message)
      setShowAnswerInput(true);
    }
  }, [messages.length]);

  const createNewChat = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setMessages([]);
    setInputMessage('');
    setUserAnswer('');
    setCurrentConversationTitle('New Chat');
    setHintCount(0);
    setShowAnswerInput(false); // Reset to false for new chat
  };

  const loadConversations = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:9000/api/chat/conversations/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessionId(sessionId);
        
        // Convert history to messages format and filter out internal prompts and duplicates
        const conversationMessages = data.history
          .filter(msg => {
            // Filter out internal prompts that were incorrectly saved as user messages
            if (msg.role === 'user') {
              const text = msg.parts[0].text;
              const isInternalPrompt = 
                text.includes('Bạn là một người thầy thân thiện') ||
                text.includes('Học sinh đang gặp khó khăn') ||
                text.includes('QUAN TRỌNG: Bạn KHÔNG BAO GIỜ') ||
                text.includes('QUY TẮC: Chỉ gợi ý') ||
                text.includes('Student is having difficulty');
              
              if (isInternalPrompt) {
                console.log('Filtering out internal prompt:', text.substring(0, 100));
                return false;
              }
            }
            
            // Filter out system messages
            return !isSystemMessage(msg.parts[0].text);
          })
          .map(msg => ({
            id: Date.now() + Math.random(),
            text: msg.parts[0].text,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: new Date().toLocaleTimeString()
          }));
        
        // Remove any duplicate messages before setting state
        const cleanMessages = removeDuplicateMessages(conversationMessages);
        console.log('Loaded conversation with', cleanMessages.length, 'clean messages');
        setMessages(cleanMessages);
        
        // Calculate hint count from conversation history (only actual hint requests)
        const hintMessages = data.history.filter(msg => 
          msg.role === 'user' && (
            msg.parts[0].text.includes("Tôi cần thêm gợi ý") ||
            msg.parts[0].text.includes("I'm stuck, I need another hint.")
          )
        );
        setHintCount(hintMessages.length);
        
        // Show answer input if there are messages (not just hints)
        setShowAnswerInput(data.history.length > 0);
        
        // Set conversation title based on first user message
        const firstUserMessage = data.history.find(msg => 
          msg.role === 'user' && !isSystemMessage(msg.parts[0].text)
        );
        if (firstUserMessage) {
          const title = firstUserMessage.parts[0].text.length > 30 
            ? firstUserMessage.parts[0].text.substring(0, 30) + '...'
            : firstUserMessage.parts[0].text;
          setCurrentConversationTitle(title);
        } else {
          setCurrentConversationTitle('Conversation');
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (sessionIdToDelete) => {
    try {
      const response = await fetch(`http://localhost:9000/api/chat/conversations/${sessionIdToDelete}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await loadConversations();
        if (sessionId === sessionIdToDelete) {
          createNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    
    const newUserMessage = {
      id: Date.now() + Math.random(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    if (messages.length === 0) {
      setShowAnswerInput(true);
    }
    
    try {
      const response = await fetch('http://localhost:9000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          language: getLanguage()
        })
      });
      
      console.log('Chat API response status:', response.status);
      
      if (response.status === 429) {
        // Quota exceeded
        const errorData = await response.json();
        console.log('Quota exceeded error:', errorData);
        
        const quotaMessage = {
          id: Date.now() + Math.random(),
          text: errorData.message || 'API quota exceeded. Please try again later.',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };
        setMessages(prev => [...prev, quotaMessage]);
      } else if (response.ok) {
        const data = await response.json();
        console.log('Chat API response data:', data);
        console.log('data.message type:', typeof data.message);
        console.log('data.message value:', data.message);
        
        if (data.message && typeof data.message === 'string') {
          // Check if this message is already the last message to avoid duplicates
          const lastMessage = messages[messages.length - 1];
          const isDuplicate = lastMessage && 
            lastMessage.sender === 'bot' && 
            lastMessage.text === data.message;
          
          if (!isDuplicate) {
            const botMessage = {
              id: Date.now() + Math.random(),
              text: data.message,
              sender: 'bot',
              timestamp: new Date().toLocaleTimeString()
            };
            console.log('Created bot message:', botMessage);
            setMessages(prev => [...prev, botMessage]);
          } else {
            console.log('Duplicate message detected, not adding to state');
          }
        } else {
          console.error('Invalid message format:', data);
          const errorMessage = {
            id: Date.now() + Math.random(),
            text: 'Có lỗi xảy ra: Response format không đúng',
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString(),
            isError: true
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + Math.random(),
        text: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại!',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const continueChat = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:9000/api/chat/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          language: getLanguage()
        })
      });
      
      if (response.status === 429) {
        // Quota exceeded
        const errorData = await response.json();
        const quotaMessage = {
          id: Date.now() + Math.random(),
          text: errorData.message || 'API quota exceeded. Please try again later.',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };
        setMessages(prev => [...prev, quotaMessage]);
      } else if (response.ok) {
        const data = await response.json();
        const botMessage = {
          id: Date.now() + Math.random(),
          text: data.message,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        };
        
        // Check if this message is already the last message to avoid duplicates
        const lastMessage = messages[messages.length - 1];
        const isDuplicate = lastMessage && 
          lastMessage.sender === 'bot' && 
          lastMessage.text === data.message;
        
        if (!isDuplicate) {
          setMessages(prev => [...prev, botMessage]);
          setHintCount(prev => prev + 1);
        } else {
          console.log('Duplicate continuation message detected, not adding to state');
        }
      } else {
        throw new Error('Failed to get continuation');
      }
    } catch (error) {
      console.error('Error getting continuation:', error);
      const errorMessage = {
        id: Date.now() + Math.random(),
        text: 'Có lỗi xảy ra khi lấy gợi ý. Vui lòng thử lại!',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFullAnswer = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:9000/api/chat/full-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          language: getLanguage()
        })
      });
      
      if (response.status === 429) {
        // Quota exceeded
        const errorData = await response.json();
        const quotaMessage = {
          id: Date.now() + Math.random(),
          text: errorData.message || 'API quota exceeded. Please try again later.',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };
        setMessages(prev => [...prev, quotaMessage]);
      } else if (response.ok) {
        const data = await response.json();
        const botMessage = {
          id: Date.now() + Math.random(),
          text: data.message,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        };
        
        // Check if this message is already the last message to avoid duplicates
        const lastMessage = messages[messages.length - 1];
        const isDuplicate = lastMessage && 
          lastMessage.sender === 'bot' && 
          lastMessage.text === data.message;
        
        if (!isDuplicate) {
          setMessages(prev => [...prev, botMessage]);
        } else {
          console.log('Duplicate full answer message detected, not adding to state');
        }
      } else {
        throw new Error('Failed to get full answer');
      }
    } catch (error) {
      console.error('Error getting full answer:', error);
      const errorMessage = {
        id: Date.now() + Math.random(),
        text: 'Có lỗi xảy ra khi lấy câu trả lời đầy đủ. Vui lòng thử lại!',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserAnswer = async () => {
    if (isLoading || !userAnswer.trim()) return;
    
    setIsLoading(true);
    const userSubmittedAnswer = userAnswer.trim();
    setUserAnswer(''); // Clear the input field

    try {
      // Add user's submitted answer to chat history as a user message
      const userAnswerMessage = {
        id: Date.now() + Math.random(),
        text: userSubmittedAnswer,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, userAnswerMessage]);

      const response = await fetch('http://localhost:9000/api/chat/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userAnswer: userSubmittedAnswer,
          language: getLanguage()
        })
      });

      if (response.status === 429) {
        // Quota exceeded
        const errorData = await response.json();
        const quotaMessage = {
          id: Date.now() + Math.random(),
          text: errorData.message || 'API quota exceeded. Please try again later.',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };
        setMessages(prev => [...prev, quotaMessage]);
      } else if (response.ok) {
        const data = await response.json();
        const botMessage = {
          id: Date.now() + Math.random(),
          text: data.message,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        };
        
        // Check if this message is already the last message to avoid duplicates
        const lastMessage = messages[messages.length - 1];
        const isDuplicate = lastMessage && 
          lastMessage.sender === 'bot' && 
          lastMessage.text === data.message;
        
        if (!isDuplicate) {
          setMessages(prev => [...prev, botMessage]);
        } else {
          console.log('Duplicate check answer message detected, not adding to state');
        }
      } else {
        throw new Error('Failed to check answer');
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      const errorMessage = {
        id: Date.now() + Math.random(),
        text: 'Có lỗi xảy ra khi kiểm tra câu trả lời. Vui lòng thử lại!',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    userAnswer,
    setUserAnswer,
    sessionId,
    setSessionId,
    isLoading,
    setIsLoading,
    conversations,
    setConversations,
    currentConversationTitle,
    setCurrentConversationTitle,
    hintCount,
    setHintCount,
    showAnswerInput,
    setShowAnswerInput,
    isInitialized,
    messagesEndRef,
    createNewChat,
    loadConversations,
    loadConversation,
    deleteConversation,
    sendMessage,
    continueChat,
    getFullAnswer,
    checkUserAnswer
  };
}; 