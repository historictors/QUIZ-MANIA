import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Badge, Button, EmptyState, Loader } from '../../components';
import API from '../../services/api';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/student/results');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setResults(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load attempt history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getPercentageColor = (pct) => {
    if (pct >= 70) return 'bg-[#6BCB77]'; // Green 70%+
    if (pct >= 40) return 'bg-[#FFA94D]'; // Orange 40-69%
    return 'bg-[#FF6B6B]';                 // Red below 40%
  };

  if (loading) {
    return <Loader message="Loading your historical results..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
            MY ATTEMPT HISTORY
          </h1>
          <p className="font-body text-sm text-neutral-600">
            Past quiz performance, scores and completion status
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No attempts yet"
          description="You have not participated in any quizzes yet."
          actionLabel="VIEW AVAILABLE QUIZZES"
          onAction={() => navigate('/student')}
        />
      ) : (
        <Table
          headers={[
            'Quiz Title',
            'Subject',
            'Date & Time',
            'Score',
            'Percentage',
            'Status',
            'Action'
          ]}
        >
          {results.map((attempt) => (
            <tr key={attempt._id} className="hover:bg-[#FFF8E7] transition-colors">
              <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                {attempt.quiz?.title || 'Quiz'}
              </td>
              <td className="p-3.5 text-neutral-700 whitespace-nowrap">
                {attempt.quiz?.subject || 'N/A'}
              </td>
              <td className="p-3.5 font-mono text-xs text-neutral-800 whitespace-nowrap">
                {attempt.submittedAt ? `${new Date(attempt.submittedAt).toLocaleDateString()} ${new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
              </td>
              <td className="p-3.5 font-mono font-bold text-black whitespace-nowrap">
                {attempt.score} / {attempt.totalQuestions}
              </td>
              <td className="p-3.5 whitespace-nowrap">
                <span
                  className={`font-label text-xs font-bold px-2.5 py-1 border border-black rounded shadow-[1px_1px_0_#000000] text-black ${getPercentageColor(
                    attempt.percentage
                  )}`}
                >
                  {attempt.percentage}%
                </span>
              </td>
              <td className="p-3.5 whitespace-nowrap">
                <Badge status={attempt.status} />
              </td>
              <td className="p-3.5 whitespace-nowrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    navigate(`/student/result/${attempt._id}`, {
                      state: { resultData: attempt }
                    })
                  }
                >
                  <span>VIEW</span>
                  <ArrowRight size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default MyResults;
