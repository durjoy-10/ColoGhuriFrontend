import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { FaEnvelope, FaArrowLeft, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post('/users/forgot-password/', { email });
            if (response.data.success) {
                setSuccess(true);
            } else {
                setError(response.data.error || 'Failed to send reset link');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                    <p className="text-gray-600 mb-4">
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Please check your inbox and click the link to reset your password.
                    </p>
                    <Link to="/login" className="btn-primary inline-block">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-6">
                    <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
                    <p className="text-primary-100">Enter your email to reset your password</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-gray-700 mb-1">Email Address *</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-10"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" /> Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                    
                    <div className="text-center">
                        <Link to="/login" className="text-primary-600 hover:underline flex items-center justify-center gap-2">
                            <FaArrowLeft /> Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;