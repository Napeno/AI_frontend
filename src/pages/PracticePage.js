import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { del, get, post } from '../utils/apiClient';
import { getLanguage } from '../locales/i18n';
import { formatAIMessage } from '../utils/chatUtils';

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

const PracticePage = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [subject, setSubject] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const language = getLanguage();

  const loadPractice = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recommendationResponse, itemsResponse] = await Promise.all([
        get(`/practice/recommendation?language=${language}`),
        get('/practice/items'),
      ]);
      const recommendationData = recommendationResponse.ok ? await recommendationResponse.json() : { recommendation: null };
      const itemsData = itemsResponse.ok ? await itemsResponse.json() : { items: [] };
      setRecommendation(recommendationData.recommendation);
      setItems(Array.isArray(itemsData.items) ? itemsData.items : []);
      setActiveItem(recommendationData.recommendation || null);
      setFeedback(null);
    } catch (error) {
      console.error('Error loading practice items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadPractice();
  }, [loadPractice]);

  const subjects = useMemo(() => [...new Set(items.map(item => item.subjectArea).filter(Boolean))], [items]);
  const visibleItems = subject === 'all' ? items : items.filter(item => item.subjectArea === subject);

  const openItem = async (itemId) => {
    try {
      const response = await get(`/practice/items/${itemId}?language=${language}`);
      if (!response.ok) return;
      const data = await response.json();
      setActiveItem(data.item);
      setFeedback(null);
      setAnswer('');
    } catch (error) {
      console.error('Error opening practice item:', error);
    }
  };

  const submitAttempt = async () => {
    if (!activeItem || !answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await post(`/practice/items/${activeItem.id}/attempt`, {
        answer: answer.trim(),
        language,
      });
      if (!response.ok) return;
      const data = await response.json();
      setActiveItem(data.item);
      setFeedback(data);
      setAnswer('');
      setItems(current => current.map(item => item.id === data.item.id ? data.item : item));
      if (recommendation?.id === data.item.id) setRecommendation(data.item);
    } catch (error) {
      console.error('Error submitting practice attempt:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await del(`/practice/items/${itemId}`);
      if (!response.ok) return;
      await loadPractice();
    } catch (error) {
      console.error('Error deleting practice item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-4 py-6 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950 sm:px-6">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">THINKBRIDGE · ÔN TẬP</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Sổ tay lỗi</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Luyện lại một bước nhỏ từ những chỗ em từng kẹt.</p>
          </div>
          <Link to="/chat" className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">← Về chat</Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-cyan-100 bg-white p-8 text-center text-slate-500 shadow-sm dark:border-cyan-900 dark:bg-gray-900">Đang chuẩn bị bài ôn...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-cyan-100 bg-white p-8 text-center shadow-sm dark:border-cyan-900 dark:bg-gray-900">
            <div className="text-4xl">🌱</div>
            <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Sổ tay đang trống</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Khi em chọn chỗ đang kẹt hoặc thử làm chưa đúng, ThinkBridge sẽ lưu một bài ôn nhỏ ở đây.</p>
            <Link to="/chat" className="mt-5 inline-flex rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700">Bắt đầu học</Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm dark:border-cyan-800 dark:bg-gray-900">
                <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">BÀI ÔN ĐỀ XUẤT HÔM NAY</p>
                {activeItem ? (
                  <>
                    <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{BLOCKER_LABELS[activeItem.blocker] || 'Luyện lại một bước nhỏ'}</h2>
                    <p className="mt-3 rounded-lg bg-cyan-50 p-3 text-sm text-slate-700 dark:bg-cyan-950/50 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: formatAIMessage(activeItem.sourceQuestion) }} />
                    {activeItem.practice?.prompt && <p className="mt-4 text-base font-medium text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: formatAIMessage(activeItem.practice.prompt) }} />}
                    {activeItem.practice?.hint && <p className="mt-3 text-sm text-cyan-800 dark:text-cyan-200">💡 {activeItem.practice.hint}</p>}
                    <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows="4" placeholder="Viết một bước em sẽ thử làm..." className="mt-4 w-full rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-cyan-800 dark:bg-gray-800 dark:text-white" />
                    <button onClick={submitAttempt} disabled={!answer.trim() || isSubmitting} className="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Đang xem bài...' : 'Kiểm tra bước này'}</button>
                    {feedback && <div className={`mt-4 rounded-lg p-3 text-sm ${feedback.isCorrect ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200' : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200'}`}><strong>{feedback.isCorrect ? 'Tiến bộ rồi!' : 'Cùng thử lại nhé.'}</strong> {feedback.feedback}</div>}
                  </>
                ) : (
                  <p className="mt-3 text-slate-600 dark:text-slate-300">Em đã hoàn thành các mục hiện có. Chọn một mục bên phải nếu muốn luyện lại.</p>
                )}
              </div>
            </section>

            <aside className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm dark:border-cyan-900 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-slate-900 dark:text-white">Các mục đã lưu</h2>
                <select value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-lg border border-cyan-200 bg-white px-2 py-1 text-xs dark:border-cyan-800 dark:bg-gray-800 dark:text-white">
                  <option value="all">Tất cả môn</option>
                  {subjects.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div className="mt-3 space-y-2">
                {visibleItems.map(item => (
                  <div key={item.id} className={`rounded-lg border p-3 ${activeItem?.id === item.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' : 'border-slate-100 dark:border-gray-800'}`}>
                    <button type="button" onClick={() => openItem(item.id)} className="w-full text-left">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{BLOCKER_LABELS[item.blocker] || 'Luyện lại một bước'}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{STATUS_LABELS[item.status]} · Đã luyện {item.reviewCount} lần</p>
                    </button>
                    <button type="button" onClick={() => removeItem(item.id)} className="mt-2 text-xs font-medium text-slate-400 hover:text-red-600">Xoá mục này</button>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default PracticePage;
