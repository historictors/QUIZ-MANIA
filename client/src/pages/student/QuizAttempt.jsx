import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Modal, ConfirmDialog } from '../../components';
import { mockQuizzes } from '../../data/sampleData';
import { Clock, AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const quiz = mockQuizzes.find((q) => q._id === id) || mockQuizzes[0];
  const questions = quiz.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: optionIndex }
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60); // 15 minutes mock
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex] || {
    questionText: 'Loading question...',
    options: []
  };

  const handleSelectOption = (optIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optIndex
    });
    toast('Answer saved', {
      duration: 1000,
      icon: '💾',
      style: {
        border: '2px solid #000',
        borderRadius: '4px',
        background: '#FFF8E7',
        color: '#000',
        fontSize: '12px'
      }
    });
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleFinalSubmit = (isAuto = false) => {
    if (isAuto) {
      toast('Time is up! Quiz auto-submitted.', { icon: '⏰' });
    } else {
      toast.success('Quiz submitted successfully!');
    }
    navigate('/student/result/att1');
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] p-3 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Header Bar: Quiz Title & Timer */}
      <header className="bg-white border-[3px] border-black p-4 rounded nb-card flex items-center justify-between gap-4 sticky top-4 z-20">
        <div>
          <span className="font-label text-xs uppercase font-bold text-neutral-600 block">
            {quiz.subject}
          </span>
          <h1 className="font-headline text-lg sm:text-2xl font-bold uppercase tracking-tight text-black">
            {quiz.title}
          </h1>
        </div>

        {/* Hard Neo-Brutalist Timer */}
        <div
          className={`px-4 py-2 border-[3px] border-black rounded shadow-[4px_4px_0_#000000] flex items-center gap-2 ${
            secondsRemaining < 120 ? 'bg-[#FF6B6B] animate-pulse text-white' : 'bg-[#FFDE59] text-black'
          }`}
        >
          <Clock size={22} className="shrink-0" />
          <span className="font-mono text-xl sm:text-2xl font-bold">
            {formatTime(secondsRemaining)}
          </span>
        </div>
      </header>

      {/* Main Attempt Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Question Box (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card className="flex flex-col gap-6 border-[3px] shadow-[6px_6px_0_#000000]">
            {/* Question Counter */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <span className="font-label text-xs sm:text-sm uppercase font-bold bg-[#FFE885] px-3 py-1 border-2 border-black rounded">
                QUESTION {currentIndex + 1} OF {questions.length}
              </span>
              <span className="font-mono text-xs font-bold text-neutral-600">
                1 MARK • SINGLE CHOICE
              </span>
            </div>

            {/* Question Text */}
            <p className="font-body text-base sm:text-xl font-medium text-black leading-relaxed">
              {currentQuestion.questionText}
            </p>

            {/* 4 Options Grid */}
            <div className="flex flex-col gap-3 mt-2">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-3.5 sm:p-4 border-[3px] border-black rounded flex items-center gap-3.5 text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FFDE59] shadow-[4px_4px_0_#000000] translate-x-1'
                        : 'bg-white shadow-[2px_2px_0_#000000] hover:bg-neutral-50 hover:translate-x-0.5'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded border-2 border-black flex items-center justify-center font-label font-bold text-sm shrink-0 ${
                        isSelected ? 'bg-black text-[#FFDE59]' : 'bg-[#FFF8E7] text-black'
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="font-body text-sm sm:text-base text-black font-medium">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-black">
              <Button
                variant="secondary"
                size="md"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              >
                <ArrowLeft size={16} />
                <span>PREVIOUS</span>
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                >
                  <span>NEXT QUESTION</span>
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="md"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  <CheckCircle2 size={16} />
                  <span>REVIEW & SUBMIT</span>
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Question Navigator Panel (1 col) */}
        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4 border-[3px] shadow-[4px_4px_0_#000000] p-4">
            <h3 className="font-headline text-base uppercase font-bold text-black border-b-2 border-black pb-2">
              QUESTION NAVIGATOR
            </h3>

            {/* Grid of question numbers */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, qIdx) => {
                const isAnswered = selectedAnswers[qIdx] !== undefined;
                const isCurrent = currentIndex === qIdx;

                return (
                  <button
                    key={qIdx}
                    onClick={() => setCurrentIndex(qIdx)}
                    className={`h-10 border-2 border-black rounded font-mono font-bold text-sm flex items-center justify-center cursor-pointer transition-transform ${
                      isCurrent
                        ? 'bg-[#FFDE59] ring-2 ring-black font-extrabold shadow-[2px_2px_0_#000000] scale-105'
                        : isAnswered
                        ? 'bg-[#6BCB77] text-black shadow-[1px_1px_0_#000000]'
                        : 'bg-white text-black hover:bg-neutral-100'
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2 pt-3 border-t-2 border-black text-xs font-label">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#6BCB77] border border-black rounded inline-block"></span>
                <span>ANSWERED ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-white border border-black rounded inline-block"></span>
                <span>UNANSWERED ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#FFDE59] border border-black rounded inline-block"></span>
                <span>CURRENT QUESTION</span>
              </div>
            </div>

            <Button
              variant="danger"
              size="md"
              className="w-full mt-2"
              onClick={() => setIsSubmitModalOpen(true)}
            >
              SUBMIT QUIZ
            </Button>
          </Card>
        </aside>
      </div>

      {/* Submit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={() => handleFinalSubmit(false)}
        title="SUBMIT QUIZ ASSESSMENT?"
        message={`You have answered ${answeredCount} of ${questions.length} questions. You still have ${unansweredCount} unanswered questions. Are you sure you want to finish?`}
        confirmText="YES, SUBMIT NOW"
        cancelText="CONTINUE QUIZ"
        variant="success"
      />
    </div>
  );
};

export default QuizAttempt;
