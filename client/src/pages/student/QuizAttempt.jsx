import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, ConfirmDialog, Loader } from '../../components';
import API from '../../services/api';
import { Clock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [deadline, setDeadline] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // References for clock offset and autosave debounce
  const clockOffsetRef = useRef(0);
  const saveTimeoutRef = useRef(null);
  const isAutoSubmittingRef = useRef(false);

  // Initial load: Attempt resume via GET /api/student/quizzes/:id/attempt
  // If not found, fallback to POST /api/student/quizzes/:id/start
  useEffect(() => {
    const initAttempt = async () => {
      try {
        let attemptData = location.state?.initialAttempt;

        if (!attemptData) {
          try {
            const resumeRes = await API.get(`/student/quizzes/${id}/attempt`);
            if (resumeRes.data?.success && resumeRes.data?.data) {
              attemptData = resumeRes.data.data;
            }
          } catch (resumeErr) {
            // Attempt start
            const startRes = await API.post(`/student/quizzes/${id}/start`);
            if (startRes.data?.success && startRes.data?.data) {
              attemptData = startRes.data.data;
            }
          }
        }

        if (!attemptData) {
          throw new Error('Could not initialize attempt');
        }

        // Set questions
        setQuestions(attemptData.questions || []);

        // Restore saved answers
        const ansMap = {};
        if (Array.isArray(attemptData.savedAnswers)) {
          attemptData.savedAnswers.forEach((ans) => {
            if (ans.selectedAnswer !== null && ans.selectedAnswer !== undefined) {
              ansMap[ans.questionIndex] = ans.selectedAnswer;
            }
          });
        }
        setSelectedAnswers(ansMap);

        // Calculate clock offset once on load: offset = serverTime - Date.now()
        const serverTime = new Date(attemptData.serverTime || Date.now()).getTime();
        const clientNow = Date.now();
        const offset = serverTime - clientNow;
        clockOffsetRef.current = offset;

        // Set deadline
        const dl = new Date(attemptData.deadline).getTime();
        setDeadline(dl);

        // Calculate initial remaining seconds
        const currentServerTime = Date.now() + offset;
        const remaining = Math.max(0, Math.floor((dl - currentServerTime) / 1000));
        setSecondsRemaining(remaining);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to start quiz attempt';
        toast.error(msg);
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };

    initAttempt();
  }, [id]);

  // Submission handler (manual or auto)
  const submitQuizAnswers = useCallback(async (isAuto = false) => {
    if (submitting || isAutoSubmittingRef.current) return;
    if (isAuto) isAutoSubmittingRef.current = true;
    setSubmitting(true);

    // Format current answers for payload
    const formattedAnswers = Object.entries(selectedAnswers).map(([k, v]) => ({
      questionIndex: Number(k),
      selectedAnswer: v
    }));

    try {
      const res = await API.post(`/student/quizzes/${id}/submit`, {
        answers: formattedAnswers,
        auto: isAuto
      });

      if (res.data?.success && res.data?.data) {
        toast.success(isAuto ? 'Time over! Quiz auto-submitted.' : 'Quiz submitted successfully!');
        navigate(`/student/result/${id}`, {
          state: {
            resultData: {
              ...res.data.data,
              quiz: { _id: id }
            }
          }
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission error';
      toast.error(msg);
      navigate('/student');
    } finally {
      setSubmitting(false);
    }
  }, [id, selectedAnswers, submitting, navigate]);

  // Accurate countdown timer based on server deadline - (Date.now() + offset)
  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const currentServerTime = Date.now() + clockOffsetRef.current;
      const remainingSecs = Math.max(0, Math.floor((deadline - currentServerTime) / 1000));
      setSecondsRemaining(remainingSecs);

      if (remainingSecs <= 0) {
        clearInterval(interval);
        submitQuizAnswers(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, submitQuizAnswers]);

  // Debounced auto-save on answer change (~1 second debounce)
  const debouncedSaveAnswers = (newAnswers) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const payloadAnswers = Object.entries(newAnswers).map(([k, v]) => ({
        questionIndex: Number(k),
        selectedAnswer: v
      }));

      try {
        await API.put(`/student/quizzes/${id}/answers`, {
          answers: payloadAnswers
        });
      } catch (err) {
        console.error('Failed to autosave answers:', err);
      }
    }, 1000);
  };

  const handleSelectOption = (optIndex) => {
    const updated = {
      ...selectedAnswers,
      [currentIndex]: optIndex
    };
    setSelectedAnswers(updated);
    debouncedSaveAnswers(updated);
  };

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
        <Loader message="Synchronizing with server clock and loading questions..." />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex] || {
    questionText: 'No question available',
    options: []
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-[#FFF8E7] p-3 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Header Bar: Question Title & Countdown Timer */}
      <header className="bg-white border-[3px] border-black p-4 rounded nb-card flex items-center justify-between gap-4 sticky top-4 z-20">
        <div>
          <span className="font-label text-xs uppercase font-bold text-neutral-600 block">
            LIVE ATTEMPT
          </span>
          <h1 className="font-headline text-lg sm:text-2xl font-bold uppercase tracking-tight text-black">
            QUIZ ASSESSMENT
          </h1>
        </div>

        {/* Server-Synchronized Hard Timer */}
        <div
          className={`px-4 py-2 border-[3px] border-black rounded shadow-[4px_4px_0_#000000] flex items-center gap-2 ${
            secondsRemaining !== null && secondsRemaining < 120
              ? 'bg-[#FF6B6B] animate-pulse text-white'
              : 'bg-[#FFDE59] text-black'
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
                1 MARK • NO NEGATIVE
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
                const letter = String.fromCharCode(65 + optIdx);

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

      {/* Manual Submit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={() => submitQuizAnswers(false)}
        title="SUBMIT QUIZ ASSESSMENT?"
        message={`You have answered ${answeredCount} of ${questions.length} questions. You still have ${unansweredCount} unanswered questions. Are you sure you want to finish?`}
        confirmText={submitting ? 'SUBMITTING...' : 'YES, SUBMIT NOW'}
        cancelText="CONTINUE QUIZ"
        variant="success"
      />
    </div>
  );
};

export default QuizAttempt;
