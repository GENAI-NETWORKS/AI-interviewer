import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

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

const StudentEntry = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        year: '',
        department: ''
    });

    const [terminationReason, setTerminationReason] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [initStatus, setInitStatus] = useState('');

    useEffect(() => {
        const checkMobile = () => {
            const minDim = Math.min(window.screen.width, window.screen.height);
            setIsMobile(minDim < 600);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Block navigation
    useEffect(() => {
        window.history.pushState(null, null, window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, null, window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Initialize Database Check
    useEffect(() => {
        const checkAndSeedDatabase = async () => {
            try {
                setInitStatus('Checking system...');
                const docRef = doc(db, 'config', 'questions');
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    setInitStatus('Initializing Question Bank...');
                    await setDoc(docRef, INITIAL_DOMAINS);
                    console.log("Database seeded successfully.");
                } else {
                    // Check if incomplete
                    const data = docSnap.data();
                    const isComplete = data.Business && data.Business.length >= 20;
                    if (!isComplete) {
                        setInitStatus('Updating Question Bank...');
                        await setDoc(docRef, INITIAL_DOMAINS);
                        console.log("Database updated successfully.");
                    }
                }
                setInitStatus('');
                setIsInitializing(false);
            } catch (error) {
                console.error("Initialization error:", error);
                // Fallback to offline mode
                setInitStatus('Offline Mode: Using local question bank.');
                setIsInitializing(false);
            }
        };

        checkAndSeedDatabase();
    }, []);

    if (isMobile) {
        return (
            <div className="min-h-screen flex-center p-4 bg-black text-white">
                <Card className="w-full max-w-md border-red-500 bg-red-900/20 text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-red-500 mb-2">Device Not Supported</h2>
                    <p className="text-gray-300">
                        Cannot be performed in mobile screen, only desktop version.
                    </p>
                </Card>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous assessment data
        localStorage.removeItem('scoreData');

        // Check if student already exists and is terminated or completed
        try {
            // Check by Email
            const emailQuery = query(
                collection(db, 'assessments'),
                where('email', '==', formData.email)
            );
            const emailSnapshot = await getDocs(emailQuery);

            // Check by Details (Name + Dept + Year)
            const detailsQuery = query(
                collection(db, 'assessments'),
                where('name', '==', formData.name),
                where('department', '==', formData.department),
                where('year', '==', formData.year)
            );
            const detailsSnapshot = await getDocs(detailsQuery);

            // Combine all found documents
            const allDocs = [...emailSnapshot.docs, ...detailsSnapshot.docs];

            let isTerminated = false;
            let isCompleted = false;
            let terminationReason = '';

            allDocs.forEach(doc => {
                const data = doc.data();
                if (data.status === 'terminated') {
                    isTerminated = true;
                    terminationReason = data.reason;
                } else if (data.status === 'completed' || data.score !== undefined) {
                    isCompleted = true;
                }
            });

            if (isTerminated) {
                // Redirect to terminated page
                if (terminationReason) {
                    localStorage.setItem('terminationReason', terminationReason);
                }
                navigate('/terminated');
                return;
            } else if (isCompleted) {
                // Save details so we can show name if needed (optional)
                localStorage.setItem('studentDetails', JSON.stringify(formData));
                navigate('/completed');
                return;
            }
        } catch (error) {
            console.error("Error checking student status:", error);
        }

        // Save to localStorage
        localStorage.setItem('studentDetails', JSON.stringify(formData));
        localStorage.removeItem('testTerminated');
        localStorage.removeItem('terminationReason');
        navigate('/assessment');
    };

    return (
        <div className="min-h-screen flex-center p-4">
            <Card className="w-full max-w-md animate-fade-in">
                <h1 className="text-3xl font-bold text-center mb-2 text-gradient">Welcome to Neural Gen-AI Networks</h1>
                <p className="text-center text-gray-400 mb-8">Enter your details to start the assessment</p>

                {initStatus && (
                    <div className="mb-4 p-3 bg-indigo-500/20 border border-indigo-500/50 rounded text-center text-indigo-300 animate-pulse text-sm">
                        {initStatus}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                    />

                    <Input
                        label="Email ID"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                    />

                    <Input
                        label="Mobile Number"
                        name="mobile"
                        type="tel"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="1234567890"
                        required
                    />

                    <Input
                        label="Year of Study"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="e.g. 3rd Year"
                        required
                    />

                    <Input
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. Computer Science"
                        required
                    />

                    <Button type="submit" className="w-full mt-6" disabled={isInitializing}>
                        {isInitializing ? 'System Initializing...' : 'Start Assessment'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default StudentEntry;
