import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Card from '../components/Card';

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showTerminatedModal, setShowTerminatedModal] = useState(false);
    const [terminatedStudents, setTerminatedStudents] = useState([]);
    const [totalStudentsCount, setTotalStudentsCount] = useState(0);
    const navigate = useNavigate();

    const fetchTerminatedStudents = async () => {
        try {
            // Note: Compound queries with orderBy might require an index. 
            // If it fails, we'll try without orderBy or handle the error.
            const q = query(collection(db, "assessments"), where("status", "==", "terminated"));
            const querySnapshot = await getDocs(q);
            const results = [];
            querySnapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            // Sort client-side if needed to avoid index issues for now
            results.sort((a, b) => {
                const timeA = a.completedAt?.seconds || a.timestamp?.seconds || 0;
                const timeB = b.completedAt?.seconds || b.timestamp?.seconds || 0;
                return timeB - timeA;
            });
            setTerminatedStudents(results);
            setShowTerminatedModal(true);
        } catch (error) {
            console.error("Error fetching terminated students: ", error);
            alert("Failed to fetch terminated students. Check console for details.");
        }
    };

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (!isAuthenticated) {
            navigate('/admin-login');
            return;
        }
        const fetchResults = async () => {
            try {
                const q = query(collection(db, "assessments"));
                const querySnapshot = await getDocs(q);
                setTotalStudentsCount(querySnapshot.size);
                const results = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.status !== 'terminated') {
                        const totalQuestions = data.totalQuestions || 60;
                        const percentage = data.percentage !== undefined ? data.percentage : ((data.score || 0) / totalQuestions) * 100;
                        results.push({ id: doc.id, ...data, totalQuestions, percentage });
                    }
                });
                // Sort client-side to avoid index issues
                results.sort((a, b) => (b.score || 0) - (a.score || 0));
                const rankedResults = results.map((student, index) => ({
                    ...student,
                    rank: index + 1
                }));
                setStudents(rankedResults);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex-center">
                <div className="text-2xl text-indigo-500 animate-pulse">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="container mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
                        <p className="text-gray-400">Monitor student performance and rankings</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                            <span className="text-gray-400">Total Students:</span>
                            <span className="ml-2 text-xl font-bold text-white">{totalStudentsCount}</span>
                        </div>
                        <button
                            onClick={fetchTerminatedStudents}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            Terminated Details
                        </button>
                        <button
                            onClick={() => navigate('/question-bank')}
                            className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/50 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2v6h-6"></path>
                                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                                <path d="M3 22v-6h6"></path>
                                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                            </svg>
                            Update
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('adminAuthenticated');
                                navigate('/admin-login');
                            }}
                            className="text-red-400 hover:text-red-300 p-2 rounded-full transition-colors"
                            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                            title="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </header>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700 text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-medium">Rank</th>
                                    <th className="p-4 font-medium">Student Name</th>
                                    <th className="p-4 font-medium">Email</th>
                                    <th className="p-4 font-medium">Mobile</th>
                                    <th className="p-4 font-medium">Department</th>
                                    <th className="p-4 font-medium">Year</th>
                                    <th className="p-4 font-medium">Score</th>
                                    <th className="p-4 font-medium">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className={`
                        w-8 h-8 flex-center rounded-full font-bold
                        ${student.rank === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                                                    student.rank === 2 ? 'bg-gray-400/20 text-gray-400 border border-gray-400/50' :
                                                        student.rank === 3 ? 'bg-orange-700/20 text-orange-700 border border-orange-700/50' :
                                                            'bg-slate-800 text-slate-400'}
                      `}>
                                                {student.rank}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-white">{student.name}</td>
                                        <td className="p-4 text-gray-300">{student.email || '-'}</td>
                                        <td className="p-4 text-gray-300">{student.mobile || '-'}</td>
                                        <td className="p-4 text-gray-300">{student.department}</td>
                                        <td className="p-4 text-gray-300">{student.year}</td>
                                        <td className="p-4 font-bold text-indigo-400">{student.score} / {student.totalQuestions}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                        style={{ width: `${student.percentage || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-400">{(student.percentage || 0).toFixed(0)}%</span>
                                                <button
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="ml-2 p-1 text-indigo-400 hover:text-indigo-300 rounded-full transition-colors bg-transparent hover:bg-transparent"
                                                    style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                                                    title="View Detailed Progress"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <line x1="12" y1="16" x2="12" y2="12" />
                                                        <line x1="12" y1="8" x2="12.01" y2="8" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-gray-500">
                                            No assessments submitted yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {selectedStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
                    <Card className="w-full max-w-2xl animate-fade-in overflow-hidden border border-indigo-500/30 shadow-glow" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-slate-800/50 p-6 border-b border-slate-700 flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">{selectedStudent.name}</h2>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                                        {selectedStudent.department}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-300">{selectedStudent.year}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-full bg-transparent hover:bg-transparent"
                                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                                Domain Performance Reports
                            </h3>

                            <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative">
                                <h4 className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-wider">Performance Distribution</h4>
                                <div className="flex justify-center gap-12 px-4 ml-8 mb-4">
                                    {['Business', 'Technical', 'Mentorship'].map((domain) => {
                                        // Check for various key formats
                                        const score = selectedStudent.domainScores?.[domain] ||
                                            selectedStudent.domainScores?.[domain.toLowerCase()] ||
                                            selectedStudent.domainScores?.[domain === 'Mentorship' ? 'mentor' : ''] ||
                                            0;
                                        const maxScore = 20;
                                        const percentage = (score / maxScore) * 100;
                                        return (
                                            <div key={domain} className="flex-1 text-center">
                                                <div className="text-white font-bold text-sm mb-1">{domain}</div>
                                                <div className="text-gray-400 text-xs">
                                                    Score: <span className="text-indigo-400 font-mono">{score}/{maxScore}</span>
                                                </div>
                                                <div className="text-gray-500 text-[10px] font-mono">({percentage.toFixed(0)}%)</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="h-56 flex items-end justify-center gap-12 relative px-4 ml-8">

                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-full border-t border-slate-700/30 h-0"></div>
                                        ))}
                                    </div>
                                    {['Business', 'Technical', 'Mentorship'].map((domain) => {
                                        // Check for various key formats
                                        const score = selectedStudent.domainScores?.[domain] ||
                                            selectedStudent.domainScores?.[domain.toLowerCase()] ||
                                            selectedStudent.domainScores?.[domain === 'Mentorship' ? 'mentor' : ''] ||
                                            0;
                                        const maxScore = 20;
                                        const percentage = (score / maxScore) * 100;
                                        const colors = {
                                            Business: { bg: 'bg-red-500', line: 'bg-red-400', shadow: 'shadow-red-glow' },
                                            Technical: { bg: 'bg-green-500', line: 'bg-green-400', shadow: 'shadow-green-glow' },
                                            Mentorship: { bg: 'bg-yellow-500', line: 'bg-yellow-400', shadow: 'shadow-yellow-glow' }
                                        };
                                        const colorConfig = colors[domain] || { bg: 'bg-teal-600', line: 'bg-teal-400', shadow: 'shadow-glow' };
                                        return (
                                            <div key={domain} className="w-20 h-full flex flex-col justify-end items-center relative group z-10">
                                                <div
                                                    className={`w-full rounded-t-md ${colorConfig.bg} transition-all duration-1000 ease-out relative`}
                                                    style={{ height: `${Math.max(percentage, 5)}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {showTerminatedModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex-center z-50 p-4" onClick={() => setShowTerminatedModal(false)}>
                    <Card className="w-full max-w-4xl animate-fade-in overflow-hidden border border-red-500/30 shadow-red-glow" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-red-900/20 p-6 border-b border-red-500/30 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                Terminated Students
                            </h2>
                            <button
                                onClick={() => setShowTerminatedModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-800/50 sticky top-0">
                                    <tr className="border-b border-slate-700 text-gray-400 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-medium">Name</th>
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium">Mobile</th>
                                        <th className="p-4 font-medium">Department</th>
                                        <th className="p-4 font-medium">Year</th>
                                        <th className="p-4 font-medium">Reason</th>
                                        <th className="p-4 font-medium">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {terminatedStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-red-500/10 transition-colors">
                                            <td className="p-4 font-medium text-white">{student.name}</td>
                                            <td className="p-4 text-gray-300">{student.email || '-'}</td>
                                            <td className="p-4 text-gray-300">{student.mobile || '-'}</td>
                                            <td className="p-4 text-gray-300">{student.department}</td>
                                            <td className="p-4 text-gray-300">{student.year}</td>
                                            <td className="p-4 text-red-400 font-medium">{student.reason}</td>
                                            <td className="p-4 text-gray-400 text-sm">
                                                {(student.completedAt?.seconds || student.timestamp?.seconds) ?
                                                    new Date((student.completedAt?.seconds || student.timestamp?.seconds) * 1000).toLocaleString()
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                    {terminatedStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-gray-500">
                                                No terminated students found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
