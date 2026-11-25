import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Badge, Loader } from '../../components';
import API from '../../services/api';
import { Award, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuizResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(!location.state?.resultData);

  useEffect(() => {
    // If result already passed through router state, we are good
    if (location.state?.resultData) {
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await API.get(`/student/results/${id}`);
        if (res.data?.success && res.data?.data) {
          setResult(res.data.data);
        }
      } catch (err) {
        // Fallback: check all student results for matching quiz id or attempt id
        try {
          const allRes = await API.get('/student/results');
          if (allRes.data?.success && Array.isArray(allRes.data?.data)) {
            const match = allRes.data.data.find(
              (r) => r._id === id || r.quiz?._id === id
            );
            if (match) {
              setResult(match);
              return;
            }
          }
        } catch {
          // ignore
        }
        toast.error('Could not load quiz result');
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, location.state]);

  if (loading) {
    return <Loader message="Loading assessment result details..." />;
  }

  if (!result) return null;

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

      {/* Main Result Card */}
      <Card className="flex flex-col gap-6 border-[3px] shadow-[6px_6px_0_#000000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
          <div>
            <Badge status={result.status || 'completed'} />
            <h1 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black mt-2">
              QUIZ ASSESSMENT RESULT
            </h1>
            <p className="font-body text-sm text-neutral-600 font-medium">
              {result.quiz?.title || 'Course Quiz'} • {result.quiz?.subject || 'Assessment'}
            </p>
          </div>

          <div className="text-right">
            <span className="font-label text-xs uppercase font-bold text-neutral-600 block">Submitted At</span>
            <span className="font-mono text-sm font-bold text-black">
              {result.submittedAt ? new Date(result.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recorded'}
            </span>
          </div>
        </div>

        {/* Big Score Block (Pink Accent #FF90E8) */}
        <div className="bg-[#FF90E8] border-[3px] border-black p-6 rounded nb-card text-center flex flex-col items-center justify-center gap-2">
          <span className="font-label text-sm uppercase font-bold text-black">
            YOUR OVERALL SCORE
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-5xl sm:text-7xl font-extrabold text-black">
              {result.score}
            </span>
            <span className="font-headline text-2xl sm:text-3xl font-bold text-black">
              / {result.totalQuestions}
            </span>
          </div>
          <span className="font-label text-base font-bold bg-white px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0_#000000] mt-1">
            PERCENTAGE: {result.percentage}%
          </span>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FFF8E7] border-2 border-black p-4 rounded text-center">
            <span className="font-label text-xs uppercase font-bold text-neutral-600 block">Total Questions</span>
            <span className="font-mono text-2xl font-bold text-black">{result.totalQuestions}</span>
          </div>
          <div className="bg-[#6BCB77] border-2 border-black p-4 rounded text-center">
            <span className="font-label text-xs uppercase font-bold text-black block">Correct Answers</span>
            <span className="font-mono text-2xl font-bold text-black">{result.correctAnswers}</span>
          </div>
          <div className="bg-[#FF6B6B] border-2 border-black p-4 rounded text-center">
            <span className="font-label text-xs uppercase font-bold text-black block">Wrong Answers</span>
            <span className="font-mono text-2xl font-bold text-black">{result.wrongAnswers}</span>
          </div>
          <div className="bg-white border-2 border-black p-4 rounded text-center">
            <span className="font-label text-xs uppercase font-bold text-neutral-600 block">Unanswered</span>
            <span className="font-mono text-2xl font-bold text-black">{result.unanswered}</span>
          </div>
        </div>

        {/* Performance Note */}
        <div className="bg-[#FFE885] border-2 border-black p-4 rounded flex items-center gap-3">
          <Award size={28} className="text-black shrink-0" />
          <p className="font-body text-sm text-black">
            Your results have been registered into the departmental records.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/student')}
            className="flex-1"
          >
            RETURN TO DASHBOARD
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/student/results')}
            className="flex-1"
          >
            VIEW ATTEMPT HISTORY
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuizResult;
