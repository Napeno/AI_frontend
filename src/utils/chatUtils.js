// Helper function to filter out system messages
export const isSystemMessage = (text) => {
  const systemTexts = [
    // Old system texts
    "I'm stuck, I need another hint.",
    "Give me the full answer now.",
    "My answer:",
    "Tôi cần thêm gợi ý",
    "Hãy trả lời đầy đủ",
    "Câu trả lời của tôi:",
    
    // New AI internal prompts (Vietnamese)
    "Học sinh đã đưa ra câu trả lời để kiểm tra. Hãy:",
    "Học sinh đang gặp khó khăn và cần thêm gợi ý. Hãy:",
    "Học sinh đã yêu cầu được trả lời đầy đủ. Hãy:",
    "Bạn là một người bạn thân thiện và kiên nhẫn",
    "Người dùng đang bị kẹt. Hãy xem câu hỏi cuối cùng",
    "Bạn là một người bạn theo phương pháp Socratic",
    
    // New AI internal prompts (English)
    "The student has provided their answer for checking. Please:",
    "The student is having difficulty and needs more hints. Please:",
    "The student has requested a complete answer. Please:",
    "You are a friendly and patient friend",
    "The user is stuck. Look at the last user question",
    "You are a Socratic tutor",
    
    // Prompt formatting instructions
    "**Lưu ý:** Hãy định dạng câu trả lời với:",
    "**Note:** Please format your response with:",
    "Xuống dòng rõ ràng giữa các ý",
    "Clear line breaks between ideas",
    "Dấu gạch đầu dòng (*) cho các điểm chính",
    "Bullet points (*) for key points",
    "Sử dụng **chữ đậm** để nhấn mạnh từ khóa quan trọng",
    "Use **bold text** to highlight important keywords",
    "Sắp xếp thông tin theo thứ tự logic",
    "Organize information in logical order"
  ];
  
  return systemTexts.some(systemText => text.includes(systemText));
};

// Helper function to format AI messages with proper formatting
export const formatAIMessage = (text) => {
    if (typeof text !== 'string') {
        console.error('formatAIMessage received non-string input:', text);
        return String(text);
    }
    
    let formatted = text;
    
    // Replace LaTeX-style math with HTML math formatting
    formatted = formatted.replace(/\$([^$]+)\$/g, '<span class="math-formula">$1</span>');
    
    // Replace line breaks with <br> tags
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Replace bullet points with proper HTML
    formatted = formatted.replace(/^[-*]\s+/gm, '• ');
    
    // Make text between ** bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Make text between * italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Format mathematical expressions
    formatted = formatted.replace(/(\w+)\^(\w+)/g, '<span class="math-sup">$1<sup>$2</sup></span>');
    formatted = formatted.replace(/(\w+)_(\w+)/g, '<span class="math-sub">$1<sub>$2</sub></span>');
    
    // Format fractions like a/b
    formatted = formatted.replace(/(\w+)\/(\w+)/g, '<span class="math-frac">$1/$2</span>');
    
    // Format parentheses with better spacing
    formatted = formatted.replace(/\(/g, '<span class="math-paren">(</span>');
    formatted = formatted.replace(/\)/g, '<span class="math-paren">)</span>');
    
    return formatted;
};

// Helper function to remove duplicate messages from frontend
export const removeDuplicateMessages = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages;
  }

  const seen = new Set();
  const uniqueMessages = [];

  for (const message of messages) {
    // Create a key based on sender and text content
    const key = `${message.sender}:${message.text}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMessages.push(message);
    } else {
    }
  }

  return uniqueMessages;
}; 