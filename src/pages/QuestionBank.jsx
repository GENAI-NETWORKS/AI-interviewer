import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

// Initial data for seeding
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

const QuestionBank = () => {
    const navigate = useNavigate();
    const [domains, setDomains] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const docRef = doc(db, 'config', 'questions');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setDomains(docSnap.data());
                } else {
                    // Seed database if empty
                    await setDoc(docRef, INITIAL_DOMAINS);
                    setDomains(INITIAL_DOMAINS);
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleEdit = (question, domain) => {
        setEditingId(question.id);
        setEditForm({ ...question, domain });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm(null);
    };

    const handleSave = async () => {
        try {
            const updatedDomains = { ...domains };
            const domainQuestions = updatedDomains[editForm.domain];
            const index = domainQuestions.findIndex(q => q.id === editForm.id);

            if (index !== -1) {
                // Remove domain from editForm before saving
                const { domain, ...questionData } = editForm;
                domainQuestions[index] = questionData;

                await updateDoc(doc(db, 'config', 'questions'), updatedDomains);
                setDomains(updatedDomains);
                setEditingId(null);
                setEditForm(null);
            }
        } catch (error) {
            console.error("Error updating question:", error);
            alert("Failed to update question");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex-center">
                <div className="text-2xl text-indigo-500 animate-pulse">Loading Question Bank...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="container mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">Question Bank</h1>
                        <p className="text-gray-400">Review and edit assessment questions</p>
                    </div>
                    <Button onClick={() => navigate('/admin-dashboard')} className="bg-slate-700 hover:bg-slate-600">
                        Back to Dashboard
                    </Button>
                </header>

                <div className="space-y-8">
                    {domains && Object.entries(domains).map(([domain, questions]) => (
                        <Card key={domain} className="overflow-hidden">
                            <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <span className={`w-3 h-8 rounded-full ${domain === 'Business' ? 'bg-red-500' :
                                        domain === 'Technical' ? 'bg-green-500' :
                                            'bg-yellow-500'
                                        }`}></span>
                                    {domain} Domain
                                    <span className="text-sm font-normal text-gray-400 ml-auto">
                                        {questions.length} Questions
                                    </span>
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-700">
                                {questions.map((q, index) => (
                                    <div key={q.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                                        {editingId === q.id ? (
                                            <div className="space-y-4 animate-fade-in">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-indigo-400 font-bold">Editing Question {index + 1}</span>
                                                </div>
                                                <Input
                                                    label="Question"
                                                    value={editForm.question}
                                                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {editForm.options.map((opt, i) => (
                                                        <Input
                                                            key={i}
                                                            label={`Option ${i + 1}`}
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOptions = [...editForm.options];
                                                                newOptions[i] = e.target.value;
                                                                setEditForm({ ...editForm, options: newOptions });
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <label className="text-gray-400 text-sm">Correct Answer Index (0-3):</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="3"
                                                        value={editForm.answer}
                                                        onChange={(e) => setEditForm({ ...editForm, answer: parseInt(e.target.value) })}
                                                        className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white w-20"
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-2 mt-4">
                                                    <Button onClick={handleCancel} className="bg-slate-600 hover:bg-slate-500">
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-500">
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-4 group">
                                                <span className="text-gray-500 font-mono text-sm pt-1">
                                                    Q{index + 1}.
                                                </span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-medium text-white mb-3">{q.question}</h3>
                                                        <button
                                                            onClick={() => handleEdit(q, domain)}
                                                            className="text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                                            title="Edit Question"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {q.options.map((option, optIndex) => (
                                                            <div
                                                                key={optIndex}
                                                                className={`p-3 rounded-lg border text-sm ${optIndex === q.answer
                                                                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                                                                    : 'border-slate-700 text-gray-400'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-4 h-4 rounded-full border flex-center ${optIndex === q.answer
                                                                        ? 'border-green-500 bg-green-500 text-black'
                                                                        : 'border-slate-600'
                                                                        }`}>
                                                                        {optIndex === q.answer && (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    {option}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionBank;
