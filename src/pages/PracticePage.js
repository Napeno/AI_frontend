import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { del, get, post } from '../utils/apiClient';
import { getLanguage } from '../locales/i18n';
import { formatAIMessage } from '../utils/chatUtils';

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

const subjectLabel = (subject) => SUBJECT_LABELS[subject] || subject || 'Chưa phân môn';

const PracticePage = () => {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [activeItem, setActiveItem] = useState(null);
  const [answer, setAnswer] = useState('');
  const [subject, setSubject] = useState('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const messagesEndRef = useRef(null);

  const language = getLanguage();
  const turns = activeItem?.practice?.turns || [];

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
      setAnswer('');
      setRequestError('');
    } catch (error) {
      console.error('Error opening practice item:', error);
      setRequestError('Không thể mở bài ôn này. Em thử lại nhé.');
    }
  };

  const sendInteraction = async (action) => {
    if (!activeItem || isSubmitting || (action === 'attempt' && !answer.trim())) return;

    setIsSubmitting(true);
    setRequestError('');
    try {
      const response = await post(`/practice/items/${activeItem.id}/attempt`, {
        action,
        answer: action === 'attempt' ? answer.trim() : '',
        language,
      });
      const data = await response.json();
      if (!response.ok) {
        setRequestError(data.message || 'Không thể xử lý yêu cầu này.');
        return;
      }
      updateItem(data.item);
      if (action === 'attempt') setAnswer('');
    } catch (error) {
      console.error('Error submitting practice interaction:', error);
      setRequestError('Không thể gửi phản hồi. Em thử lại nhé.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await del(`/practice/items/${itemId}`);
      if (!response.ok) return;
      if (activeItem?.id === itemId) setActiveItem(null);

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

  return (
    <div className="h-[calc(100dvh-65px)] overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-3 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950 sm:p-4">
      <main className="mx-auto flex h-full max-w-7xl min-h-0 flex-col">
        <header className="mb-3 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-white px-4 py-3 shadow-sm dark:border-cyan-900 dark:bg-gray-900">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">THINKBRIDGE · ÔN TẬP</p>
            <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Sổ tay lỗi</h1>
          </div>
          <Link to="/chat" className="shrink-0 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-700 sm:text-sm">← Về chat</Link>
        </header>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-cyan-100 bg-white text-slate-500 shadow-sm dark:border-cyan-900 dark:bg-gray-900">Đang chuẩn bị bài ôn...</div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-cyan-100 bg-white p-8 text-center shadow-sm dark:border-cyan-900 dark:bg-gray-900">
            <div className="text-4xl">🌱</div>
            <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Sổ tay đang trống</h2>
            <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">Khi em chọn chỗ đang kẹt hoặc thử làm chưa đúng, ThinkBridge sẽ lưu một bài ôn nhỏ ở đây.</p>
            <Link to="/chat" className="mt-5 rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700">Bắt đầu học</Link>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-h-0">
              <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm dark:border-cyan-800 dark:bg-gray-900">
                {activeItem ? (
                  <>
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-cyan-100 px-4 py-3 dark:border-cyan-900">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">Phòng ôn tập</p>
                        <h2 className="truncate text-base font-bold text-slate-900 dark:text-white">{BLOCKER_LABELS[activeItem.blocker] || 'Luyện lại một bước nhỏ'}</h2>
                      </div>
                      <span className="shrink-0 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200">{subjectLabel(activeItem.subjectArea)}</span>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-cyan-50/70 via-white to-blue-50/70 p-3 scrollbar-thin dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/30 sm:p-4">
                      {activeItem.practice?.prompt && (
                        <div className="mb-4 flex justify-start gap-2">
                          <div className="seal-avatar mt-1 shrink-0"><img src="/image/sealedu-logo.png" alt="ThinkBridge" className="h-5 w-5" /></div>
                          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-cyan-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm dark:border-cyan-800 dark:bg-gray-800 dark:text-slate-100 sm:text-base">
                            <p className="mb-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300">Bài tương tự để mình luyện lại</p>
                            <div className="chat-message" dangerouslySetInnerHTML={{ __html: formatAIMessage(activeItem.practice.prompt) }} />
                            {activeItem.practice?.hint && <div className="mt-3 rounded-lg bg-cyan-50 px-3 py-2 text-sm text-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-100" dangerouslySetInnerHTML={{ __html: formatAIMessage(`💡 ${activeItem.practice.hint}`) }} />}
                          </div>
                        </div>
                      )}

                      {turns.map((turn, index) => (
                        <div key={`${turn.createdAt || index}-${index}`} className={`mb-4 flex gap-2 ${turn.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                          {turn.role === 'assistant' && <div className="seal-avatar mt-1 shrink-0"><img src="/image/sealedu-logo.png" alt="ThinkBridge" className="h-5 w-5" /></div>}
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:text-base ${turn.role === 'student' ? 'rounded-br-md bg-gradient-to-r from-cyan-600 to-blue-600 text-white' : 'rounded-bl-md border border-cyan-200 bg-white text-slate-800 dark:border-cyan-800 dark:bg-gray-800 dark:text-slate-100'}`}>
                            <div className={turn.role === 'assistant' ? 'chat-message' : 'whitespace-pre-wrap'} dangerouslySetInnerHTML={{ __html: formatAIMessage(turn.content) }} />
                            {turn.hint && <div className="mt-3 rounded-lg bg-cyan-50 px-3 py-2 text-sm text-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-100" dangerouslySetInnerHTML={{ __html: formatAIMessage(`💡 ${turn.hint}`) }} />}
                            {turn.nextQuestion && <div className="mt-3 font-medium" dangerouslySetInnerHTML={{ __html: formatAIMessage(turn.nextQuestion) }} />}
                          </div>
                        </div>
                      ))}
                      {isSubmitting && <div className="mb-4 flex items-center gap-2 text-sm text-cyan-700 dark:text-cyan-300"><div className="seal-avatar"><img src="/image/sealedu-logo.png" alt="ThinkBridge" className="h-5 w-5" /></div><span>ThinkBridge đang suy nghĩ...</span></div>}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                      {requestError && <p className="mb-2 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{requestError}</p>}
                      <div className="flex gap-2">
                        <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendInteraction('attempt'); } }} rows="1" maxLength="1200" placeholder="Viết bước em muốn thử..." disabled={isSubmitting} className="min-h-11 flex-1 resize-none rounded-2xl border-2 border-cyan-200 bg-white px-4 py-2 text-sm outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-800 dark:bg-gray-800 dark:text-white" />
                        <button type="button" onClick={() => sendInteraction('attempt')} disabled={!answer.trim() || isSubmitting} className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 text-sm font-semibold text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60">Gửi</button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={() => sendInteraction('hint')} disabled={isSubmitting} className="rounded-full border border-cyan-300 px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-800 dark:text-cyan-200 dark:hover:bg-cyan-950/40">💡 Gợi ý thêm</button>
                        <button type="button" onClick={() => sendInteraction('solution')} disabled={!activeItem.canShowSolution || isSubmitting} title={activeItem.canShowSolution ? 'Xem lời giải cho bài ôn này' : 'Cần 2 lượt làm sai có ý nghĩa để mở lời giải mẫu'} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800">📖 Lời giải mẫu</button>
                        {!activeItem.canShowSolution && <span className="self-center text-xs text-slate-500 dark:text-slate-400">Mở sau 2 lượt sai có ý nghĩa.</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="m-auto p-6 text-center text-slate-600 dark:text-slate-300">Chọn một mục bên phải để bắt đầu ôn lại.</div>
                )}
              </div>
            </section>

            <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-cyan-100 bg-white p-3 shadow-sm dark:border-cyan-900 dark:bg-gray-900">
              <div className="flex shrink-0 items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Các mục đã lưu</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pagination.totalItems} mục</p>
                </div>
                <select value={subject} onChange={(event) => { setSubject(event.target.value); setPage(1); }} className="rounded-lg border border-cyan-200 bg-white px-2 py-1 text-xs dark:border-cyan-800 dark:bg-gray-800 dark:text-white">
                  <option value="all">Tất cả môn</option>
                  {subjects.map(value => <option key={value} value={value}>{subjectLabel(value)}</option>)}
                </select>
              </div>
              <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
                {items.map(item => (
                  <div key={item.id} className={`flex items-start gap-2 rounded-xl border p-2.5 ${activeItem?.id === item.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' : 'border-slate-100 dark:border-gray-800'}`}>
                    <button type="button" onClick={() => openItem(item.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{BLOCKER_LABELS[item.blocker] || 'Luyện lại một bước'}</p>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{subjectLabel(item.subjectArea)} · {STATUS_LABELS[item.status]} · {item.reviewCount} lần</p>
                    </button>
                    <button type="button" onClick={() => removeItem(item.id)} className="rounded p-1 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Xoá ${BLOCKER_LABELS[item.blocker] || 'mục ôn'}`}>×</button>
                  </div>
                ))}
                {items.length === 0 && <p className="pt-3 text-sm text-slate-500 dark:text-slate-400">Chưa có mục thuộc môn này.</p>}
              </div>
              <div className="mt-3 flex shrink-0 items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-gray-800">
                <button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={pagination.page <= 1} className="rounded px-2 py-1 font-semibold text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-cyan-300 dark:hover:bg-cyan-950/40">← Trước</button>
                <span className="text-slate-500 dark:text-slate-400">{pagination.page}/{pagination.totalPages}</span>
                <button type="button" onClick={() => setPage(current => Math.min(pagination.totalPages, current + 1))} disabled={pagination.page >= pagination.totalPages} className="rounded px-2 py-1 font-semibold text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-cyan-300 dark:hover:bg-cyan-950/40">Sau →</button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default PracticePage;
