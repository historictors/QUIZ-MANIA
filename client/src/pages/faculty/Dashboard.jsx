import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Card, Table, Badge, Button } from '../../components';
import { mockQuizzes, mockCurrentUser } from '../../data/sampleData';
import { FileQuestion, Clock, CheckCircle, Users, PlusCircle, ArrowRight } from 'lucide-react';

export const FacultyDashboard = () => {
  const navigate = useNavigate();
  const faculty = mockCurrentUser.faculty;

  const totalQuizzes = mockQuizzes.length;
  const upcomingCount = mockQuizzes.filter((q) => q.status === 'upcoming').length;
  const liveCount = mockQuizzes.filter((q) => q.status === 'live').length;
  const closedCount = mockQuizzes.filter((q) => q.status === 'closed').length;
  const totalAttempts = mockQuizzes.reduce((acc, q) => acc + (q.attemptCount || 0), 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="bg-[#C9B6FF] border-[3px] border-black p-6 rounded nb-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-label text-xs uppercase font-bold bg-white px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0_#000000]">
            FACULTY MANAGEMENT CONSOLE
          </span>
          <h1 className="font-headline text-2xl sm:text-4xl font-bold uppercase tracking-tight text-black mt-2">
            HELLO, {faculty.name.toUpperCase()}!
          </h1>
          <p className="font-body text-sm font-medium text-black mt-1">
            Department: Computer Science and Engineering | Role: Course Instructor
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
          value={totalQuizzes}
          icon={FileQuestion}
          bg="bg-[#FFDE59]"
        />
        <StatCard
          label="Live Quizzes"
          value={liveCount}
          icon={Clock}
          bg="bg-[#6BCB77]"
        />
        <StatCard
          label="Upcoming"
          value={upcomingCount}
          icon={Clock}
          bg="bg-[#FFA94D]"
        />
        <StatCard
          label="Closed"
          value={closedCount}
          icon={CheckCircle}
          bg="bg-[#FF6B6B]"
        />
        <StatCard
          label="Student Attempts"
          value={totalAttempts}
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
          {mockQuizzes.map((quiz) => (
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
                {quiz.attemptCount}
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
                  onClick={() => navigate(`/faculty/quizzes/${quiz._id}/edit`)}
                >
                  EDIT
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
};

export default FacultyDashboard;
