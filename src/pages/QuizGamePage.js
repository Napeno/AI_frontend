import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { get, post } from '../utils/apiClient';

// --- Confetti particle component ---
const ConfettiParticle = ({ delay, left }) => (
    <div
        className="absolute w-2 h-2 rounded-full opacity-0 animate-confetti-fall"
        style={{
            left: `${left}%`,
            top: '-10px',
            backgroundColor: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
            animationDelay: `${delay}s`,
        }}
    />
);

const QuizGamePage = () => {
    // --- State ---
    const [phase, setPhase] = useState('loading'); // loading | countdown | playing | submitting | result
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [slideDirection, setSlideDirection] = useState(''); // animate-slide-in-right, animate-slide-out-left, etc.
    const [countdownNumber, setCountdownNumber] = useState(3);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [progressAnimating, setProgressAnimating] = useState(false);
    const questionRef = useRef(null);

    // --- Fetch questions from backend ---
    const fetchQuestions = useCallback(async () => {
        try {
            const response = await get('/quiz/questions');
            const data = await response.json();
            if (data.success) {
                setQuestions(data.data.questions);
                setPhase('countdown');
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    // --- Countdown timer ---
    useEffect(() => {
        if (phase !== 'countdown') return;
        if (countdownNumber === 0) {
            setPhase('playing');
            setSlideDirection('animate-slide-in-right');
            return;
        }
        const timer = setTimeout(() => setCountdownNumber(prev => prev - 1), 800);
        return () => clearTimeout(timer);
    }, [phase, countdownNumber]);



    // --- Handle answer selection ---
    const handleSelectAnswer = (questionId, answerId) => {
        if (selectedAnswer) return; // prevent double-click
        setSelectedAnswer(answerId);
        setAnswers(prev => ({ ...prev, [questionId]: answerId }));

        // Animate then proceed
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                // Slide out current, slide in next
                setSlideDirection('animate-slide-out-left');
                setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                    setSelectedAnswer(null);
                    setSlideDirection('animate-slide-in-right');
                    setProgressAnimating(true);
                    setTimeout(() => setProgressAnimating(false), 400);
                }, 350);
            } else {
                // Last question -> submit
                submitQuiz({ ...answers, [questionId]: answerId });
            }
        }, 500);
    };

    // --- Submit quiz to backend ---
    const submitQuiz = async (finalAnswers) => {
        setPhase('submitting');
        try {
            const response = await post('/quiz/submit', { answers: finalAnswers });
            const data = await response.json();
            if (data.success) {
                setResult(data.data);
                setTimeout(() => setPhase('result'), 800);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };

    // --- Restart quiz ---
    const handleRestart = () => {
        setPhase('loading');
        setCurrentIndex(0);
        setAnswers({});
        setResult(null);
        setSelectedAnswer(null);
        setCountdownNumber(3);
        fetchQuestions();
    };

    // --- Current question data ---
    const currentQuestion = questions[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

    // --- RENDER ---
    return (
        <div className="min-h-screen w-full bg-ocean-gradient flex items-center justify-center px-3 sm:px-6 py-4 sm:py-8 overflow-hidden">
            <div className="relative max-w-2xl w-full">

                {/* ====== FLOATING DECORATIONS ====== */}
                <div className="absolute -top-8 -left-8 w-20 h-20 bg-yellow-300/20 rounded-full animate-float blur-md hidden sm:block" />
                <div className="absolute -top-4 -right-10 w-24 h-24 bg-pink-300/15 rounded-full animate-float blur-md hidden sm:block" style={{ animationDelay: '1s' }} />
                <div className="absolute -bottom-6 left-10 w-16 h-16 bg-cyan-300/25 rounded-full animate-float blur-md hidden sm:block" style={{ animationDelay: '2s' }} />

                {/* ====== LOADING PHASE ====== */}
                {phase === 'loading' && (
                    <div className="flex flex-col items-center gap-4 animate-quiz-fade-in">
                        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <p className="text-white font-medium text-lg">Đang tải câu hỏi...</p>
                    </div>
                )}

                {/* ====== COUNTDOWN PHASE ====== */}
                {phase === 'countdown' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div
                                key={countdownNumber}
                                className="text-9xl sm:text-[10rem] font-black text-white animate-quiz-countdown-pop"
                                style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}
                            >
                                {countdownNumber === 0 ? '🚀' : countdownNumber}
                            </div>
                            {/* Ripple rings */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-40 h-40 rounded-full border-4 border-white/20 animate-quiz-ripple" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-40 h-40 rounded-full border-4 border-white/10 animate-quiz-ripple" style={{ animationDelay: '0.3s' }} />
                            </div>
                        </div>
                        <p className="text-white/80 text-lg font-medium animate-quiz-fade-in" style={{ animationDelay: '0.2s' }}>
                            Chuẩn bị sẵn sàng...
                        </p>
                    </div>
                )}

                {/* ====== PLAYING PHASE ====== */}
                {phase === 'playing' && currentQuestion && (
                    <div className="relative">
                        {/* Main card */}
                        <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                            {/* Top bar with progress */}
                            <div className="relative bg-gradient-to-r from-seablue-600 via-ocean-medium to-seablue-400 p-4 sm:p-5">
                                {/* Back button */}
                                <Link to="/game" className="absolute top-3 left-3 sm:top-4 sm:left-4 text-white/70 hover:text-white transition-colors text-sm flex items-center gap-1 z-10">
                                    <span>←</span>
                                    <span className="hidden sm:inline">Về trang game</span>
                                </Link>

                                <div className="text-center pt-2">
                                    <div className="flex items-center justify-center gap-2 text-white/90 text-xs sm:text-sm font-medium mb-3">
                                        <span>{currentQuestion.levelEmoji} Level {currentQuestion.level}</span>
                                        <span className="text-white/50">•</span>
                                        <span>Câu {currentIndex + 1}/{questions.length}</span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="relative w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ease-out ${progressAnimating ? 'animate-progress-pulse' : ''
                                                }`}
                                            style={{
                                                width: `${progress}%`,
                                                background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)',
                                            }}
                                        />
                                        {/* Sparkle at progress tip */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/60 blur-sm transition-all duration-500"
                                            style={{ left: `${Math.max(0, progress - 2)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Question area */}
                            <div
                                ref={questionRef}
                                className={`p-5 sm:p-8 ${slideDirection}`}
                                key={`q-${currentQuestion.id}`}
                            >
                                {/* Question text */}
                                <div className="mb-6 sm:mb-8">
                                    <div className="inline-flex items-center gap-2 bg-seablue-50 rounded-full px-3 py-1 mb-3">
                                        <span className="text-seablue-600 font-bold text-sm">Q{currentIndex + 1}</span>
                                    </div>
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                                        {currentQuestion.question}
                                    </h2>
                                </div>

                                {/* Answer options */}
                                <div className="space-y-3">
                                    {currentQuestion.answers.map((answer, idx) => {
                                        const isSelected = selectedAnswer === answer.id;
                                        const letterColors = [
                                            'from-blue-500 to-cyan-500',
                                            'from-purple-500 to-pink-500',
                                            'from-amber-500 to-orange-500',
                                            'from-emerald-500 to-teal-500',
                                        ];

                                        return (
                                            <button
                                                key={answer.id}
                                                onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                                                disabled={selectedAnswer !== null}
                                                className={`animate-answer-option-in opacity-0 w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden
                          ${isSelected
                                                        ? 'border-seablue-400 bg-seablue-50 shadow-lg scale-[1.02] ring-2 ring-seablue-300/50'
                                                        : selectedAnswer
                                                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                                            : 'border-gray-200 hover:border-seablue-300 hover:bg-seablue-50/50 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
                                                    }`}
                                                style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'forwards' }}
                                            >
                                                {/* Hover shimmer */}
                                                {!selectedAnswer && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                                )}

                                                <div className="relative flex items-center gap-3 sm:gap-4">
                                                    {/* Answer letter badge */}
                                                    <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${letterColors[idx % 4]} flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md transition-transform duration-300 ${isSelected ? 'scale-110 shadow-lg' : 'group-hover:scale-105'
                                                        }`}>
                                                        {answer.id}
                                                    </div>

                                                    {/* Answer text */}
                                                    <span className={`text-sm sm:text-base font-medium transition-colors duration-200 ${isSelected ? 'text-seablue-700' : 'text-gray-700 group-hover:text-gray-900'
                                                        }`}>
                                                        {answer.text}
                                                    </span>

                                                    {/* Check mark for selected */}
                                                    {isSelected && (
                                                        <div className="ml-auto flex-shrink-0 w-7 h-7 rounded-full bg-seablue-500 flex items-center justify-center animate-check-pop">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bottom decorative bar */}
                            <div className="h-1.5 bg-gradient-to-r from-seablue-400 via-purple-400 to-pink-400" />
                        </div>
                    </div>
                )}

                {/* ====== SUBMITTING PHASE ====== */}
                {phase === 'submitting' && (
                    <div className="flex flex-col items-center gap-6 animate-quiz-fade-in">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold text-xl mb-2">Đang phân tích kết quả...</p>
                            <p className="text-white/70 text-sm">AI đang "đọc vị" cách học của bạn 🔍</p>
                        </div>
                    </div>
                )}

                {/* ====== RESULT PHASE ====== */}
                {phase === 'result' && result && (
                    <div className="animate-result-reveal">
                        {/* Confetti */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
                            {[...Array(30)].map((_, i) => (
                                <ConfettiParticle key={i} delay={Math.random() * 1.5} left={Math.random() * 100} />
                            ))}
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                            {/* Result header */}
                            <div className={`relative p-6 sm:p-10 text-center bg-gradient-to-br ${result.result.bgGradient} overflow-hidden`}>
                                {/* Animated circles */}
                                <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full animate-float" />
                                <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />

                                <div className="relative z-10">
                                    <div className="text-6xl sm:text-7xl mb-4 animate-emoji-result-bounce">{result.result.emoji}</div>
                                    <div className="text-4xl mb-2">{result.result.color}</div>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">{result.result.title}</h2>
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                        <span className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r ${result.result.gradient} text-white font-bold text-sm shadow-lg`}>
                                            <span>⭐</span>
                                            <span>{result.totalScore}/{result.maxScore} điểm</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Result body */}
                            <div className="p-5 sm:p-8">
                                {/* Description */}
                                <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-5 border border-gray-100">
                                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-medium">
                                        {result.result.description}
                                    </p>
                                </div>

                                {/* Advice */}
                                <div className={`bg-gradient-to-br ${result.result.bgGradient} rounded-2xl p-5 sm:p-6 mb-6 border border-gray-100`}>
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl flex-shrink-0">💡</span>
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-1">Lời khuyên cho bạn</h3>
                                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                                {result.result.advice}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                                        <div className="text-2xl mb-1">📝</div>
                                        <div className="text-xs text-gray-500">Đã trả lời</div>
                                        <div className="font-bold text-blue-600">{result.answeredCount}/{result.totalQuestions}</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                                        <div className="text-2xl mb-1">🎯</div>
                                        <div className="text-xs text-gray-500">Tổng điểm</div>
                                        <div className="font-bold text-purple-600">{result.totalScore}</div>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                                        <div className="text-2xl mb-1">📊</div>
                                        <div className="text-xs text-gray-500">Phân loại</div>
                                        <div className="font-bold text-emerald-600">{result.result.color}</div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleRestart}
                                        className="flex-1 group relative px-6 py-4 rounded-xl bg-seablue-gradient text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            <span>🔄</span> Làm lại bài test
                                        </span>
                                    </button>
                                    <Link
                                        to="/game"
                                        className="flex-1 px-6 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base text-center transition-all duration-300 border border-gray-200"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <span>🏠</span> Về trang game
                                        </span>
                                    </Link>
                                </div>
                            </div>

                            {/* Bottom bar */}
                            <div className={`h-2 bg-gradient-to-r ${result.result.gradient}`} />
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-center text-sm text-white/50">
                            <p>🎓 SealEdu Game Zone – Học mà chơi, chơi mà học!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizGamePage;
