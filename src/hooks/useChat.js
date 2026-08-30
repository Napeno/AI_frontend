import { useState, useRef, useEffect, useCallback } from 'react';
import { isSystemMessage, removeDuplicateMessages } from '../utils/chatUtils';
import { getLanguage } from '../locales/i18n';
import { useAuth } from '../context/AuthContext';
import { apiClient, get, post } from '../utils/apiClient';


//deploy
const DEFAULT_INTERVENTION = {
  active: false,
  level: 'green',
  type: null,
  requiredAction: null,
  options: [],
  canRequestHint: true,
  canRequestFullAnswer: false,
  fullAnswerRequirements: {
    hintsUsed: 0,
    hintsRequired: 4,
    hasMeaningfulAttempt: false,
  },
  hintTier: 1,
};

export const useChat = (onCoinAnimation, onPointsAnimation) => {
  const { updateUserChestnuts } = useAuth();
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [supportMode, setSupportMode] = useState(null);
  const [intervention, setIntervention] = useState(DEFAULT_INTERVENTION);
  const [problemContext, setProblemContext] = useState(null);
  const messagesEndRef = useRef(null);
  const chatSettings = useRef({ educationLevel: 'middle', subjectArea: 'mathematics', course: 'mathematics' });

  const syncIntervention = useCallback((nextIntervention, fallback = DEFAULT_INTERVENTION) => {
    setIntervention(nextIntervention || fallback);
  }, []);

  const clearSupportMode = useCallback(() => {
    setSupportMode(null);
    setUserAnswer('');
  }, []);

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
    setIntervention(DEFAULT_INTERVENTION);
    setProblemContext(null);
    setSupportMode(null);
  }, []);

  // Generate a unique session ID when component mounts
  useEffect(() => {
    if (!sessionId && !isInitialized) {
      setIsInitialized(true);
      // Create a default chat so the screen isn't empty
      createNewChat({ educationLevel: 'middle', subjectArea: 'mathematics', course: 'mathematics' });
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

  const loadConversations = useCallback(async () => {
    try {
      const response = await get('/chat/conversations');
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
  }, []);

  const loadConversation = async (sessionId) => {
    try {
      const response = await get(`/chat/conversations/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessionId(sessionId);
        chatSettings.current = {
          educationLevel: data.educationLevel || 'middle',
          subjectArea: data.subjectArea || 'natural_sciences',
          course: data.course || (data.subjectArea === 'mathematics' ? 'mathematics' : null),
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
              isCorrect: msg.isCorrect,
              evaluationStatus: msg.evaluationStatus,
              imageUrl: msg.parts[0].image?.url || undefined // Include image URL if it exists
            };
          });
        
        const cleanMessages = removeDuplicateMessages(conversationMessages);
        setMessages(cleanMessages);
        setProblemContext(data.problemContext || null);
        setSupportMode(null);
        
        const hintMessages = data.history.filter(msg => 
          msg.role === 'continue'
        );
        setHintCount(hintMessages.length);
        const interventionResponse = await post('/chat/intervention', {
          sessionId,
          language: getLanguage(),
        });
        if (interventionResponse.ok) {
          const interventionData = await interventionResponse.json();
          syncIntervention(interventionData.intervention);
        } else {
          syncIntervention(data.intervention);
        }
        
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
      const response = await apiClient(`/chat/conversations/${sessionIdToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadConversations();
        if (sessionId === sessionIdToDelete) {
          createNewChat({ educationLevel: 'middle', subjectArea: 'mathematics', course: 'mathematics' });
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    const isFirstMessage = messages.length === 0; // Check if this is the first message
    setInputMessage('');
    setSupportMode(null);
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
      const response = await post('/chat', {
        message: userMessage,
        sessionId,
        language: getLanguage(),
        educationLevel: chatSettings.current.educationLevel,
        subjectArea: chatSettings.current.subjectArea,
        course: chatSettings.current.course,
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

          setProblemContext(data.problemContext || null);

          syncIntervention(data.intervention);
          
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

          // Give a new conversation its title immediately, then reconcile the sidebar with the server.
          if (isFirstMessage) {
            const newTitle = userMessage.length > 50 
              ? userMessage.substring(0, 50) + '...' 
              : userMessage;
            setCurrentConversationTitle(newTitle);
          }
          await loadConversations();
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

  const continueChat = async (gateResponse = null) => {
    if (isLoading) return;
    const isSupportChoice = gateResponse?.type === 'support_choice';

    if (isSupportChoice) {
      setSupportMode(gateResponse.value === 'calculation' ? 'calculation' : null);
    }

    if (!isSupportChoice) {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: gateResponse?.type === 'blocker_choice'
          ? 'Đã cho ThinkBridge biết chỗ đang kẹt...'
          : gateResponse
            ? 'Đã gửi bước nhỏ, ThinkBridge đang xem tiếp...'
            : 'Đang yêu cầu thêm gợi ý...',
        sender: 'continue',
        timestamp: new Date().toLocaleTimeString(),
        type: 'continue'
      }]);
    }

    setIsLoading(true);
    
    try {
      const response = await post('/chat/continue', {
        sessionId,
        language: getLanguage(),
        gateResponse,
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
        syncIntervention(data.intervention);
        if (data.badge) setMessages(prev => [...prev, { id: Date.now() + Math.random(), text: `🎉 Huy hiệu mới: ${data.badge.title}`, sender: 'system', type: 'badge-award', timestamp: new Date().toLocaleTimeString() }]);
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
          if (!isSupportChoice && !data.intervention?.active) {
            setHintCount(prev => prev + 1);
          }
        } else {
        }
      } else {
        throw new Error('Failed to get continuation');
      }
    } catch (error) {
      console.error('Error getting continuation:', error);
      const errorMessage = {
        id: Date.now() + Math.random(),
        text: 'Tớ vẫn chưa hiểu ý cậu lắm, cậu giải thích lại giúp tớ theo cách khác được không?',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFullAnswer = async (gateResponse = null) => {
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
      const response = await post('/chat/full-answer', {
        sessionId,
        language: getLanguage(),
        gateResponse,
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
        syncIntervention(data.intervention);
        if (data.badge) setMessages(prev => [...prev, { id: Date.now() + Math.random(), text: `🎉 Huy hiệu mới: ${data.badge.title}`, sender: 'system', type: 'badge-award', timestamp: new Date().toLocaleTimeString() }]);
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

  const checkUserAnswerWithImage = async (imageFile, textAnswer = '') => {
    if (isLoading) return;

    setIsLoading(true);
    setSupportMode(null);
    const userSubmittedAnswer = textAnswer.trim();
    setUserAnswer('');

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('sessionId', sessionId);
    formData.append('userAnswer', userSubmittedAnswer);
    formData.append('language', getLanguage());

    try {
      // First add the user's answer as a regular user message
      const userAnswerMessage = {
        id: Date.now() + Math.random(),
        text: userSubmittedAnswer || (getLanguage() === 'vi' ? 'Kiểm tra đáp án với hình ảnh' : 'Check answer with image'),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
        imageUrl: URL.createObjectURL(imageFile) // For immediate preview
      };
      setMessages(prev => [...prev, userAnswerMessage]);

      // Then add visual feedback for check action
      const checkMessage = {
        id: Date.now() + Math.random() + 1,
        text: `Đang kiểm tra câu trả lời với hình ảnh: "${userSubmittedAnswer}"`,
        sender: 'check-answer',
        timestamp: new Date().toLocaleTimeString(),
        type: 'check-answer',
        userAnswer: userSubmittedAnswer,
        hasImage: true
      };
      setMessages(prev => [...prev, checkMessage]);

      const response = await apiClient('/chat/check-answer-image', {
        method: 'POST',
        body: formData
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
        syncIntervention(data.intervention);
        const botMessage = {
          id: Date.now() + Math.random(),
          text: data.message,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          isCorrect: data.isCorrect,
          evaluationStatus: data.evaluation?.status
        };
        setProblemContext(data.problemContext || null);

        // Update user chestnuts and points if awarded
        if (data.chestnutsAwarded && data.totalChestnuts !== undefined) {
          updateUserChestnuts(data.totalChestnuts, data.totalPoints);
          let sourceElement = null;
          // Trigger coin animation
          if (onCoinAnimation) {
            sourceElement = document.querySelector('[data-coin-source="true"]') ||
                                 document.querySelector('button[type="submit"]') ||
                                 document.querySelector('.check-answer-button');
            onCoinAnimation({
              amount: data.chestnutsAwarded,
              sourceElement: sourceElement
            });
          }

          // Trigger points animation if points were awarded
          if (data.pointsAwarded && data.pointsAwarded > 0 && onPointsAnimation) {
            const rankDisplayElement = document.querySelector('.rank-display') ||
                                     document.querySelector('[data-rank-display="true"]');
            onPointsAnimation({
              amount: data.pointsAwarded,
              sourceElement: sourceElement,
              targetElement: rankDisplayElement
            });
          }

          // Add a system message for coin award
          const coinMessage = {
            id: Date.now() + Math.random() + 2,
            text: `🎉 Bạn đã nhận được ${data.chestnutsAwarded} hạt dẻ! Tổng số hạt dẻ: ${data.totalChestnuts} 🎉`,
            sender: 'system',
            timestamp: new Date().toLocaleTimeString(),
            type: 'chestnut-award'
          };
          setMessages(prev => [...prev, coinMessage]);

          // Add points message if points were awarded
          if (data.pointsAwarded && data.pointsAwarded > 0) {
            const pointsMessage = {
              id: Date.now() + Math.random() + 3,
              text: `Bạn đã nhận được ${data.pointsAwarded} điểm xếp hạng! Tổng số điểm: ${data.totalPoints}`,
              sender: 'system',
              timestamp: new Date().toLocaleTimeString(),
              type: 'points-award'
            };
            setMessages(prev => [...prev, pointsMessage]);
          }
        }

        const lastMessage = messages[messages.length - 1];
        const isDuplicate = lastMessage &&
          lastMessage.sender === 'bot' &&
          lastMessage.text === data.message;

        if (!isDuplicate) {
          setMessages(prev => [...prev, botMessage]);
        }
      } else {
        throw new Error('Failed to check answer with image');
      }
    } catch (error) {
      console.error('Error checking answer with image:', error);
      const errorMessage = {
        id: Date.now() + Math.random(),
        text: 'Có lỗi xảy ra khi kiểm tra câu trả lời với hình ảnh. Vui lòng thử lại!',
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
    setSupportMode(null);
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

      const response = await post('/chat/check-answer', {
        sessionId,
        userAnswer: userSubmittedAnswer,
        language: getLanguage(),
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
        syncIntervention(data.intervention);
        const botMessage = {
          id: Date.now() + Math.random(),
          text: data.message,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          isCorrect: data.isCorrect,
          evaluationStatus: data.evaluation?.status
        };
        setProblemContext(data.problemContext || null);
        
        // Update user chestnuts and points if awarded
        if (data.chestnutsAwarded && data.totalChestnuts !== undefined) {
          updateUserChestnuts(data.totalChestnuts, data.totalPoints);
          let sourceElement = null;
          // Trigger coin animation
          if (onCoinAnimation) {
            // Get the source element (the answer input or check button)
            sourceElement = document.querySelector('[data-coin-source="true"]') || 
                                 document.querySelector('button[type="submit"]') ||
                                 document.querySelector('.check-answer-button');
            onCoinAnimation({
              amount: data.chestnutsAwarded,
              sourceElement: sourceElement
            });
          }
          
          // Trigger points animation if points were awarded
          if (data.pointsAwarded && data.pointsAwarded > 0 && onPointsAnimation) {
            const rankDisplayElement = document.querySelector('.rank-display') || 
                                     document.querySelector('[data-rank-display="true"]');
            onPointsAnimation({
              amount: data.pointsAwarded,
              sourceElement: sourceElement,
              targetElement: rankDisplayElement
            });
          }
          
          // Add a system message for coin award
          const coinMessage = {
            id: Date.now() + Math.random() + 2, // Ensure unique ID
            text: `🎉 Bạn đã nhận được ${data.chestnutsAwarded} hạt dẻ! Tổng số hạt dẻ: ${data.totalChestnuts} 🎉`,
            sender: 'system',
            timestamp: new Date().toLocaleTimeString(),
            type: 'chestnut-award'
          };
          setMessages(prev => [...prev, coinMessage]);
          
          // Add points message if points were awarded
          if (data.pointsAwarded && data.pointsAwarded > 0) {
            const pointsMessage = {
              id: Date.now() + Math.random() + 3, // Ensure unique ID  
              text: `Bạn đã nhận được ${data.pointsAwarded} điểm xếp hạng! Tổng số điểm: ${data.totalPoints}`,
              sender: 'system',
              timestamp: new Date().toLocaleTimeString(),
              type: 'points-award'
            };
            setMessages(prev => [...prev, pointsMessage]);
          }
        }

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

  const sendImageMessage = async (imageFile, textMessage = '') => {
    if (!imageFile || isLoading) return;
    const isFirstMessage = messages.length === 0;
    const isStudentWork = supportMode === 'calculation';
    const imageMessage = textMessage.trim() || (isStudentWork
      ? (getLanguage() === 'vi' ? 'Đây là bước làm em muốn kiểm tra lỗi.' : 'This is the working step I want checked.')
      : (getLanguage() === 'vi' ? 'Trả lời đáp án bên trong hình ảnh' : 'Answer the question shown in the image'));
    
    setIsLoading(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('sessionId', sessionId);
    formData.append('language', getLanguage());
    formData.append('educationLevel', chatSettings.current.educationLevel);
    formData.append('subjectArea', chatSettings.current.subjectArea);
    formData.append('course', chatSettings.current.course || '');
    
    if (textMessage.trim() || isStudentWork) {
      formData.append('message', imageMessage);
    }
    if (isStudentWork) {
      formData.append('imagePurpose', 'student_work');
    }
    
    // Add user message to UI immediately
    const userMessage = {
      id: Date.now() + Math.random(),
      text: imageMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      imageUrl: URL.createObjectURL(imageFile) // For immediate preview
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedImage(null);
    setSupportMode(null);
    
    if (messages.length === 0) {
      setShowAnswerInput(true);
    }
    
    try {
      const response = await apiClient('/chat/image', {
        method: 'POST',
        body: formData
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
          syncIntervention(data.intervention);
          const botMessage = {
            id: Date.now() + Math.random(),
            text: data.message,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString()
          };
          setProblemContext(data.problemContext || null);
          
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
          if (isFirstMessage) {
            setCurrentConversationTitle(textMessage.trim() || (getLanguage() === 'vi' ? 'Bài tập trong ảnh' : 'Problem from image'));
          }
          await loadConversations();
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Không thể gửi ảnh (mã ${response.status}).`);
      }
    } catch (error) {
      console.error('Error sending image message:', error);
      const errorMessage = {
        id: Date.now() + Math.random(),
        text: error.message || 'Có lỗi xảy ra khi gửi hình ảnh. Vui lòng thử lại!',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveQuestion = async (questionId) => {
    if (isLoading || !sessionId) return;
    try {
      const response = await post('/chat/problem-context', { sessionId, questionId });
      if (response.ok) {
        const data = await response.json();
        setProblemContext(data.problemContext || null);
      }
    } catch (error) {
      console.error('Error selecting problem question:', error);
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
    selectedImage,
    setSelectedImage,
    supportMode,
    clearSupportMode,
    intervention,
    setIntervention,
    problemContext,
    setActiveQuestion,
    messagesEndRef,
    createNewChat,
    loadConversations,
    loadConversation,
    deleteConversation,
    sendMessage,
    sendImageMessage,
    continueChat,
    getFullAnswer,
    checkUserAnswer,
    checkUserAnswerWithImage,
  };
}; 
