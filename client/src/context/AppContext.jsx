import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockCurrentUser } from '../data/sampleData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Roles: 'student' | 'faculty' | 'admin'
  const [role, setRole] = useState(() => {
    return localStorage.getItem('cq_role') || 'student';
  });

  const [user, setUser] = useState(mockCurrentUser[role]);

  useEffect(() => {
    localStorage.setItem('cq_role', role);
    setUser(mockCurrentUser[role]);
  }, [role]);

  const switchRole = (newRole) => {
    setRole(newRole);
  };

  return (
    <AppContext.Provider value={{ role, user, switchRole }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
