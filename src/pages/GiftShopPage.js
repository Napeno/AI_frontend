import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post, put } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

const formatChestnuts = value => Number(value || 0).toLocaleString('vi-VN');
const createRequestId = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
  </svg>
);

const GiftShopPage = () => {
  const { user, updateUserChestnuts } = useAuth();
  const [gifts, setGifts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [chestnuts, setChestnuts] = useState(user?.chestnuts || 0);
  const [loading, setLoading] = useState(true);
  const [busyGift, setBusyGift] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([get('/shop/gifts'), get('/shop/history')])
      .then(async ([giftResponse, historyResponse]) => {
        if (!active) return;
        if (!giftResponse.ok) throw new Error('Không thể tải danh sách quà');
        const giftData = await giftResponse.json();
        setGifts(giftData.gifts || []);
        setFavorites(giftData.favorites || []);
        setChestnuts(giftData.chestnuts || 0);
        if (historyResponse.ok) setHistory((await historyResponse.json()).history || []);
      })
      .catch(error => active && setNotice({ type: 'error', text: error.message || 'Không thể tải cửa hàng' }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const favoriteGifts = useMemo(() => favorites.map(id => gifts.find(gift => gift.id === id)).filter(Boolean), [favorites, gifts]);

  const toggleFavorite = async giftId => {
    setBusyGift(giftId);
    try {
      const response = await put(`/shop/favorites/${giftId}`, {});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể cập nhật yêu thích');
      setFavorites(data.favorites || []);
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusyGift(null);
    }
  };

  const redeemGift = async gift => {
    if (chestnuts < gift.price) {
      setNotice({ type: 'error', text: 'Em chưa đủ hạt dẻ để đổi món quà này.' });
      return;
    }
    setBusyGift(gift.id);
    try {
      const response = await post('/shop/redeem', { giftId: gift.id, requestId: createRequestId() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể đổi quà');
      setChestnuts(data.totalChestnuts);
      updateUserChestnuts?.(data.totalChestnuts);
      setHistory(current => [data.redemption, ...current]);
      setNotice({ type: 'success', text: `Đã gửi yêu cầu đổi “${gift.title}”. Đơn đang chờ xử lý.` });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusyGift(null);
    }
  };

  return (
    <main className="gift-shop min-h-screen bg-white px-4 py-5 text-slate-800 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-[#ed4d99] px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-white">Sóc</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Danh sách quà tặng</h1>
            <p className="mt-2 text-sm text-slate-500">Đổi hạt dẻ lấy món quà em yêu thích.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-orange-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Số dư của em</p>
              <p className="mt-1 text-xl font-extrabold text-orange-500">🌰 {formatChestnuts(chestnuts)}</p>
            </div>
            <Link to="/chat" className="rounded-2xl bg-[#2f9f7a] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#247c5f]">Về cuộc trò chuyện</Link>
          </div>
        </div>

        {notice && <div role="alert" className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{notice.text}</div>}

        {loading ? <div className="rounded-3xl bg-white p-12 text-center font-semibold text-slate-500 shadow-sm">Đang tải quà tặng...</div> : (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section aria-label="Danh sách quà tặng" className="grid gap-5 md:grid-cols-2">
              {gifts.map(gift => {
                const isFavorite = favorites.includes(gift.id);
                const isBusy = busyGift === gift.id;
                return <article key={gift.id} className="flex min-h-[230px] gap-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-[0_8px_25px_rgba(217,119,6,0.06)] transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
                  <div className="flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 sm:h-44 sm:w-36"><img src={gift.image} alt={gift.title} className="h-full w-full object-contain" /></div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start gap-2">
                      <h2 className="line-clamp-2 flex-1 text-base font-extrabold leading-snug text-slate-800">{gift.title}</h2>
                      <button type="button" onClick={() => toggleFavorite(gift.id)} disabled={isBusy} aria-label={isFavorite ? `Bỏ yêu thích ${gift.title}` : `Yêu thích ${gift.title}`} className={`shrink-0 rounded-full p-1.5 transition ${isFavorite ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}><HeartIcon filled={isFavorite} /></button>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{gift.description}</p>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                      <p className="text-lg font-extrabold text-orange-500">{formatChestnuts(gift.price)} <span className="text-sm">🌰</span></p>
                      <button type="button" onClick={() => redeemGift(gift)} disabled={isBusy} className="rounded-xl bg-[#3b82f6] px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#2563eb] disabled:cursor-wait disabled:opacity-60">{isBusy ? 'Đang xử lý...' : 'Nhận quà'}</button>
                    </div>
                  </div>
                </article>;
              })}
            </section>

            <aside className="sticky top-5 rounded-3xl bg-white p-5 shadow-[0_8px_25px_rgba(217,119,6,0.08)]">
              <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold text-slate-900">Quà tặng yêu thích</h2><span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-500">{favoriteGifts.length}</span></div>
              {favoriteGifts.length ? <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-2">
                {favoriteGifts.map(gift => <div key={gift.id} className="min-w-[245px] snap-center overflow-hidden rounded-2xl border border-orange-100 bg-[#fffaf2] p-3">
                  <div className="flex h-44 items-center justify-center rounded-xl bg-white"><img src={gift.image} alt={gift.title} className="h-full w-full object-contain" /></div>
                  <h3 className="mt-3 line-clamp-2 font-extrabold text-slate-800">{gift.title}</h3>
                  <p className="mt-2 text-sm font-bold text-orange-500">{formatChestnuts(gift.price)} 🌰</p>
                </div>)}
              </div> : <div className="mt-5 rounded-2xl bg-[#fffaf2] px-5 py-12 text-center text-sm text-slate-500">Bấm vào trái tim để lưu món quà em thích nhé.</div>}

              <div className="mt-5 rounded-2xl bg-orange-50 p-4"><p className="text-sm font-bold text-slate-700">Số hạt dẻ hiện có</p><p className="mt-1 text-2xl font-extrabold text-orange-500">🌰 {formatChestnuts(chestnuts)}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100"><div className="h-full rounded-full bg-orange-400" style={{ width: `${Math.min(100, Math.round((chestnuts / (favoriteGifts[0]?.price || 1)) * 100))}%` }} /></div></div>

              <div className="mt-6 border-t border-slate-100 pt-5"><h3 className="font-extrabold text-slate-800">Lịch sử đổi quà</h3>{history.length ? <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">{history.map(item => <div key={item._id || item.idempotencyKey} className="rounded-xl bg-slate-50 px-3 py-2 text-sm"><p className="font-bold text-slate-700">{item.title}</p><p className="mt-1 text-xs text-slate-500">-{formatChestnuts(item.price)} 🌰 · {item.status === 'failed' ? 'Không đủ hạt dẻ' : 'Đang chờ xử lý'}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">Chưa có lịch sử đổi quà.</p>}</div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default GiftShopPage;
