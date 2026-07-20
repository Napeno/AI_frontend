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

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const extractBracedContent = (text, startIndex) => {
  if (text[startIndex] !== '{') {
    return null;
  }

  let depth = 0;
  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          content: text.slice(startIndex + 1, index),
          endIndex: index,
        };
      }
    }
  }

  return null;
};

const replaceLatexCommandWithBraces = (text, command, renderer) => {
  let result = '';
  let cursor = 0;

  while (cursor < text.length) {
    const commandIndex = text.indexOf(command, cursor);
    if (commandIndex === -1) {
      result += text.slice(cursor);
      break;
    }

    const braceStart = commandIndex + command.length;
    const braced = extractBracedContent(text, braceStart);

    if (!braced) {
      result += text.slice(cursor, commandIndex + command.length);
      cursor = commandIndex + command.length;
      continue;
    }

    result += text.slice(cursor, commandIndex);
    result += renderer(braced.content);
    cursor = braced.endIndex + 1;
  }

  return result;
};

const renderLatex = (rawLatex) => {
  let latex = escapeHtml(rawLatex)
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\pm/g, '±')
    .replace(/\\geq?/g, '≥')
    .replace(/\\leq?/g, '≤')
    .replace(/\\neq/g, '≠')
    .replace(/\\frac/g, '\\frac')
    .trim();

  latex = replaceLatexCommandWithBraces(latex, '\\sqrt', (content) => {
    const renderedContent = renderLatex(content);
    return `<span class="math-root">√<span class="math-root-content">${renderedContent}</span></span>`;
  });

  latex = replaceLatexCommandWithBraces(latex, '\\text', content => content);

  latex = latex.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, numerator, denominator) => (
    `<span class="math-fraction"><span>${renderLatex(numerator)}</span><span>${renderLatex(denominator)}</span></span>`
  ));

  latex = latex
    .replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>')
    .replace(/\^([A-Za-z0-9+-]+)/g, '<sup>$1</sup>')
    .replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>')
    .replace(/_([A-Za-z0-9+-]+)/g, '<sub>$1</sub>')
    .replace(/\\([A-Za-z]+)/g, '$1')
    .replace(/\{/g, '(')
    .replace(/\}/g, ')');

  return latex;
};

const replaceMathSegments = (text) => {
  const mathSegments = [];
  const placeholderPrefix = '%%SEALEDUMATH';
  const placeholderSuffix = '%%';
  const addMathSegment = (latex, isBlock = false) => {
    const className = isBlock ? 'math-formula math-display' : 'math-formula';
    const renderedMath = `<span class="${className}">${renderLatex(latex)}</span>`;
    const placeholder = `${placeholderPrefix}${mathSegments.length}${placeholderSuffix}`;
    mathSegments.push(renderedMath);
    return placeholder;
  };
  const delimitedMath = text.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g, (match, blockDollar, inlineDollar, parenMath, bracketMath) => {
    const latex = blockDollar || inlineDollar || parenMath || bracketMath || '';
    const isBlock = Boolean(blockDollar || bracketMath);
    return addMathSegment(latex, isBlock);
  });

  const withoutMath = delimitedMath.replace(/\\frac\{[^{}]+\}\{[^{}]+\}|\\sqrt\{[^{}]+\}/g, match => addMathSegment(match));

  return { withoutMath, mathSegments, placeholderPrefix, placeholderSuffix };
};

// Helper function to format AI messages with proper formatting
export const formatAIMessage = (text) => {
    if (typeof text !== 'string') {
        console.error('formatAIMessage received non-string input:', text);
        return String(text);
    }

    const { withoutMath, mathSegments, placeholderPrefix, placeholderSuffix } = replaceMathSegments(text);
    let formatted = escapeHtml(withoutMath);

    // Replace line breaks with <br> tags
    formatted = formatted.replace(/\n/g, '<br>');

    // Replace bullet points with proper HTML
    formatted = formatted.replace(/^[-*]\s+/gm, '• ');

    // Make text between ** bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Make text between * italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Older practice content sometimes stores x^2 directly instead of \(x^2\).
    formatted = formatted
      .replace(/([A-Za-z0-9)])\^\{([^{}]+)\}/g, '$1<sup>$2</sup>')
      .replace(/([A-Za-z0-9)])\^([A-Za-z0-9+-]+)/g, '$1<sup>$2</sup>')
      .replace(/([A-Za-z0-9)])_\{([^{}]+)\}/g, '$1<sub>$2</sub>')
      .replace(/([A-Za-z0-9)])_([A-Za-z0-9+-]+)/g, '$1<sub>$2</sub>');

    mathSegments.forEach((mathHtml, index) => {
      const placeholder = `${placeholderPrefix}${index}${placeholderSuffix}`;
      formatted = formatted.replace(placeholder, mathHtml);
    });

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
