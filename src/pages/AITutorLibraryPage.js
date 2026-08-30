import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../utils/apiClient';

const subjectNames = {
  mathematics: 'Toán học',
  natural_sciences: 'KHTN',
  social_sciences: 'KHXH',
  english_language: 'Tiếng Anh'
};

const AITutorLibraryPage = () => {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    get('/ai-tutor/lessons').then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể tải danh sách bài luyện.');
      if (active) setLessons(data.lessons || []);
    }).catch(loadError => active && setError(loadError.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return <main className="min-h-screen bg-seablue-50 px-4 py-7 text-slate-900 sm:px-8">
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-seablue-700">ThinkBridge · AI Tutor</p><h1 className="mt-1 text-2xl font-bold text-seablue-900">Luyện tập cùng AI Tutor</h1><p className="mt-2 text-sm text-slate-600">Chọn bài đang làm để tiếp tục, hoặc làm lại bài đã hoàn thành.</p></div>
        <Link to="/chat" className="rounded-xl border border-seablue-200 bg-white px-4 py-2 text-sm font-bold text-seablue-800 shadow-sm hover:bg-seablue-100">← Về chat</Link>
      </header>
      {loading && <p className="py-16 text-center text-seablue-700">Đang tải bài luyện...</p>}
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {!loading && !error && !lessons.length && <section className="mt-6 rounded-3xl border border-seablue-200 bg-white p-8 text-center shadow-sm"><img src="/avatar.png" alt="Sóc ThinkBridge" className="mx-auto h-20 w-20 object-contain" /><h2 className="mt-4 text-xl font-bold">Chưa có bài luyện nào</h2><p className="mt-2 text-sm text-slate-600">Mở một bài trong Chat và chọn “Luyện bài này với AI Tutor” để bắt đầu.</p><Link to="/chat" className="mt-5 inline-block rounded-xl bg-seablue-600 px-4 py-2 text-sm font-bold text-white">Mở Chat</Link></section>}
      {!loading && lessons.length > 0 && <section className="mt-6 grid gap-4 sm:grid-cols-2">{lessons.map(lesson => {
        const href = `/ai-tutor/${lesson.sessionId}?questionId=${encodeURIComponent(lesson.sourceQuestionId)}`;
        const progress = Math.min(lesson.questionCount || 5, (lesson.currentQuestionIndex || 0) + 1);
        return <article key={lesson.lessonId} className="rounded-2xl border border-seablue-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${lesson.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-seablue-100 text-seablue-800'}`}>{lesson.completed ? 'Đã hoàn thành' : `Đang làm · câu ${progress}/${lesson.questionCount || 5}`}</span><span className="text-xs text-slate-500">{subjectNames[lesson.course] || subjectNames[lesson.subjectArea] || 'Bài học'}</span></div><h2 className="mt-4 line-clamp-2 text-lg font-bold text-seablue-900">{lesson.sourceText || 'Bài luyện từ Chat'}</h2><p className="mt-2 text-xs text-slate-500">Cập nhật {new Date(lesson.updatedAt).toLocaleDateString('vi-VN')}</p><Link to={href} className="mt-5 inline-flex rounded-xl bg-seablue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-seablue-700">{lesson.completed ? 'Làm lại bài này' : 'Tiếp tục học'}</Link></article>;
      })}</section>}
    </div>
  </main>;
};

export default AITutorLibraryPage;
