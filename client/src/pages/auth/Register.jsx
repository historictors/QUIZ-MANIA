import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button } from '../../components';
import API from '../../services/api';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: '',
    year: '1'
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Load departments from GET /api/departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await API.get('/departments');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setDepartments(res.data.data);
          if (res.data.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              department: res.data.data[0]._id
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
        toast.error('Failed to load departments from server');
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.password || !formData.rollNumber || !formData.department) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/student/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        rollNumber: formData.rollNumber.trim(),
        department: formData.department,
        year: Number(formData.year)
      });

      if (res.data?.success) {
        toast.success('Registration successful! Please sign in with your credentials.');
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-[#6BCB77] border-[3px] border-black rounded flex items-center justify-center shadow-[4px_4px_0_#000000] mb-1">
            <Sparkles size={32} className="text-black" />
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black">
            STUDENT REGISTRATION
          </h1>
          <p className="font-body text-sm font-medium text-neutral-700">
            JOIN CAMPUSQUIZ TO ACCESS LIVE TESTS & LEADERBOARDS
          </p>
        </div>

        {/* Form Card */}
        <Card className="flex flex-col gap-5 border-[3px] shadow-[6px_6px_0_#000000]">
          <div className="border-b-2 border-black pb-3">
            <h2 className="font-headline text-xl uppercase font-bold text-black">
              CREATE YOUR ACCOUNT
            </h2>
            <p className="font-body text-xs text-neutral-600">
              Only verified students can register for college assessments
            </p>
          </div>

          {/* Validation error box */}
          {errorMessage && (
            <div className="bg-[#FFD6D6] border-2 border-[#FF6B6B] p-3 rounded flex items-start gap-2.5 shadow-[2px_2px_0_#000000]">
              <AlertCircle size={18} className="text-[#FF6B6B] shrink-0 mt-0.5" />
              <p className="font-body text-xs text-black font-semibold">
                {errorMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Input
              id="name"
              label="Full Name"
              required
              placeholder="e.g. Arjun Verma"
              value={formData.name}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="email"
                type="email"
                label="College Email"
                required
                placeholder="name@college.com"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                id="rollNumber"
                label="Roll Number"
                required
                placeholder="e.g. 21CSE045"
                value={formData.rollNumber}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="department"
                label="Department"
                required
                value={formData.department}
                onChange={handleChange}
              >
                {departments.length === 0 ? (
                  <option value="">Loading departments...</option>
                ) : (
                  departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.code} - {d.name}
                    </option>
                  ))
                )}
              </Select>

              <Select
                id="year"
                label="Year of Study"
                required
                value={formData.year}
                onChange={handleChange}
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </Select>
            </div>

            <Input
              id="password"
              type="password"
              label="Password (min 6 chars)"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="success"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              <span>{loading ? 'CREATING ACCOUNT...' : 'COMPLETE REGISTRATION'}</span>
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="pt-3 border-t-2 border-black text-center">
            <p className="font-body text-xs text-neutral-700">
              Already registered?{' '}
              <Link
                to="/login"
                className="font-label font-bold text-black underline hover:text-[#4D96FF]"
              >
                SIGN IN HERE
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
