import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const TerminatedStudent = () => {
    const navigate = useNavigate();
    const terminationReason = localStorage.getItem('terminationReason') || 'Test terminated due to violation.';

    useEffect(() => {
        // Push state to trap user
        window.history.pushState(null, null, window.location.href);

        const handlePopState = () => {
            window.history.pushState(null, null, window.location.href);
        };

        window.addEventListener('popstate', handlePopState);

        // Prevent refresh (standard browser warning)
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const handleAcknowledge = () => {
        // Optionally clear local storage or just navigate back to home
        // Clearing might allow them to try again if the backend doesn't block them, 
        // but for now we just redirect to home where they might be blocked again if they try.
        navigate('/');
    };

    return (
        <div className="min-h-screen flex-center p-4">
            <Card className="w-full max-w-md animate-fade-in border border-red-500/30 shadow-red-glow bg-red-900/20">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex-center mx-auto mb-4 border border-red-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
                    <p className="text-white text-lg font-medium mb-2">This candidate has been terminated.</p>
                    <p className="text-gray-400 text-sm mb-6">You cannot retake the assessment.</p>
                    <div className="bg-red-950/50 p-3 rounded mb-6 border border-red-500/20">
                        <p className="text-red-300 text-sm">Reason: {terminationReason}</p>
                    </div>
                    <Button onClick={handleAcknowledge} className="w-full bg-red-600 hover:bg-red-700 border-none">
                        Return to Home
                    </Button>

                </div>
            </Card>
        </div>
    );
};

export default TerminatedStudent;
