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
    const [isMuted, setIsMuted] = useState(false);
    const questionRef = useRef(null);
    const audioRef = useRef(null);

    // --- Audio setup ---
    useEffect(() => {
        // Assume user will place bgm.mp3 here
        audioRef.current = new Audio('/survey/bgm.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;

        // Try autoplaying right away
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented:", error);
                setIsMuted(true); // UI reflects blocked state
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, []);

    const toggleMute = () => {
        if (!audioRef.current) return;
        if (isMuted) {
            audioRef.current.play().catch(e => console.error("Play failed", e));
        } else {
            audioRef.current.pause();
        }
        setIsMuted(!isMuted);
    };

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
        <div className="relative min-h-[100dvh] w-screen bg-[#1a0e08] flex flex-col items-center justify-end overflow-hidden pb-3 sm:pb-8 font-['Be_Vietnam_Pro',serif]">
            {/* Dark vignette overlay */}
            <div className="fixed inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-[1]" />

            {/* Floating particles/dust */}
            <div className="fixed inset-0 w-full h-full pointer-events-none z-[2]">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[3px] h-[3px] bg-[#f5d68a] rounded-full shadow-[0_0_4px_#f5d68a] animate-rpg-dust-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 6}s`,
                            animationDuration: `${4 + Math.random() * 4}s`,
                            opacity: 0.3 + Math.random() * 0.4,
                        }}
                    />
                ))}
            </div>

            {/* RPG Background containing lamps, seal, and table */}
            {/* Desktop uses fixed aspect ratio calculated by calc(100vh*...), Mobile scales the background container to 100vw and anchors to TOP */}
            <div
                className="absolute top-[2vh] sm:top-0 w-full h-[calc(100vw*2048/2088)] left-1/2 -translate-x-1/2 sm:top-auto sm:bottom-0 sm:w-[min(100vw,calc(100vh*2088/2048))] sm:h-[min(100vh,calc(100vw*2048/2088))] sm:left-auto sm:translate-x-0 sm:inset-x-0 sm:mx-auto bg-contain bg-top sm:bg-bottom bg-no-repeat z-[2] transition-all duration-1000"
                style={{ backgroundImage: `url("${'/survey/background.png'}")` }}
            >
                {/* Oil Lamp - Top Left */}
                <div className="absolute top-[5%] left-[-8%] sm:left-[0%] w-[58%] sm:w-[35%] min-w-[160px] sm:min-w-[180px] max-w-[350px] z-10 flex flex-col items-center">
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[160%] aspect-square rounded-full bg-[radial-gradient(circle,rgba(255,180,50,0.25)_0%,rgba(255,140,20,0.1)_40%,transparent_70%)] animate-rpg-lamp-flicker z-[1] pointer-events-none" />
                    <img src="/survey/oil-lamp.gif" alt="Oil Lamp" className="w-full h-auto brightness-110 saturate-[1.2] relative z-[2]" />
                </div>

                {/* Oil Lamp - Top Right */}
                <div className="absolute top-[5%] right-[-8%] sm:right-[0%] w-[58%] sm:w-[35%] min-w-[160px] sm:min-w-[180px] max-w-[350px] z-10 flex flex-col items-center">
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[160%] aspect-square rounded-full bg-[radial-gradient(circle,rgba(255,180,50,0.25)_0%,rgba(255,140,20,0.1)_40%,transparent_70%)] animate-rpg-lamp-flicker z-[1] pointer-events-none" />
                    <img src="/survey/oil-lamp.gif" alt="Oil Lamp" className="scale-x-[-1] w-full h-auto brightness-110 saturate-[1.2] relative z-[2]" />
                </div>

                {/* Squirrel Shopkeeper (behind table) */}
                <div className="absolute z-[3] flex justify-center w-full bottom-[15%] sm:bottom-[18%] md:bottom-[20%] lg:bottom-[23%] xl:bottom-[26%]">
                    <span role="img" aria-label="Squirrel Shopkeeper" className="text-[6rem] sm:text-[8rem] lg:text-[10rem] drop-shadow-[0_8px_25px_rgba(0,0,0,0.5)] origin-[50%_90%] animate-rpg-seal-idle select-none">🐿️</span>
                </div>

                {/* Table (in front of seal) */}
                <div className="absolute z-[4] flex flex-col items-center w-full bottom-[8%]">
                    <img src="/survey/table.png" alt="Wooden Table" className="w-[50%] sm:w-[55%] max-w-[700px] h-auto drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative z-[2]" />
                </div>
            </div>

            {/* Content Container for UI */}
            <div className={`w-full flex justify-center z-10 relative px-2 sm:px-4 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${phase === 'loading' ? 'translate-y-[80px]' : 'translate-y-0'}`}>

                {/* ====== LOADING PHASE ====== */}
                {phase === 'loading' && (
                    <div className="flex flex-col items-center gap-6 animate-quiz-fade-in relative z-[6] mt-[-50px]">
                        <div className="relative z-[6] w-full max-w-xl mt-[-30px] sm:mt-[-50px]">
                            <div className="w-full bg-gradient-to-b from-[#5a3a1e] via-[#3d2215] to-[#2d1810] border-2 border-[#6b4a1e] rounded-xl p-8 flex flex-col items-center shadow-[inset_0_2px_4px_rgba(255,200,100,0.1),0_10px_30px_rgba(0,0,0,0.7)]">
                                <h2 className="text-[#f5d68a] text-xl font-bold mb-4 animate-pulse">Đang chuẩn bị...</h2>
                                <div className="w-full bg-[#1a0e08] h-4 rounded-full overflow-hidden border border-[#4a2e1b] p-0.5">
                                    <div className="h-full bg-gradient-to-r from-[#8b6914] via-[#d4a55e] to-[#f5d68a] rounded-full w-1/3 animate-[rpg-bar-loading_1s_ease-in-out_infinite_alternate] shadow-[0_0_10px_rgba(212,165,94,0.5)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* ====== COUNTDOWN PHASE ====== */}
                {phase === 'countdown' && (
                    <div className="relative z-[6] w-full max-w-md mt-[-80px] flex justify-center items-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-[#8b6914] via-[#5a3a1e] to-[#2d1810] rounded-full border-4 border-[#d4a55e] flex items-center justify-center shadow-[0_0_40px_rgba(212,165,94,0.4),inset_0_4px_10px_rgba(0,0,0,0.6)] animate-[rpg-pop-in_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
                            <span className="text-[5rem] font-black text-[#f5d68a] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-none animate-[rpg-pulse-scale_1s_ease-in-out_infinite]">
                                {countdownNumber}
                            </span>
                        </div>
                    </div>
                )}

                {/* ====== PLAYING PHASE ====== */}
                {phase === 'playing' && currentQuestion && (
                    <div className="relative z-[6] w-full max-w-2xl mt-[-20px] sm:mt-[-50px] flex flex-col items-center">
                        {/* Main card - Wooden Border theme */}
                        <div className="w-full bg-gradient-to-b from-[#5a3a1e] via-[#3d2215] to-[#2d1810] border-[3px] border-[#8b6914] rounded-2xl shadow-[inset_0_2px_4px_rgba(255,200,100,0.1),0_-4px_20px_rgba(0,0,0,0.7),0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden relative">
                            {/* Inner wooden highlight */}
                            <div className="absolute inset-0 border border-[#ab8534]/50 rounded-[14px] pointer-events-none" />

                            {/* Top bar with progress */}
                            <div className="relative bg-gradient-to-r from-[#2d1810] via-[#4d2f1a] to-[#2d1810] p-4 sm:p-5 border-b-[3px] border-[#1a0e08]">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 text-[#e8c88a] font-bold text-xs sm:text-sm mb-3 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] uppercase tracking-wide">
                                        <span>{currentQuestion.levelEmoji} Level {currentQuestion.level}</span>
                                        <span className="text-[#8b6914]">✦</span>
                                        <span className="text-[#f5d68a]">Câu {currentIndex + 1}/{questions.length}</span>
                                    </div>

                                    {/* Progress bar - RPG stylized */}
                                    <div className="relative w-full h-3.5 bg-[#1a0e08] rounded-full overflow-hidden border-2 border-[#3d2215] shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)]">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ease-out`}
                                            style={{
                                                width: `${progress}%`,
                                                background: 'linear-gradient(90deg, #8b6914, #d4a55e, #f5d68a)',
                                                boxShadow: '0 0 12px rgba(245,214,138,0.6)',
                                            }}
                                        />
                                        {/* Sparkle at tip */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/80 blur-[2px] transition-all duration-500 z-10"
                                            style={{ left: `calc(${Math.max(0, progress)}% - 8px)` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Question area */}
                            <div
                                ref={questionRef}
                                className={`p-4 sm:p-8 ${slideDirection}`}
                                key={`q-${currentQuestion.id}`}
                            >
                                {/* Question text Box */}
                                <div className="mb-4 sm:mb-8 bg-[rgba(26,14,8,0.5)] border-2 border-[#6b4a1e] p-4 sm:p-6 rounded-xl shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b6914] to-transparent opacity-50" />
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b6914] to-transparent opacity-50" />
                                    <h2 className="text-[1.1rem] sm:text-[1.35rem] md:text-[1.5rem] font-extrabold text-[#f5d68a] leading-[1.5] drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] text-center tracking-[0.01em]">
                                        {currentQuestion.question}
                                    </h2>
                                </div>

                                {/* Answer options */}
                                <div className="space-y-2.5 sm:space-y-4">
                                    {currentQuestion.answers.map((answer, idx) => {
                                        const isSelected = selectedAnswer === answer.id;

                                        return (
                                            <button
                                                key={answer.id}
                                                onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                                                disabled={selectedAnswer !== null}
                                                className={`animate-answer-option-in opacity-0 w-full text-left px-3 py-2.5 sm:py-5 sm:px-5 rounded-xl border-[2.5px] transition-all duration-300 group relative overflow-hidden flex items-center gap-3 sm:gap-5
                                                    ${isSelected
                                                        ? 'border-[#f5d68a] bg-gradient-to-r from-[#8b6914] to-[#ab8534] shadow-[0_0_20px_rgba(245,214,138,0.5)] scale-[1.03] z-10'
                                                        : selectedAnswer
                                                            ? 'border-[#3d2215] bg-[rgba(26,14,8,0.7)] opacity-40 cursor-not-allowed text-[#8b6914]'
                                                            : 'bg-gradient-to-b from-[rgba(107,74,30,0.6)] to-[rgba(61,35,23,0.8)] border-[#6b4a1e] hover:border-[#d4a55e] hover:from-[rgba(107,74,30,0.8)] hover:to-[rgba(90,58,30,0.9)] hover:-translate-y-[3px] shadow-[0_6px_15px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_25px_rgba(139,105,20,0.4)]'
                                                    }`}
                                                style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'forwards' }}
                                            >
                                                {/* Hover shine */}
                                                {!selectedAnswer && (
                                                    <div className="absolute top-0 -left-full w-[150%] h-full bg-gradient-to-r from-transparent via-[rgba(245,214,138,0.15)] to-transparent group-hover:left-[100%] transition-all duration-[800ms] skew-x-[-20deg] z-[0]" />
                                                )}

                                                {/* Choice Letter Block */}
                                                <div className={`relative z-[1] flex-shrink-0 w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-lg bg-gradient-to-br from-[#2d1810] to-[#1a0e08] border-2 flex items-center justify-center font-black text-lg sm:text-2xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] transition-all duration-300 ${isSelected ? 'text-[#1a0e08] bg-[#f5d68a] border-[#f5d68a] shadow-[0_0_15px_rgba(245,214,138,0.8)]' : 'text-[#d4a55e] border-[#8b6914] group-hover:text-[#f5d68a] group-hover:border-[#d4a55e]'}`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>

                                                <span className={`relative z-[1] text-[0.95rem] sm:text-[1.15rem] leading-[1.4] font-semibold transition-colors duration-200 ${isSelected ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' : selectedAnswer ? 'text-[#a99066] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]' : 'text-[#e8c88a] group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`}>
                                                    {answer.text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|\uD83E[\uDE00-\uDEFF])/g, '').trim()}
                                                </span>

                                                {/* Check mark for selected */}
                                                {isSelected && (
                                                    <div className="ml-auto flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1a0e08] border-2 border-[#f5d68a] flex items-center justify-center animate-check-pop shadow-[0_0_10px_rgba(245,214,138,0.5)]">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5d68a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ====== SUBMITTING PHASE ====== */}
                {phase === 'submitting' && (
                    <div className="flex flex-col items-center gap-6 animate-quiz-fade-in relative z-[6] pt-10">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-[#8b6914]/30 border-t-[#f5d68a] rounded-full animate-spin shadow-[0_0_20px_rgba(245,214,138,0.3)]" />
                            <div className="absolute inset-0 flex items-center justify-center text-4xl drop-shadow-[0_0_10px_rgba(245,214,138,0.5)]">🔮</div>
                        </div>
                        <div className="w-full text-center bg-gradient-to-b from-[rgba(61,35,23,0.8)] to-[rgba(26,14,8,0.9)] px-8 py-5 rounded-2xl border-2 border-[#6b4a1e] shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                            <p className="text-[#f5d68a] font-extrabold text-2xl mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">Đang phân tích...</p>
                            <p className="text-[#d4a55e] text-[0.95rem] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Cuộn giấy phép thuật đang ghi lại kết quả của bạn 📜</p>
                        </div>
                    </div>
                )}

                {/* ====== RESULT PHASE ====== */}
                {phase === 'result' && result && (
                    <div className="animate-result-reveal relative z-[6] w-full max-w-2xl mt-[-30px]">
                        {/* Golden Confetti */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
                            {[...Array(40)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-3 opacity-0 animate-confetti-fall"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: '-20px',
                                        backgroundColor: ['#f5d68a', '#d4a55e', '#8b6914', '#e8c88a'][Math.floor(Math.random() * 4)],
                                        animationDelay: `${Math.random() * 2}s`,
                                        animationDuration: `${2 + Math.random() * 3}s`,
                                        transform: `rotate(${Math.random() * 360}deg)`,
                                        boxShadow: '0 0 5px rgba(245,214,138,0.5)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Grand RPG Board */}
                        <div className="w-full bg-gradient-to-b from-[#5a3a1e] via-[#3d2215] to-[#2d1810] border-[3px] border-[#d4a55e] rounded-2xl shadow-[inset_0_2px_4px_rgba(255,200,100,0.2),0_-4px_25px_rgba(139,105,20,0.3),0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
                            {/* Inner wooden highlight */}
                            <div className="absolute inset-0 border border-[#ab8534]/60 rounded-[14px] pointer-events-none" />

                            {/* Result header */}
                            <div className={`relative p-5 sm:p-10 text-center overflow-hidden border-b-[3px] border-[#1a0e08]`} style={{ background: 'linear-gradient(to bottom, rgba(139,105,20,0.25), transparent)' }}>
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f5d68a] to-transparent opacity-50" />
                                <div className="relative z-10 w-full flex flex-col items-center">
                                    <div className="text-5xl sm:text-8xl mb-3 animate-emoji-result-bounce drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] relative inline-block">
                                        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20" />
                                        {result.result.emoji}
                                    </div>
                                    <h2 className="text-[1.2rem] sm:text-[2.2rem] font-extrabold text-[#f5d68a] mb-1 sm:mb-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] tracking-widest uppercase text-center leading-tight">{result.result.title}</h2>
                                    <div className="text-[1rem] sm:text-[1.2rem] font-bold text-[#d4a55e] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-4 sm:mb-6 text-center">{result.result.color}</div>

                                    <div className="flex items-center justify-center">
                                        <div className={`inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full border border-[#f5d68a] bg-gradient-to-b from-[rgba(45,24,16,0.8)] to-[#1a0e08] shadow-[0_0_15px_rgba(245,214,138,0.3),inset_0_0_10px_rgba(139,105,20,0.5)]`}>
                                            <span className="text-xl">🌟</span>
                                            <span className="text-[#f5d68a] font-black text-[1rem] sm:text-lg py-1 tracking-wide">{result.totalScore}/{result.maxScore} ĐIỂM</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Result body */}
                            <div className="p-4 sm:p-10">
                                {/* Description */}
                                <div className="bg-[rgba(26,14,8,0.5)] border-2 border-[#6b4a1e] rounded-xl p-4 sm:p-8 mb-4 sm:mb-6 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] relative">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#8b6914] to-transparent opacity-60" />
                                    <p className="text-[#e8c88a] text-[0.85rem] sm:text-[1.15rem] leading-[1.5] sm:leading-[1.6] font-medium text-center drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
                                        {result.result.description}
                                    </p>
                                </div>

                                {/* Advice */}
                                <div className={`bg-gradient-to-br from-[#2d1810] to-[#1a0e08] border-2 border-[#8b6914] rounded-xl p-4 sm:p-7 mb-5 sm:mb-8 shadow-[0_6px_15px_rgba(0,0,0,0.7)]`}>
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                                        <span className="text-3xl sm:text-5xl flex-shrink-0 drop-shadow-[0_2px_4px_rgba(245,214,138,0.4)]">💡</span>
                                        <div>
                                            <h3 className="font-extrabold text-[1.1rem] text-[#f5d68a] mb-1 sm:mb-2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] uppercase tracking-wide">Lời khuyên dành cho bạn</h3>
                                            <p className="text-[#d4a55e] text-[0.85rem] sm:text-[1.1rem] leading-[1.5] sm:leading-[1.6] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                                {result.result.advice}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-5">
                                    <button
                                        onClick={handleRestart}
                                        className="flex-1 relative inline-flex flex-col sm:flex-row items-center justify-center overflow-hidden rounded-xl font-bold text-[0.95rem] sm:text-[1.05rem] transition-all duration-300 px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-br from-[#8b6914] via-[#b8863a] to-[#d4a55e] text-[#1a0e08] border-[3px] border-[#f5d68a] shadow-[0_6px_20px_rgba(139,105,20,0.5),inset_0_2px_4px_rgba(255,215,120,0.6)] hover:-translate-y-[3px] hover:shadow-[0_8px_30px_rgba(139,105,20,0.7),inset_0_2px_4px_rgba(255,215,120,0.6)] hover:brightness-110 group tracking-wide uppercase"
                                    >
                                        <div className="absolute top-0 -left-full w-[150%] h-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent group-hover:left-[100%] transition-all duration-700 skew-x-[-20deg] z-[0]" />
                                        <span className="relative z-[1] flex items-center justify-center gap-2">
                                            <span className="text-[1.1rem] sm:text-xl">🔄</span> Thử lại lần nữa
                                        </span>
                                    </button>
                                    <Link
                                        to="/game"
                                        className="flex-1 relative inline-flex flex-col sm:flex-row items-center justify-center overflow-hidden rounded-xl font-bold text-[0.95rem] sm:text-[1.05rem] transition-all duration-300 px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-b from-[rgba(107,74,30,0.8)] to-[rgba(61,35,23,0.9)] text-[#e8c88a] border-[3px] border-[#6b4a1e] shadow-[0_6px_15px_rgba(0,0,0,0.6)] hover:border-[#d4a55e] hover:from-[rgba(139,105,20,0.7)] hover:to-[rgba(90,58,30,0.8)] hover:text-[#f5d68a] hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.7)] tracking-wide uppercase"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="text-[1.1rem] sm:text-xl relative bottom-[1px]">🏠</span> Về Quầy Shop
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Back button */}
            <Link to="/game" className="fixed top-3 left-3 sm:top-5 sm:left-5 z-[20] flex items-center gap-1.5 py-1.5 px-3 bg-[rgba(45,24,16,0.85)] border-2 border-[#6b4a1e] rounded-xl text-[#d4a55e] text-[0.85rem] font-extrabold transition-all duration-300 backdrop-blur-md hover:bg-[rgba(90,58,30,0.95)] hover:border-[#d4a55e] hover:text-[#f5d68a] shadow-[0_4px_10px_rgba(0,0,0,0.6)] uppercase tracking-wider group hover:-translate-y-[1px]">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span className="hidden sm:block">Thoát</span>
            </Link>

            {/* Audio Toggle Button */}
            <button
                onClick={toggleMute}
                className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[20] flex items-center justify-center w-10 h-10 bg-[rgba(45,24,16,0.85)] border-2 border-[#6b4a1e] rounded-xl text-[#d4a55e] text-lg font-extrabold transition-all duration-300 backdrop-blur-md hover:bg-[rgba(90,58,30,0.95)] hover:border-[#d4a55e] hover:text-[#f5d68a] shadow-[0_4px_10px_rgba(0,0,0,0.6)] group hover:-translate-y-[1px]"
                title={isMuted ? "Bật nhạc" : "Tắt nhạc"}
            >
                {isMuted ? '🔇' : '🔊'}
            </button>
        </div>
    );
};

export default QuizGamePage;
