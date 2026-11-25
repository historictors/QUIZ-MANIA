import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Card, Button, Loader } from '../../components';
import API from '../../services/api';
import { Users, GraduationCap, Building2, FileQuestion, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    faculty: 0,
    students: 0,
    departments: 0,
    quizzes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/admin/dashboard');
        if (res.data?.success && res.data?.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader message="Loading admin dashboard statistics..." />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Banner */}
      <div className="bg-[#4D96FF] border-[3px] border-black p-6 rounded nb-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-label text-xs uppercase font-bold bg-white px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0_#000000]">
            INSTITUTIONAL ADMINISTRATION
          </span>
          <h1 className="font-headline text-2xl sm:text-4xl font-bold uppercase tracking-tight text-black mt-2">
            ADMINISTRATOR DASHBOARD
          </h1>
          <p className="font-body text-sm font-medium text-black mt-1">
            Global oversight: Manage faculty appointments, academic departments & student rosters
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Faculty"
          value={stats.faculty}
          sublabel="Instructors & Professors"
          icon={Users}
          bg="bg-[#FFDE59]"
        />
        <StatCard
          label="Enrolled Students"
          value={stats.students}
          sublabel="Registered candidates"
          icon={GraduationCap}
          bg="bg-[#6BCB77]"
        />
        <StatCard
          label="Departments"
          value={stats.departments}
          sublabel="Academic faculties"
          icon={Building2}
          bg="bg-[#C9B6FF]"
        />
        <StatCard
          label="Active Quizzes"
          value={stats.quizzes}
          sublabel="Created across branches"
          icon={FileQuestion}
          bg="bg-[#FFA94D]"
        />
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between gap-4 border-[3px] shadow-[4px_4px_0_#000000]">
          <div>
            <h3 className="font-headline text-lg uppercase font-bold text-black flex items-center gap-2">
              <Users size={20} />
              FACULTY MANAGEMENT
            </h3>
            <p className="font-body text-xs text-neutral-600 mt-1">
              Add new professors, edit profiles, and assign academic branches.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/faculty')}
            className="w-full"
          >
            <span>MANAGE FACULTY</span>
            <ArrowRight size={16} />
          </Button>
        </Card>

        <Card className="flex flex-col justify-between gap-4 border-[3px] shadow-[4px_4px_0_#000000]">
          <div>
            <h3 className="font-headline text-lg uppercase font-bold text-black flex items-center gap-2">
              <Building2 size={20} />
              DEPARTMENTS
            </h3>
            <p className="font-body text-xs text-neutral-600 mt-1">
              Configure branch names, codes and monitor active usage.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/admin/departments')}
            className="w-full"
          >
            <span>MANAGE DEPARTMENTS</span>
            <ArrowRight size={16} />
          </Button>
        </Card>

        <Card className="flex flex-col justify-between gap-4 border-[3px] shadow-[4px_4px_0_#000000]">
          <div>
            <h3 className="font-headline text-lg uppercase font-bold text-black flex items-center gap-2">
              <GraduationCap size={20} />
              STUDENT ROSTER
            </h3>
            <p className="font-body text-xs text-neutral-600 mt-1">
              View registered students, filter by branch and batch year.
            </p>
          </div>
          <Button
            variant="info"
            size="md"
            onClick={() => navigate('/admin/students')}
            className="w-full"
          >
            <span>VIEW STUDENTS</span>
            <ArrowRight size={16} />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
