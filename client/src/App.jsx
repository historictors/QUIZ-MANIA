import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import AdminLayout from './layouts/AdminLayout';

// ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import QuizInstructions from './pages/student/QuizInstructions';
import QuizAttempt from './pages/student/QuizAttempt';
import QuizResult from './pages/student/QuizResult';
import MyResults from './pages/student/MyResults';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import MyQuizzes from './pages/faculty/MyQuizzes';
import QuizForm from './pages/faculty/QuizForm';
import QuizResults from './pages/faculty/QuizResults';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Faculty from './pages/admin/Faculty';
import Departments from './pages/admin/Departments';
import Students from './pages/admin/Students';

// 404
import NotFound from './pages/NotFound';

export const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: '3px solid #000',
            boxShadow: '4px 4px 0 #000',
            borderRadius: '4px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '13px',
            background: '#FFF8E7',
            color: '#000'
          }
        }}
      />

      <Routes>
        {/* Default route redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="quiz/:id" element={<QuizInstructions />} />
            <Route path="result/:id" element={<QuizResult />} />
            <Route path="results" element={<MyResults />} />
          </Route>
          {/* Quiz Taking / Attempt Route (Has NO Sidebar) */}
          <Route path="/student/quiz/:id/attempt" element={<QuizAttempt />} />
        </Route>

        {/* Protected Faculty Routes */}
        <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
          <Route path="/faculty" element={<FacultyLayout />}>
            <Route index element={<FacultyDashboard />} />
            <Route path="quizzes" element={<MyQuizzes />} />
            <Route path="quizzes/new" element={<QuizForm />} />
            <Route path="quizzes/:id/edit" element={<QuizForm />} />
            <Route path="quizzes/:id/results" element={<QuizResults />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="faculty" element={<Faculty />} />
            <Route path="departments" element={<Departments />} />
            <Route path="students" element={<Students />} />
          </Route>
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
