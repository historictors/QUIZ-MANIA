import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button } from '../../components';
import { mockDepartments } from '../../data/sampleData';
import { Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: 'dept1',
    year: '3'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.rollNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    toast.success('Registration successful! Please sign in.');
    navigate('/login');
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
                {mockDepartments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
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
            >
              <span>COMPLETE REGISTRATION</span>
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
