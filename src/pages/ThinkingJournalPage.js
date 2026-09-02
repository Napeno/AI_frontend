import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMedal } from 'react-icons/fa';
import { get } from '../utils/apiClient';

const ThinkingJournalPage = () => {
  const [journal, setJournal] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    get('/user/journal/weekly').then(async response => {
      if (!response.ok) throw new Error('Không thể tải dữ liệu nhật ký.');
      setJournal(await response.json());
    }).catch(error => setLoadError(error.message));
  }, []);

  const current = journal?.current || { activities: 0, beforeHint: 0, meaningfulWork: 0, rate: 0 };
  const previous = journal?.previous || { rate: 0 };
  const goal = journal?.goal;
  const challenges = journal?.challenges || [];
  const badges = journal?.badges || [];
  const progress = goal ? Math.min(100, Math.round((goal.progress || 0) * 100 / goal.target)) : 0;
  return <main className="squirrel-hero min-h-screen px-4 py-8 sm:px-6">
    <section className="squirrel-card mx-auto max-w-4xl rounded-3xl p-5 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-700">ThinkBridge · dành cho bạn</p><h1 className="mt-1 text-2xl font-bold text-orange-950 sm:text-3xl">📓 Nhật ký tư duy</h1><p className="mt-2 text-sm text-orange-800">Nhìn lại cách bạn học, không phải điểm phạt.</p></div><Link to="/chat" className="rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700">← Về chat</Link></div>
      <div className="mt-7 rounded-2xl bg-orange-50 p-5 text-orange-950"><p className="text-sm font-bold">Câu chuyện tuần này</p><p className="mt-2 text-lg font-semibold leading-relaxed">{journal?.message || 'Đang chuẩn bị nhật ký của bạn...'}</p></div>
      {loadError && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{loadError}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-orange-200 p-4"><p className="text-xs text-orange-700">Tự thử trước khi hỏi</p><p className="mt-1 text-3xl font-bold text-orange-900">{current.beforeHint}/{current.activities}</p><p className="text-xs text-orange-700">bài trong tuần này</p></div><div className="rounded-2xl border border-orange-200 p-4"><p className="text-xs text-orange-700">Tỷ lệ chủ động</p><p className="mt-1 text-3xl font-bold text-orange-900">{current.rate}%</p><p className="text-xs text-orange-700">tuần trước: {previous.rate}%</p></div><div className="rounded-2xl border border-orange-200 p-4"><p className="text-xs text-orange-700">Bước làm đã gửi</p><p className="mt-1 text-3xl font-bold text-orange-900">{current.meaningfulWork}</p><p className="text-xs text-orange-700">mỗi bước đều đáng giá</p></div></div>
      {goal && <div className="mt-8"><h2 className="flex items-center gap-2 text-xl font-bold text-orange-950"><FaMedal className="text-amber-500" aria-hidden="true" /> Mục tiêu tuần tiếp theo</h2><article className="mt-3 rounded-2xl border border-orange-200 bg-white/70 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-orange-700">{goal.area}{goal.subject ? ` · ${goal.subject}` : ''}</p><h3 className="mt-1 text-lg font-bold text-orange-950">{goal.title}</h3><p className="mt-1 max-w-2xl text-sm leading-relaxed text-orange-800">{goal.description}</p></div><span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-900">{goal.progress}/{goal.target} {goal.unit}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs font-semibold text-orange-700">Tiến độ hiện tại: {progress}%</p></article><h3 className="mt-6 text-lg font-bold text-orange-950">Task trong tuần</h3><div className="mt-3 grid gap-3 md:grid-cols-3">{challenges.map((challenge, index) => <article key={`${challenge.code}-${index}`} className={`rounded-2xl border p-4 ${challenge.completed ? 'border-amber-300 bg-amber-50/70' : 'border-orange-200 bg-white/70'}`}><div className="flex items-center gap-2"><span className="text-2xl" aria-hidden="true">{challenge.icon}</span><h4 className="font-bold text-orange-950">{challenge.title}</h4></div><p className="mt-2 text-sm leading-relaxed text-orange-800">{challenge.description}</p><div className="mt-4 flex items-center justify-between text-xs font-bold text-orange-700"><span>Tiến độ: {challenge.progress}/{challenge.target}</span><span>{challenge.completed ? 'Đã hoàn thành ✓' : 'Chưa hoàn thành'}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, challenge.progress * 100 / challenge.target)}%` }} /></div><Link to={challenge.actionPath || '/chat'} className="mt-4 inline-flex rounded-xl bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700">{challenge.actionLabel}</Link><p className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange-700"><FaMedal className="text-amber-500" aria-hidden="true" /> Thưởng: {challenge.badgeTitle}</p></article>)}</div>{badges.length > 0 && <div className="mt-6 rounded-2xl bg-amber-50 p-4"><h3 className="flex items-center gap-2 font-bold text-orange-950"><FaMedal className="text-amber-500" aria-hidden="true" /> Huy hiệu nhà tư duy</h3><div className="mt-2 grid gap-2 sm:grid-cols-2">{badges.map(badge => <div key={badge.code} className={`rounded-xl px-3 py-2 text-xs font-semibold ${badge.earnedAt ? 'bg-white text-orange-900' : 'bg-white/50 text-orange-400'}`}><span className="mr-1" aria-hidden="true">🏅</span>{badge.title}<span className="ml-1">· {badge.earnedAt ? 'Đã mở' : 'Chưa mở'}</span></div>)}</div></div>}</div>}
    </section>
  </main>;
};

export default ThinkingJournalPage;
