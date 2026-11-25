import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Card, Table, Badge, Button, Loader } from '../../components';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileQuestion, Clock, CheckCircle, Users, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState({
    totalQuizzes: 0,
    upcoming: 0,
    live: 0,
    closed: 0,
    totalAttempts: 0,
    recentQuizzes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/faculty/dashboard');
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load faculty dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader message="Loading instructor dashboard..." />;
  }

  const deptName = user?.department?.name || 'Department';

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="bg-[#C9B6FF] border-[3px] border-black p-6 rounded nb-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-label text-xs uppercase font-bold bg-white px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0_#000000]">
            FACULTY MANAGEMENT CONSOLE
          </span>
          <h1 className="font-headline text-2xl sm:text-4xl font-bold uppercase tracking-tight text-black mt-2">
            HELLO, {user?.name ? user.name.toUpperCase() : 'PROFESSOR'}!
          </h1>
          <p className="font-body text-sm font-medium text-black mt-1">
            Department: {deptName} | Role: Course Instructor
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/faculty/quizzes/new')}
          className="shrink-0"
        >
          <PlusCircle size={18} />
          <span>CREATE NEW QUIZ</span>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Quizzes"
          value={data.totalQuizzes}
          icon={FileQuestion}
          bg="bg-[#FFDE59]"
        />
        <StatCard
          label="Live Quizzes"
          value={data.live}
          icon={Clock}
          bg="bg-[#6BCB77]"
        />
        <StatCard
          label="Upcoming"
          value={data.upcoming}
          icon={Clock}
          bg="bg-[#FFA94D]"
        />
        <StatCard
          label="Closed"
          value={data.closed}
          icon={CheckCircle}
          bg="bg-[#FF6B6B]"
        />
        <StatCard
          label="Student Attempts"
          value={data.totalAttempts}
          icon={Users}
          bg="bg-[#4D96FF]"
        />
      </div>

      {/* Recent Quizzes Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <h2 className="font-headline text-xl sm:text-2xl uppercase font-bold text-black">
            RECENTLY CREATED QUIZZES
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/faculty/quizzes')}
          >
            VIEW ALL QUIZZES
          </Button>
        </div>

        {data.recentQuizzes.length === 0 ? (
          <p className="font-body text-sm text-neutral-600 bg-white p-6 border-2 border-black rounded text-center">
            No quizzes created yet. Click "CREATE NEW QUIZ" to author your first assessment.
          </p>
        ) : (
          <Table
            headers={[
              'Quiz Title',
              'Subject',
              'Time Limit',
              'Attempts',
              'Status',
              'Actions'
            ]}
          >
            {data.recentQuizzes.map((quiz) => (
              <tr key={quiz._id} className="hover:bg-[#FFF8E7] transition-colors">
                <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                  {quiz.title}
                </td>
                <td className="p-3.5 text-neutral-700 whitespace-nowrap">
                  {quiz.subject}
                </td>
                <td className="p-3.5 font-mono text-sm whitespace-nowrap">
                  {quiz.timeLimit} mins
                </td>
                <td className="p-3.5 font-mono font-bold whitespace-nowrap">
                  {quiz.attemptCount || 0}
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <Badge status={quiz.status} />
                </td>
                <td className="p-3.5 whitespace-nowrap flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/faculty/quizzes/${quiz._id}/results`)}
                  >
                    RESULTS
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={quiz.attemptCount > 0}
                    title={quiz.attemptCount > 0 ? 'Locked: students have attempted' : 'Edit Quiz'}
                    onClick={() => navigate(`/faculty/quizzes/${quiz._id}/edit`)}
                  >
                    EDIT
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
