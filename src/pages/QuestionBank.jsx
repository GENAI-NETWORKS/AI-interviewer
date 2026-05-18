import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestions, saveQuestions } from '../firebaseConfig';
import { INITIAL_DOMAINS } from '../data/questions';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const FormattedQuestion = ({ text }) => {
    if (!text) return null;

    const languageMarker = /(python|javascript|js|sql)\s*:/i;
    const match = text.match(languageMarker);

    if (match) {
        const index = match.index;
        const textPart = text.substring(0, index);
        const codePart = text.substring(index + match[0].length).trim();

        let language = match[1].toLowerCase();
        let displayLabel = "Code Snippet";

        if (language === 'python') {
            displayLabel = "Python Snippet";
        } else if (language === 'javascript' || language === 'js') {
            language = 'javascript';
            displayLabel = "JavaScript Snippet";
        } else if (language === 'sql') {
            displayLabel = "SQL Query";
        }

        return (
            <div className="w-full">
                {textPart && (
                    <div className="text-xl font-medium text-white leading-loose font-mono tracking-wide mb-4 whitespace-pre-wrap">
                        {textPart}
                    </div>
                )}
                {codePart && (
                    <div className="rounded-lg overflow-hidden border border-slate-700 shadow-lg my-2">
                        <div className="bg-slate-900 px-3 py-1 text-xs font-mono text-indigo-400 border-b border-slate-700 flex justify-between items-center">
                            <span>{displayLabel}</span>
                        </div>
                        <SyntaxHighlighter
                            language={language}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, padding: '1rem', fontSize: '0.9rem', lineHeight: '1.5', background: '#0f172a' }}
                            showLineNumbers={false}
                            wrapLines={true}
                        >
                            {codePart}
                        </SyntaxHighlighter>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className="text-xl md:text-2xl font-medium text-white leading-loose font-mono tracking-wide"
            style={{ whiteSpace: 'pre-wrap' }}
        >
            {text}
        </div>
    );
};

// INITIAL_DOMAINS is imported from '../data/questions'



const QuestionBank = () => {
    const navigate = useNavigate();
    const [domains, setDomains] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const result = await getQuestions();

                if (result.exists && result.data) {
                    setDomains(result.data);
                } else {
                    // Seed database if empty
                    await saveQuestions(INITIAL_DOMAINS);
                    setDomains(INITIAL_DOMAINS);
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
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
                const { domain: _domain, ...questionData } = editForm;
                domainQuestions[index] = questionData;

                await saveQuestions(updatedDomains);
                setDomains(updatedDomains);
                setEditingId(null);
                setEditForm(null);
            }
        } catch (error) {
            console.error('Error updating question:', error);
            alert('Failed to update question');
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
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Question</label>
                                                    <textarea
                                                        value={editForm.question}
                                                        onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                                                        className="w-full bg-white border border-black rounded-lg px-4 py-3 text-black text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[300px] font-mono leading-relaxed"
                                                        placeholder="Enter question text..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {editForm.options.map((opt, i) => (
                                                        <div key={i} className="mb-4">
                                                            <label className="block text-sm font-medium text-gray-300 mb-1">Option {i + 1}</label>
                                                            <textarea
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const newOptions = [...editForm.options];
                                                                    newOptions[i] = e.target.value;
                                                                    setEditForm({ ...editForm, options: newOptions });
                                                                }}
                                                                className="w-full bg-white border border-black rounded-lg px-4 py-3 text-black text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[80px] font-mono leading-relaxed"
                                                                placeholder={`Enter option ${i + 1}...`}
                                                            />
                                                        </div>
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
                                            <div className="group">
                                                <div className="w-full mb-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-inner relative">
                                                    <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                                                        <span className="text-indigo-400 font-mono text-sm font-bold tracking-wider">
                                                            QUESTION {index + 1}
                                                        </span>
                                                        <button
                                                            onClick={() => handleEdit(q, domain)}
                                                            className="text-slate-400 hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                                                            title="Edit Question"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <div className="mb-8">
                                                        <FormattedQuestion text={q.question} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {q.options.map((option, optIndex) => (
                                                            <div
                                                                key={optIndex}
                                                                className={`p-4 rounded-lg border text-sm transition-colors ${optIndex === q.answer
                                                                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                                                                    : 'border-slate-700 bg-slate-900/30 text-gray-400'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`w-5 h-5 rounded-full border flex-center mt-0.5 shrink-0 ${optIndex === q.answer
                                                                        ? 'border-green-500 bg-green-500 text-black'
                                                                        : 'border-slate-600'
                                                                        }`}>
                                                                        {optIndex === q.answer && (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <span className="font-mono whitespace-pre-wrap leading-relaxed">{option}</span>
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
