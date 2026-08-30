import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { post } from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";

const TypedText = ({ text, animate = false }) => {
  const [visibleText, setVisibleText] = useState(animate ? "" : text);

  useEffect(() => {
    if (!animate) {
      setVisibleText(text);
      return undefined;
    }
    setVisibleText("");
    let index = 0;
    const intervalId = setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));
      if (index >= text.length) clearInterval(intervalId);
    }, 20);
    return () => clearInterval(intervalId);
  }, [animate, text]);

  return <span>{visibleText}</span>;
};

const Confetti = ({ burst }) => (
  <div
    key={burst}
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
  >
    {Array.from({ length: 36 }, (_, index) => (
      <span
        key={index}
        className="absolute top-0 h-3 w-2 animate-confetti-fall opacity-0"
        style={{
          left: `${(index * 29) % 100}%`,
          animationDelay: `${(index % 8) * 0.08}s`,
          animationDuration: `${2 + (index % 4) * 0.25}s`,
          backgroundColor: ["#f97316", "#facc15", "#10b981", "#60a5fa", "#f472b6"][index % 5],
          transform: `rotate(${(index * 37) % 360}deg)`,
        }}
      />
    ))}
  </div>
);

const Visual = ({ visual, allowVisual = true }) => {
  if (!allowVisual) return null;
  if (visual?.kind === "image" && visual?.url)
    return (
      <img
        src={visual.url}
        alt={visual.alt || "Minh họa do AI tạo"}
        className="w-full rounded-2xl border border-orange-200 object-contain"
      />
    );
  if (visual?.url)
    return (
      <img
        src={visual.url}
        alt={visual.alt || "Minh họa do AI tạo"}
        className="w-full rounded-2xl border border-orange-200 object-contain"
      />
    );
  if (visual?.kind === "svg" && visual?.spec?.svg)
    return (
      <div
        role="img"
        aria-label={visual.spec.label || "Minh họa do Gemini tạo"}
        className="flex w-full items-center justify-center overflow-hidden rounded-2xl border border-orange-200 bg-orange-50 p-4 [&>svg]:max-h-60 [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: visual.spec.svg }}
      />
    );
  return null;
};

