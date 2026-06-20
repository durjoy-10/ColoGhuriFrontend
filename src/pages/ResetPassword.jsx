import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await axios.get(`/users/validate-reset-token/${token}/`);
            if (response.data.success) {
                setEmail(response.data.email);
                setError('');
            } else {
                setError(response.data.error || 'Invalid or expired reset link');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Invalid or expired reset link');
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post(`/users/reset-password/${token}/`, {
                new_password: password,
                confirm_password: confirmPassword
            });
            
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login', { 
                        state: { message: 'Password reset successfully! Please login with your new password.' }
                    });
                }, 3000);
            } else {
                setError(response.data.error || 'Failed to reset password');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-5xl text-primary-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Validating reset link...</h2>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your password has been reset successfully.
                    </p>
                    <div className="animate-pulse text-sm text-gray-500 mb-4">
                        Redirecting to login page...
                    </div>
                    <Link to="/login" className="btn-primary inline-block">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (error && !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Please request a new password reset link.
                    </p>
                    <Link to="/forgot-password" className="btn-primary inline-block">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-6">
                    <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                    <p className="text-primary-100">Create a new password for your account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}
                    
                    {email && (
                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                            Resetting password for: <strong>{email}</strong>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-gray-700 mb-1">New Password *</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-10 pr-10"
                                placeholder="Enter new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 mb-1">Confirm New Password *</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field pl-10 pr-10"
                                placeholder="Confirm new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-400"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" /> Resetting Password...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                    
                    <div className="text-center">
                        <Link to="/login" className="text-primary-600 hover:underline text-sm">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;