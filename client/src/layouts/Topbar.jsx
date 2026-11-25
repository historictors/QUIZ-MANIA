import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, Menu, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const Topbar = ({ onToggleSidebar }) => {
  const { role, user, switchRole } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleRoleChange = (e) => {
    const nextRole = e.target.value;
    switchRole(nextRole);
    toast(`Switched view to ${nextRole.toUpperCase()}`, {
      icon: '🔄',
      style: {
        border: '3px solid #000',
        borderRadius: '4px',
        fontWeight: 'bold',
        background: '#FFDE59',
        color: '#000'
      }
    });

    if (nextRole === 'student') navigate('/student');
    else if (nextRole === 'faculty') navigate('/faculty');
    else if (nextRole === 'admin') navigate('/admin');
  };

  return (
    <header className="bg-[#FFF8E7] border-b-[3px] border-black px-4 py-3 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-10 h-10 bg-white border-2 border-black rounded flex items-center justify-center shadow-[2px_2px_0_#000000] hover:bg-[#FFDE59] cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div
          onClick={() => {
            if (role === 'student') navigate('/student');
            else if (role === 'faculty') navigate('/faculty');
            else navigate('/admin');
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 bg-[#FFDE59] border-2 border-black rounded flex items-center justify-center shadow-[2px_2px_0_#000000]">
            <Sparkles size={18} className="text-black" />
          </div>
          <span className="font-headline text-lg sm:text-xl font-bold uppercase tracking-tight hidden sm:inline-block">
            CampusQuiz
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* TODO: REMOVE ROLE SWITCHER IN PRODUCTION - For demo navigation between layouts */}
        <div className="flex items-center gap-1.5 bg-[#FFE885] border-2 border-black px-2 py-1 rounded shadow-[2px_2px_0_#000000]">
          <span className="font-label text-xs uppercase font-bold hidden md:inline">
            Role:
          </span>
          <select
            value={role}
            onChange={handleRoleChange}
            className="font-label text-xs uppercase font-bold bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* User Chip */}
        <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5 rounded shadow-[2px_2px_0_#000000]">
          <div className="w-6 h-6 rounded-full bg-[#4D96FF] border border-black flex items-center justify-center text-xs font-bold font-label">
            {user?.name?.[0] || 'U'}
          </div>
          <span className="font-label text-xs sm:text-sm uppercase font-bold hidden sm:inline">
            {user?.name || 'User'}
          </span>
        </div>

        {/* Red Logout Button */}
        <button
          onClick={handleLogout}
          className="nb-btn px-3 py-1.5 bg-[#FF6B6B] hover:bg-[#FF8E8E] text-black font-label text-xs sm:text-sm uppercase font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">LOGOUT</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