const StepGuidance = ({ step, animate = false }) => (
  <>
    <p className="text-base leading-7 text-slate-800 sm:text-lg">
      <TypedText text={step.explanation} animate={animate} />
    </p>
    {(step.analysis || step.easierExample?.prompt) && (
      <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 text-sm leading-6 text-slate-700">
        <summary className="cursor-pointer px-3 py-2 font-bold text-slate-800">Gợi ý thêm</summary>
        <div className="space-y-2 border-t border-slate-200 px-3 py-3">
          {step.analysis && <p><strong>Phân tích:</strong> <TypedText text={step.analysis} animate={animate} /></p>}
          {step.easierExample?.prompt && <p><strong>Ví dụ dễ hơn:</strong> <TypedText text={step.easierExample.prompt} animate={animate} /></p>}
          {step.easierExample?.hint && <p className="text-slate-600">Gợi ý: {step.easierExample.hint}</p>}
        </div>
      </details>
    )}
  </>
);

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
              {item.text}
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
              <span>{left.text}</span>
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
              {choice.text}
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
            {token.label}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {step.blanks.map((blank, index) => (
          <div key={blank.id} className="flex items-center gap-2">
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
              {placements[blank.id] ? labelFor(placements[blank.id]) : ""}
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

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    const start = async () => {
      try {
        const response = await post("/ai-tutor/lessons", {
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
      setReward(data.correct && data.pointsAwarded > 0 ? {
        points: data.pointsAwarded,
        chestnuts: data.chestnutsAwarded || 0,
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
      setReward(movedToNextQuestion ? null : reward);
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
      <main className="min-h-screen bg-orange-50 p-10 text-center text-orange-800">
        AI đang chuẩn bị bài luyện từ cuộc trò chuyện của bạn…
      </main>
    );
  if (!lesson || !question)
    return (
      <main className="min-h-screen bg-orange-50 p-10 text-center">
        <p className="text-red-700">{feedback || "Chưa tải được câu hỏi luyện tập."}</p>
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
    <main className="min-h-screen bg-[#fff8ee] px-4 py-8 text-slate-900 sm:px-10">
      {confettiBurst > 0 && <Confetti burst={confettiBurst} />}
      <div className="mx-auto max-w-[1480px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-orange-700">
              ThinkBridge · AI Tutor
            </p>
            <h1 className="text-2xl font-bold text-orange-950">
              Luyện bài từ cuộc trò chuyện
            </h1>
            <p className="mt-1 text-sm text-orange-700">
              Câu {(lesson.currentQuestionIndex || 0) + 1}/5 · Hoàn thành liên
              tục 5 câu hỏi
            </p>
          </div>
          <Link
            to={`/chat?sessionId=${encodeURIComponent(sessionId)}`}
            className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-800"
          >
            ← Về Chat
          </Link>
        </header>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
            style={{
              width: `${Math.max(8, ((lesson.currentQuestionIndex + (answerSubmitted ? 1 : 0)) / 5) * 100)}%`,
            }}
          />
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_640px]">
          <section className="min-h-[760px] rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-lg sm:p-9">
            <p className="rounded-xl bg-orange-50 p-3 text-sm text-orange-900">
              <strong>Đề bài từ Chat:</strong> {lesson.sourceText}
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
                {lesson.currentQuestionIndex > 0 && (
                  <button
                    type="button"
                    onClick={goPrevious}
                    disabled={loading}
                    className="mt-6 rounded-xl border-2 border-orange-500 px-5 py-3 font-bold text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Câu trước
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
                    📝
                  </div>
                  <h2 className="text-3xl font-bold text-slate-950">
                    {question.title}
                  </h2>
                </div>
                <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-lg leading-relaxed">
                  {question.prompt}
                </p>
                <div className="mt-5">
                  <Visual
                    visual={question.visual}
                    allowVisual={question.interactionType !== "math_tokens"}
                  />
                </div>
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
                        className={`min-h-16 rounded-xl border-2 p-5 text-left text-lg font-bold transition ${answerSubmitted && isCorrect ? "border-green-700 bg-green-600 text-white" : isWrong ? "border-red-400 bg-red-50 text-red-800" : isSelected ? "border-[#2f5fe5] bg-[#eef4ff] text-[#173b9d]" : "border-[#c5d3f5] bg-[#ffffff] text-[#173b9d] hover:border-[#2f5fe5] hover:bg-[#f5f8ff]"}`}
                      >
                          <span className={`mr-2 ${answerSubmitted && isCorrect ? "text-green-100" : "text-[#2f5fe5]"}`}>
                          {option.id}.
                        </span>
                        {option.text}
                      </button>
                    );
                  })}
                </div>
                {selected && !answerSubmitted && (
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={answerSubmitted || loading}
                    className="mt-5 w-full rounded-xl bg-[#2f5fe5] px-5 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-[#234ac1] disabled:cursor-not-allowed disabled:bg-slate-300"
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
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-xl text-white">✓</span>
                    <div>
                      <p className="font-bold">Tuyệt vời! Em đã trả lời đúng.</p>
                      <p className="font-bold text-orange-600">+{reward.points} điểm · +{reward.chestnuts} hạt dẻ</p>
                    </div>
                  </div>
                )}
                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={goPrevious}
                    disabled={loading || lesson.currentQuestionIndex === 0}
                    className="rounded-xl border-2 border-orange-500 px-5 py-3 font-bold text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Câu trước
                  </button>
                </div>
              </>
            )}
          </section>
          <aside className="flex min-h-[760px] flex-col overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl lg:h-[calc(100vh-4rem)] lg:max-h-[1100px] lg:min-h-0">
            <div className="shrink-0 border-b-2 border-slate-200 bg-white p-7 sm:p-9">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-3xl font-bold text-slate-950">
                  Hướng dẫn AI Tutor
                </h2>
                <span className="text-sm font-bold text-slate-400">
                  A− &nbsp; A &nbsp; A+
                </span>
              </div>
            </div>
            <div className="scrollbar-thin min-h-0 flex-1 space-y-5 overflow-y-auto p-7">
              <div className="flex items-center gap-4 overflow-hidden rounded-3xl border-2 border-sky-200 bg-sky-50 p-5 text-sky-950 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold">Mẹo nhỏ</p>
                  <p className="mt-1 text-sm leading-6">
                    Điền vào các ô trống. Đáp án có thể là số, biểu thức hoặc một từ.
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
                    className={`min-h-24 rounded-3xl border-2 p-6 shadow-md ${active ? "border-emerald-400 bg-white" : unlocked ? "border-emerald-200 bg-white" : "border-slate-200 bg-white text-violet-700"}`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold ${active ? "bg-emerald-600 text-white" : unlocked ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                      >
                        {unlocked ? index + 1 : "🔒"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-950">Bước {index + 1}</h3>
                        {!unlocked && (
                          <div className="mt-2 h-2 rounded-full bg-slate-200" />
                        )}
                        {active && answerSubmitted && answerCorrect !== false && (
                          <div className="mt-5 rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-md sm:p-7">
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
                          ) : answerCorrect === true ? (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => submitStep({}, { skip: true })}
                              className="mt-3 w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                            >
                              Câu tiếp theo →
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => submitStep({}, { skip: true })}
                              className="mt-3 w-full rounded-xl bg-orange-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
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
