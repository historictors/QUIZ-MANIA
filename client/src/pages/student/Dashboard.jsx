import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Card, Badge, Button, Loader } from '../../components';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Play, Clock, BookOpen, CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalAvailable: 0,
    upcoming: 0,
    live: 0,
    completed: 0
  });
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchStudentData = async () => {
    try {
      const [dashRes, quizRes] = await Promise.all([
        API.get('/student/dashboard'),
        API.get('/student/quizzes')
      ]);

      if (dashRes.data?.success) setStats(dashRes.data.data);
      if (quizRes.data?.success) setQuizzes(quizRes.data.data);
    } catch (err) {
      toast.error('Failed to load student quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const filteredQuizzes = quizzes.filter((q) => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  if (loading) {
    return <Loader message="Loading assigned quizzes..." />;
  }

  const deptCode = user?.department?.code || (typeof user?.department === 'string' ? user?.department : 'CSE');

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="bg-[#FFDE59] border-[3px] border-black p-6 rounded nb-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-label text-xs uppercase font-bold bg-white px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0_#000000]">
            ACADEMIC SESSION
          </span>
          <h1 className="font-headline text-2xl sm:text-4xl font-bold uppercase tracking-tight text-black mt-2">
            WELCOME, {user?.name ? user.name.toUpperCase() : 'STUDENT'}!
          </h1>
          <p className="font-body text-sm font-medium text-black mt-1">
            Department: {deptCode} | Year: {user?.year || '1'} | Roll: {user?.rollNumber || 'N/A'}
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
          value={stats.totalAvailable}
          sublabel="Live now for your class"
          icon={Play}
          bg="bg-[#6BCB77]"
        />
        <StatCard
          label="Upcoming Quizzes"
          value={stats.upcoming}
          sublabel="Scheduled later"
          icon={Calendar}
          bg="bg-[#FFA94D]"
        />
        <StatCard
          label="Live Now"
          value={stats.live}
          sublabel="Requires immediate start"
          icon={Clock}
          bg="bg-[#FFDE59]"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
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
        {filteredQuizzes.length === 0 ? (
          <p className="font-body text-sm text-neutral-600 bg-white p-8 border-2 border-black rounded text-center">
            No quizzes found in this category.
          </p>
        ) : (
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
                      <span className="font-bold">{quiz.questionCount || 0} questions</span>
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
                      <span>START QUIZ</span>
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
                      NOT OPEN YET
                    </Button>
                  )}

                  {quiz.status === 'completed' && (
                    <Button
                      variant="info"
                      size="md"
                      className="w-full"
                      onClick={() => navigate(`/student/results`)}
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
                      CLOSED
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
