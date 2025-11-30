import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const AssessmentCompleted = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Try to get data from location state, otherwise fallback to localStorage
    let { score, totalQuestions, percentage, domainScores, studentDetails } = location.state || {};

    if (score === undefined) {
        const savedScoreData = localStorage.getItem('scoreData');
        const savedStudentDetails = localStorage.getItem('studentDetails');

        if (savedScoreData) {
            const parsedScoreData = JSON.parse(savedScoreData);
            score = parsedScoreData.score;
            totalQuestions = parsedScoreData.totalQuestions;
            percentage = (score / totalQuestions) * 100;
            domainScores = parsedScoreData.domainScores;
        }

        if (savedStudentDetails) {
            studentDetails = JSON.parse(savedStudentDetails);
        }
    }
    const [timeLeft, setTimeLeft] = useState(10);

    // Block navigation & Exit Fullscreen
    useEffect(() => {
        // Exit fullscreen immediately on mount
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log("Error exiting fullscreen:", err));
        }

        // Push state to trap user
        window.history.pushState(null, null, window.location.href);

        const handlePopState = () => {
            window.history.pushState(null, null, window.location.href);
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Auto redirect
    useEffect(() => {
        if (timeLeft === 0) {
            // Ensure fullscreen is exited before redirecting
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            navigate('/');
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, navigate]);

    return (
        <div className="min-h-screen flex-center p-4">
            <Card className="w-full max-w-2xl animate-fade-in text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex-center mx-auto mb-6 border-4 border-green-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                {score !== undefined ? (
                    <>
                        <h1 className="text-4xl font-bold text-gradient mb-2">Assessment Completed!</h1>
                        <p className="text-gray-400 mb-8 text-lg">
                            Great job, <span className="text-indigo-400 font-semibold">{studentDetails?.name}</span>! Your assessment has been submitted.
                        </p>

                        <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 border border-slate-700 backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="text-center border-r border-slate-700">
                                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Score</p>
                                    <p className="text-5xl font-bold text-white">{score} <span className="text-2xl text-gray-500">/ {totalQuestions}</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Percentage</p>
                                    <p className={`text-5xl font-bold ${percentage >= 70 ? 'text-green-400' : percentage >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {percentage.toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-500 text-sm animate-pulse">
                            Redirecting to home in {timeLeft} seconds...
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-red-500 mb-2">Access Denied</h1>
                        <p className="text-white text-lg font-medium mb-6">
                            Assessment already completed for this user.
                        </p>
                        <Button onClick={() => navigate('/')} className="bg-slate-700 hover:bg-slate-600">
                            Back to Home
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
};

export default AssessmentCompleted;
