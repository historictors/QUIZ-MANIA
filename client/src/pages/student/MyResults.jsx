import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, EmptyState } from '../../components';
import { mockAttempts } from '../../data/sampleData';
import { Award, ArrowRight, BookOpen } from 'lucide-react';

export const MyResults = () => {
  const navigate = useNavigate();

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

      {mockAttempts.length === 0 ? (
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
          {mockAttempts.map((attempt) => (
            <tr key={attempt._id} className="hover:bg-[#FFF8E7] transition-colors">
              <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                {attempt.quiz.title}
              </td>
              <td className="p-3.5 text-neutral-700 whitespace-nowrap">
                {attempt.quiz.subject}
              </td>
              <td className="p-3.5 font-mono text-xs text-neutral-800 whitespace-nowrap">
                {new Date(attempt.submittedAt).toLocaleDateString()} {new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="p-3.5 font-mono font-bold text-black whitespace-nowrap">
                {attempt.score} / {attempt.totalQuestions}
              </td>
              <td className="p-3.5 whitespace-nowrap">
                <span className="font-label text-xs font-bold bg-[#FFE885] px-2 py-0.5 border border-black rounded">
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
                  onClick={() => navigate(`/student/result/${attempt._id}`)}
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
