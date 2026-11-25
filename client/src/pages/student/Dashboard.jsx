import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Card, Badge, Button } from '../../components';
import { mockQuizzes } from '../../data/sampleData';
import { useApp } from '../../context/AppContext';
import { Play, Clock, BookOpen, CheckCircle, Calendar, ArrowRight } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const liveCount = mockQuizzes.filter((q) => q.status === 'live').length;
  const upcomingCount = mockQuizzes.filter((q) => q.status === 'upcoming').length;
  const completedCount = mockQuizzes.filter((q) => q.status === 'completed').length;
  const availableCount = liveCount;

  const filteredQuizzes = mockQuizzes.filter((q) => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="bg-[#FFDE59] border-[3px] border-black p-6 rounded nb-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-label text-xs uppercase font-bold bg-white px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0_#000000]">
            ACADEMIC SESSION 2026
          </span>
          <h1 className="font-headline text-2xl sm:text-4xl font-bold uppercase tracking-tight text-black mt-2">
            WELCOME, {user?.name?.toUpperCase() || 'STUDENT'}!
          </h1>
          <p className="font-body text-sm font-medium text-black mt-1">
            Department: Computer Science & Eng. | Year: 3rd Year | Roll: {user?.rollNumber || '21CSE045'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate('/student/results')}
          className="shrink-0"
        >
          VIEW MY HISTORY
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Available Quizzes"
          value={availableCount}
          sublabel="Live now for your class"
          icon={Play}
          bg="bg-[#6BCB77]"
        />
        <StatCard
          label="Upcoming Quizzes"
          value={upcomingCount}
          sublabel="Scheduled later this week"
          icon={Calendar}
          bg="bg-[#FFA94D]"
        />
        <StatCard
          label="Live Now"
          value={liveCount}
          sublabel="Requires immediate start"
          icon={Clock}
          bg="bg-[#FFDE59]"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          sublabel="Already submitted"
          icon={CheckCircle}
          bg="bg-[#C9B6FF]"
        />
      </div>

      {/* Assigned Quizzes Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
          <h2 className="font-headline text-xl sm:text-2xl uppercase font-bold text-black flex items-center gap-2">
            <BookOpen size={24} />
            ASSIGNED QUIZZES
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {['all', 'live', 'upcoming', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 border-2 border-black rounded font-label text-xs uppercase font-bold cursor-pointer transition-transform ${
                  filter === f
                    ? 'bg-[#FFDE59] shadow-[2px_2px_0_#000000] -translate-y-0.5'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz._id}
              className="flex flex-col justify-between gap-4 border-[3px] shadow-[6px_6px_0_#000000] hover:translate-y-[-2px] transition-transform"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge status={quiz.status} />
                  <span className="font-mono text-xs font-bold bg-[#FFF8E7] px-2 py-0.5 border border-black rounded">
                    {quiz.timeLimit} MINS
                  </span>
                </div>
                <div>
                  <h3 className="font-headline text-lg sm:text-xl uppercase font-bold text-black">
                    {quiz.title}
                  </h3>
                  <p className="font-body text-xs text-neutral-600 font-medium">
                    Subject: {quiz.subject}
                  </p>
                </div>

                <div className="bg-[#FFF8E7] border-2 border-black p-3 rounded flex flex-col gap-1 text-xs font-body">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 font-medium">Start:</span>
                    <span className="font-mono font-bold">
                      {new Date(quiz.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 font-medium">End:</span>
                    <span className="font-mono font-bold">
                      {new Date(quiz.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 font-medium">Questions:</span>
                    <span className="font-bold">{quiz.numberOfQuestions} questions</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-black flex items-center justify-between">
                {quiz.status === 'live' && (
                  <Button
                    variant="success"
                    size="md"
                    className="w-full"
                    onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                  >
                    <span>START QUIZ NOW</span>
                    <ArrowRight size={16} />
                  </Button>
                )}

                {quiz.status === 'upcoming' && (
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    disabled
                  >
                    UPCOMING AT {new Date(quiz.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Button>
                )}

                {quiz.status === 'completed' && (
                  <Button
                    variant="info"
                    size="md"
                    className="w-full"
                    onClick={() => navigate(`/student/result/att1`)}
                  >
                    VIEW RESULT
                  </Button>
                )}

                {quiz.status === 'closed' && (
                  <Button
                    variant="danger"
                    size="md"
                    className="w-full"
                    disabled
                  >
                    QUIZ CLOSED
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
