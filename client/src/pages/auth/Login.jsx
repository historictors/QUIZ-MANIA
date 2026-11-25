import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Input, Button } from '../../components';
import API from '../../services/api';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', {
        email: email.trim(),
        password
      });

      if (res.data?.success && res.data?.data) {
        const { user, token } = res.data.data;
        login(user, token);
        toast.success(`Welcome back, ${user.name}!`);

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'faculty') {
          navigate('/faculty');
        } else if (user.role === 'student') {
          navigate('/student');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sign in. Please verify your credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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

          {/* Red error box for API error messages */}
          {errorMessage && (
            <div className="bg-[#FFD6D6] border-2 border-[#FF6B6B] p-3 rounded flex items-start gap-2.5 shadow-[2px_2px_0_#000000]">
              <AlertCircle size={18} className="text-[#FF6B6B] shrink-0 mt-0.5" />
              <p className="font-body text-xs text-black font-semibold">
                {errorMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              id="login-email"
              type="email"
              label="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@college.com"
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
              disabled={loading}
            >
              <span>{loading ? 'SIGNING IN...' : 'SIGN IN'}</span>
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
      </div>
    </div>
  );
};

export default Login;
