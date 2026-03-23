import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GameHomePage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = React.useRef(null);

    useEffect(() => {
        setIsVisible(true);

        audioRef.current = new Audio('/survey/bgm.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented:", error);
                setIsMuted(true);
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

    return (
        <div className="relative min-h-[100dvh] w-screen bg-[#1a0e08] flex flex-col items-center justify-end overflow-hidden pb-8">
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

            {/* Main Full-Screen Layout Components */}
            <div
                className={`absolute bottom-0 inset-x-0 mx-auto w-[min(100vw,calc(100vh*2088/2048))] h-[min(100vh,calc(100vw*2048/2088))] bg-contain bg-bottom bg-no-repeat z-[2] transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
                style={{ backgroundImage: `url("${'/survey/background.png'}")` }}
            >
                {/* Oil Lamp - Top Left */}
                <div className="absolute top-[5%] left-[0%] w-[35%] min-w-[180px] max-w-[350px] z-10 flex flex-col items-center">
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[160%] aspect-square rounded-full bg-[radial-gradient(circle,rgba(255,180,50,0.25)_0%,rgba(255,140,20,0.1)_40%,transparent_70%)] animate-rpg-lamp-flicker z-[1] pointer-events-none" />
                    <img src="/survey/oil-lamp.gif" alt="Oil Lamp" className="w-full h-auto brightness-110 saturate-[1.2] relative z-[2]" />
                </div>

                {/* Oil Lamp - Top Right */}
                <div className="absolute top-[5%] right-[0%] w-[35%] min-w-[180px] max-w-[350px] z-10 flex flex-col items-center">
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[160%] aspect-square rounded-full bg-[radial-gradient(circle,rgba(255,180,50,0.25)_0%,rgba(255,140,20,0.1)_40%,transparent_70%)] animate-rpg-lamp-flicker z-[1] pointer-events-none" />
                    <img src="/survey/oil-lamp.gif" alt="Oil Lamp" className="scale-x-[-1] w-full h-auto brightness-110 saturate-[1.2] relative z-[2]" />
                </div>

                {/* Seal Indie Character (behind table) */}
                <div className="absolute z-[3] flex justify-center w-full bottom-[15%] sm:bottom-[18%] md:bottom-[20%] lg:bottom-[23%] xl:bottom-[26%]">
                    <img src="/survey/seal-indie.png" alt="Seal Shopkeeper" className="w-[45%] sm:w-[38%] md:w-[32%] lg:w-[28%] max-w-[450px] h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] origin-[50%_90%] animate-rpg-seal-idle" />
                </div>

                {/* Table (in front of seal) */}
                <div className="absolute z-[4] flex flex-col items-center w-full bottom-[8%]">
                    <img src="/survey/table.png" alt="Wooden Table" className="w-[55%] max-w-[700px] h-auto drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative z-[2]" />

                    {/* Content on/above the table */}
                    <div className="absolute top-[15%] lg:top-[-20px] left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-1.5 w-[80%] max-w-[380px]">
                        {/* Title Scroll */}
                        <div className="relative w-full text-center bg-gradient-to-b from-[#d4a55e] via-[#b8863a] to-[#8a6228] border-2 border-[#6b4a1e] rounded-lg py-2.5 px-5 shadow-[inset_0_1px_2px_rgba(255,215,120,0.3),0_4px_15px_rgba(0,0,0,0.5)] before:content-['✦'] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-1.5 before:text-[#f5d68a] before:text-[14px] before:drop-shadow-[0_0_6px_rgba(245,214,138,0.5)] after:content-['✦'] after:absolute after:top-1/2 after:-translate-y-1/2 after:right-1.5 after:text-[#f5d68a] after:text-[14px] after:drop-shadow-[0_0_6px_rgba(245,214,138,0.5)]">
                            <h1 className="font-['Be_Vietnam_Pro',serif] text-[0.85rem] sm:text-[1.1rem] lg:text-[1.3rem] font-extrabold text-[#1a0e08] drop-shadow-[0_1px_1px_rgba(255,215,120,0.3)] leading-[1.3] tracking-[0.02em]">
                                BẠN ĐANG DÙNG AI<br />HAY AI ĐANG DÙNG BẠN?
                            </h1>
                        </div>

                        <p className="text-[0.7rem] sm:text-[0.8rem] lg:text-[0.9rem] text-[#f5d68a] text-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] font-medium">
                            ⏱️ Bài test vui 3 phút – Không đúng sai – Chỉ để hiểu bản thân!
                        </p>
                    </div>
                </div>

            </div> {/* End rpg-scene */}

            {/* Content Container for UI (Bottom Panel) */}
            <div className={`mt-4 w-full flex justify-center z-10 relative transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] delay-200 px-4 ${isVisible ? '!opacity-100 !translate-y-0' : 'opacity-0 translate-y-[30px]'}`}>
                {/* Bottom Panel - RPG style info panel */}
                <div className="relative z-[6] w-full max-w-xl mt-[-20px] bg-gradient-to-b from-[#5a3a1e] via-[#3d2215] to-[#2d1810] border-2 border-[#6b4a1e] rounded-xl shadow-[inset_0_2px_4px_rgba(255,200,100,0.1),0_-4px_20px_rgba(0,0,0,0.5),0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#8b6914] before:to-transparent">
                    <div className="p-5 sm:p-6">
                        {/* CTA Button */}
                        <div className="flex flex-col items-center gap-4 py-4 sm:py-6">
                            <Link to="/game/quiz" className="relative inline-flex flex-col sm:flex-row items-center justify-center overflow-hidden rounded-xl font-extrabold text-[1.15rem] sm:text-[1.35rem] transition-all duration-300 px-8 py-5 sm:py-6 bg-gradient-to-br from-[#8b6914] via-[#b8863a] to-[#d4a55e] text-[#1a0e08] border-[4px] border-[#f5d68a] shadow-[0_6px_20px_rgba(139,105,20,0.6),inset_0_2px_4px_rgba(255,215,120,0.6)] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] w-[90%] sm:w-full max-w-[420px] hover:-translate-y-[4px] hover:shadow-[0_10px_35px_rgba(139,105,20,0.8),inset_0_2px_4px_rgba(255,215,120,0.6)] hover:from-[#a07a18] hover:via-[#d4a55e] hover:to-[#e8c88a] hover:brightness-110 group tracking-wide uppercase">
                                <div className="absolute top-0 -left-full w-[150%] h-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent animate-rpg-btn-shine z-[0] skew-x-[-20deg]" />
                                <span className="relative z-[1] flex items-center justify-center gap-3">
                                    <span className="text-3xl filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">🚀</span> Bắt Đầu Làm Bài Test
                                </span>
                            </Link>
                            <p className="text-[#8b6914] text-[0.85rem] text-center font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                                Hoàn toàn miễn phí • Không cần đăng ký
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back button */}
            <Link to="/" className="fixed top-3 left-3 z-20 flex items-center gap-1 py-1.5 px-3 bg-[rgba(45,24,16,0.8)] border border-[#6b4a1e] rounded-lg text-[#d4a55e] text-[0.8rem] font-medium transition-all duration-300 backdrop-blur-[4px] hover:bg-[rgba(90,58,30,0.9)] hover:border-[#d4a55e] hover:text-[#f5d68a]">
                <span>←</span>
                <span className="hidden sm:block">Trang chủ</span>
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

export default GameHomePage;
