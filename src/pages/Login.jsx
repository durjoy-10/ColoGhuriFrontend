import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const message = location.state?.message;
        if (message) {
            toast.success(message);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
            toast.error('Please enter username and password');
            return;
        }
        
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);
        
        if (result.success) {
            navigate('/');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        
        if (!resetEmail) {
            toast.error('Please enter your email address');
            return;
        }
        
        setResetLoading(true);
        
        try {
            const response = await axios.post('/users/forgot-password/', { email: resetEmail });
            if (response.data.success) {
                setResetSent(true);
                toast.success(response.data.message || 'Password reset link sent to your email!');
            } else {
                toast.error(response.data.error || 'Failed to send reset link');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    if (showForgotPassword) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-8 text-center">
                        <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                        <p className="text-primary-100 mt-2">Enter your email to receive reset link</p>
                    </div>
                    
                    {resetSent ? (
                        <div className="p-6 text-center">
                            <div className="bg-green-50 rounded-lg p-4 mb-6">
                                <FaEnvelope className="text-green-500 text-4xl mx-auto mb-3" />
                                <p className="text-green-700 font-medium">Check Your Email</p>
                                <p className="text-sm text-green-600 mt-2">
                                    We've sent a password reset link to <strong>{resetEmail}</strong>
                                </p>
                                <p className="text-xs text-green-500 mt-3">
                                    Please check your inbox and click the link to reset your password.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setResetSent(false);
                                    setResetEmail('');
                                }}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                <FaArrowLeft /> Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="p-6 space-y-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Enter the email address you used to register.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={resetLoading}
                                className="w-full btn-primary py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {resetLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    className="text-primary-600 hover:underline text-sm flex items-center justify-center gap-1"
                                >
                                    <FaArrowLeft /> Back to Login
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-8 text-center">
                    <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                    <p className="text-primary-100 mt-2">Sign in to your account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Username or Email</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field pl-10"
                                placeholder="Enter your username or email"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-10 pr-10"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="text-right">
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-primary-600 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-lg disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="px-6 pb-6 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 hover:underline font-semibold">
                            Register here
                        </Link>
                    </p>
                    <p className="text-gray-500 text-sm mt-4">
                        <Link to="/guide-group-register" className="text-primary-600 hover:underline">
                            Register as Guide Group
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;