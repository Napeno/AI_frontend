import { useState, useRef, useEffect, useCallback } from 'react';
import { isSystemMessage, removeDuplicateMessages } from '../utils/chatUtils';
import { getLanguage } from '../locales/i18n';
import { useAuth } from '../context/AuthContext';

export const useChat = () => {
  const { token } = useAuth();
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
  const chatSettings = useRef({ educationLevel: 'middle', subjectArea: 'natural_sciences' });

  const createNewChat = useCallback((settings) => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setMessages([]);
    setInputMessage('');
    setUserAnswer('');
    setCurrentConversationTitle('New Chat');
    chatSettings.current = settings;
    setHintCount(0);
    setShowAnswerInput(false);
  }, []);

  // Generate a unique session ID when component mounts
  useEffect(() => {
    if (!sessionId && !isInitialized) {
      setIsInitialized(true);
      // Create a default chat so the screen isn't empty
      createNewChat({ educationLevel: 'middle', subjectArea: 'natural_sciences' });
    }
  }, [sessionId, isInitialized, createNewChat]);

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
      setShowAnswerInput(true);
    }
  }, [messages.length]);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:9000/api/chat/conversations', {
        headers: { ...authHeaders },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load conversations:', response.status);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  }, [token]);

  const loadConversation = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:9000/api/chat/conversations/${sessionId}`, {
        headers: { ...authHeaders },
      });
      if (response.ok) {
        const data = await response.json();
        setSessionId(sessionId);
        chatSettings.current = {
          educationLevel: data.educationLevel || 'middle',
          subjectArea: data.subjectArea || 'natural_sciences',
        };
        
        const conversationMessages = data.history
          .filter(msg => {
            if (msg.role === 'user') {
              const text = msg.parts[0].text;
              const isInternalPrompt = 
                text.includes('Bạn là một người thầy thân thiện') ||
                text.includes('Học sinh đang gặp khó khăn') ||
                text.includes('QUAN TRỌNG: Bạn KHÔNG BAO GIỜ') ||
                text.includes('QUY TẮC: Chỉ gợi ý') ||
                text.includes('Student is having difficulty');
              
              if (isInternalPrompt) {
                return false;
              }
            }
            
            return !isSystemMessage(msg.parts[0].text);
          })
          .map(msg => {
            // Handle different message types
            let sender = 'bot';
            if (msg.role === 'user') {
              sender = 'user';
            } else if (msg.role === 'continue') {
              sender = 'continue';
            } else if (msg.role === 'full-answer') {
              sender = 'full-answer';
            } else if (msg.role === 'check-answer') {
              sender = 'check-answer';
            }
            
            return {
              id: Date.now() + Math.random(),
              text: msg.parts[0].text,
              sender: sender,
              timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
              type: msg.role === 'continue' ? 'continue' : msg.role === 'full-answer' ? 'full-answer' : msg.role === 'check-answer' ? 'check-answer' : undefined,
              userAnswer: msg.userAnswer || undefined,  // Include user answer if it exists
              isCorrect: msg.isCorrect
            };
          });
        
        const cleanMessages = removeDuplicateMessages(conversationMessages);
        setMessages(cleanMessages);
        
        const hintMessages = data.history.filter(msg => 
          msg.role === 'user' && (
            msg.parts[0].text.includes("Tôi cần thêm gợi ý") ||
            msg.parts[0].text.includes("I'm stuck, I need another hint.")
          )
        );
        setHintCount(hintMessages.length);
        
        setShowAnswerInput(data.history.length > 0);
        
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
        method: 'DELETE',
        headers: { ...authHeaders },
      });
      if (response.ok) {
        await loadConversations();
        if (sessionId === sessionIdToDelete) {
          createNewChat({ educationLevel: 'middle', subjectArea: 'natural_sciences' });
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
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          language: getLanguage(),
          educationLevel: chatSettings.current.educationLevel,
          subjectArea: chatSettings.current.subjectArea,
        })
      });
      
      
      if (response.status === 429) {
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
        
        if (data.message && typeof data.message === 'string') {
          const botMessage = {
            id: Date.now() + Math.random(),
            text: data.message,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString()
          };
          
          // Use functional update to check for duplicates with current state
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            const isDuplicate = lastMessage && 
              lastMessage.sender === 'bot' && 
              lastMessage.text === data.message;
            
            if (isDuplicate) {
              return prev;
            }
            return [...prev, botMessage];
          });
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
    
    // First, add a visual "continue" message on the user side
    const continueMessage = {
      id: Date.now() + Math.random(),
      text: 'Đang yêu cầu thêm gợi ý...',
      sender: 'continue',
      timestamp: new Date().toLocaleTimeString(),
      type: 'continue'
    };
    
    setMessages(prev => [...prev, continueMessage]);
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:9000/api/chat/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          sessionId,
          language: getLanguage(),
        })
      });
      
      if (response.status === 429) {
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
        
        const lastMessage = messages[messages.length - 1];
        const isDuplicate = lastMessage && 
          lastMessage.sender === 'bot' && 
          lastMessage.text === data.message;
        
        if (!isDuplicate) {
          setMessages(prev => [...prev, botMessage]);
          setHintCount(prev => prev + 1);
        } else {
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
    
    // First, add a visual "full answer" message on the user side
    const fullAnswerMessage = {
      id: Date.now() + Math.random(),
      text: 'Đang yêu cầu đáp án đầy đủ...',
      sender: 'full-answer',
      timestamp: new Date().toLocaleTimeString(),
      type: 'full-answer'
    };
    
    setMessages(prev => [...prev, fullAnswerMessage]);
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:9000/api/chat/full-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          sessionId,
          language: getLanguage(),
        })
      });
      
      if (response.status === 429) {
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
        
        const lastMessage = messages[messages.length - 1];
        const isDuplicate = lastMessage && 
          lastMessage.sender === 'bot' && 
          lastMessage.text === data.message;
        
        if (!isDuplicate) {
          setMessages(prev => [...prev, botMessage]);
        } else {
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
    setUserAnswer('');

    try {
      // First add the user's answer as a regular user message
      const userAnswerMessage = {
        id: Date.now() + Math.random(),
        text: userSubmittedAnswer,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, userAnswerMessage]);

      // Then add visual feedback for check action
      const checkMessage = {
        id: Date.now() + Math.random() + 1,
        text: `Đang kiểm tra câu trả lời: "${userSubmittedAnswer}"`,
        sender: 'check-answer',
        timestamp: new Date().toLocaleTimeString(),
        type: 'check-answer',
        userAnswer: userSubmittedAnswer
      };
      setMessages(prev => [...prev, checkMessage]);

      const response = await fetch('http://localhost:9000/api/chat/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          sessionId,
          userAnswer: userSubmittedAnswer,
          language: getLanguage(),
        })
      });

      if (response.status === 429) {
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
          timestamp: new Date().toLocaleTimeString(),
          isCorrect: data.isCorrect
        };
        
        const lastMessage = messages[messages.length - 1];
        const isDuplicate = lastMessage && 
          lastMessage.sender === 'bot' && 
          lastMessage.text === data.message;
        
        if (!isDuplicate) {
          setMessages(prev => [...prev, botMessage]);
        } else {
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
    checkUserAnswer,
  };
}; 