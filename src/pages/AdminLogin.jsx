import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Updated credentials as requested
        if (credentials.username === 'genai@test' && credentials.password === 'neural@8') {
            localStorage.setItem('adminAuthenticated', 'true');
            navigate('/admin-dashboard');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="min-h-screen flex-center p-4">
            <Card className="w-full max-w-md animate-fade-in">
                <h1 className="text-3xl font-bold text-center mb-6 text-gradient">Admin Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                    />

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full mt-6">
                        Login
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default AdminLogin;
