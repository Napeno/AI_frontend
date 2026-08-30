import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { post } from '../utils/apiClient';

const Visual = ({ visual }) => {
  if (visual?.kind === 'image' && visual?.url) return <img src={visual.url} alt={visual.alt || 'Minh họa do AI tạo'} className="w-full rounded-2xl border border-orange-200 object-contain" />;
  if (visual?.url) return <img src={visual.url} alt={visual.alt || 'Minh họa do AI tạo'} className="w-full rounded-2xl border border-orange-200 object-contain" />;
  if (visual?.kind === 'svg' && visual?.spec?.svg) return <div role="img" aria-label={visual.spec.label || 'Minh họa do Gemini tạo'} className="flex w-full items-center justify-center overflow-hidden rounded-2xl border border-orange-200 bg-orange-50 p-4 [&>svg]:max-h-60 [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: visual.spec.svg }} />;
  if (visual?.kind === 'svg') return <svg viewBox="0 0 560 240" className="w-full rounded-2xl bg-orange-50 p-4" role="img" aria-label="Sơ đồ AI tạo"><rect x="90" y="38" width="380" height="150" rx="18" fill="#fed7aa" stroke="#f97316" strokeWidth="4" /><path d="M130 150 H430 M280 70 V175" stroke="#c2410c" strokeWidth="4" /><text x="280" y="220" textAnchor="middle" fill="#7c2d12" fontSize="18">{visual?.spec?.label || 'Sơ đồ bài toán'}</text></svg>;
  return null;
};

