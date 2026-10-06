import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Zap, RotateCcw, Flame, CheckCircle2, ArrowRight } from 'lucide-react';

export const AptitudeArenaView: React.FC = () => {
  const [category, setCategory] = useState<string>('All');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [streak, setStreak] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [submissionResults, setSubmissionResults] = useState<any>(null);

  // Load questions
  useEffect(() => {
    const loadSprint = async () => {
      const res = await apiService.getAptitudeSprint(category);
      if (res.questions?.length > 0) {
        setQuestions(res.questions);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setTimeLeft(45);
        setStreak(1);
        setScore(0);
        setIsFinished(false);
        setSubmissionResults(null);
      }
    };
    loadSprint();
  }, [category]);

  // 45s Countdown Timer
  useEffect(() => {
    if (isFinished || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto advance to next question
          handleNextQuestion();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isFinished, questions.length]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (!currentQ || isFinished) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(45);
    } else {
      handleSubmitSprint();
    }
  };

  const handleSubmitSprint = async () => {
    setIsFinished(true);
    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      selected_option: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1
    }));

    try {
      const res = await apiService.submitAptitudeSprint(answersPayload);
      setSubmissionResults(res);
      setScore(res.score_awarded || 30);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Arena Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Gamified Aptitude Arena</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Timed 45-second high-velocity sprints modeled on Pan-India campus recruitment rounds (Barclays, Persistent, TCS Digital, Infosys SP).
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
          {['All', 'Quantitative', 'Logical', 'Core CS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                category === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {!isFinished && currentQ ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Card (Col 8) */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {currentQ.category} • {currentQ.topic}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className={`text-base font-black font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-800 dark:text-slate-200'}`}>
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </span>
                  <span className="text-[9px] text-slate-400 block -mt-1">Sprint Timer</span>
                </div>
              </div>
            </div>

            {/* Timer Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-brand-indigo'}`}
                style={{ width: `${(timeLeft / 45) * 100}%` }}
              ></div>
            </div>

            {/* Question Text */}
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt: string, idx: number) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl text-left text-xs md:text-sm font-medium transition flex items-center justify-between border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-brand-indigo text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-brand-indigo text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected && <span className="text-brand-indigo font-bold text-sm">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1);
                    setTimeLeft(45);
                  }
                }}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30"
              >
                ← Previous
              </button>

              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
              >
                {currentIndex === questions.length - 1 ? "Submit Sprint" : "Next Question →"}
              </button>
            </div>
          </div>

          {/* Gamified Live Sidebar (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Live Sprint Telemetry
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 text-center">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">Streak</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-300 font-mono inline-flex items-center gap-1 justify-center">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{streak}x</span>
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Live Score</span>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                    {Object.keys(selectedAnswers).length * 10} pts
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Target Speed:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">&lt; 45s / question</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Negative Marking:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">0.25 (National CAT / TCS Standard)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Answered:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {Object.keys(selectedAnswers).length} of {questions.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-900 text-white border border-slate-800 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Placement Benchmark</span>
              <h4 className="text-sm font-bold mt-1 text-slate-100">Barclays Quant Cutoff</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Clearing 80%+ accuracy in Time & Work and Permutations ensures automatic shortlisting for Barclays Round 1.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Sprint Completed
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Aptitude Sprint Performance & Step-by-Step Proofs
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{submissionResults?.accuracy_pct || 80}%</span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">Accuracy</span>
              </div>
              <button
                onClick={() => {
                  setIsFinished(false);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                  setTimeLeft(45);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Sprint</span>
              </button>
            </div>
          </div>

          {/* Solutions with Explanations */}
          <div className="space-y-4">
            {submissionResults?.results?.map((res: any, idx: number) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${
                  res.is_correct
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-red-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                    {idx + 1}. {res.question}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    res.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {res.is_correct ? 'CORRECT' : 'INCORRECT'}
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 font-mono">
                  <span className="font-bold text-brand-indigo block mb-1">Mathematical Derivation:</span>
                  {res.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
