import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { del, get, post } from '../utils/apiClient';
import { getLanguage } from '../locales/i18n';
import { formatAIMessage } from '../utils/chatUtils';
import { useAuth } from '../context/AuthContext';
import RewardCelebration from '../components/chat/RewardCelebration';

const PAGE_SIZE = 6;

const BLOCKER_LABELS = {
  understand_question: 'Chưa hiểu đề',
  formula: 'Cần nhắc lại công thức',
  start: 'Kẹt ở bước bắt đầu',
  calculation: 'Cần kiểm tra tính toán',
  incorrect_answer: 'Cần xem lại cách làm',
};

const STATUS_LABELS = {
  new: 'Mới lưu',
  needs_review: 'Cần luyện lại',
  reviewed: 'Đang tiến bộ',
  mastered: 'Đã vững',
};

const SUBJECT_LABELS = {
  mathematics: 'Toán học',
  natural_sciences: 'Khoa học tự nhiên',
  social_sciences: 'Khoa học xã hội',
  english_language: 'Tiếng Anh',
};

const QUESTION_TYPES = [
  { id: 'multiple_choice', label: 'Trắc nghiệm nhiều lựa chọn', icon: '🔘', color: 'border-blue-700 bg-blue-600 text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600', questionColor: 'border-blue-700 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-700', optionColor: 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-900/60 dark:text-blue-50 dark:hover:bg-blue-800', submitColor: 'from-blue-600 via-indigo-600 to-blue-800' },
  { id: 'true_false', label: 'Đúng / Sai', icon: '✅', color: 'border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700 dark:border-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600', questionColor: 'border-emerald-700 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-700', optionColor: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-900/60 dark:text-emerald-50 dark:hover:bg-emerald-800', submitColor: 'from-emerald-500 via-teal-600 to-emerald-800' },
  { id: 'fill_blank', label: 'Điền vào chỗ trống', icon: '✏️', color: 'border-amber-700 bg-amber-500 text-white hover:bg-amber-600 dark:border-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500', questionColor: 'border-amber-700 bg-amber-500 text-white dark:border-amber-500 dark:bg-amber-600', optionColor: 'border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100 dark:border-amber-500 dark:bg-amber-900/60 dark:text-amber-50 dark:hover:bg-amber-800', submitColor: 'from-amber-500 via-orange-600 to-red-600' },
  { id: 'long_answer', label: 'Tự luận dài', icon: '📝', color: 'border-pink-700 bg-pink-600 text-white hover:bg-pink-700 dark:border-pink-500 dark:bg-pink-700 dark:hover:bg-pink-600', questionColor: 'border-pink-700 bg-pink-600 text-white dark:border-pink-500 dark:bg-pink-700', optionColor: 'border-pink-200 bg-pink-50 text-pink-950 hover:bg-pink-100 dark:border-pink-500 dark:bg-pink-900/60 dark:text-pink-50 dark:hover:bg-pink-800', submitColor: 'from-pink-500 via-fuchsia-600 to-purple-700' },
];

const OPTION_COLORS = [
  { normal: 'border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-900/60 dark:text-blue-50 dark:hover:bg-blue-800', selected: 'border-blue-800 bg-blue-700 text-white ring-blue-300/70' },
  { normal: 'border-violet-300 bg-violet-50 text-violet-900 hover:bg-violet-100 dark:border-violet-500 dark:bg-violet-900/60 dark:text-violet-50 dark:hover:bg-violet-800', selected: 'border-violet-800 bg-violet-700 text-white ring-violet-300/70' },
  { normal: 'border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100 dark:border-amber-500 dark:bg-amber-900/60 dark:text-amber-50 dark:hover:bg-amber-800', selected: 'border-amber-800 bg-amber-600 text-white ring-amber-300/70' },
  { normal: 'border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100 dark:border-rose-500 dark:bg-rose-900/60 dark:text-rose-50 dark:hover:bg-rose-800', selected: 'border-rose-800 bg-rose-700 text-white ring-rose-300/70' },
];

const subjectLabel = (subject) => SUBJECT_LABELS[subject] || subject || 'Chưa phân môn';
const itemTitle = (item) => item.conversationTitle || item.title || item.sourceQuestion || BLOCKER_LABELS[item.blocker] || 'Luyện lại một bước';
const itemProblemTitle = (item) => item.subjectArea === 'mathematics' && item.sourceQuestion
  ? `Vấn đề: ${item.sourceQuestion}`
  : '';

const PracticePage = () => {
  const auth = useAuth();
  const updateUserChestnuts = auth?.updateUserChestnuts;
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [activeItem, setActiveItem] = useState(null);
  const [activeQuestionType, setActiveQuestionType] = useState('');
  const [answer, setAnswer] = useState('');
  const [subject, setSubject] = useState('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [reward, setReward] = useState(null);
  const messagesEndRef = useRef(null);

  const language = getLanguage();
  const activeVariant = activeItem?.variants?.find(variant => variant.questionType === activeQuestionType) || null;
  const turns = activeVariant?.turns || [];
  const hasAttempted = turns.some(turn => turn.role === 'student' && turn.action === 'attempt');

  const loadPractice = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (subject !== 'all') query.set('subjectArea', subject);
      const [recommendationResponse, itemsResponse] = await Promise.all([
        get(`/practice/recommendation?language=${language}`),
        get(`/practice/items?${query.toString()}`),
      ]);
      const recommendationData = recommendationResponse.ok ? await recommendationResponse.json() : { recommendation: null };
      const itemsData = itemsResponse.ok ? await itemsResponse.json() : { items: [], subjects: [], pagination: {} };
      const nextItems = Array.isArray(itemsData.items) ? itemsData.items : [];

      setItems(nextItems);
      setSubjects(Array.isArray(itemsData.subjects) ? itemsData.subjects : []);
      setPagination({
        page: itemsData.pagination?.page || 1,
        totalPages: itemsData.pagination?.totalPages || 1,
        totalItems: itemsData.pagination?.totalItems ?? nextItems.length,
      });
      setActiveItem(current => {
        if (current && (subject === 'all' || current.subjectArea === subject)) return current;
        return recommendationData.recommendation || nextItems[0] || null;
      });
      setRequestError('');
      setRequestDetails('');
    } catch (error) {
      console.error('Error loading practice items:', error);
      setRequestError('Không thể tải sổ tay ôn tập. Em thử lại nhé.');
    } finally {
      setIsLoading(false);
    }
  }, [language, page, subject]);

  useEffect(() => {
    loadPractice();
  }, [loadPractice]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [activeItem?.id, turns.length]);

  const updateItem = (item) => {
    setActiveItem(item);
    setItems(current => current.map(entry => entry.id === item.id ? item : entry));
  };

  const openItem = async (itemId) => {
    try {
      const response = await get(`/practice/items/${itemId}?language=${language}`);
      if (!response.ok) return;
      const data = await response.json();
      setActiveItem(data.item);
      setActiveQuestionType('');
      setAnswer('');
      setRequestError('');
      setRequestDetails('');
      setReward(null);
    } catch (error) {
      console.error('Error opening practice item:', error);
      setRequestError('Không thể mở bài ôn này. Em thử lại nhé.');
    }
  };

  const generateQuestion = async (questionType) => {
    if (!activeItem || isSubmitting) return;

    setIsSubmitting(true);
    setRequestError('');
    setRequestDetails('');
    try {
      const response = await post(`/practice/items/${activeItem.id}/generate`, {
        questionType,
        language,
      });
      const data = await response.json();
      if (!response.ok) {
        setRequestError(data.message || 'Không thể tạo bài ôn lúc này.');
        setRequestDetails(data.details || '');
        return;
      }
      setActiveItem(data.item);
      setActiveQuestionType(questionType);
      setAnswer('');
      setReward(null);
    } catch (error) {
      console.error('Error generating practice question:', error);
      setRequestError('Không thể tạo bài ôn lúc này. Em thử lại nhé.');
      setRequestDetails(error.message || '');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendInteraction = async (action) => {
    if (!activeItem || !activeVariant || isSubmitting || (action === 'attempt' && !answer.trim())) return;

    setIsSubmitting(true);
    setRequestError('');
    setRequestDetails('');
    try {
      const response = await post(`/practice/items/${activeItem.id}/attempt`, {
        action,
        questionType: activeQuestionType,
        answer: action === 'attempt' ? answer.trim() : '',
        language,
      });
      const data = await response.json();
      if (!response.ok) {
        setRequestError(data.message || 'Không thể xử lý yêu cầu này.');
        setRequestDetails(data.details || '');
        return;
      }
      updateItem(data.item);
      if (action === 'attempt') {
        if (data.totalChestnuts !== null && data.totalChestnuts !== undefined) updateUserChestnuts?.(data.totalChestnuts, data.totalPoints);
        if (data.isCorrect === true) {
          setReward({
            points: data.pointsAwarded || 0,
            chestnuts: data.chestnutsAwarded || 0,
            badge: data.challengeBadges?.[0] || null,
            id: `${activeItem.id}-${activeQuestionType}-${Date.now()}`,
          });
        }
      }
      if (action === 'attempt') setAnswer('');
    } catch (error) {
      console.error('Error submitting practice interaction:', error);
      setRequestError('Không thể gửi phản hồi. Em thử lại nhé.');
      setRequestDetails(error.message || '');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await del(`/practice/items/${itemId}`);
      if (!response.ok) return;
      if (activeItem?.id === itemId) setActiveItem(null);
      if (activeItem?.id === itemId) setActiveQuestionType('');

      if (items.length === 1 && page > 1) {
        setPage(current => current - 1);
      } else {
        await loadPractice();
      }
    } catch (error) {
      console.error('Error deleting practice item:', error);
      setRequestError('Không thể xoá mục này. Em thử lại nhé.');
    }
  };

  const isEmpty = !isLoading && pagination.totalItems === 0;
  const activeQuestionStyle = QUESTION_TYPES.find(type => type.id === activeQuestionType) || QUESTION_TYPES[3];
  const selectedQuestionLabel = activeQuestionStyle.label;

  return (
    <div className="practice-page min-h-[calc(100dvh-65px)] overflow-y-auto bg-gradient-to-br from-orange-50 via-white to-amber-50 p-3 dark:from-gray-950 dark:via-gray-900 dark:to-orange-950 sm:p-4 lg:h-[calc(100dvh-65px)] lg:overflow-hidden">
      <RewardCelebration reward={reward} />
      <main className="mx-auto flex max-w-7xl flex-col lg:h-full lg:min-h-0">
        <header className="mb-3 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-sm dark:border-orange-900 dark:bg-gray-900">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">THINKBRIDGE · ÔN TẬP</p>
            <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Sổ tay lỗi</h1>
          </div>
          <Link to="/chat" className="shrink-0 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 sm:text-sm">← Về chat</Link>
        </header>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-orange-100 bg-white text-slate-500 shadow-sm dark:border-orange-900 dark:bg-gray-900">Đang chuẩn bị bài ôn...</div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm dark:border-orange-900 dark:bg-gray-900">
            <div className="text-4xl">🌱</div>
            <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Sổ tay đang trống</h2>
            <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">Khi em chọn chỗ đang kẹt hoặc thử làm chưa đúng, ThinkBridge sẽ lưu một bài ôn nhỏ ở đây.</p>
            <Link to="/chat" className="mt-5 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700">Bắt đầu học</Link>
          </div>
        ) : (
          <div className="practice-grid grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="practice-section min-h-0">
              <div className="practice-workspace flex flex-col overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm dark:border-orange-800 dark:bg-gray-900 lg:h-full lg:min-h-0">
                {activeItem ? (
                  <>
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-orange-100 px-4 py-3 dark:border-orange-900">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">Phòng ôn tập</p>
                        <h2 className="truncate text-base font-bold text-slate-900 dark:text-white">{itemTitle(activeItem)}</h2>
                        {itemProblemTitle(activeItem) && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{itemProblemTitle(activeItem)}</p>}
                      </div>
                      <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800 dark:bg-orange-950/50 dark:text-orange-200">{subjectLabel(activeItem.subjectArea)}</span>
                    </div>

                    <div className="practice-scroll flex flex-col bg-gradient-to-br from-orange-50/70 via-white to-amber-50/70 p-3 scrollbar-thin dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/30 sm:p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                      {!activeVariant && <div className="m-auto w-full max-w-4xl rounded-2xl border border-orange-100 bg-white/80 p-4 shadow-lg dark:border-orange-900 dark:bg-gray-800/80 sm:p-6">
                        <div className="text-center">
                          <p className="font-bold uppercase tracking-wide text-orange-700 dark:text-orange-300 sm:text-lg">Chọn dạng bài ôn</p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">Chọn một cách học để ThinkBridge tạo bài luyện riêng cho lỗi này.</p>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {QUESTION_TYPES.map(type => <button key={type.id} type="button" onClick={() => generateQuestion(type.id)} disabled={isSubmitting} className={`group min-h-24 rounded-2xl border px-4 py-4 text-left font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-5 ${type.color} disabled:cursor-not-allowed disabled:opacity-60`}><span className="mr-2 text-2xl align-middle transition-transform group-hover:scale-110 sm:text-3xl">{type.icon}</span><span className="align-middle text-base sm:text-lg">{type.label}</span></button>)}
                        </div>
                        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Mỗi lần bấm sẽ tạo một câu mới phù hợp với lỗi này.</p>
                      </div>}

                      {activeVariant?.prompt && (
                        <div className="mb-4 flex justify-start gap-2">
                          <div className="squirrel-avatar mt-1 shrink-0"><img src="/avatar.png" alt="ThinkBridge" className="h-full w-full object-contain" /></div>
                          <div className="min-w-0 flex-1">
                            <div className={`w-full rounded-2xl rounded-bl-md border px-5 py-4 text-base font-medium shadow-md sm:text-lg ${activeQuestionStyle.questionColor}`}>
                              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/80">{selectedQuestionLabel}</p>
                              <div className="chat-message" dangerouslySetInnerHTML={{ __html: formatAIMessage(activeVariant.prompt) }} />
                            </div>
                            {activeQuestionType === 'multiple_choice' && (
                              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {activeVariant.options.map((option, index) => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setAnswer(option.id)}
                                    aria-pressed={answer === option.id}
                                    disabled={isSubmitting}
                                    className={`block min-h-14 w-full rounded-xl border-2 px-4 py-3 text-left text-base transition sm:text-lg ${answer === option.id ? `${OPTION_COLORS[index % OPTION_COLORS.length].selected} font-extrabold shadow-md ring-4` : `${OPTION_COLORS[index % OPTION_COLORS.length].normal} font-semibold`}`}
                                  >
                                    <span className="mr-1 font-semibold">{option.id}.</span><span dangerouslySetInnerHTML={{ __html: formatAIMessage(option.text) }} />
                                  </button>
                                ))}
                              </div>
                            )}
                            {activeQuestionType === 'true_false' && (
                              <div className="mt-3 grid grid-cols-2 gap-3">
                                {['true', 'false'].map(value => (
                                  <button key={value} type="button" onClick={() => setAnswer(value)} aria-pressed={answer === value} disabled={isSubmitting} className={`min-h-14 rounded-xl border-2 px-6 py-3 text-base font-bold transition sm:text-lg ${value === 'true'
                                    ? (answer === value ? 'border-emerald-800 bg-emerald-700 text-white font-extrabold shadow-md ring-4 ring-emerald-300/70' : 'border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:border-emerald-500 dark:bg-emerald-900/70 dark:text-emerald-50 dark:hover:bg-emerald-800')
                                    : (answer === value ? 'border-rose-800 bg-rose-700 text-white font-extrabold shadow-md ring-4 ring-rose-300/70' : 'border-rose-300 bg-rose-100 text-rose-900 hover:bg-rose-200 dark:border-rose-500 dark:bg-rose-900/70 dark:text-rose-50 dark:hover:bg-rose-800')}`}>
                                    {value === 'true' ? 'Đúng' : 'Sai'}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {turns.map((turn, index) => (
                        <div key={`${turn.createdAt || index}-${index}`} className={`mb-4 flex gap-2 ${turn.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                          {turn.role === 'assistant' && <div className="squirrel-avatar mt-1 shrink-0"><img src="/avatar.png" alt="ThinkBridge" className="h-full w-full object-contain" /></div>}
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:text-base ${turn.role === 'student' ? 'rounded-br-md bg-gradient-to-r from-orange-500 to-orange-700 text-white' : 'rounded-bl-md border border-orange-200 bg-white text-slate-800 dark:border-orange-800 dark:bg-gray-800 dark:text-slate-100'}`}>
                            {turn.role === 'assistant' && turn.action === 'attempt' && typeof turn.isCorrect === 'boolean' && <div className="mb-2 flex justify-center"><img src={turn.isCorrect ? '/happy.png' : '/sad.png'} alt={turn.isCorrect ? 'Trả lời đúng' : 'Trả lời chưa đúng'} className="h-20 w-20 object-contain sm:h-24 sm:w-24" /></div>}
                            <div className={turn.role === 'assistant' ? 'chat-message' : 'whitespace-pre-wrap'} dangerouslySetInnerHTML={{ __html: formatAIMessage(turn.content) }} />
                            {turn.hint && turn.action === 'hint' && <div className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-900 dark:bg-orange-950/50 dark:text-orange-100" dangerouslySetInnerHTML={{ __html: formatAIMessage(`💡 ${turn.hint}`) }} />}
                            {turn.nextQuestion && <div className="mt-3 border-t border-orange-100 pt-3 font-medium text-orange-900 dark:border-orange-800 dark:text-orange-100" dangerouslySetInnerHTML={{ __html: formatAIMessage(`Bước tiếp theo: ${turn.nextQuestion}`) }} />}
                          </div>
                        </div>
                      ))}
                      {isSubmitting && <div className="mb-4 flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300"><div className="squirrel-avatar"><img src="/avatar.png" alt="ThinkBridge" className="h-full w-full object-contain" /></div><span>ThinkBridge đang suy nghĩ...</span></div>}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                      {requestError && <div className="mb-2 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200"><p>{requestError}</p>{requestDetails && <p className="mt-1 font-normal">Chi tiết: {requestDetails}</p>}</div>}
                      {activeVariant && activeQuestionType !== 'multiple_choice' && activeQuestionType !== 'true_false' && <div className="flex gap-2">
                        <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && activeQuestionType === 'fill_blank') { event.preventDefault(); sendInteraction('attempt'); } }} rows={activeQuestionType === 'long_answer' ? 3 : 1} maxLength={activeQuestionType === 'long_answer' ? 1200 : 300} placeholder={activeQuestionType === 'fill_blank' ? 'Điền đáp án ngắn...' : 'Viết bước làm hoặc cách nghĩ của em...'} disabled={isSubmitting} className="min-h-11 flex-1 resize-none rounded-2xl border-2 border-orange-200 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-800 dark:bg-gray-800 dark:text-white" />
                        <button type="button" onClick={() => sendInteraction('attempt')} disabled={!answer.trim() || isSubmitting} className={`rounded-2xl bg-gradient-to-r ${activeQuestionStyle.submitColor} px-4 text-sm font-semibold text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60`}>Gửi</button>
                      </div>}
                      {activeVariant && (activeQuestionType === 'multiple_choice' || activeQuestionType === 'true_false') && <button type="button" onClick={() => sendInteraction('attempt')} disabled={!answer.trim() || isSubmitting} className={`w-full rounded-2xl bg-gradient-to-r ${activeQuestionStyle.submitColor} min-h-14 px-5 py-3 text-lg font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:text-xl`}>🚀 Gửi lựa chọn</button>}
                      {!activeVariant && <p className="text-sm text-slate-500 dark:text-slate-400">Hãy chọn một dạng bài ở phía trên để Gemini tạo câu ôn.</p>}
                      {hasAttempted && <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <button type="button" onClick={() => generateQuestion(activeQuestionType)} disabled={isSubmitting} className="min-h-14 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 px-5 py-3 text-base font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg">🔄 Câu tiếp theo</button>
                        <button type="button" onClick={() => { setActiveQuestionType(''); setAnswer(''); setRequestError(''); }} disabled={isSubmitting} className="min-h-14 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-700 px-5 py-3 text-base font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg">🎨 Chọn loại câu hỏi khác</button>
                      </div>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={() => sendInteraction('hint')} disabled={!hasAttempted || isSubmitting} title={hasAttempted ? 'Nhận một gợi ý dựa trên bước em đã thử' : 'Hãy gửi một bước làm trước'} className="rounded-full border border-orange-300 px-3 py-1.5 text-xs font-semibold text-orange-800 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-800 dark:text-orange-200 dark:hover:bg-orange-950/40">💡 Gợi ý thêm</button>
                        {!hasAttempted && <span className="self-center text-xs text-slate-500 dark:text-slate-400">Hãy thử một bước trước để nhận gợi ý đúng chỗ.</span>}
                        <button type="button" onClick={() => sendInteraction('solution')} disabled={!activeVariant?.canShowSolution || isSubmitting} title={activeVariant?.canShowSolution ? 'Xem lời giải cho bài ôn này' : 'Cần 2 lượt làm sai có ý nghĩa để mở lời giải mẫu'} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800">📖 Lời giải mẫu</button>
                        {activeVariant && !activeVariant.canShowSolution && <span className="self-center text-xs text-slate-500 dark:text-slate-400">Mở sau 2 lượt sai có ý nghĩa.</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="m-auto p-6 text-center text-slate-600 dark:text-slate-300">Chọn một mục bên phải để bắt đầu ôn lại.</div>
                )}
              </div>
            </section>

            <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white p-3 shadow-sm dark:border-orange-900 dark:bg-gray-900">
              <div className="flex shrink-0 items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Các mục đã lưu</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pagination.totalItems} mục</p>
                </div>
                <select value={subject} onChange={(event) => { setSubject(event.target.value); setPage(1); }} className="rounded-lg border border-orange-200 bg-white px-2 py-1 text-xs dark:border-orange-800 dark:bg-gray-800 dark:text-white">
                  <option value="all">Tất cả môn</option>
                  {subjects.map(value => <option key={value} value={value}>{subjectLabel(value)}</option>)}
                </select>
              </div>
              <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
                {items.map(item => (
                  <div key={item.id} className={`flex items-start gap-2 rounded-xl border p-2.5 ${activeItem?.id === item.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40' : 'border-slate-100 dark:border-gray-800'}`}>
                    <button type="button" onClick={() => openItem(item.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{itemTitle(item)}</p>
                      {itemProblemTitle(item) && <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">{itemProblemTitle(item)}</p>}
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{subjectLabel(item.subjectArea)} · {STATUS_LABELS[item.status]} · {item.reviewCount} lần</p>
                    </button>
                    <button type="button" onClick={() => removeItem(item.id)} className="rounded p-1 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Xoá ${itemTitle(item)}`}>×</button>
                  </div>
                ))}
                {items.length === 0 && <p className="pt-3 text-sm text-slate-500 dark:text-slate-400">Chưa có mục thuộc môn này.</p>}
              </div>
              <div className="mt-3 flex shrink-0 items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-gray-800">
                <button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={pagination.page <= 1} className="rounded px-2 py-1 font-semibold text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-orange-300 dark:hover:bg-orange-950/40">← Trước</button>
                <span className="text-slate-500 dark:text-slate-400">{pagination.page}/{pagination.totalPages}</span>
                <button type="button" onClick={() => setPage(current => Math.min(pagination.totalPages, current + 1))} disabled={pagination.page >= pagination.totalPages} className="rounded px-2 py-1 font-semibold text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-orange-300 dark:hover:bg-orange-950/40">Sau →</button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default PracticePage;