const SubjectStep = ({ step, onSubmit, loading }) => {
  const [placements, setPlacements] = useState({});
  const [picked, setPicked] = useState('');
  const [order, setOrder] = useState([]);
  const [matches, setMatches] = useState({});
  const [choiceId, setChoiceId] = useState('');
  const [clozeText, setClozeText] = useState('');
  useEffect(() => { setPlacements({}); setPicked(''); setOrder([]); setMatches({}); setChoiceId(''); setClozeText(''); }, [step?.id]);
  if (!step) return null;
  const interaction = step.interaction;
  if (interaction?.type === 'sort_sequence') {
    const add = itemId => setOrder(value => value.includes(itemId) ? value.filter(id => id !== itemId) : [...value, itemId]);
    return <div className="mt-3 rounded-xl border border-orange-200 bg-white p-3"><p className="text-sm leading-relaxed text-slate-700">{step.explanation}</p><p className="mt-3 text-xs font-bold uppercase tracking-wide text-orange-700">Chạm theo đúng thứ tự</p><div className="mt-2 space-y-2">{interaction.items.map(item => <button key={item.id} type="button" onClick={() => add(item.id)} className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-sm ${order.includes(item.id) ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-800">{order.indexOf(item.id) + 1 || '–'}</span>{item.text}</button>)}</div><button type="button" disabled={order.length !== interaction.items.length || loading} onClick={() => onSubmit({}, { order })} className="mt-3 w-full rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Tiếp tục</button></div>;
  }
  if (['match_pairs', 'label_diagram', 'cause_effect'].includes(interaction?.type)) return <div className="mt-3 rounded-xl border border-orange-200 bg-white p-3"><p className="text-sm leading-relaxed text-slate-700">{step.explanation}</p><div className="mt-3 space-y-2">{interaction.left.map(left => <label key={left.id} className="flex items-center justify-between gap-2 text-sm font-semibold"><span>{left.text}</span><select value={matches[left.id] || ''} onChange={event => setMatches(value => ({ ...value, [left.id]: event.target.value }))} className="rounded-lg border border-orange-200 p-2 text-sm"><option value="">Chọn đáp án</option>{interaction.right.map(right => <option key={right.id} value={right.id}>{right.text}</option>)}</select></label>)}</div><button type="button" disabled={Object.keys(matches).length !== interaction.left.length || loading} onClick={() => onSubmit({}, { matches })} className="mt-3 w-full rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Tiếp tục</button></div>;
  if (interaction?.type === 'evidence_choice') return <div className="mt-3 rounded-xl border border-orange-200 bg-white p-3"><p className="text-sm leading-relaxed text-slate-700">{interaction.prompt || step.explanation}</p><div className="mt-3 space-y-2">{interaction.choices.map(choice => <button key={choice.id} type="button" onClick={() => setChoiceId(choice.id)} className={`w-full rounded-lg border p-2 text-left text-sm ${choiceId === choice.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>{choice.text}</button>)}</div><button type="button" disabled={!choiceId || loading} onClick={() => onSubmit({}, { choiceId })} className="mt-3 w-full rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Tiếp tục</button></div>;
  if (interaction?.type === 'cloze') return <div className="mt-3 rounded-xl border border-orange-200 bg-white p-3"><p className="text-sm leading-relaxed text-slate-700">{interaction.prompt || step.explanation}</p><input value={clozeText} onChange={event => setClozeText(event.target.value)} className="mt-3 w-full rounded-lg border border-orange-200 p-2 text-sm" placeholder="Điền câu trả lời" /><button type="button" disabled={!clozeText.trim() || loading} onClick={() => onSubmit({}, { text: clozeText })} className="mt-3 w-full rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Tiếp tục</button></div>;
  const put = blankId => { if (picked) setPlacements(value => ({ ...value, [blankId]: picked })); };
  const labelFor = tokenId => step.tokens.find(token => token.id === tokenId)?.label || 'Kéo token vào đây';
  const ready = step.blanks.length > 0 && step.blanks.every(blank => placements[blank.id]);
  return <div className="mt-3 rounded-xl border border-orange-200 bg-white p-3"><p className="text-sm leading-relaxed text-slate-700">{step.explanation}</p><div className="mt-3 flex flex-wrap gap-2">{step.tokens.map(token => <button key={token.id} type="button" draggable onDragStart={event => event.dataTransfer.setData('text/plain', token.id)} onClick={() => setPicked(token.id)} className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${picked === token.id ? 'border-orange-600 bg-orange-100 text-orange-900' : 'border-orange-200 bg-orange-50 text-orange-800'}`}>{token.label}</button>)}</div><div className="mt-3 space-y-2">{step.blanks.map(blank => <button key={blank.id} type="button" onClick={() => put(blank.id)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); setPlacements(value => ({ ...value, [blank.id]: event.dataTransfer.getData('text/plain') })); }} className="flex w-full items-center justify-between rounded-lg border border-dashed border-orange-300 bg-orange-50 px-3 py-2 text-left text-sm"><span className="font-semibold text-orange-900">{blank.label}</span><span className="rounded bg-white px-2 py-1 text-orange-700">{labelFor(placements[blank.id])}</span></button>)}</div><button type="button" disabled={!ready || loading} onClick={() => onSubmit(placements, {})} className="mt-3 w-full rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Tiếp tục</button></div>;
};

const AITutorPage = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [lesson, setLesson] = useState(null);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(Boolean(sessionId));
  const question = lesson?.question;
  const activeStep = useMemo(() => question?.tutorSteps?.[lesson?.currentStepIndex] || null, [question, lesson?.currentStepIndex]);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    const start = async () => {
      try {
        const response = await post('/ai-tutor/lessons', { sessionId, questionId: searchParams.get('questionId'), language: 'vi' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Không thể tạo bài luyện.');
        if (active) setLesson(data.lesson);
      } catch (error) { if (active) setFeedback(error.message); } finally { if (active) setLoading(false); }
    };
    start();
    return () => { active = false; };
  }, [sessionId, searchParams]);

  const choose = async optionId => {
    if (!lesson || selected || loading) return;
    setSelected(optionId); setLoading(true);
    try {
      const response = await post(`/ai-tutor/lessons/${lesson.lessonId}/answer`, { questionId: question.id, optionId });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể kiểm tra đáp án.');
      setLesson(data.lesson); setFeedback(data.message);
    } catch (error) { setFeedback(error.message); } finally { setLoading(false); }
  };

  const submitStep = async (placements, interactionAnswer) => {
    setLoading(true);
    try {
      const response = await post(`/ai-tutor/lessons/${lesson.lessonId}/step`, { questionId: question.id, stepId: activeStep.id, placements, interactionAnswer });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Kiểm tra bước chưa thành công.');
      setLesson(data.lesson); setSelected(''); setFeedback(data.lesson.completed ? 'Bạn đã hoàn thành mini-lesson!' : 'Tốt lắm, tiếp tục nhé.');
    } catch (error) { setFeedback(error.message); } finally { setLoading(false); }
  };

  if (!sessionId) return <main className="min-h-screen bg-orange-50 px-4 py-16 text-center"><div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm"><img src="/avatar.png" alt="ThinkBridge" className="mx-auto h-20 w-20 object-contain" /><h1 className="mt-4 text-2xl font-bold text-orange-950">AI Tutor học từ bài trong Chat</h1><p className="mt-3 text-slate-600">Mở một bài toán trong Chat rồi bấm “Luyện bài này với AI Tutor” để bắt đầu.</p><Link to="/chat" className="mt-6 inline-block rounded-xl bg-orange-600 px-4 py-2 font-bold text-white">Về Chat</Link></div></main>;
  if (loading && !lesson) return <main className="min-h-screen bg-orange-50 p-10 text-center text-orange-800">AI đang chuẩn bị bài luyện từ cuộc trò chuyện của bạn…</main>;
  if (!lesson) return <main className="min-h-screen bg-orange-50 p-10 text-center"><p className="text-red-700">{feedback}</p><Link to={sessionId ? `/chat?sessionId=${encodeURIComponent(sessionId)}` : '/chat'} className="mt-4 inline-block text-orange-700 underline">Về Chat</Link></main>;

 return <main className="min-h-screen bg-orange-50 px-4 py-5 text-slate-900 sm:px-8"><div className="mx-auto max-w-7xl"><header className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-700">ThinkBridge · AI Tutor</p><h1 className="text-2xl font-bold text-orange-950">Luyện bài từ cuộc trò chuyện</h1><p className="mt-1 text-sm text-orange-700">Câu {(lesson.currentQuestionIndex || 0) + 1}/5 · Hoàn thành liên tục 5 câu hỏi</p></div><Link to={`/chat?sessionId=${encodeURIComponent(sessionId)}`} className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-800">← Về Chat</Link></header><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]"><section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7"><p className="rounded-xl bg-orange-50 p-3 text-sm text-orange-900"><strong>Đề bài từ Chat:</strong> {lesson.sourceText}</p>{lesson.sourceImage?.url && <img src={lesson.sourceImage.url} alt="Đề bài học sinh gửi trong Chat" className="mt-4 max-h-72 w-full rounded-2xl border border-orange-100 object-contain" />}{lesson.completed ? <div className="py-12 text-center"><div className="text-5xl">🎉</div><h2 className="mt-3 text-xl font-bold">Hoàn thành 5 câu hỏi</h2><p className="mt-2 text-slate-600">Bạn đã luyện xong các bước quan trọng của bài này.</p></div> : <><h2 className="mt-5 text-xl font-bold">{question.title}</h2><p className="mt-3 leading-relaxed">{question.prompt}</p><div className="mt-5"><Visual visual={question.visual} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{question.options.map(option => { const isCorrect = question.correctOptionId === option.id; const isWrong = selected === option.id && !isCorrect; return <button key={option.id} type="button" onClick={() => choose(option.id)} disabled={loading || Boolean(selected)} className={`min-h-14 rounded-xl border p-4 text-left text-base font-semibold transition ${isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : isWrong ? 'border-red-400 bg-red-50 text-red-800' : 'border-orange-200 hover:border-orange-500 hover:bg-orange-50'}`}><span className="mr-2 text-orange-600">{option.id}.</span>{option.text}</button>; })}</div>{feedback && <p className={`mt-4 rounded-xl p-3 text-sm font-semibold ${feedback.includes('Chính xác') || feedback.includes('Tốt lắm') || feedback.includes('hoàn thành') ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>{feedback}</p>}</>}</section><aside className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm"><div className="border-b border-orange-100 p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-orange-950">Gợi ý & lời giải</h2><img src="/studentAI.png" alt="StudentAI" className="h-20 w-20 object-contain" /></div><p className="mt-1 text-sm text-orange-700">Xem gợi ý và đáp án từng bước ngay tại đây.</p></div><div className="space-y-3 p-4">{question.tutorSteps.map((step, index) => { const active = index === lesson.currentStepIndex; return <article key={step.id} className={`rounded-2xl border p-4 ${active ? 'border-orange-300 bg-orange-50' : 'border-slate-100 bg-slate-50'}`}><div className="flex gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'}`}>{index + 1}</span><div className="min-w-0 flex-1"><h3 className="font-bold">{step.title}</h3><p className="mt-1 text-sm text-slate-700">{step.explanation || 'Đọc kỹ đề và nêu bước suy luận của em.'}</p>{active && (feedback.includes('Chưa đúng') ? <SubjectStep step={step} onSubmit={submitStep} loading={loading} /> : <button type="button" disabled={loading} onClick={() => submitStep({}, { skip: true })} className="mt-3 w-full rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Đã hiểu, sang câu tiếp</button>)}</div></div></article>; })}</div></aside></div></div></main>;
};

export default AITutorPage;
