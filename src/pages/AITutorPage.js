import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { get, post } from "../utils/apiClient";
import { formatAIMessage } from "../utils/chatUtils";
import { useAuth } from "../context/AuthContext";

const formulaPattern = /[$\\^_]|ightarrow|[→←↔×₂²]/;

const RichText = ({ text }) => (
  <span dangerouslySetInnerHTML={{ __html: formatAIMessage(String(text || "")) }} />
);

const TypedText = ({ text, animate = false }) => {
  const value = String(text || "");
  const [visibleText, setVisibleText] = useState(animate ? "" : value);

  useEffect(() => {
    if (!animate || formulaPattern.test(value)) {
      setVisibleText(value);
      return undefined;
    }
    setVisibleText("");
    let index = 0;
    const intervalId = setInterval(() => {
      index += 1;
      setVisibleText(value.slice(0, index));
      if (index >= value.length) clearInterval(intervalId);
    }, 20);
    return () => clearInterval(intervalId);
  }, [animate, value]);

  if (formulaPattern.test(visibleText) || formulaPattern.test(value)) return <RichText text={value} />;
  return <span>{visibleText}</span>;
};

const Confetti = ({ burst }) => (
  <div
    key={burst}
    aria-hidden="true"
    className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-[48vh] overflow-hidden"
  >
    {Array.from({ length: 36 }, (_, index) => (
      <span
        key={index}
        className="absolute top-0 h-3 w-2 animate-confetti-fall opacity-0"
        style={{
          left: `${(index * 29) % 100}%`,
          top: `${(index * 17) % 34}%`,
          animationDelay: `${(index % 8) * 0.08}s`,
          animationDuration: `${2 + (index % 4) * 0.25}s`,
          backgroundColor: ["#f97316", "#facc15", "#10b981", "#60a5fa", "#f472b6"][index % 5],
          transform: `rotate(${(index * 37) % 360}deg)`,
        }}
      />
    ))}
  </div>
);

const StepGuidance = ({ step, animate = false }) => {
  const hint = step.hint || "";
  const easierExample = step.easierExample;
  return <>
    <p className="text-base leading-7 text-slate-800 sm:text-lg">
      <TypedText text={step.explanation} animate={animate} />
    </p>
    {(step.analysis || hint) && (
      <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 text-sm leading-6 text-slate-700">
        <summary className="cursor-pointer px-3 py-2 font-bold text-slate-800">Gợi ý thêm</summary>
        <div className="space-y-2 border-t border-slate-200 px-3 py-3">
          {step.analysis && <p><strong>Phân tích:</strong> <TypedText text={step.analysis} animate={animate} /></p>}
          {hint && <p className="text-slate-600"><RichText text={`Gợi ý: ${hint}`} /></p>}
          {easierExample?.prompt && <div className="rounded-lg bg-white p-3 text-slate-700">
            <p><strong>Câu dễ hơn:</strong> <RichText text={easierExample.prompt} /></p>
            {easierExample.answer && <p className="mt-1"><strong>Đáp án:</strong> <RichText text={easierExample.answer} /></p>}
            {easierExample.hint && <p className="mt-1 text-slate-600"><RichText text={`Gợi ý: ${easierExample.hint}`} /></p>}
          </div>}
        </div>
      </details>
    )}
  </>;
};

