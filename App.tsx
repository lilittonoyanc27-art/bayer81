/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  Lightbulb,
  MessageSquare,
  Award,
  ArrowRight,
  Eye,
  Crown,
  Heart,
  ChevronDown,
  ChevronUp,
  X,
  Languages,
  Check,
  User2
} from 'lucide-react';
import {
  round1Questions,
  round2Questions,
  dialogues,
  Question,
  Dialogue
} from './questions';

// Web Audio API Sound Synth Helper
function playSound(type: 'correct' | 'wrong' | 'victory', isMuted: boolean) {
  if (isMuted) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (type === 'correct') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === 'wrong') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(85, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'victory') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major chord
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.08 + 0.6);
        osc.start(audioCtx.currentTime + index * 0.08);
        osc.stop(audioCtx.currentTime + index * 0.08 + 0.6);
      });
    }
  } catch (e) {
    console.warn('AudioContext not allowed or failed:', e);
  }
}

interface Player {
  name: string;
  score: number;
  maxStreak: number;
  currentStreak: number;
  avatar: string; // avatar key
  color: string; // Tailwind border/bg class
  accentColor: string; // Tailwind text color
  answers: {
    questionId: number;
    sentence: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    translation: string;
    roundName: string;
  }[];
}

const AVATARS = [
  { key: 'torero', emoji: '🐂', name: 'Ցլամարտիկ (Torero)' },
  { key: 'flamenco', emoji: '💃', name: 'Ֆլամենկո (Flamenco)' },
  { key: 'quixote', emoji: '🛡️', name: 'Դոն Կիխոտ (Quixote)' },
  { key: 'conquistador', emoji: '🧭', name: 'Նվաճող (Conquistador)' },
  { key: 'sol', emoji: '☀️', name: 'Արև (Sol de España)' },
  { key: 'guitarra', emoji: '🎸', name: 'Իսպանական Կիթառ' }
];

