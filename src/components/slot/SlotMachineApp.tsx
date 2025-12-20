import React, { useState, useEffect, useRef, useCallback } from 'react';

// -----------------------------------------------------------------------------
// Constants & Data
// -----------------------------------------------------------------------------

const HIRAGANA = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ARABIC = "ابتثجحخدذرزسشصضطظعغفقكلمنوهي";
const HANGUL = "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후";
const CHINESE = "的一是不了人我在有他这为之大来以个中上们国和地到说时要去子得也下过家道只年做什想";

const ALL_CHARS = (HIRAGANA + ALPHABET + ARABIC + HANGUL + CHINESE).split('');

const getRandomChar = () => ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];

// -----------------------------------------------------------------------------
// Audio Logic (Web Audio API)
// -----------------------------------------------------------------------------

const useSlotSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime + startTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }, []);

  const playNoise = useCallback((duration: number, startTime: number = 0) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime + startTime;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.start(now);
  }, []);

  const playStartSound = useCallback(() => {
    initAudio();
    const now = 0;
    playTone(1200, 'square', 0.1, now, 0.1);
    playTone(2400, 'sine', 0.4, now + 0.05, 0.2);

    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, [initAudio, playTone]);

  const playStopSound = useCallback(() => {
    playTone(80, 'square', 0.15, 0, 0.3);
    playTone(40, 'sine', 0.2, 0, 0.5);
    playTone(2000, 'sawtooth', 0.05, 0, 0.05);
  }, [playTone]);

  const playWinSound = useCallback(() => {
    const root = 523.25; // C5
    const intervals = [1, 1.25, 1.5, 2];
    const speed = 0.08;

    for (let i = 0; i < 16; i++) {
      const noteIndex = i % 4;
      const freq = root * intervals[noteIndex] * (i > 7 ? 2 : 1);
      playTone(freq, 'square', 0.1, i * speed, 0.1);
      playTone(freq * 1.01, 'sawtooth', 0.1, i * speed, 0.1);
      if (i % 2 === 0) playNoise(0.1, i * speed + 0.04);
    }

    setTimeout(() => {
      playTone(1046.50 * 2, 'square', 1.0, 0, 0.3);
      playTone(523.25, 'triangle', 1.0, 0, 0.5);
    }, 16 * speed * 1000);
  }, [playTone, playNoise]);

  return { playStartSound, playStopSound, playWinSound };
};

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

interface ReelProps {
  char: string;
  isSpinning: boolean;
}

const Reel: React.FC<ReelProps> = ({ char, isSpinning }) => {
  return (
    <div className="w-20 h-24 md:w-24 md:h-32 bg-white border-2 border-black flex items-center justify-center text-4xl md:text-5xl font-bold text-black overflow-hidden relative">
      <span 
        className={`block ${isSpinning ? 'animate-slot-spin blur-[2px] opacity-50' : ''}`}
        style={isSpinning ? { animation: 'slot-spin 0.1s linear infinite' } : {}}
      >
        {char}
      </span>
      <style>{`
        @keyframes slot-spin {
          0% { transform: translateY(-150%); }
          100% { transform: translateY(150%); }
        }
      `}</style>
    </div>
  );
};

interface SlotMachineAppProps {
  onChange?: (name: string) => void;
}

export const SlotMachineApp: React.FC<SlotMachineAppProps> = ({ onChange }) => {
  const [reels, setReels] = useState<string[]>(['-', '-', '-']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [reelSpinningStatus, setReelSpinningStatus] = useState<boolean[]>([false, false, false]);
  const [message, setMessage] = useState<string>('');
  
  const { playStartSound, playStopSound, playWinSound } = useSlotSound();
  
  // Refs for intervals to clear them properly
  const intervalRefs = useRef<(number | null)[]>([null, null, null]);

  const startSlot = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setMessage('');
    playStartSound();

    // Start spinning all reels
    setReelSpinningStatus([true, true, true]);

    // Set up intervals for visual updates
    reels.forEach((_, index) => {
      if (intervalRefs.current[index]) clearInterval(intervalRefs.current[index] as number);
      
      intervalRefs.current[index] = window.setInterval(() => {
        setReels(prev => {
          const newReels = [...prev];
          newReels[index] = getRandomChar();
          return newReels;
        });
      }, 50);

      // Schedule stops
      const stopTime = 1000 + (index * 600);
      setTimeout(() => {
        stopReel(index);
      }, stopTime);
    });
  };

  const stopReel = (index: number) => {
    // Clear interval
    if (intervalRefs.current[index]) {
      clearInterval(intervalRefs.current[index] as number);
      intervalRefs.current[index] = null;
    }

    // Set final char and update status
    setReels(prev => {
      const newReels = [...prev];
      newReels[index] = getRandomChar();
      
      // Check result if this is the last reel
      if (index === 2) {
        checkResult(newReels);
        setIsSpinning(false);
      }
      return newReels;
    });

    setReelSpinningStatus(prev => {
      const newStatus = [...prev];
      newStatus[index] = false;
      return newStatus;
    });
    
    playStopSound();
  };

  const checkResult = (finalReels: string[]) => {
    const finalName = finalReels.join('');
    if (onChange) {
      onChange(finalName);
    }

    const [r1, r2, r3] = finalReels;
    if (r1 === r2 && r2 === r3) {
      setMessage("JACKPOT!!");
      playWinSound();
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      setMessage("ALMOST!");
    } else {
      setMessage("");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intervalRefs.current.forEach(interval => {
        if (interval) clearInterval(interval as number);
      });
    };
  }, []);

  return (
    <div className="bg-white flex flex-col items-center justify-center p-4 text-black font-mono">
      <div className="bg-white p-8 max-w-md w-full text-center border-4 border-black">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-widest">
          名前を入力
        </h1>

        {/* Slot Reels */}
        <div className="flex justify-center gap-2 mb-8 p-4 border-2 border-black bg-gray-100" data-testid="slot-reels">
          <Reel char={reels[0]} isSpinning={reelSpinningStatus[0]} />
          <Reel char={reels[1]} isSpinning={reelSpinningStatus[1]} />
          <Reel char={reels[2]} isSpinning={reelSpinningStatus[2]} />
        </div>

        {/* Message */}
        <div className="h-8 text-lg font-bold text-black mb-6">
          {message}
        </div>

        {/* Start Button */}
        <button
          onClick={startSlot}
          disabled={isSpinning}
          className={`
            w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 text-xl 
            border-2 border-transparent transition 
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isSpinning ? "RUNNING..." : (message ? "RETRY" : "START")}
        </button>
      </div>
    </div>
  );
};

export default SlotMachineApp;

