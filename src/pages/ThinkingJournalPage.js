import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../utils/apiClient';

const ThinkingJournalPage = () => {
  const [badges, setBadges] = useState([]);
  const [journal, setJournal] = useState(null);

  useEffect(() => {
    Promise.all([get('/user/badges'), get('/user/journal/weekly')]).then(async ([badgeResponse, journalResponse]) => {
      if (badgeResponse.ok) setBadges((await badgeResponse.json()).badges || []);
      if (journalResponse.ok) setJournal(await journalResponse.json());
    }).catch(() => {});
  }, []);

  const current = journal?.current || { activities: 0, beforeHint: 0, meaningfulWork: 0, rate: 0 };
  const previous = journal?.previous || { rate: 0 };
  return <main className="squirrel-hero min-h-screen px-4 py-8 sm:px-6">
    <section className="squirrel-card mx-auto max-w-4xl rounded-3xl p-5 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-700">ThinkBridge · dành cho bạn</p><h1 className="mt-1 text-2xl font-bold text-orange-950 sm:text-3xl">📓 Nhật ký tư duy</h1><p className="mt-2 text-sm text-orange-800">Nhìn lại cách bạn học, không phải điểm phạt.</p></div><Link to="/chat" className="rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700">← Về chat</Link></div>
      <div className="mt-7 rounded-2xl bg-orange-50 p-5 text-orange-950"><p className="text-sm font-bold">Câu chuyện tuần này</p><p className="mt-2 text-lg font-semibold leading-relaxed">{journal?.message || 'Đang chuẩn bị nhật ký của bạn...'}</p></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-orange-200 p-4"><p className="text-xs text-orange-700">Tự thử trước khi hỏi</p><p className="mt-1 text-3xl font-bold text-orange-900">{current.beforeHint}/{current.activities}</p><p className="text-xs text-orange-700">bài trong tuần này</p></div><div className="rounded-2xl border border-orange-200 p-4"><p className="text-xs text-orange-700">Tỷ lệ chủ động</p><p className="mt-1 text-3xl font-bold text-orange-900">{current.rate}%</p><p className="text-xs text-orange-700">tuần trước: {previous.rate}%</p></div><div className="rounded-2xl border border-orange-200 p-4"><p className="text-xs text-orange-700">Bước làm đã gửi</p><p className="mt-1 text-3xl font-bold text-orange-900">{current.meaningfulWork}</p><p className="text-xs text-orange-700">mỗi bước đều đáng giá</p></div></div>
      <div className="mt-8"><h2 className="text-xl font-bold text-orange-950">🌰 Huy hiệu nhà tư duy</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{badges.map(badge => <article key={badge.code} className={`rounded-2xl border p-4 ${badge.earnedAt ? 'border-orange-300 bg-orange-50' : 'border-orange-100 bg-white/60 opacity-70'}`}><div className="flex items-center gap-3"><span className="text-3xl">{badge.icon}</span><div><h3 className="font-bold text-orange-950">{badge.title}</h3><p className="mt-1 text-sm text-orange-800">{badge.description}</p><p className="mt-2 text-xs font-semibold text-orange-700">{badge.earnedAt ? 'Đã mở 🎉' : 'Chưa mở'}</p></div></div></article>)}</div></div>
    </section>
  </main>;
};

export default ThinkingJournalPage;