export default function App() {
  // Game Setup States
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Players State
  const [gor, setGor] = useState<Player>({
    name: 'Գոռ',
    score: 0,
    maxStreak: 0,
    currentStreak: 0,
    avatar: 'torero',
    color: 'from-orange-500 to-red-600',
    accentColor: 'text-orange-600',
    answers: []
  });

  const [gayane, setGayane] = useState<Player>({
    name: 'Գայանե',
    score: 0,
    maxStreak: 0,
    currentStreak: 0,
    avatar: 'flamenco',
    color: 'from-amber-400 to-yellow-500',
    accentColor: 'text-amber-600',
    answers: []
  });

  const [currentPlayer, setCurrentPlayer] = useState<'gor' | 'gayane'>('gor');
  const [gameMode, setGameMode] = useState<'round1' | 'round2' | 'dialogues' | 'mega'>('round1');

  // Game Play States
  const [currentRoundType, setCurrentRoundType] = useState<'round1' | 'round2' | 'dialogues'>('round1');
  const [roundStepIndex, setRoundStepIndex] = useState(0); // overall index in the active round's item list
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Dialogue Game Mode Specifics
  const [dialogueIndex, setDialogueIndex] = useState(0); // 0, 1, 2
  const [dialoguePartIndex, setDialoguePartIndex] = useState(0); // 0, 1, 2, 3 for active sentence

  // Questions pools based on selection
  const [round1Pool, setRound1Pool] = useState<Question[]>([]);
  const [round2Pool, setRound2Pool] = useState<Question[]>([]);
  const [dialoguesPool, setDialoguesPool] = useState<Dialogue[]>([]);

  // Score popups for visual feedback (+10 pts)
  const [floatingScore, setFloatingScore] = useState<{ x: number; y: number; text: string; id: number } | null>(null);

  // Canvas ref for confetti particles
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<any[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // Initialize pools
  useEffect(() => {
    setRound1Pool(round1Questions);
    setRound2Pool(round2Questions);
    setDialoguesPool(dialogues);
  }, []);

  // Canvas particle loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const updateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(updateParticles);
    };

    updateParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameStarted]);

  // Spawn confetti particles
  const triggerConfetti = (x: number, y: number, isBig = false) => {
    const count = isBig ? 120 : 35;
    const colors = ['#e05a36', '#f5b041', '#2c3e50', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    const pArray = particlesRef.current;

    for (let i = 0; i < count; i++) {
      const speedMultiplier = isBig ? 12 : 6;
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 0.8 + 0.2) * speedMultiplier;

      pArray.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2 - 100,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - (isBig ? 4 : 2),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * (isBig ? 8 : 6) + 4,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
        gravity: 0.15
      });
    }
  };

  // Generate a celebratory screen burst
  const triggerScreenCelebration = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    triggerConfetti(width * 0.2, height * 0.4, true);
    triggerConfetti(width * 0.5, height * 0.3, true);
    triggerConfetti(width * 0.8, height * 0.4, true);
  };

  // Start the game
  const startGame = (mode: typeof gameMode) => {
    setGameMode(mode);
    setGameStarted(true);
    setGameFinished(false);
    setShowTranslation(false);
    setSelectedOption(null);
    setIsAnswered(false);

    // Reset Player Stats
    const resetPlayer = (p: Player) => ({
      ...p,
      score: 0,
      maxStreak: 0,
      currentStreak: 0,
      answers: []
    });
    setGor(prev => resetPlayer(prev));
    setGayane(prev => resetPlayer(prev));

    // Determine initial round type
    if (mode === 'mega') {
      setCurrentRoundType('round1');
    } else {
      setCurrentRoundType(mode as any);
    }

    setRoundStepIndex(0);
    setDialogueIndex(0);
    setDialoguePartIndex(0);
    setCurrentPlayer('gor');
  };

  // Turn tracking and active question fetching
  const getActiveQuestion = (): {
    sentence: string;
    options: string[];
    correctIndex: number;
    translation: string;
    explanation: string;
    rule?: string;
  } => {
    if (currentRoundType === 'round1') {
      const q = round1Pool[roundStepIndex] || round1Pool[0];
      if (!q) {
        return {
          sentence: '',
          options: [],
          correctIndex: 0,
          translation: '',
          explanation: '',
          rule: ''
        };
      }
      return {
        sentence: q.sentence,
        options: q.options,
        correctIndex: q.correctIndex,
        translation: q.translation,
        explanation: q.explanation,
        rule: q.indicativoSubjuntivoRule
      };
    } else if (currentRoundType === 'round2') {
      const q = round2Pool[roundStepIndex] || round2Pool[0];
      if (!q) {
        return {
          sentence: '',
          options: [],
          correctIndex: 0,
          translation: '',
          explanation: '',
          rule: ''
        };
      }
      return {
        sentence: q.sentence,
        options: q.options,
        correctIndex: q.correctIndex,
        translation: q.translation,
        explanation: q.explanation,
        rule: q.indicativoSubjuntivoRule
      };
    } else {
      // Dialogues mode
      const activeDialogue = dialoguesPool[dialogueIndex] || dialoguesPool[0];
      const activePart = activeDialogue?.parts[dialoguePartIndex] || activeDialogue?.parts[0];
      return {
        sentence: activePart ? `(${activePart.speaker}) ${activePart.sentenceWithBlank}` : '',
        options: activePart?.options || [],
        correctIndex: activePart?.correctIndex || 0,
        translation: activePart?.translation || '',
        explanation: activePart?.explanation || '',
        rule: 'Dialogue context'
      };
    }
  };

  const activeQuestion = getActiveQuestion();

  // Total questions in the selected game mode
  const getTotalQuestionsCount = () => {
    if (gameMode === 'round1') return 20; // 10 Gor, 10 Gayane
    if (gameMode === 'round2') return 20; // 10 Gor, 10 Gayane
    if (gameMode === 'dialogues') return 12; // 3 dialogues x 4 parts = 12 total, 6 Gor, 6 Gayane
    return 52; // Mega tournament total (20 + 20 + 12)
  };

  const getCompletedQuestionsCount = () => {
    if (gameMode === 'mega') {
      let count = 0;
      if (currentRoundType === 'round2') count += 20;
      if (currentRoundType === 'dialogues') count += 40;
      
      if (currentRoundType === 'dialogues') {
        count += dialogueIndex * 4 + dialoguePartIndex;
      } else {
        count += roundStepIndex;
      }
      return count;
    } else {
      if (currentRoundType === 'dialogues') {
        return dialogueIndex * 4 + dialoguePartIndex;
      }
      return roundStepIndex;
    }
  };

  // Handle choice selection
  const handleAnswerClick = (optionIdx: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (isAnswered) return;

    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const isCorrect = optionIdx === activeQuestion.correctIndex;
    const pointsAwarded = isCorrect ? 10 : 0;

    // Trigger sound
    if (isCorrect) {
      playSound('correct', isMuted);
    } else {
      playSound('wrong', isMuted);
    }

    // Save answer and update stats for current player
    const updatePlayerStats = (p: Player) => {
      const newStreak = isCorrect ? p.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(p.maxStreak, newStreak);
      return {
        ...p,
        score: p.score + pointsAwarded,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        answers: [
          ...p.answers,
          {
            questionId: currentRoundType === 'dialogues' ? (dialogueIndex * 4 + dialoguePartIndex) : roundStepIndex,
            sentence: activeQuestion.sentence,
            correct: isCorrect,
            userAnswer: activeQuestion.options[optionIdx],
            correctAnswer: activeQuestion.options[activeQuestion.correctIndex],
            translation: activeQuestion.translation,
            roundName: currentRoundType === 'round1' ? 'Subjuntivo' : currentRoundType === 'round2' ? 'Subjuntivo vs Indicativo' : `Երկխոսություն ${dialogueIndex + 1}`
          }
        ]
      };
    };

    if (currentPlayer === 'gor') {
      setGor(prev => updatePlayerStats(prev));
    } else {
      setGayane(prev => updatePlayerStats(prev));
    }
  };

  // Advance to next question or round
  const handleNextQuestion = () => {
    setShowTranslation(false);
    setSelectedOption(null);
    setIsAnswered(false);

    // Swap active player for next turn (they take turns sequentially)
    setCurrentPlayer(prev => (prev === 'gor' ? 'gayane' : 'gor'));

    const isMega = gameMode === 'mega';
    const totalR1 = round1Pool.length;
    const totalR2 = round2Pool.length;

    if (currentRoundType === 'round1') {
      if (roundStepIndex + 1 < totalR1) {
        setRoundStepIndex(prev => prev + 1);
      } else {
        // End of Round 1
        if (isMega) {
          // Move to Round 2
          setCurrentRoundType('round2');
          setRoundStepIndex(0);
        } else {
          // Finished the game
          finishGame();
        }
      }
    } else if (currentRoundType === 'round2') {
      if (roundStepIndex + 1 < totalR2) {
        setRoundStepIndex(prev => prev + 1);
      } else {
        // End of Round 2
        if (isMega) {
          // Move to Dialogues
          setCurrentRoundType('dialogues');
          setDialogueIndex(0);
          setDialoguePartIndex(0);
        } else {
          finishGame();
        }
      }
    } else {
      // Dialogues mode
      if (dialoguePartIndex + 1 < 4) {
        setDialoguePartIndex(prev => prev + 1);
      } else if (dialogueIndex + 1 < 3) {
        setDialogueIndex(prev => prev + 1);
        setDialoguePartIndex(0);
      } else {
        // Completed dialogues (end of game)
        finishGame();
      }
    }
  };

  const finishGame = () => {
    setGameFinished(true);
    playSound('victory', isMuted);
    triggerScreenCelebration();
  };

  const getWinner = () => {
    if (gor.score > gayane.score) return 'gor';
    if (gayane.score > gor.score) return 'gayane';
    return 'tie';
  };

  const winner = getWinner();

  return (
    <div className="relative min-h-screen font-sans flex flex-col justify-between selection:bg-brand-sky selection:text-slate-950 pb-12 bg-brand-dark text-slate-100">
      {/* Absolute Confetti Canvas Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* FLOATING SCORE POPUP */}
      <AnimatePresence>
        {floatingScore && (
          <motion.div
            initial={{ opacity: 0, y: floatingScore.y, scale: 0.5 }}
            animate={{ opacity: 1, y: floatingScore.y - 120, scale: 1.3 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed pointer-events-none font-black text-brand-sky text-4xl z-50 drop-shadow-[0_4px_12px_rgba(56,189,248,0.5)] font-mono italic"
            style={{ left: floatingScore.x }}
          >
            +10 ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b-2 border-slate-800 px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setGameStarted(false)}>
          <div className="flex space-x-1.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-2xl">🇪🇸</span>
            <span className="text-2xl">🇦🇲</span>
          </div>
          <div>
            <h1 className="font-extrabold text-xl lg:text-2xl tracking-tight flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-brand-sky uppercase font-black italic">Իսպաներենի Մրցույթ</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-brand-sky text-slate-950 uppercase tracking-widest font-mono">
                Gor & Gayane
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">Subjuntivo & Indicativo Battle Arena</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 text-brand-sky transition-all hover:scale-105 active:scale-95"
            title={isMuted ? "Միացնել ձայնը" : "Անջատել ձայնը"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-slate-500" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowCheatSheet(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-sky hover:bg-sky-400 border-2 border-slate-950 text-slate-950 text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.15)]"
          >
            <BookOpen className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Քերականություն</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl w-full mx-auto px-4 mt-6 flex-grow flex flex-col justify-center">
        
        {/* VIEW 1: START SCREEN */}
        {!gameStarted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-3xl p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(56,189,248,0.15)] border-2 border-slate-800"
          >
            {/* Intro */}
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-md bg-brand-sky/10 text-brand-sky text-xs font-black uppercase tracking-widest border border-brand-sky/20 mb-4 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Սուբխունկտիվի Մարտահրավեր</span>
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 tracking-tight leading-none uppercase italic">
                Գոռ և Գայանե
              </h2>
              <p className="text-slate-400 mt-4 text-sm md:text-base leading-relaxed font-sans">
                Բարի գալուստ իսպաներենի քերականական մրցույթ։ Յուրաքանչյուր խաղացող ստանում է հավասարաչափ հարցեր։ 
                Կտտացրեք նախադասությունների վրա՝ հայերեն թարգմանությունը բացելու համար: Ո՞վ ավելի շատ միավոր կհավաքի:
              </p>
            </div>

            {/* Players Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Gor Customizer */}
              <div className="bg-slate-950/65 rounded-2xl p-6 border-2 border-slate-800 flex flex-col items-center transition-all hover:border-brand-sky/40">
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl shadow-lg border-2 border-slate-800 mb-4">
                  {AVATARS.find(a => a.key === gor.avatar)?.emoji || '🧑‍💻'}
                </div>
                <h3 className="font-black text-xl text-white mb-1 uppercase tracking-tight italic">Գոռ (Gor)</h3>
                <span className="text-xs font-mono text-slate-400 mb-4 uppercase">Խաղացող 1</span>
                
                <div className="w-full">
                  <label className="text-[10px] font-black text-slate-500 block mb-2.5 text-center uppercase tracking-widest font-mono">Ընտրել Կերպարը</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVATARS.map(av => (
                      <button
                        key={av.key}
                        onClick={() => setGor(prev => ({ ...prev, avatar: av.key }))}
                        className={`p-2.5 text-2xl rounded-xl border-2 transition-all cursor-pointer ${
                          gor.avatar === av.key
                            ? 'border-brand-sky bg-brand-sky/10 scale-105 shadow-md shadow-brand-sky/10'
                            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                        title={av.name}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gayane Customizer */}
              <div className="bg-slate-950/65 rounded-2xl p-6 border-2 border-slate-800 flex flex-col items-center transition-all hover:border-brand-sky/40">
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-4xl shadow-lg border-2 border-slate-800 mb-4">
                  {AVATARS.find(a => a.key === gayane.avatar)?.emoji || '👩‍💻'}
                </div>
                <h3 className="font-black text-xl text-white mb-1 uppercase tracking-tight italic">Գայանե (Gayane)</h3>
                <span className="text-xs font-mono text-slate-400 mb-4 uppercase">Խաղացող 2</span>

                <div className="w-full">
                  <label className="text-[10px] font-black text-slate-500 block mb-2.5 text-center uppercase tracking-widest font-mono">Ընտրել Կերպարը</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVATARS.map(av => (
                      <button
                        key={av.key}
                        onClick={() => setGayane(prev => ({ ...prev, avatar: av.key }))}
                        className={`p-2.5 text-2xl rounded-xl border-2 transition-all cursor-pointer ${
                          gayane.avatar === av.key
                            ? 'border-brand-sky bg-brand-sky/10 scale-105 shadow-md shadow-brand-sky/10'
                            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                        title={av.name}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Select Game Mode */}
            <div className="mb-10">
              <h3 className="font-black text-white text-center mb-5 uppercase tracking-widest text-xs font-mono text-slate-500">Ընտրել Խաղափուլը</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mode 1 */}
                <button
                  onClick={() => startGame('round1')}
                  className="p-5 rounded-2xl border-2 text-left transition-all bg-slate-950/70 hover:bg-slate-900/80 border-slate-800 hover:border-brand-sky group relative overflow-hidden cursor-pointer shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-brand-sky uppercase tracking-widest font-mono">ՓՈՒԼ 1</span>
                      <h4 className="font-black text-white mt-1 text-base uppercase tracking-tight italic">Subjuntivo Quiz</h4>
                      <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">20 թեստային հարց Subjuntivo-ի տարբեր կառույցներից: 10-ական հարց յուրաքանչյուրին:</p>
                    </div>
                    <span className="text-3xl group-hover:scale-110 transition-transform filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.3)]">🧠</span>
                  </div>
                </button>

                {/* Mode 2 */}
                <button
                  onClick={() => startGame('round2')}
                  className="p-5 rounded-2xl border-2 text-left transition-all bg-slate-950/70 hover:bg-slate-900/80 border-slate-800 hover:border-brand-sky group relative overflow-hidden cursor-pointer shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-brand-sky uppercase tracking-widest font-mono">ՓՈՒԼ 2</span>
                      <h4 className="font-black text-white mt-1 text-base uppercase tracking-tight italic">Subjuntivo vs Indicativo</h4>
                      <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">20 հարց խառն տիպի: Ստուգում է, թե երբ է պետք Subjuntivo-ն և երբ՝ հասարակ Indicativo-ն:</p>
                    </div>
                    <span className="text-3xl group-hover:scale-110 transition-transform filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.3)]">⚖️</span>
                  </div>
                </button>

                {/* Mode 3 */}
                <button
                  onClick={() => startGame('dialogues')}
                  className="p-5 rounded-2xl border-2 text-left transition-all bg-slate-950/70 hover:bg-slate-900/80 border-slate-800 hover:border-brand-sky group relative overflow-hidden cursor-pointer shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-brand-sky uppercase tracking-widest font-mono">ՓՈՒԼ 3</span>
                      <h4 className="font-black text-white mt-1 text-base uppercase tracking-tight italic">Երկխոսության Բացթողումներ</h4>
                      <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">3 երկար դիալոգներ: Լրացրեք համապատասխան բայաձևերը խոսակցական կոնտեքստում:</p>
                    </div>
                    <span className="text-3xl group-hover:scale-110 transition-transform filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.3)]">💬</span>
                  </div>
                </button>

                {/* Mode Mega */}
                <button
                  onClick={() => startGame('mega')}
                  className="p-5 rounded-2xl border-2 text-left transition-all bg-slate-950/70 hover:bg-slate-900/80 border-slate-800 hover:border-brand-sky group relative overflow-hidden cursor-pointer shadow-md"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-sky/5 rounded-full -mr-10 -mt-10" />
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-brand-sky uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-sky" />
                        ՄԵԳԱ ՏՈՒՐՆԻՐ
                      </span>
                      <h4 className="font-black text-white mt-1 text-base uppercase tracking-tight italic">Ամբողջական Մրցաշար</h4>
                      <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">Բոլոր 3 փուլերը միասին (52 հարց): Իսկական քերականության չեմպիոններին որոշելու համար:</p>
                    </div>
                    <span className="text-3xl group-hover:scale-110 transition-transform filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.3)]">🏆</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Help Prompt */}
            <div className="text-center p-4 bg-slate-950/40 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4 text-brand-sky stroke-[2.5]" />
              <span className="font-medium">Խաղալու ընթացքում սեղմեք նախադասության վրա, որպեսզի տեսնեք դրա հայերեն թարգմանությունը:</span>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: ACTIVE GAMEPLAY */}
        {gameStarted && !gameFinished && (
          <div className="space-y-6">
            
            {/* Live Score Dashboard */}
            <div className="bg-slate-900 rounded-3xl p-4 md:p-6 shadow-[5px_5px_0px_0px_rgba(255,255,255,0.02)] border-2 border-slate-800 grid grid-cols-3 items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-950">
                <div
                  className="h-full bg-brand-sky transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                  style={{ width: `${(getCompletedQuestionsCount() / getTotalQuestionsCount()) * 100}%` }}
                />
              </div>

              {/* Player 1: Gor */}
              <div className={`flex flex-col items-center p-3.5 rounded-2xl transition-all border-2 ${
                currentPlayer === 'gor' ? 'bg-slate-950/85 border-brand-sky shadow-lg' : 'opacity-55 border-transparent bg-slate-950/30'
              }`}>
                <div className="relative">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-md border border-slate-800">
                    {AVATARS.find(a => a.key === gor.avatar)?.emoji || '🧑‍💻'}
                  </div>
                  {gor.currentStreak > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-sky text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-black flex items-center gap-0.5 animate-bounce font-mono">
                      <Flame className="w-3 h-3 fill-slate-950 text-slate-950" />
                      {gor.currentStreak}
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-sm mt-2 text-white tracking-wide">Գոռ</span>
                <span className="text-2xl font-mono font-black text-brand-sky">{gor.score}<span className="text-[10px] font-mono font-bold text-slate-500 block">Միավոր</span></span>
              </div>

              {/* Mid Status / Leader comparison */}
              <div className="flex flex-col items-center justify-center px-2 text-center">
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-1.5 font-mono">
                  ՀԱՐՑ {getCompletedQuestionsCount() + 1} / {getTotalQuestionsCount()}
                </span>
                
                {/* Animated turn spotlight banner */}
                <div className="py-1.5 px-3 rounded-md bg-slate-950 border border-slate-850 text-white text-xs font-black uppercase tracking-wider animate-pulse shadow-xs flex items-center gap-1.5">
                  {currentPlayer === 'gor' ? (
                    <>
                      <span className="text-brand-sky font-mono">🧑‍💻 Գոռ</span>
                    </>
                  ) : (
                    <>
                      <span className="text-brand-sky font-mono">👩‍💻 Գայանե</span>
                    </>
                  )}
                </div>

                <div className="mt-3.5 text-xs font-mono">
                  {winner === 'tie' ? (
                    <span className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-md text-slate-400 font-semibold">Ոչ-ոքի 🤝</span>
                  ) : (
                    <span className="bg-slate-950 border border-brand-sky/20 text-brand-sky px-2.5 py-1 rounded-md font-black flex items-center gap-1">
                      👑 {winner === 'gor' ? 'Գոռը' : 'Գայանեն'} (+{Math.abs(gor.score - gayane.score)})
                    </span>
                  )}
                </div>
              </div>

              {/* Player 2: Gayane */}
              <div className={`flex flex-col items-center p-3.5 rounded-2xl transition-all border-2 ${
                currentPlayer === 'gayane' ? 'bg-slate-950/85 border-brand-sky shadow-lg' : 'opacity-55 border-transparent bg-slate-950/30'
              }`}>
                <div className="relative">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-3xl shadow-md border border-slate-800">
                    {AVATARS.find(a => a.key === gayane.avatar)?.emoji || '👩‍💻'}
                  </div>
                  {gayane.currentStreak > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-sky text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-black flex items-center gap-0.5 animate-bounce font-mono">
                      <Flame className="w-3 h-3 fill-slate-950 text-slate-950" />
                      {gayane.currentStreak}
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-sm mt-2 text-white tracking-wide">Գայանե</span>
                <span className="text-2xl font-mono font-black text-brand-sky">{gayane.score}<span className="text-[10px] font-mono font-bold text-slate-500 block">Միավոր</span></span>
              </div>
            </div>

            {/* Dialogue context presentation (Round 3 only) */}
            {currentRoundType === 'dialogues' && (
              <div className="bg-slate-950/60 border-2 border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <MessageSquare className="w-4 h-4 text-brand-sky" />
                    <span>Երկխոսություն {dialogueIndex + 1} / 3</span>
                  </span>
                  <span className="text-xs font-bold text-brand-sky uppercase tracking-wide font-mono">{dialoguesPool[dialogueIndex]?.title}</span>
                </div>

                <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
                  {dialoguesPool[dialogueIndex]?.parts.map((p, idx) => {
                    const isPassed = idx < dialoguePartIndex;
                    const isActive = idx === dialoguePartIndex;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl transition-all text-sm flex items-start gap-3 ${
                          isActive
                            ? 'bg-brand-sky/10 border-l-4 border-brand-sky text-white font-bold'
                            : isPassed
                            ? 'opacity-65 text-slate-300 bg-slate-900/30 border-l border-slate-800'
                            : 'opacity-25 text-slate-600'
                        }`}
                      >
                        <span className="font-black text-brand-sky min-w-[2rem] font-mono">{p.speaker}:</span>
                        <div className="flex-grow">
                          {isActive ? (
                            <span>
                              {p.sentenceWithBlank.split("___")[0]}
                              <span className="px-3 py-0.5 mx-1.5 font-mono font-black bg-brand-sky/20 text-brand-sky border border-brand-sky/30 rounded uppercase">
                                {isAnswered ? p.options[p.correctIndex] : " ? "}
                              </span>
                              {p.sentenceWithBlank.split("___")[1]}
                            </span>
                          ) : (
                            <span className="font-medium">
                              {p.sentenceWithBlank.replace("___", isPassed ? p.options[p.correctIndex] : "_________")}
                            </span>
                          )}
                          
                          {/* Reveal Armenian translation of active dialogue line */}
                          {isActive && (showTranslation || isAnswered) && (
                            <p
                              className="text-xs text-slate-300 font-bold mt-2 border-t border-slate-800/80 pt-1.5 font-sans"
                            >
                              🇦🇲 {p.translation}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MAIN QUESTION CARD */}
            <div
              className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(56,189,248,0.15)] border-2 border-slate-800 flex flex-col justify-between relative"
            >
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <span className="text-xs font-black text-slate-400 font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-md">
                  {currentRoundType === 'round1' ? 'Subjuntivo' : currentRoundType === 'round2' ? 'Subjuntivo vs Indicativo' : 'Dialogue'}
                </span>
                {activeQuestion.rule && (
                  <span className="text-[10px] font-black text-brand-sky bg-brand-sky/10 border border-brand-sky/20 px-3 py-1.5 rounded-md uppercase tracking-wider font-mono">
                    {activeQuestion.rule}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="mt-4 mb-8 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-4 font-mono">ԻՍՊԱՆԵՐԵՆ ՆԱԽԱԴԱՍՈՒԹՅՈՒՆ</p>
                
                {/* Sentence block */}
                <div
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="inline-block cursor-pointer bg-slate-950/80 hover:bg-slate-950 border-2 border-dashed border-slate-800 hover:border-brand-sky p-6 md:p-8 rounded-2xl transition-all duration-200 max-w-2xl mx-auto w-full group relative"
                  title="Կտտացրեք թարգմանության համար"
                >
                  <p className="text-2xl md:text-3xl font-black text-white tracking-wide leading-relaxed font-sans italic">
                    {activeQuestion.sentence.split("___").map((text, i, arr) => (
                      <span key={i}>
                        {text}
                        {i < arr.length - 1 && (
                          <span className="inline-block px-4 py-1 mx-2 font-mono font-black border-b-4 border-dashed border-brand-sky bg-brand-sky/5 text-brand-sky rounded-md">
                            {isAnswered ? activeQuestion.options[activeQuestion.correctIndex] : "_________"}
                          </span>
                        )}
                      </span>
                    ))}
                  </p>

                  <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-bold mt-6 uppercase select-none group-hover:text-brand-sky transition-colors font-mono">
                    <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Կտտացրեք նախադասության վրա՝ թարգմանությունը տեսնելու համար</span>
                  </div>
                </div>

                {/* ARMENIAN TRANSLATION SLIDE-IN (NO ANIMATION) */}
                {(showTranslation || isAnswered) && (
                  <div className="mt-4">
                    <div className="bg-slate-950 border-2 border-slate-850 rounded-2xl p-4 max-w-xl mx-auto">
                      <span className="text-[10px] font-black text-brand-sky block uppercase mb-1.5 font-mono tracking-widest">🇦🇲 ՀԱՅԵՐԵՆ ԹԱՐԳՄԱՆՈՒԹՅՈՒՆ</span>
                      <p className="text-base font-black text-white font-sans leading-relaxed">
                        {activeQuestion.translation}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* MULTIPLE CHOICE OPTIONS */}
              <div className={`grid gap-4 ${activeQuestion.options.length > 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {activeQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = idx === activeQuestion.correctIndex;
                  
                  let buttonStyle = "bg-slate-950 hover:bg-slate-900 border-slate-800 text-white hover:border-slate-700 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm";
                  let leftLetterStyle = "bg-slate-900 border border-slate-800 text-slate-400";

                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      buttonStyle = "bg-emerald-950/90 border-emerald-500 text-emerald-100 font-black shadow-md shadow-emerald-500/10";
                      leftLetterStyle = "bg-emerald-500 text-white border-transparent";
                    } else if (isSelected) {
                      buttonStyle = "bg-red-950/90 border-red-500 text-red-200 font-bold opacity-85";
                      leftLetterStyle = "bg-red-500 text-white border-transparent";
                    } else {
                      buttonStyle = "bg-slate-950/40 border-slate-900 text-slate-500 opacity-55";
                      leftLetterStyle = "bg-slate-900 border border-slate-850 text-slate-600";
                    }
                  }

                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={(e) => handleAnswerClick(idx, e)}
                      className={`p-4 rounded-xl border-2 text-left ${!isAnswered ? 'transition-all' : ''} flex items-center space-x-3.5 w-full group relative ${buttonStyle}`}
                    >
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm font-mono ${!isAnswered ? 'transition-all' : ''} ${leftLetterStyle}`}>
                        {isAnswered && isCorrectAnswer ? <Check className="w-5 h-5 stroke-[3]" /> : optionLetters[idx]}
                      </span>
                      <span className="text-base font-bold font-mono tracking-wide">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* INTERACTIVE RULE EXPLANATION (post answer - NO ANIMATION) */}
              {isAnswered && (
                <div
                  className="mt-6 p-5 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-start space-x-4"
                >
                  <div className="p-2.5 rounded-xl bg-brand-sky/10 text-brand-sky border border-brand-sky/20 mt-0.5">
                    <Lightbulb className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-500 block uppercase tracking-widest font-mono">Քերականական Կանոն</span>
                    <p className="text-sm text-slate-300 mt-2 font-medium leading-relaxed font-sans">
                      {activeQuestion.explanation}
                    </p>
                    
                    {/* Close button / proceed */}
                    <button
                      onClick={handleNextQuestion}
                      className="mt-5 flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-sky text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-sky-400 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>Հաջորդ հարցը</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: GAME FINISHED OVERVIEW */}
        {gameStarted && gameFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-3xl p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(56,189,248,0.15)] border-2 border-slate-800 text-center"
          >
            {/* Crown illustration */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-brand-sky/10 text-brand-sky mb-6 border border-brand-sky/20 shadow-lg relative">
              <Crown className="w-12 h-12 text-brand-sky animate-bounce stroke-[2.5]" />
              <div className="absolute inset-0 border-4 border-brand-sky/20 rounded-2xl animate-ping" style={{ animationDuration: '3s' }} />
            </div>

            {/* Title / Winner Announcement */}
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
              Մրցույթն Ավարտվե՛ց:
            </h2>
            
            {winner === 'tie' ? (
              <p className="text-lg font-bold text-brand-sky mt-3">
                Ոչ-ոքի! 🤝 Իդեալական համագործակցություն և հավասար ուժեր:
              </p>
            ) : (
              <div className="mt-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2 font-mono">ՀԱՂԹՈՂ</span>
                <span className="text-xl md:text-2xl font-black text-brand-sky bg-brand-sky/10 border-2 border-brand-sky/20 px-6 py-2.5 rounded-xl inline-block tracking-widest uppercase font-mono shadow-md">
                  🏆 {winner === 'gor' ? 'ԳՈՌ (Gor)' : 'ԳԱՅԱՆԵ (Gayane)'}
                </span>
              </div>
            )}

            {/* scoreboard breakdown dials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 max-w-2xl mx-auto">
              
              {/* Gor Stats */}
              <div className="bg-slate-950 border-2 border-slate-850 rounded-3xl p-6 flex flex-col items-center shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-md mb-3 border border-slate-800">
                  {AVATARS.find(a => a.key === gor.avatar)?.emoji || '🧑‍💻'}
                </div>
                <h3 className="font-black text-white text-base tracking-wide uppercase">Գոռ</h3>
                <span className="text-4xl font-mono font-black text-brand-sky mt-2">{gor.score}<span className="text-xs font-mono font-bold text-slate-500 block">Միավոր</span></span>
                
                <div className="w-full grid grid-cols-2 gap-2 mt-5 pt-5 border-t-2 border-slate-900 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block font-bold uppercase tracking-wider">Ճշտություն</span>
                    <span className="font-black text-white text-sm">
                      {gor.answers.length > 0 ? `${Math.round((gor.answers.filter(a => a.correct).length / gor.answers.length) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold uppercase tracking-wider">Մաքսիմում Սթրեյք</span>
                    <span className="font-black text-white text-sm flex items-center justify-center gap-0.5">
                      <Flame className="w-4 h-4 text-brand-sky fill-brand-sky" />
                      {gor.maxStreak}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Gayane Stats */}
              <div className="bg-slate-950 border-2 border-slate-850 rounded-3xl p-6 flex flex-col items-center shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-3xl shadow-md mb-3 border border-slate-800">
                  {AVATARS.find(a => a.key === gayane.avatar)?.emoji || '👩‍💻'}
                </div>
                <h3 className="font-black text-white text-base tracking-wide uppercase">Գայանե</h3>
                <span className="text-4xl font-mono font-black text-brand-sky mt-2">{gayane.score}<span className="text-xs font-mono font-bold text-slate-500 block">Միավոր</span></span>

                <div className="w-full grid grid-cols-2 gap-2 mt-5 pt-5 border-t-2 border-slate-900 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block font-bold uppercase tracking-wider">Ճշտություն</span>
                    <span className="font-black text-white text-sm">
                      {gayane.answers.length > 0 ? `${Math.round((gayane.answers.filter(a => a.correct).length / gayane.answers.length) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold uppercase tracking-wider">Մաքսիմում Սթրեյք</span>
                    <span className="font-black text-white text-sm flex items-center justify-center gap-0.5">
                      <Flame className="w-4 h-4 text-brand-sky fill-brand-sky" />
                      {gayane.maxStreak}x
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer History Review Tab */}
            <div className="text-left max-w-2xl mx-auto mb-10">
              <h3 className="font-black text-white text-lg mb-5 border-b-2 border-slate-800 pb-3 flex items-center gap-2 uppercase tracking-wide">
                <Languages className="w-5 h-5 text-brand-sky" />
                <span>Պատասխանների Ստուգում</span>
              </h3>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {/* Combined list of questions */}
                {Array.from({ length: Math.max(gor.answers.length, gayane.answers.length) }).map((_, index) => {
                  const gAns = gor.answers[index];
                  const gaAns = gayane.answers[index];

                  return (
                    <div key={index} className="space-y-3.5 border-b-2 border-slate-950 pb-5">
                      {gAns && (
                        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 text-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-black text-slate-300 flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px]">
                              <span>Գոռի հարցը:</span>
                              <span className="text-[10px] font-mono font-bold text-slate-500">({gAns.roundName})</span>
                            </span>
                            {gAns.correct ? (
                              <span className="bg-emerald-950/85 border border-emerald-500 text-emerald-400 text-[10px] px-2.5 py-1 rounded-md font-black flex items-center gap-1 uppercase tracking-wider font-mono">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                Ճիշտ է
                              </span>
                            ) : (
                              <span className="bg-red-950/85 border border-red-500 text-red-400 text-[10px] px-2.5 py-1 rounded-md font-black flex items-center gap-1 uppercase tracking-wider font-mono">
                                <XCircle className="w-3.5 h-3.5 text-red-400" />
                                Սխալ է
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-white font-mono tracking-wide leading-relaxed italic">{gAns.sentence.replace("___", `[ ${gAns.userAnswer} ]`)}</p>
                          {!gAns.correct && (
                            <p className="text-xs text-brand-sky font-bold mt-2">Ճիշտ պատասխանն է՝ <span className="underline font-mono">{gAns.correctAnswer}</span></p>
                          )}
                          <p className="text-xs text-slate-300 mt-2 italic font-sans">🇦🇲 {gAns.translation}</p>
                        </div>
                      )}

                      {gaAns && (
                        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 text-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-black text-slate-300 flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px]">
                              <span>Գայանեի հարցը:</span>
                              <span className="text-[10px] font-mono font-bold text-slate-500">({gaAns.roundName})</span>
                            </span>
                            {gaAns.correct ? (
                              <span className="bg-emerald-950/85 border border-emerald-500 text-emerald-400 text-[10px] px-2.5 py-1 rounded-md font-black flex items-center gap-1 uppercase tracking-wider font-mono">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                Ճիշտ է
                              </span>
                            ) : (
                              <span className="bg-red-950/85 border border-red-500 text-red-400 text-[10px] px-2.5 py-1 rounded-md font-black flex items-center gap-1 uppercase tracking-wider font-mono">
                                <XCircle className="w-3.5 h-3.5 text-red-400" />
                                Սխալ է
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-white font-mono tracking-wide leading-relaxed italic">{gaAns.sentence.replace("___", `[ ${gaAns.userAnswer} ]`)}</p>
                          {!gaAns.correct && (
                            <p className="text-xs text-brand-sky font-bold mt-2">Ճիշտ պատասխանն է՝ <span className="underline font-mono">{gaAns.correctAnswer}</span></p>
                          )}
                          <p className="text-xs text-slate-300 mt-2 italic font-sans">🇦🇲 {gaAns.translation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Restart button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => startGame(gameMode)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-brand-sky text-slate-950 font-black uppercase tracking-wider hover:bg-sky-400 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                <span>Կրկին խաղալ նույն փուլը</span>
              </button>

              <button
                onClick={() => setGameStarted(false)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-slate-950 border-2 border-slate-800 text-white font-black uppercase tracking-wider hover:bg-slate-900 transition-all cursor-pointer"
              >
                <span>Գլխավոր էջ</span>
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* PERSISTENT GRAMMAR CHEAT SHEET SIDEBAR */}
      <AnimatePresence>
        {showCheatSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheatSheet(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l-2 border-slate-850 shadow-2xl z-50 p-6 md:p-8 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <h3 className="font-black text-lg text-white flex items-center gap-2 uppercase tracking-wide">
                    <BookOpen className="w-5 h-5 text-brand-sky" />
                    <span>Քերականության Ուղեցույց</span>
                  </h3>
                  <button
                    onClick={() => setShowCheatSheet(false)}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-brand-sky border border-slate-850 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
                  
                  {/* Section 1 */}
                  <div className="bg-slate-950 border-2 border-slate-850 rounded-2xl p-5 shadow-inner">
                    <h4 className="font-black text-brand-sky text-base flex items-center gap-2 mb-2 uppercase tracking-wide">
                      <span className="text-lg">💡</span>
                      <span>Ի՞նչ է Subjuntivo-ն</span>
                    </h4>
                    <p className="font-medium text-slate-300">
                      Subjuntivo-ն (ըղձական եղանակ) իսպաներենում օգտագործվում է ոչ թե օբյեկտիվ փաստեր, այլ սուբյեկտիվ վերաբերմունք, ցանկություններ, կասկածներ կամ գնահատականներ արտահայտելու համար:
                    </p>
                  </div>

                  {/* Section 2 (Triggers - WEIRD) */}
                  <div>
                    <h4 className="font-black text-slate-500 text-xs uppercase tracking-widest mb-3.5 font-mono">Ե՞րբ օգտագործել Subjuntivo</h4>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="bg-slate-950 text-brand-sky border border-brand-sky/20 font-mono font-black px-2 py-0.5 rounded text-[11px] mt-0.5">Deseo</span>
                        <div>
                          <strong className="text-white">Ցանկություններ և Կամք:</strong> <span className="text-slate-400 font-mono">Quiero que, Espero que, Ojalá que...</span>
                          <span className="block text-xs text-slate-500 italic mt-1 font-sans">Օրինակ՝ Quiero que tú me digas la verdad. (Ուզում եմ, որ ինձ ասես ճշմարտությունը։)</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-slate-950 text-brand-sky border border-brand-sky/20 font-mono font-black px-2 py-0.5 rounded text-[11px] mt-0.5">Duda</span>
                        <div>
                          <strong className="text-white">Կասկած, Ժխտում:</strong> <span className="text-slate-400 font-mono">Dudo que, No creo que, No pienso que...</span>
                          <span className="block text-xs text-slate-500 italic mt-1 font-sans">Օրինակ՝ No creo que él sepa la verdad. (Չեմ կարծում, որ նա գիտի ճշմարտությունը։)</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-slate-950 text-brand-sky border border-brand-sky/20 font-mono font-black px-2 py-0.5 rounded text-[11px] mt-0.5">Valor</span>
                        <div>
                          <strong className="text-white">Անդեմ գնահատականներ:</strong> <span className="text-slate-400 font-mono">Es importante que, Es necesario que...</span>
                          <span className="block text-xs text-slate-500 italic mt-1 font-sans">Օրինակ՝ Es importante que llegues temprano. (Կարևոր է, որ շուտ հասնես։)</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-slate-950 text-brand-sky border border-brand-sky/20 font-mono font-black px-2 py-0.5 rounded text-[11px] mt-0.5">Emoción</span>
                        <div>
                          <strong className="text-white">Զգացմունքներ:</strong> <span className="text-slate-400 font-mono">Me alegra que, Me molesta que...</span>
                          <span className="block text-xs text-slate-500 italic mt-1 font-sans">Օրինակ՝ Me alegra que estés bien. (Ուրախ եմ, որ լավ ես։)</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Section 3 (Indicativo vs Subjuntivo contrast) */}
                  <div className="border-t border-slate-800 pt-5">
                    <h4 className="font-black text-slate-500 text-xs uppercase tracking-widest mb-3 font-mono">Indicativo vs Subjuntivo (Համոզմունք)</h4>
                    <p className="mb-3 font-medium">
                      Երբ վստահ ենք կամ հաստատում ենք մեր կարծիքը, օգտագործում ենք <strong>Indicativo</strong>: Երբ կասկածում ենք կամ ժխտում, օգտագործում ենք <strong>Subjuntivo</strong>:
                    </p>
                    <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
                      <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl">
                        <span className="font-black text-emerald-400 block mb-1.5">Indicativo (Վստահություն)</span>
                        <ul className="space-y-1 text-slate-400">
                          <li>• Creo que...</li>
                          <li>• Sé que...</li>
                          <li>• Es verdad...</li>
                          <li>• Es seguro...</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl">
                        <span className="font-black text-red-400 block mb-1.5">Subjuntivo (Ժխտում)</span>
                        <ul className="space-y-1 text-slate-400">
                          <li>• No creo que...</li>
                          <li>• Dudo que...</li>
                          <li>• No es verdad...</li>
                          <li>• No es seguro...</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCheatSheet(false)}
                className="mt-8 w-full p-4 rounded-xl bg-brand-sky text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-sky-400 transition-all text-center shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 cursor-pointer font-mono"
              >
                Փակել Ուղեցույցը
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="text-center mt-12 px-4">
        <p className="text-xs text-slate-600 font-mono tracking-widest uppercase">
          Made for Gor & Gayane 🇪🇸🇦🇲 © 2026. Learn Spanish grammar interactively!
        </p>
      </footer>
    </div>
  );
}
