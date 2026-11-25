import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Loader } from '../../components';
import API from '../../services/api';
import { AlertCircle, Clock, ArrowLeft, Play, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuizInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const res = await API.get(`/student/quizzes/${id}`);
        if (res.data?.success && res.data?.data) {
          setQuiz(res.data.data);
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Quiz not found or not eligible';
        toast.error(msg);
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [id]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await API.post(`/student/quizzes/${id}/start`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Quiz started! Countdown initiated.');
        navigate(`/student/quiz/${id}/attempt`, {
          state: { initialAttempt: res.data.data }
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to start quiz';
      toast.error(msg);
      navigate('/student');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading quiz instructions..." />;
  }

  if (!quiz) return null;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/student')}
        className="w-fit"
      >
        <ArrowLeft size={16} />
        <span>BACK TO DASHBOARD</span>
      </Button>

      <Card className="flex flex-col gap-6 border-[3px] shadow-[6px_6px_0_#000000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
          <div>
            <Badge status={quiz.status} />
            <h1 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black mt-2">
              {quiz.title}
            </h1>
            <p className="font-body text-sm text-neutral-600 font-medium">
              Subject: {quiz.subject} | {quiz.department?.code} (Year {quiz.year})
            </p>
          </div>

          <div className="bg-[#FFDE59] border-2 border-black px-4 py-2 rounded shadow-[3px_3px_0_#000000] flex items-center gap-2 self-start sm:self-auto">
            <Clock size={20} className="text-black" />
            <span className="font-mono text-lg font-bold text-black">
              {quiz.timeLimit} MINS
            </span>
          </div>
        </div>

        {/* Quiz Meta Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FFF8E7] border-2 border-black p-3 rounded text-center">
            <span className="font-label text-xs uppercase font-bold text-neutral-600 block">Questions</span>
            <span className="font-mono text-xl font-bold text-black">{quiz.numberOfQuestions}</span>
          </div>
          <div className="bg-[#FFF8E7] border-2 border-black p-3 rounded text-center">
            <span className="font-label text-xs uppercase font-bold text-neutral-600 block">Total Marks</span>
            <span className="font-mono text-xl font-bold text-black">{quiz.numberOfQuestions}</span>
          </div>
          <div className="bg-[#FFF8E7] border-2 border-black p-3 rounded text-center">
            <span className="font-label text-xs uppercase font-bold text-neutral-600 block">Negative Marking</span>
            <span className="font-mono text-xl font-bold text-black">NONE</span>
          </div>
          <div className="bg-[#FFF8E7] border-2 border-black p-3 rounded text-center">
            <span className="font-label text-xs uppercase font-bold text-neutral-600 block">Allowed Attempts</span>
            <span className="font-mono text-xl font-bold text-black">1 ONLY</span>
          </div>
        </div>

        {/* Instructions List */}
        <div className="flex flex-col gap-3 bg-[#FFF8E7] border-2 border-black p-4 sm:p-5 rounded">
          <h3 className="font-headline text-lg uppercase font-bold text-black flex items-center gap-2">
            <AlertCircle size={20} />
            IMPORTANT CANDIDATE INSTRUCTIONS
          </h3>
          <ul className="list-disc list-inside space-y-2 font-body text-sm text-black">
            <li>
              <strong>One single attempt:</strong> You can only take this quiz once. Once submitted or auto-submitted, your attempt is final.
            </li>
            <li>
              <strong>Timer starts immediately:</strong> Clicking the "START QUIZ NOW" button will record your start timestamp and launch the server countdown.
            </li>
            <li>
              <strong>Auto-save:</strong> You can navigate between questions using the numbers or Previous/Next buttons. Your answers are saved continuously.
            </li>
            <li>
              <strong>Auto-submission:</strong> When the countdown timer reaches 00:00, the quiz will auto-submit all answered questions.
            </li>
            <li>
              <strong>Browser Refresh:</strong> In case of refresh or accidental closing, returning will resume your attempt with the correct remaining time.
            </li>
          </ul>
        </div>

        {/* Warning Banner */}
        <div className="bg-[#FFD6D6] border-2 border-[#FF6B6B] p-3.5 rounded flex items-center gap-3">
          <ShieldAlert size={24} className="text-[#FF6B6B] shrink-0" />
          <p className="font-body text-xs text-black">
            Ensure you have a stable network connection. Do not open other tabs or leave the browser window while the quiz is active.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="success"
            size="lg"
            onClick={handleStart}
            disabled={starting || quiz.status !== 'live'}
            className="w-full text-base py-3.5"
          >
            <Play size={20} />
            <span>{starting ? 'STARTING QUIZ...' : 'START QUIZ NOW'}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuizInstructions;