const SubjectStep = ({ step, onSubmit, loading, animateExplanation = false, stepFeedback = null }) => {
  const [placements, setPlacements] = useState({});
  const [picked, setPicked] = useState("");
  const [order, setOrder] = useState([]);
  const [matches, setMatches] = useState({});
  const [choiceId, setChoiceId] = useState("");
  const [clozeText, setClozeText] = useState("");
  useEffect(() => {
    setPlacements({});
    setPicked("");
    setOrder([]);
    setMatches({});
    setChoiceId("");
    setClozeText("");
  }, [step?.id]);
  if (!step) return null;
  const interaction = step.interaction;
  if (interaction?.type === "sort_sequence") {
    const add = (itemId) =>
      setOrder((value) =>
        value.includes(itemId)
          ? value.filter((id) => id !== itemId)
          : [...value, itemId],
      );
    return (
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
        <StepGuidance step={step} animate={animateExplanation} />
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-violet-700">
          Chạm theo đúng thứ tự
        </p>
        <div className="mt-2 space-y-2">
          {interaction.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => add(item.id)}
              className={`flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm ${order.includes(item.id) ? "border-violet-500 bg-violet-50 text-violet-900" : "border-slate-200 bg-slate-50 hover:border-violet-300"}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-800">
                {order.indexOf(item.id) + 1 || "–"}
              </span>
              {item.text ? <RichText text={item.text} /> : null}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={order.length !== interaction.items.length || loading}
          onClick={() => onSubmit({}, { order })}
          className="mt-4 w-full rounded-xl bg-violet-600 px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
        >
          Tiếp tục
        </button>
      </div>
    );
  }
  if (
    ["match_pairs", "label_diagram", "cause_effect"].includes(interaction?.type)
  )
    return (
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
        <StepGuidance step={step} animate={animateExplanation} />
        <div className="mt-3 space-y-2">
          {interaction.left.map((left) => (
            <label
              key={left.id}
              className="flex items-center justify-between gap-2 text-sm font-semibold"
            >
              <span><RichText text={left.text} /></span>
              <select
                value={matches[left.id] || ""}
                onChange={(event) =>
                  setMatches((value) => ({
                    ...value,
                    [left.id]: event.target.value,
                  }))
                }
                className="rounded-lg border border-cyan-200 bg-cyan-50 p-2 text-sm text-cyan-950"
              >
                <option value="">Chọn đáp án</option>
                {interaction.right.map((right) => (
                  <option key={right.id} value={right.id}>
                    {right.text}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={
            Object.keys(matches).length !== interaction.left.length || loading
          }
          onClick={() => onSubmit({}, { matches })}
          className="mt-4 w-full rounded-xl bg-cyan-600 px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-50"
        >
          Tiếp tục
        </button>
      </div>
    );
  if (interaction?.type === "evidence_choice")
    return (
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
        <StepGuidance step={{ ...step, explanation: interaction.prompt || step.explanation }} animate={animateExplanation} />
        <div className="mt-3 space-y-2">
          {interaction.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => setChoiceId(choice.id)}
              className={`w-full rounded-lg border p-3 text-left text-sm ${choiceId === choice.id ? "border-rose-500 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 hover:border-rose-300"}`}
            >
              <RichText text={choice.text} />
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!choiceId || loading}
          onClick={() => onSubmit({}, { choiceId })}
          className="mt-4 w-full rounded-xl bg-rose-600 px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
        >
          Tiếp tục
        </button>
      </div>
    );
  if (interaction?.type === "cloze")
    return (
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
        <StepGuidance step={{ ...step, explanation: interaction.prompt || step.explanation }} animate={animateExplanation} />
        <input
          value={clozeText}
          onChange={(event) => setClozeText(event.target.value)}
          className="mt-3 w-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"
          placeholder="Điền câu trả lời"
        />
        <button
          type="button"
          disabled={!clozeText.trim() || loading}
          onClick={() => onSubmit({}, { text: clozeText })}
          className="mt-4 w-full rounded-xl bg-amber-600 px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
        >
          Tiếp tục
        </button>
      </div>
    );
  const put = (blankId) => {
    if (picked) setPlacements((value) => ({ ...value, [blankId]: picked }));
  };
  const labelFor = (tokenId) =>
    step.tokens.find((token) => token.id === tokenId)?.label ||
    "Chọn đáp án";
  const ready =
    step.blanks.length > 0 &&
    step.blanks.every((blank) => placements[blank.id]);
  if (!step.blanks.length && !step.tokens.length) {
    return (
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-7">
        <StepGuidance step={step} animate={animateExplanation} />
        <button
          type="button"
          disabled={loading}
          onClick={() => onSubmit({}, { skip: true })}
          className="mt-4 w-full rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Đã hiểu, sang bước tiếp
        </button>
      </div>
    );
  }
  return (
    <div className="mt-3 rounded-2xl border-0 bg-transparent p-0">
      <StepGuidance step={step} animate={animateExplanation} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {step.tokens.map((token) => (
          <button
            key={token.id}
            type="button"
            draggable
            onDragStart={(event) =>
              event.dataTransfer.setData("text/plain", token.id)
            }
            onClick={() => setPicked(token.id)}
            className={`rounded-lg border-2 bg-white px-3 py-2 text-sm font-bold shadow-sm transition ${picked === token.id ? "border-orange-500 bg-orange-100 text-orange-900" : "border-slate-300 text-slate-800 hover:border-orange-400 hover:bg-orange-50"}`}
          >
            <RichText text={token.label} />
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {step.blanks.map((blank, index) => (
          <div key={blank.id} className="flex items-center gap-2">
            <span className="max-w-[18rem] text-sm font-semibold text-slate-700"><RichText text={blank.label} /></span>
            <button
              type="button"
              onClick={() => put(blank.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setPlacements((value) => ({
                  ...value,
                  [blank.id]: event.dataTransfer.getData("text/plain"),
                }));
              }}
              aria-label={`${blank.label}: ${placements[blank.id] ? labelFor(placements[blank.id]) : "Ô trống"}`}
              style={{ backgroundColor: "#fff" }}
              className={`flex h-12 min-w-20 items-center justify-center rounded-lg border-2 bg-white px-4 text-base font-bold shadow-sm transition ${placements[blank.id] ? "border-emerald-500 text-emerald-800" : "border-slate-300 text-slate-300 hover:border-orange-400"}`}
            >
              {placements[blank.id] ? <RichText text={labelFor(placements[blank.id])} /> : "Ô trống"}
            </button>
            {index < step.blanks.length - 1 && <span className="text-lg text-slate-500">,</span>}
          </div>
        ))}
      </div>
      {stepFeedback && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-bold">Đáp án đúng: {stepFeedback.correctAnswer?.map(answer => answer.label).join(", ") || "Xem lại hướng dẫn ở trên."}</p>
          {stepFeedback.guidance && <p className="mt-1">Hướng dẫn: {stepFeedback.guidance}</p>}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-orange-200 pt-4">
        {!ready && !stepFeedback && <p className="text-sm text-slate-500">Hãy điền đủ tất cả ô trống</p>}
        <button
          type="button"
          disabled={(!ready && !stepFeedback) || loading}
          onClick={() => onSubmit(stepFeedback ? {} : placements, stepFeedback ? { stepReview: true } : {})}
          className="rounded-xl bg-slate-300 px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-white transition enabled:bg-orange-500 enabled:hover:bg-orange-600 disabled:cursor-not-allowed"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

const AITutorPage = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const { updateUserChestnuts } = useAuth() || {};
  const [lesson, setLesson] = useState(null);
  const [selected, setSelected] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(null);
  const [stepFeedback, setStepFeedback] = useState(null);
  const [reward, setReward] = useState(null);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(Boolean(sessionId));
  const activeStepRef = useRef(null);
  const question = lesson?.question;
  const generatedQuestionCount = lesson?.generatedQuestionCount || 0;
  const generationPercent = Math.min(100, Math.round((generatedQuestionCount / (lesson?.totalQuestionCount || 5)) * 100));
  const activeStep = useMemo(
    () => question?.tutorSteps?.[lesson?.currentStepIndex] || null,
    [question, lesson?.currentStepIndex],
  );

  useEffect(() => {
    if (!confettiBurst) return undefined;
    const timeoutId = setTimeout(() => setConfettiBurst(0), 2800);
    return () => clearTimeout(timeoutId);
  }, [confettiBurst]);

  const normalizeLesson = (value) => {
    if (!value) return value;
    const index = Number.isInteger(value.currentQuestionIndex) ? value.currentQuestionIndex : 0;
    return value.question ? value : { ...value, question: value.questions?.[index] || null };
  };

  const regenerateLesson = async () => {
    if (!sessionId || loading) return;
    setLoading(true);
    setFeedback("");
    try {
      const response = await post("/ai-tutor/lessons", {
        sessionId,
        questionId: searchParams.get("questionId"),
        language: "vi",
        regenerate: true,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tạo bài luyện.");
      setLesson(normalizeLesson(data.lesson));
      setAnswerSubmitted(false);
      setAnswerCorrect(null);
      setReward(null);
      setStepFeedback(null);
      setSelected("");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    const start = async () => {
      try {
        const lessonId = searchParams.get("lessonId");
        const response = lessonId
          ? await get(`/ai-tutor/lessons/${encodeURIComponent(lessonId)}`)
          : await post("/ai-tutor/lessons", {
            sessionId,
            questionId: searchParams.get("questionId"),
            language: "vi",
          });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Không thể tạo bài luyện.");
        if (active) {
          setLesson(normalizeLesson(data.lesson));
          setAnswerSubmitted(false);
          setAnswerCorrect(null);
          setReward(null);
          setStepFeedback(null);
          setSelected("");
        }
      } catch (error) {
        if (active) setFeedback(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    start();
    return () => {
      active = false;
    };
  }, [sessionId, searchParams]);

  useEffect(() => {
    if (!lesson?.lessonId || lesson.generationStatus !== "generating") return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await get(`/ai-tutor/lessons/${encodeURIComponent(lesson.lessonId)}`);
        const data = await response.json();
        if (active && response.ok && data.lesson) {
          const nextLesson = normalizeLesson(data.lesson);
          if (nextLesson.currentQuestionIndex !== lesson.currentQuestionIndex) {
            setSelected("");
            setAnswerSubmitted(false);
            setAnswerCorrect(null);
            setReward(null);
            setStepFeedback(null);
            setFeedback("");
          }
          setLesson(nextLesson);
        }
      } catch (error) {
        if (active) setFeedback(error.message);
      }
    };
    poll();
    const intervalId = setInterval(poll, 1500);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [lesson?.lessonId, lesson?.generationStatus, lesson?.currentQuestionIndex]);

  const choose = (optionId) => {
    if (!lesson || answerSubmitted || loading) return;
    setSelected(optionId);
    setFeedback("");
    setAnswerCorrect(null);
  };

  const submitAnswer = async () => {
    if (!lesson || !selected || answerSubmitted || loading) return;
    setLoading(true);
    try {
      const response = await post(
        `/ai-tutor/lessons/${lesson.lessonId}/answer`,
        { questionId: question.id, optionId: selected },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Không thể kiểm tra đáp án.");
      setLesson(normalizeLesson(data.lesson));
      setAnswerSubmitted(true);
      setAnswerCorrect(data.correct);
      setStepFeedback(null);
      setReward(data.correct ? {
        chestnuts: data.chestnutsAwarded || 0,
        badge: data.challengeBadges?.[0] || null,
      } : null);
      if (data.correct && data.totalChestnuts !== null && data.totalChestnuts !== undefined) {
        updateUserChestnuts?.(data.totalChestnuts, data.totalPoints);
      }
      if (data.correct) setConfettiBurst(value => value + 1);
      setFeedback(data.message);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitStep = async (placements, interactionAnswer) => {
    const previousQuestionIndex = lesson.currentQuestionIndex;
    setLoading(true);
    try {
      const response = await post(`/ai-tutor/lessons/${lesson.lessonId}/step`, {
        questionId: question.id,
        stepId: activeStep.id,
        placements,
        interactionAnswer,
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.lesson && data.correct === false && data.guidance) {
          setLesson(normalizeLesson(data.lesson));
          setStepFeedback({ correctAnswer: data.correctAnswer, guidance: data.guidance });
          setFeedback(data.error || "Câu trả lời chưa đúng.");
          return;
        }
        throw new Error(data.error || "Kiểm tra bước chưa thành công.");
      }
      setLesson(normalizeLesson(data.lesson));
      setStepFeedback(null);
      const movedToNextQuestion =
        data.lesson.currentQuestionIndex !== previousQuestionIndex;
      setSelected(movedToNextQuestion ? "" : selected);
      setAnswerSubmitted(!movedToNextQuestion);
      setAnswerCorrect(movedToNextQuestion ? null : answerCorrect);
      setReward(movedToNextQuestion ? null : data.challengeBadges?.[0] ? { ...(reward || { chestnuts: 0 }), badge: data.challengeBadges[0] } : reward);
      setFeedback(
        movedToNextQuestion
          ? ""
          : data.lesson.completed
            ? "Bạn đã hoàn thành mini-lesson!"
            : "Tốt lắm, tiếp tục nhé.",
      );
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (answerCorrect !== false) return undefined;
    const timeoutId = setTimeout(() => {
      activeStepRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    }, 60);
    return () => clearTimeout(timeoutId);
  }, [answerCorrect, lesson?.currentQuestionIndex, lesson?.currentStepIndex]);

  const goPrevious = async () => {
    if (!lesson || loading || lesson.currentQuestionIndex <= 0) return;
    setLoading(true);
    try {
      const response = await post(
        `/ai-tutor/lessons/${lesson.lessonId}/previous`,
        {},
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Không thể quay lại câu trước.");
      setLesson(normalizeLesson(data.lesson));
      setSelected("");
      setAnswerSubmitted(false);
      setAnswerCorrect(null);
      setReward(null);
      setStepFeedback(null);
      setFeedback("");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId)
    return (
      <main className="min-h-screen bg-orange-50 px-4 py-16 text-center">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm">
          <img
            src="/avatar.png"
            alt="ThinkBridge"
            className="mx-auto h-20 w-20 object-contain"
          />
          <h1 className="mt-4 text-2xl font-bold text-orange-950">
            AI Tutor học từ bài trong Chat
          </h1>
          <p className="mt-3 text-slate-600">
            Mở một bài toán trong Chat rồi bấm “Luyện bài này với AI Tutor” để
            bắt đầu.
          </p>
          <Link
            to="/chat"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-4 py-2 font-bold text-white"
          >
            Về Chat
          </Link>
        </div>
      </main>
    );
  if (loading && !lesson)
    return (
      <main className="min-h-screen bg-orange-50 px-5 py-16 text-center text-orange-800">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-lg font-bold">AI đang chuẩn bị bài luyện…</p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-600 transition-all" style={{ width: "0%" }} />
          </div>
          <p className="mt-3 text-sm font-semibold">Đã tạo 0/5 câu · 0%</p>
          <p className="mt-1 text-xs text-slate-500">Câu đầu tiên sẽ hiện ngay khi AI tạo xong.</p>
        </div>
      </main>
    );
  if (lesson && !question && lesson.generationStatus === "generating")
    return (
      <main className="min-h-screen bg-orange-50 p-10 text-center text-orange-800">
        AI đang tạo câu hỏi đầu tiên… Đã tạo {lesson.generatedQuestionCount || 0}/5 câu.
      </main>
    );
  if (!lesson || !question)
    return (
      <main className="min-h-screen bg-orange-50 p-10 text-center">
        <p className="text-red-700">{feedback || lesson?.generationError || "Chưa tải được câu hỏi luyện tập."}</p>
        <Link
          to={
            sessionId
              ? `/chat?sessionId=${encodeURIComponent(sessionId)}`
              : "/chat"
          }
          className="mt-4 inline-block text-orange-700 underline"
        >
          Về Chat
        </Link>
      </main>
    );

  return (
    <main className="aitutor-page flex min-h-screen flex-col overflow-y-auto bg-[#fff8ee] p-3 text-slate-900 sm:p-4 lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden">
      {confettiBurst > 0 && <Confetti burst={confettiBurst} />}
      <div className="mx-auto flex w-full max-w-[1500px] lg:min-h-0 lg:flex-1">
        <div className="grid w-full gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(420px,.8fr)]">
          <section className="aitutor-panel aitutor-main-panel flex flex-col rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-lg sm:p-6 lg:min-h-0 lg:overflow-y-auto">
            <div className="aitutor-toolbar mb-4 flex shrink-0 items-center gap-3 rounded-2xl bg-white">
              <Link
                to={`/chat?sessionId=${encodeURIComponent(sessionId)}`}
                aria-label="Về Chat"
                className="flex min-h-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#f97316] bg-[#f97316] px-3 text-sm font-bold text-white transition hover:border-[#ea580c] hover:bg-[#ea580c] sm:px-4"
              >
                ← Trở về cuộc trò chuyện
              </Link>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-600 transition-all"
                  style={{
                    width: `${Math.max(generationPercent, Math.max(8, ((lesson.currentQuestionIndex + (answerSubmitted ? 1 : 0)) / 5) * 100))}%`,
                  }}
                />
              </div>
              <span className="hidden rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 sm:inline">Câu {(lesson.currentQuestionIndex || 0) + 1}/5</span>
            </div>
            {lesson.generationStatus === "generating" && (
              <p className="mb-3 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800" aria-live="polite">
                Đã tạo {generatedQuestionCount}/5 câu · {generationPercent}%. Các câu tiếp theo đang được AI tạo nền.
              </p>
            )}
            {lesson.generationStatus === "failed" && lesson.generationError && (
              <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800" aria-live="polite">
                Một câu chưa tạo được: {lesson.generationError}
              </p>
            )}
            <p className="aitutor-prompt rounded-2xl bg-slate-50 p-4 text-sm text-slate-800">
              <strong>Đề bài từ Chat:</strong> <RichText text={lesson.sourceText} />
            </p>
            {lesson.sourceImage?.url && (
              <img
                src={lesson.sourceImage.url}
                alt="Đề bài học sinh gửi trong Chat"
                className="mt-4 max-h-72 w-full rounded-2xl border border-orange-100 object-contain"
              />
            )}
            {lesson.completed ? (
              <div className="py-12 text-center">
                <div className="text-5xl">🎉</div>
                <h2 className="mt-3 text-xl font-bold">Hoàn thành 5 câu hỏi</h2>
                <p className="mt-2 text-slate-600">
                  Bạn đã luyện xong các bước quan trọng của bài này.
                </p>
                <button
                  type="button"
                  onClick={regenerateLesson}
                  disabled={loading}
                  className="mt-6 rounded-2xl bg-green-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Tạo 5 câu khác
                </button>
                {lesson.currentQuestionIndex > 0 && (
                  <button
                    type="button"
                    onClick={goPrevious}
                    disabled={loading}
                    className="mt-6 rounded-xl border-2 border-violet-300 px-5 py-3 font-bold text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Câu trước
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-3xl">
                    📝
                  </div>
                  <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                    <RichText text={question.title} />
                  </h2>
                </div>
                <p className="aitutor-prompt mt-5 rounded-2xl bg-slate-50 p-5 text-lg leading-relaxed">
                  <RichText text={question.prompt} />
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const isCorrect = question.correctOptionId === option.id;
                    const isWrong =
                      answerSubmitted && selected === option.id && !isCorrect;
                    const isSelected = selected === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => choose(option.id)}
                        disabled={loading || answerSubmitted}
                        className={`min-h-16 rounded-2xl border-2 p-5 text-left text-lg font-bold transition ${answerSubmitted && isCorrect ? "border-emerald-700 bg-emerald-600 text-white shadow-md" : isWrong ? "border-rose-400 bg-rose-50 text-rose-800" : isSelected ? "border-violet-500 bg-violet-50 text-violet-900" : "border-slate-300 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-50"}`}
                      >
                          <span className={`mr-2 ${answerSubmitted && isCorrect ? "text-green-100" : "text-[#2f5fe5]"}`}>
                          {option.id}.
                        </span>
                        <RichText text={option.text} />
                      </button>
                    );
                  })}
                </div>
                {selected && !answerSubmitted && (
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={answerSubmitted || loading}
                    className="mt-5 w-full rounded-2xl bg-violet-600 px-5 py-4 text-lg font-bold text-white shadow-md transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loading ? "Đang kiểm tra…" : "Trả lời →"}
                  </button>
                )}
                {feedback && (
                  <p
                    aria-live="polite"
                    className={`mt-4 rounded-xl p-4 text-sm font-semibold ${answerCorrect === false && !feedback.includes("Tốt lắm") ? "border border-rose-200 bg-rose-50 text-rose-800" : feedback.includes("Chính xác") || feedback.includes("Tốt lắm") || feedback.includes("hoàn thành") ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}
                  >
                    <TypedText
                      text={feedback}
                      animate={answerCorrect === false && !feedback.includes("Tốt lắm")}
                    />
                  </p>
                )}
                {reward && (
                  <div className="animate-result-reveal mt-auto flex flex-col gap-4 rounded-3xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 p-5 shadow-md sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-bold text-white shadow-md">✓</span>
                      <div className="min-w-0">
                        <p className="text-base font-extrabold text-emerald-700">Tuyệt vời! Bạn đã trả lời đúng.</p>
                        {reward.chestnuts > 0 && (
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-extrabold">
                            <span className="sr-only">+{reward.chestnuts} hạt dẻ</span>
                            <span className="flex items-center gap-1 text-2xl text-amber-600">
                              <span className="reward-icon-pop" aria-hidden="true">🌰</span>
                              <span className="reward-number-rise">+{reward.chestnuts} <span className="text-base">hạt dẻ</span></span>
                            </span>
                          </div>
                        )}
                        <p className="mt-1 text-sm font-semibold text-slate-600">Cùng xem lời giải để hiểu sâu hơn nhé!</p>
                      </div>
                    </div>
                    {answerCorrect === true && !lesson.completed && (
                      <div className="flex shrink-0 gap-2 sm:ml-4">
                        <button
                          type="button"
                          onClick={goPrevious}
                          disabled={loading || lesson.currentQuestionIndex === 0}
                          className="rounded-xl border-2 border-violet-300 bg-white px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Câu trước
                        </button>
                        <button
                          type="button"
                          disabled={loading || lesson.waitingForQuestion}
                          onClick={() => submitStep({}, { skip: true })}
                          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600 disabled:opacity-50"
                        >
                          {lesson.waitingForQuestion ? "Đang tạo câu tiếp theo…" : "Câu tiếp theo  →"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={regenerateLesson}
                    disabled={loading}
                    className="rounded-2xl bg-green-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Tạo 5 câu khác
                  </button>
                  {!reward && (
                    <button
                      type="button"
                      onClick={goPrevious}
                      disabled={loading || lesson.currentQuestionIndex === 0}
                      className="rounded-xl border-2 border-violet-300 px-5 py-3 font-bold text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Câu trước
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
          <aside className="aitutor-panel aitutor-guide-panel flex flex-col rounded-3xl border-2 border-slate-200 bg-white shadow-xl lg:h-full lg:min-h-0 lg:overflow-hidden">
            <div className="aitutor-toolbar shrink-0 border-b-2 border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                  Hướng dẫn AI Tutor
                </h2>
                <span className="text-sm font-bold text-slate-400">
                  A− &nbsp; A &nbsp; A+
                </span>
              </div>
            </div>
            <div className="aitutor-guide-scroll scrollbar-thin space-y-4 p-4 sm:p-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              <div className="aitutor-help flex items-center gap-4 overflow-hidden rounded-3xl border-2 border-sky-200 bg-sky-50 p-4 text-sky-950 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold">Mẹo nhỏ</p>
                  <p className="mt-1 text-sm leading-6">
                    Đọc kỹ phần giải thích từng bước. Khi đã hiểu, bấm “Đã hiểu, sang bước tiếp” để mở bước tiếp theo.
                  </p>
                </div>
                <img
                  src="/studentAI.png"
                  alt="Mascot hướng dẫn học tập"
                  className="h-24 w-24 shrink-0 object-contain sm:h-28 sm:w-28"
                />
              </div>
              {question.tutorSteps.map((step, index) => {
                const unlocked = answerSubmitted && index <= lesson.currentStepIndex;
                const active = unlocked && index === lesson.currentStepIndex;
                return (
                  <article
                    key={step.id}
                    ref={active ? activeStepRef : undefined}
                    className={`aitutor-step min-h-24 rounded-3xl border-2 p-5 shadow-md ${active ? "border-orange-400 bg-white" : unlocked ? "border-emerald-200 bg-white" : "border-slate-200 bg-white text-violet-700"}`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold ${active ? "bg-orange-500 text-white" : unlocked ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                      >
                        {unlocked ? index + 1 : "🔒"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-950">Bước {index + 1}</h3>
                        {!unlocked && (
                          <div className="mt-2 h-2 rounded-full bg-slate-200" />
                        )}
                        {active && answerSubmitted && answerCorrect !== false && (
                            <div className="aitutor-panel mt-4 rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-md">
                            <StepGuidance step={step} animate={answerCorrect === true} />
                          </div>
                        )}
                        {active &&
                          answerSubmitted &&
                          !lesson.completed &&
                          (answerCorrect === false ? (
                            <SubjectStep
                              step={step}
                              onSubmit={submitStep}
                              loading={loading}
                              animateExplanation
                              stepFeedback={stepFeedback}
                            />
                          ) : answerCorrect === true ? null : (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => submitStep({}, { skip: true })}
                              className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
                            >
                              Đã hiểu, sang câu tiếp
                            </button>
                          ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {!answerSubmitted && (
              <div className="mx-7 mb-7 rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 text-base leading-7 text-amber-950 shadow-sm">
                <strong className="text-lg">💡 Gợi ý</strong>
                <p className="mt-1">
                  {selected
                    ? 'Em đã chọn đáp án. Bấm “Trả lời” để kiểm tra và mở hướng dẫn.'
                    : 'Hãy đọc kỹ đề và chọn đáp án em nghĩ là đúng nhất trước khi xem hướng dẫn.'}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
};

export default AITutorPage;
