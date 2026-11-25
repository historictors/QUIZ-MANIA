import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, Input, Button } from '../../components';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const [email, setEmail] = useState('arjun@college.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState('student');
  const { switchRole } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    switchRole(selectedRole);
    toast.success(`Welcome back! Logged in as ${selectedRole.toUpperCase()}`);

    if (selectedRole === 'student') navigate('/student');
    else if (selectedRole === 'faculty') navigate('/faculty');
    else if (selectedRole === 'admin') navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Logo / Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-[#FFDE59] border-[3px] border-black rounded flex items-center justify-center shadow-[4px_4px_0_#000000] mb-1">
            <Sparkles size={32} className="text-black" />
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black">
            CampusQuiz
          </h1>
          <p className="font-body text-sm font-medium text-neutral-700">
            TAKE QUIZZES. BEAT THE CLOCK.
          </p>
        </div>

        {/* Login Card */}
        <Card className="flex flex-col gap-5 border-[3px] shadow-[6px_6px_0_#000000]">
          <div className="border-b-2 border-black pb-3">
            <h2 className="font-headline text-xl uppercase font-bold text-black">
              Sign In
            </h2>
            <p className="font-body text-xs text-neutral-600">
              Single sign-on for students, faculty & administrators
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Role Selector Chip (for convenient testing of each role) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs uppercase font-bold text-black">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['student', 'faculty', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r);
                      if (r === 'student') setEmail('arjun@college.com');
                      else if (r === 'faculty') setEmail('sharma@college.com');
                      else if (r === 'admin') setEmail('admin@college.com');
                    }}
                    className={`py-1.5 px-2 border-2 border-black rounded font-label text-xs uppercase font-bold transition-transform cursor-pointer ${
                      selectedRole === r
                        ? 'bg-[#FFDE59] shadow-[2px_2px_0_#000000] -translate-y-0.5'
                        : 'bg-white hover:bg-neutral-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Input
              id="login-email"
              type="email"
              label="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@college.com"
            />

            <Input
              id="login-password"
              type="password"
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
            >
              <span>SIGN IN</span>
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="pt-3 border-t-2 border-black text-center">
            <p className="font-body text-xs text-neutral-700">
              New student?{' '}
              <Link
                to="/register"
                className="font-label font-bold text-black underline hover:text-[#4D96FF]"
              >
                REGISTER HERE
              </Link>
            </p>
          </div>
        </Card>

        {/* Notice Box */}
        <div className="bg-[#FFE885] border-2 border-black p-3 rounded shadow-[3px_3px_0_#000000] flex items-center gap-2.5">
          <ShieldCheck size={20} className="shrink-0 text-black" />
          <p className="font-body text-xs text-black">
            Demo Mode: Click any role button above to pre-fill test credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
