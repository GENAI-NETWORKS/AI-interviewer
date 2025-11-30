import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Card from '../components/Card';
import Button from '../components/Button';

const StudentAssessment = () => {
    const navigate = useNavigate();
    const [domainsData, setDomainsData] = useState(null);
    const [domainKeys, setDomainKeys] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(true);

    const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentDetails, setStudentDetails] = useState(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [scoreData, setScoreData] = useState(null);

    // Break Time & Intro State
    const [isBreakTime, setIsBreakTime] = useState(false);
    const [isStartIntro, setIsStartIntro] = useState(false);
    const [breakTimer, setBreakTimer] = useState(10);
    const [showBreakMessage, setShowBreakMessage] = useState(false);

    // Global Timer State (60 minutes = 3600 seconds)
    const [totalTimer, setTotalTimer] = useState(3600);

    // Suggestion Panel State
    const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);

    // Anti-Cheat State
    const [isTerminated, setIsTerminated] = useState(() => localStorage.getItem('testTerminated') === 'true');
    const [terminationReason, setTerminationReason] = useState(() => localStorage.getItem('terminationReason') || '');
    const terminationProcessed = useRef(false);

    const [error, setError] = useState(null);
    const [warningMessage, setWarningMessage] = useState(null);

    // Initial data for seeding (Fallback)
    const INITIAL_DOMAINS = {
        Business: [
            { id: 'b1', question: "What is a USP?", options: ["Unique Selling Proposition", "Universal Sales Point", "Uniform Selling Price", "User Service Plan"], answer: 0 },
            { id: 'b2', question: "What is B2B?", options: ["Business to Business", "Back to Business", "Business to Buyer", "Buyer to Business"], answer: 0 },
            { id: 'b3', question: "What is ROI?", options: ["Return on Investment", "Rate of Interest", "Risk on Investment", "Return on Income"], answer: 0 },
            { id: 'b4', question: "What is a Stakeholder?", options: ["Anyone interested in the business", "Only shareholders", "Only employees", "Only customers"], answer: 0 },
            { id: 'b5', question: "What is SWOT?", options: ["Strengths, Weaknesses, Opportunities, Threats", "Sales, Work, Orders, Targets", "Strategy, Work, Organization, Team", "None of the above"], answer: 0 },
            { id: 'b6', question: "What is a Niche Market?", options: ["A small, specialized market", "A large international market", "A stock market", "A supermarket"], answer: 0 },
            { id: 'b7', question: "What is B2C?", options: ["Business to Consumer", "Business to Company", "Buyer to Consumer", "Back to Consumer"], answer: 0 },
            { id: 'b8', question: "What is a KPI?", options: ["Key Performance Indicator", "Key Process Index", "Key Product Info", "Key Person Interest"], answer: 0 },
            { id: 'b9', question: "What is Equity?", options: ["Ownership interest in a company", "A type of loan", "Employee salary", "Office equipment"], answer: 0 },
            { id: 'b10', question: "What is a Balance Sheet?", options: ["A financial statement of assets and liabilities", "A list of employees", "A marketing plan", "A sales report"], answer: 0 },
            { id: 'b11', question: "What is Cash Flow?", options: ["Movement of money in and out", "Profit only", "Loss only", "Bank balance"], answer: 0 },
            { id: 'b12', question: "What is a Target Audience?", options: ["Specific group of consumers", "Everyone", "Employees", "Competitors"], answer: 0 },
            { id: 'b13', question: "What is Branding?", options: ["Creating a unique image/name", "Selling products", "Hiring staff", "Accounting"], answer: 0 },
            { id: 'b14', question: "What is a Startup?", options: ["A newly established business", "A closing business", "A large corporation", "A government agency"], answer: 0 },
            { id: 'b15', question: "What is Outsourcing?", options: ["Hiring external parties for tasks", "Hiring internal staff", "Selling assets", "Buying shares"], answer: 0 },
            { id: 'b16', question: "What is a Merger?", options: ["Combining two companies", "Closing a company", "Splitting a company", "Firing employees"], answer: 0 },
            { id: 'b17', question: "What is Revenue?", options: ["Income from sales", "Profit", "Cost", "Tax"], answer: 0 },
            { id: 'b18', question: "What is Profit Margin?", options: ["Ratio of profit to revenue", "Total sales", "Total costs", "Employee count"], answer: 0 },
            { id: 'b19', question: "What is a Business Plan?", options: ["A document outlining goals and strategies", "A list of products", "A receipt", "A contract"], answer: 0 },
            { id: 'b20', question: "What is Liability?", options: ["Financial debt or obligation", "Asset", "Profit", "Income"], answer: 0 }
        ],
        Technical: [
            { id: 't1', question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], answer: 0 },
            { id: 't2', question: "Which language is used for styling?", options: ["HTML", "JQuery", "CSS", "XML"], answer: 2 },
            { id: 't3', question: "What is React?", options: ["A Library", "A Framework", "A Database", "A Server"], answer: 0 },
            { id: 't4', question: "What is Git?", options: ["Version Control System", "Programming Language", "Database", "Operating System"], answer: 0 },
            { id: 't5', question: "What is an API?", options: ["Application Programming Interface", "Apple Pie Ingredients", "Automated Program Instruction", "None of the above"], answer: 0 },
            { id: 't6', question: "What is JSON?", options: ["JavaScript Object Notation", "Java Source Open Network", "JavaScript Open Node", "Java System On Net"], answer: 0 },
            { id: 't7', question: "What is Node.js?", options: ["JavaScript Runtime", "A Database", "A Browser", "An Editor"], answer: 0 },
            { id: 't8', question: "What is SQL?", options: ["Structured Query Language", "Simple Question List", "System Query Logic", "Standard Queue Link"], answer: 0 },
            { id: 't9', question: "What is a Component in React?", options: ["Reusable UI piece", "A database table", "A server function", "A CSS class"], answer: 0 },
            { id: 't10', question: "What is State in React?", options: ["Data managed by component", "External database", "Global variable", "Static file"], answer: 0 },
            { id: 't11', question: "What is a Hook?", options: ["Function to use React features", "A fishing tool", "A CSS selector", "A database trigger"], answer: 0 },
            { id: 't12', question: "What is NPM?", options: ["Node Package Manager", "New Project Maker", "Node Program Module", "Net Protocol Map"], answer: 0 },
            { id: 't13', question: "What is DOM?", options: ["Document Object Model", "Data Object Mode", "Disk Operating Method", "Digital Order Map"], answer: 0 },
            { id: 't14', question: "What is CSS Grid?", options: ["Layout system", "Database", "Programming language", "Browser"], answer: 0 },
            { id: 't15', question: "What is Flexbox?", options: ["Layout model", "Animation tool", "Video player", "Audio codec"], answer: 0 },
            { id: 't16', question: "What is a Variable?", options: ["Container for data", "A constant", "A function", "A file"], answer: 0 },
            { id: 't17', question: "What is a Loop?", options: ["Repeating code block", "A circle", "A mistake", "A connection"], answer: 0 },
            { id: 't18', question: "What is an Array?", options: ["Collection of items", "A single number", "A string", "A function"], answer: 0 },
            { id: 't19', question: "What is a Function?", options: ["Block of reusable code", "A variable", "A file", "A comment"], answer: 0 },
            { id: 't20', question: "What is Debugging?", options: ["Fixing errors", "Writing code", "Deleting files", "Saving data"], answer: 0 }
        ],
        Mentorship: [
            { id: 'm1', question: "What is the role of a mentor?", options: ["Guide and advise", "Do the work for you", "Criticize only", "None of the above"], answer: 0 },
            { id: 'm2', question: "What is active listening?", options: ["Fully concentrating on what is being said", "Listening while doing other things", "Interrupting frequently", "Ignoring the speaker"], answer: 0 },
            { id: 'm3', question: "How to handle feedback?", options: ["Listen and improve", "Ignore it", "Argue back", "Quit"], answer: 0 },
            { id: 'm4', question: "What is networking?", options: ["Building professional relationships", "Connecting computers", "Social media browsing", "None of the above"], answer: 0 },
            { id: 'm5', question: "What is a soft skill?", options: ["Communication", "Coding", "Accounting", "Machine Operation"], answer: 0 },
            { id: 'm6', question: "What is empathy?", options: ["Understanding others' feelings", "Feeling sorry for someone", "Ignoring feelings", "Being angry"], answer: 0 },
            { id: 'm7', question: "What is time management?", options: ["Planning and controlling time", "Working all the time", "Wasting time", "Watching the clock"], answer: 0 },
            { id: 'm8', question: "What is leadership?", options: ["Guiding a team", "Bossing people around", "Doing everything alone", "Avoiding responsibility"], answer: 0 },
            { id: 'm9', question: "What is adaptability?", options: ["Adjusting to change", "Resisting change", "Complaining", "Quitting"], answer: 0 },
            { id: 'm10', question: "What is conflict resolution?", options: ["Solving disagreements", "Starting fights", "Ignoring problems", "Blaming others"], answer: 0 },
            { id: 'm11', question: "What is goal setting?", options: ["Defining objectives", "Dreaming", "Wishing", "Guessing"], answer: 0 },
            { id: 'm12', question: "What is motivation?", options: ["Drive to achieve", "Laziness", "Fear", "Anger"], answer: 0 },
            { id: 'm13', question: "What is teamwork?", options: ["Collaborating with others", "Working alone", "Competing", "Fighting"], answer: 0 },
            { id: 'm14', question: "What is professionalism?", options: ["Conduct and behavior", "Wearing a suit", "Being rich", "Being famous"], answer: 0 },
            { id: 'm15', question: "What is integrity?", options: ["Honesty and morals", "Lying", "Cheating", "Stealing"], answer: 0 },
            { id: 'm16', question: "What is critical thinking?", options: ["Analyzing objectively", "Guessing", "Believing everything", "Ignoring facts"], answer: 0 },
            { id: 'm17', question: "What is emotional intelligence?", options: ["Managing emotions", "Being emotional", "Ignoring emotions", "Being cold"], answer: 0 },
            { id: 'm18', question: "What is resilience?", options: ["Recovering from setbacks", "Giving up", "Crying", "Blaming"], answer: 0 },
            { id: 'm19', question: "What is self-awareness?", options: ["Knowing oneself", "Ignoring oneself", "Copying others", "Hiding"], answer: 0 },
            { id: 'm20', question: "What is career development?", options: ["Managing career growth", "Getting a job", "Retiring", "Quitting"], answer: 0 }
        ]
    };

    useEffect(() => {
        let isMounted = true;
        const fetchQuestions = async () => {
            try {
                const docRef = doc(db, 'config', 'questions');
                const docSnap = await getDoc(docRef);

                if (isMounted) {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Check if data is complete (has 20 questions per domain)
                        const isComplete = data.Business && data.Business.length >= 20 &&
                            data.Technical && data.Technical.length >= 20 &&
                            data.Mentorship && data.Mentorship.length >= 20;

                        if (isComplete) {
                            setDomainsData(data);
                            setDomainKeys(Object.keys(data));
                        } else {
                            console.log("Updating question bank with full 60-question set...");
                            // Data exists but is incomplete (old version) - Overwrite
                            await setDoc(docRef, INITIAL_DOMAINS);
                            setDomainsData(INITIAL_DOMAINS);
                            setDomainKeys(Object.keys(INITIAL_DOMAINS));
                        }
                    } else {
                        // Doesn't exist - seed
                        await setDoc(docRef, INITIAL_DOMAINS);
                        setDomainsData(INITIAL_DOMAINS);
                        setDomainKeys(Object.keys(INITIAL_DOMAINS));
                    }
                    setLoadingQuestions(false);
                }
            } catch (err) {
                console.error("Error fetching questions:", err);
                if (isMounted) {
                    // Fallback to local data if DB fails (e.g. permission error)
                    console.warn("Using local fallback data due to DB error");
                    setDomainsData(INITIAL_DOMAINS);
                    setDomainKeys(Object.keys(INITIAL_DOMAINS));
                    setError(null); // Clear error to allow proceeding
                    setLoadingQuestions(false);
                }
            }
        };

        fetchQuestions();

        // Failsafe timeout
        const timer = setTimeout(() => {
            if (isMounted) {
                setLoadingQuestions((prev) => {
                    if (prev) {
                        console.warn("Question fetching timed out");
                        return false;
                    }
                    return prev;
                });
            }
        }, 2000);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, []);

    const currentDomain = domainKeys[currentDomainIndex];
    const currentDomainQuestions = domainsData ? domainsData[currentDomain] : [];

    useEffect(() => {
        const details = localStorage.getItem('studentDetails');
        if (!details) {
            navigate('/');
            return;
        }
        try {
            setStudentDetails(JSON.parse(details));
        } catch (e) {
            console.error("Invalid student details", e);
            navigate('/');
        }

        // Restore state if available
        const savedState = localStorage.getItem('assessmentState');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                // Only restore if not terminated
                if (!localStorage.getItem('testTerminated')) {
                    setAnswers(parsedState.answers || {});
                    setCurrentDomainIndex(parsedState.currentDomainIndex || 0);
                    setCurrentQuestion(parsedState.currentQuestion || 0);
                    setTotalTimer(parsedState.totalTimer || 3600);
                }
            } catch (e) {
                console.error("Error parsing saved state", e);
            }
        }
    }, [navigate]);

    const startTest = () => {
        // Request fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error("Error attempting to enable full-screen mode:", err.message);
            });
        }

        setHasStarted(true);
        setIsStartIntro(true);
        setBreakTimer(10);

        const timer = setInterval(() => {
            setBreakTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsStartIntro(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Anti-Cheat: Fullscreen & Blur Detection
    useEffect(() => {
        if (!hasStarted || isTerminated || isFinished) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleTermination("Tab Switching / Minimized Window");
            }
        };

        const handleBlur = () => {
            handleTermination("Window Focus Lost");
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && hasStarted && !isTerminated && !isFinished) {
                handleTermination("Exited Fullscreen Mode");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [hasStarted, isTerminated, isFinished]);

    // Timer Effect
    useEffect(() => {
        if (!hasStarted || isTerminated || isFinished) return;

        const timer = setInterval(() => {
            setTotalTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTermination("Time Limit Exceeded");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [hasStarted, isTerminated, isFinished]);

    const handleTermination = async (reason) => {
        if (terminationProcessed.current) return;
        terminationProcessed.current = true;

        setIsTerminated(true);
        setTerminationReason(reason);
        localStorage.setItem('testTerminated', 'true');
        localStorage.setItem('terminationReason', reason);

        // Update status in Firestore if studentDetails exists
        if (studentDetails && studentDetails.email) {
            try {
                // We need to find the doc first or create a new one with terminated status
                // For simplicity, we'll just add a new record or you might want to update an existing one
                // Here we just add a record indicating termination
                const terminationData = {
                    ...studentDetails,
                    score: 0, // Or calculate partial score
                    domainScores: {},
                    answers: answers,
                    completedAt: serverTimestamp(),
                    status: 'terminated',
                    reason: reason
                };
                await addDoc(collection(db, 'assessments'), terminationData);
            } catch (e) {
                console.error("Error logging termination:", e);
            }
        }

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }

        navigate('/terminated');
    };

    // Format time helper
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    console.log("Render State:", {
        loadingQuestions,
        isTerminated,
        hasStarted,
        studentDetails: !!studentDetails,
        domainsData: !!domainsData,
        error
    });

    if (!studentDetails) {
        console.log("Rendering: Initializing...");
        return (
            <div className="min-h-screen flex-center">
                <div className="text-xl text-gray-500 animate-pulse">Initializing...</div>
            </div>
        );
    }

    if (loadingQuestions) {
        console.log("Rendering: Loading Assessment...");
        return (
            <div className="min-h-screen flex-center">
                <div className="text-2xl text-indigo-500 animate-pulse">Loading Assessment...</div>
            </div>
        );
    }

    if (isTerminated) {
        console.log("Rendering: Terminated");
        return (
            <div className="min-h-screen flex-center bg-slate-900">
                <div className="text-xl text-red-500 animate-pulse">Assessment Terminated. Redirecting...</div>
            </div>
        );
    }







    if (!hasStarted) {
        return (
            <div className="min-h-screen flex-center p-4">
                <Card className="w-full max-w-2xl animate-fade-in">
                    <h1 className="text-3xl font-bold text-center mb-6 text-gradient">Instructions (Read Carefully)
                    </h1>

                    <div className="space-y-4 mb-8 text-gray-300">
                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-white mb-2">1. Fullscreen Mode</h3>
                            <p className="text-sm">The test will be conducted in fullscreen mode. Exiting fullscreen will terminate the test.</p>
                        </div>

                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-white mb-2">2. No Tab Switching</h3>
                            <p className="text-sm">Switching tabs or minimizing the window is strictly prohibited and will result in immediate termination.</p>
                        </div>

                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-white mb-2">3. Focus</h3>
                            <p className="text-sm">Do not click outside the test window. Losing focus will terminate the test.</p>
                        </div>

                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-white mb-2">4. Mandatory Answering</h3>
                            <p className="text-sm">You must answer all questions in all domains before submitting.</p>
                        </div>

                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-white mb-2">5. Domain Knowledge</h3>
                            <p className="text-sm">The assessment covers three domains: Business, Technical, and Mentorship. You will proceed through them sequentially.</p>
                        </div>

                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-white mb-2">6. Time Limit</h3>
                            <p className="text-sm">You have a total of 60 minutes to complete the entire assessment. Manage your time wisely across all sections.</p>
                        </div>
                    </div>

                    <Button onClick={startTest} className="w-full">
                        I Understand, Start Test
                    </Button>
                </Card>
            </div>
        );
    }

    if (error || !domainsData || Object.keys(domainsData).length === 0) {
        return (
            <div className="min-h-screen flex-center p-4">
                <Card className="w-full max-w-md border-red-500 bg-red-900/10 text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-4">Connection Error</h2>
                    <p className="text-gray-300 mb-6">{error || "Failed to load assessment questions. Please check your connection."}</p>
                    <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 w-full">
                        Retry
                    </Button>
                </Card>
            </div>
        );
    }

    if (showSuggestionPanel) {
        return (
            <div className="min-h-screen flex-center p-4">
                <Card className="w-full max-w-md border-yellow-500/50 bg-yellow-900/10">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-yellow-500 mb-2">Suggestion</h2>
                        <p className="text-gray-300 mb-6">
                            You have not answered all questions. Since you cannot go back, you must start the assessment again.
                        </p>
                        <Button onClick={() => {
                            if (document.fullscreenElement) {
                                document.exitFullscreen().catch(() => { });
                            }
                            localStorage.removeItem('studentDetails');
                            localStorage.removeItem('assessmentState');
                            localStorage.removeItem('testTerminated');
                            localStorage.removeItem('terminationReason');
                            navigate('/');
                        }} className="bg-yellow-600 hover:bg-yellow-700 w-full">
                            Back to Home
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (warningMessage) {
        return (
            <div className="min-h-screen flex-center p-4">
                <Card className="w-full max-w-md border-orange-500 bg-orange-900/10 text-center">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-orange-500 mb-4">Attention Needed</h2>
                    <p className="text-gray-300 mb-6">{warningMessage}</p>
                    <Button onClick={() => setWarningMessage(null)} className="bg-orange-600 hover:bg-orange-700 w-full">
                        Okay, I'll Answer
                    </Button>
                </Card>
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className="min-h-screen flex-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-white animate-pulse">Submitting Assessment...</h2>
                    <p className="text-gray-400 mt-2">Please wait while we record your answers.</p>
                </div>
            </div>
        );
    }



    if (isStartIntro) {
        return (
            <div className="min-h-screen flex-center p-4">
                <Card className="w-full max-w-md animate-fade-in text-center">
                    <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex-center mx-auto mb-6 animate-pulse border-4 border-indigo-500/30">
                        <span className="text-4xl font-bold text-indigo-400">{breakTimer}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome!</h2>
                    <p className="text-gray-400 text-lg mb-4">
                        Starting <span className="text-indigo-400 font-semibold">{domainKeys[0]}</span> Domain...
                    </p>
                    <p className="text-lg text-indigo-300/80 italic animate-pulse text-center">
                        AI is cooking up your questions… wait a moment ✦
                    </p>
                </Card>
            </div>
        );
    }



    if (isBreakTime) {
        return (
            <div className="min-h-screen flex-center p-4">
                <Card className="w-full max-w-md animate-fade-in text-center">
                    <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex-center mx-auto mb-6 animate-pulse border-4 border-indigo-500/30">
                        <span className="text-4xl font-bold text-indigo-400">{breakTimer}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Take a Breath</h2>
                    {breakTimer > 7 ? (
                        <p className="text-gray-400 text-lg">
                            Moving to <span className="text-indigo-400 font-semibold">{domainKeys[currentDomainIndex]}</span> Domain...
                        </p>
                    ) : (
                        <p className="text-lg text-indigo-300/80 italic animate-pulse text-center">
                            Your questions are in the AI oven... Please wait ✦
                        </p>
                    )}
                </Card>
            </div>
        );
    }

    const question = currentDomainQuestions ? currentDomainQuestions[currentQuestion] : null;

    if (!question || !Array.isArray(question.options)) {
        return (
            <div className="min-h-screen flex-center p-4">
                <Card className="w-full max-w-md border-red-500 bg-red-900/10 text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-4">Data Error</h2>
                    <p className="text-gray-300 mb-6">
                        The question data seems corrupted or missing.
                        <br />
                        <span className="text-sm text-gray-500">
                            {question ? "Missing options" : "Question not found"}
                        </span>
                    </p>
                    <Button onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                    }} className="bg-red-600 hover:bg-red-700 w-full">
                        Reset & Return Home
                    </Button>
                </Card>
            </div>
        );
    }
    const handleOptionSelect = (optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [currentDomain]: {
                ...prev[currentDomain],
                [currentQuestion]: optionIndex
            }
        }));
    };

    const handleNext = () => {
        // Check if answered
        if (answers[currentDomain]?.[currentQuestion] === undefined) {
            setWarningMessage("Please answer the question before proceeding.");
            return;
        }

        if (currentQuestion < currentDomainQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Next Domain
            if (currentDomainIndex < domainKeys.length - 1) {
                setCurrentDomainIndex(prev => prev + 1);
                setCurrentQuestion(0);
                setIsBreakTime(true);
                setBreakTimer(10);
                const timer = setInterval(() => {
                    setBreakTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setIsBreakTime(false);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        } else if (currentDomainIndex > 0) {
            const prevDomain = domainKeys[currentDomainIndex - 1];
            setCurrentDomainIndex(prev => prev - 1);
            setCurrentQuestion(domainsData[prevDomain].length - 1);
        }
    };

    const handleSubmit = async () => {
        // Check if last question answered
        if (answers[currentDomain]?.[currentQuestion] === undefined) {
            setWarningMessage("Please answer the question before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Calculate Score
            let totalScore = 0;
            let domainScores = {};

            domainKeys.forEach(domain => {
                let domainScore = 0;
                const domainAnswers = answers[domain] || {};
                const questions = domainsData[domain];

                questions.forEach((q, idx) => {
                    if (domainAnswers[idx] === q.answer) {
                        domainScore++;
                    }
                });

                domainScores[domain] = domainScore;
                totalScore += domainScore;
            });

            const resultData = {
                ...studentDetails,
                score: totalScore,
                totalQuestions: 60,
                percentage: (totalScore / 60) * 100,
                domainScores,
                answers,
                completedAt: serverTimestamp(),
                status: 'completed'
            };

            await addDoc(collection(db, 'assessments'), resultData);

            // Save to local storage for the completion page
            localStorage.setItem('scoreData', JSON.stringify({
                score: totalScore,
                domainScores,
                totalQuestions: 60
            }));

            localStorage.removeItem('assessmentState');
            setIsFinished(true);
            navigate('/completed', {
                state: {
                    score: totalScore,
                    totalQuestions: 60,
                    percentage: (totalScore / 60) * 100,
                    domainScores,
                    studentDetails
                }
            });
        } catch (error) {
            console.error("Error submitting assessment:", error);
            setError("Failed to submit assessment. Please try again.");
            setIsSubmitting(false);
        }
    };

    const isLastQuestionInDomain = currentQuestion === currentDomainQuestions.length - 1;
    const isLastDomain = currentDomainIndex === domainKeys.length - 1;

    return (
        <div className="min-h-screen flex-center p-4">
            <Card className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-indigo-400 mb-1">{currentDomain} Domain</h2>
                        <p className="text-sm text-gray-400">Question {currentQuestion + 1}/{currentDomainQuestions.length}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white text-slate-900 font-mono font-bold text-2xl rounded-md shadow-lg px-3 py-2 min-w-[3.5rem] text-center tracking-widest">
                            {Math.floor(totalTimer / 60).toString().padStart(2, '0')}
                        </div>
                        <span className="text-white font-bold text-2xl animate-pulse">:</span>
                        <div className="bg-white text-slate-900 font-mono font-bold text-2xl rounded-md shadow-lg px-3 py-2 min-w-[3.5rem] text-center tracking-widest">
                            {(totalTimer % 60).toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-6">{question.question}</h3>
                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <div
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${answers[currentDomain] && answers[currentDomain][currentQuestion] === index
                                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                                    : 'border-slate-700 hover:border-slate-500 text-gray-300'
                                    }`}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between mt-8">
                    <Button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0 && currentDomainIndex === 0}
                        className={`bg-slate-700 hover:bg-slate-600 ${currentQuestion === 0 && currentDomainIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Previous
                    </Button>
                    {isLastQuestionInDomain && isLastDomain ? (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            {isLastQuestionInDomain ? `Next Domain: ${domainKeys[currentDomainIndex + 1]}` : 'Next'}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
    // Fallback for unknown state
    return (
        <div className="min-h-screen flex-center p-4">
            <Card className="w-full max-w-md border-yellow-500 bg-yellow-900/10 text-center">
                <h2 className="text-xl font-bold text-yellow-500 mb-4">State Error</h2>
                <p className="text-gray-300 mb-6">
                    Application is in an unknown state.
                    <br />
                    <span className="text-xs font-mono text-gray-500">
                        Details: {JSON.stringify({ loadingQuestions, isTerminated, hasStarted, hasData: !!domainsData })}
                    </span>
                </p>
                <Button onClick={() => window.location.reload()} className="bg-yellow-600 hover:bg-yellow-700 w-full">
                    Reload
                </Button>
            </Card>
        </div>
    );
};

export default StudentAssessment;
