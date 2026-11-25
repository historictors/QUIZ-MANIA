import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import { LayoutDashboard, FileQuestion, PlusCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FacultyLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { label: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
    { label: 'My Quizzes', path: '/faculty/quizzes', icon: FileQuestion },
    { label: 'Create Quiz', path: '/faculty/quizzes/new', icon: PlusCircle }
  ];

  const deptName = user?.department?.name || (typeof user?.department === 'string' ? user?.department : 'Faculty Department');

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8E7]">
      <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 relative">
        {/* Mobile Drawer Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#C9B6FF] border-r-[3px] border-black p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <span className="font-label text-xs uppercase font-bold bg-white px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0_#000000]">
                FACULTY PORTAL
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center shadow-[2px_2px_0_#000000]"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/faculty'}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded font-label text-sm uppercase font-bold border-[3px] border-black flex items-center gap-3 transition-transform ${
                        isActive
                          ? 'bg-[#FFDE59] shadow-[4px_4px_0_#000000] translate-x-1'
                          : 'bg-white shadow-[3px_3px_0_#000000] hover:translate-x-1 hover:bg-[#FFE885]'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="bg-white border-2 border-black p-3 rounded shadow-[3px_3px_0_#000000] flex flex-col gap-1">
            <span className="font-label text-[11px] uppercase font-bold text-neutral-600">
              Department
            </span>
            <span className="font-body text-xs font-bold text-black truncate">
              {deptName}
            </span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
