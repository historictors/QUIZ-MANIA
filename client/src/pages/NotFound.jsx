import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col justify-center items-center p-4">
      <Card className="max-w-md w-full text-center flex flex-col items-center gap-4 border-[3px] shadow-[6px_6px_0_#000000]">
        <div className="w-16 h-16 bg-[#FF6B6B] border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_#000000]">
          <AlertTriangle size={32} className="text-black" />
        </div>
        <span className="font-mono text-4xl sm:text-6xl font-black text-black">
          404
        </span>
        <h1 className="font-headline text-xl sm:text-2xl font-bold uppercase text-black">
          PAGE NOT FOUND
        </h1>
        <p className="font-body text-sm text-neutral-600">
          The requested URL path does not exist on the CampusQuiz assessment system.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/login')}
          className="mt-2 w-full"
        >
          <Home size={18} />
          <span>RETURN TO SIGN IN</span>
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;
