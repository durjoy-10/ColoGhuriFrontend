import React, { useEffect, useState } from 'react';
import {
    FaClock,
    FaEnvelope,
    FaLock,
    FaMapMarkerAlt,
    FaPaperPlane,
    FaPhone,
    FaSpinner,
    FaUserCheck,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
    const { user, isAuthenticated, isAdmin } = useAuth();

    const [formData, setFormData] = useState({
        subject: '',
        message: '',
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to send a message.');
            return;
        }

        if (isAdmin || user?.role === 'admin') {
            toast.error('Admin users do not need to send contact messages.');
            return;
        }

        if (!['traveller', 'guide'].includes(user?.role)) {
            toast.error('Only traveller and guide users can send messages.');
            return;
        }

        if (!formData.subject.trim()) {
            toast.error('Please enter subject.');
            return;
        }

        if (!formData.message.trim()) {
            toast.error('Please enter your message.');
            return;
        }

        try {
            setSubmitting(true);

            const response = await axios.post('/operations/contact-messages/', {
                subject: formData.subject,
                message: formData.message,
            });

            toast.success(response.data?.message || 'Message sent successfully.');

            setFormData({
                subject: '',
                message: '',
            });
        } catch (error) {
            console.error('Contact message error:', error);

            const backendMessage =
                error.response?.data?.error ||
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Something went wrong while sending message.';

            toast.error(backendMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 text-center">
                    <span className="badge badge-primary mb-3">
                        Contact Support
                    </span>

                    <h1 className="text-4xl font-extrabold text-slate-900 md:text-5xl">
                        Contact Us
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                        Send your message and our admin team will review it from the admin panel.
                    </p>

                    {isAuthenticated && !isAdmin && user?.role !== 'admin' && (
                        <div className="mx-auto mt-5 flex max-w-xl items-center justify-center gap-3 rounded-3xl bg-primary-50 px-5 py-4 text-primary-800">
                            <FaUserCheck />
                            <p className="text-sm font-bold">
                                Sending as {user?.username} ({user?.role}) · {user?.email}
                            </p>
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div className="mx-auto mt-5 max-w-xl rounded-3xl bg-amber-50 px-5 py-4 text-amber-800">
                            <p className="text-sm font-bold">
                                Please login as traveller or guide to send a contact message.
                            </p>
                        </div>
                    )}

                    {isAuthenticated && (isAdmin || user?.role === 'admin') && (
                        <div className="mx-auto mt-5 max-w-xl rounded-3xl bg-slate-100 px-5 py-4 text-slate-700">
                            <p className="text-sm font-bold">
                                Admin users do not need this contact form. Please check messages from the admin panel.
                            </p>

                            <Link
                                to="/admin/contact-messages"
                                className="mt-3 inline-flex rounded-2xl bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700"
                            >
                                Open Contact Messages
                            </Link>
                        </div>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
                    <div className="space-y-6">
                        <ContactInfoCard
                            icon={<FaMapMarkerAlt />}
                            title="Address"
                            text="Dhaka, Bangladesh"
                        />

                        <ContactInfoCard
                            icon={<FaPhone />}
                            title="Phone"
                            text="+880 1234 567890"
                        />

                        <ContactInfoCard
                            icon={<FaEnvelope />}
                            title="Email"
                            text="info@cologhuri.com"
                        />

                        <ContactInfoCard
                            icon={<FaClock />}
                            title="Business Hours"
                            text="Mon-Fri: 9AM - 6PM | Sat: 10AM - 4PM"
                        />
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100 md:p-8">
                        <h2 className="mb-2 text-2xl font-extrabold text-slate-900">
                            Send us a Message
                        </h2>

                        <p className="mb-6 text-sm text-slate-500">
                            Your name and email will be taken automatically from your account.
                        </p>

                        {!isAuthenticated ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                                <FaLock className="mx-auto mb-4 text-5xl text-slate-300" />
                                <h3 className="text-xl font-bold text-slate-800">
                                    Login Required
                                </h3>
                                <p className="mt-2 text-slate-500">
                                    Traveller and guide users can send messages after login.
                                </p>

                                <Link to="/login" className="btn-primary mt-6">
                                    Login Now
                                </Link>
                            </div>
                        ) : isAdmin || user?.role === 'admin' ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                                <FaLock className="mx-auto mb-4 text-5xl text-slate-300" />
                                <h3 className="text-xl font-bold text-slate-800">
                                    Admin Contact Form Disabled
                                </h3>
                                <p className="mt-2 text-slate-500">
                                    Admin can view all submitted messages from the admin panel.
                                </p>

                                <Link to="/admin/contact-messages" className="btn-primary mt-6">
                                    View Messages
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Example: Booking issue, guide question, payment support..."
                                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">
                                        Your Message
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="8"
                                        placeholder="Write your message..."
                                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContactInfoCard = ({ icon, title, text }) => {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
            <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-50 text-xl text-primary-700">
                    {icon}
                </div>

                <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {text}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Contact;