import React, { useEffect, useState } from 'react';
import {
    FaEnvelope,
    FaEye,
    FaRedo,
    FaSearch,
    FaTrash,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ContactMessages = () => {
    const { get, patch, del, loading } = useApi();

    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, [statusFilter]);

    const fetchMessages = async () => {
        try {
            const params = {};

            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;

            const response = await get('/operations/contact-messages/', params, false);
            setMessages(Array.isArray(response) ? response : response.results || []);
        } catch (error) {
            console.error('Fetch contact messages error:', error);
            toast.error('Failed to load contact messages.');
        }
    };

    const updateStatus = async (message, status) => {
        try {
            const updated = await patch(
                `/operations/contact-messages/${message.id}/`,
                { status },
                true
            );

            setMessages((prev) =>
                prev.map((item) => (item.id === message.id ? updated : item))
            );

            if (selectedMessage?.id === message.id) {
                setSelectedMessage(updated);
            }

            toast.success('Message status updated.');
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('Failed to update message.');
        }
    };

    const deleteMessage = async (message) => {
        const confirmed = window.confirm('Delete this contact message?');

        if (!confirmed) return;

        try {
            await del(`/operations/contact-messages/${message.id}/`, true);

            setMessages((prev) => prev.filter((item) => item.id !== message.id));

            if (selectedMessage?.id === message.id) {
                setSelectedMessage(null);
            }

            toast.success('Message deleted.');
        } catch (error) {
            console.error('Delete message error:', error);
            toast.error('Failed to delete message.');
        }
    };

    const statusClass = (status) => {
        if (status === 'new') return 'bg-blue-50 text-blue-700 border-blue-100';
        if (status === 'read') return 'bg-amber-50 text-amber-700 border-amber-100';
        if (status === 'replied') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        return 'bg-slate-50 text-slate-700 border-slate-100';
    };

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="badge badge-primary mb-3">
                            Admin Support
                        </span>

                        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                            Contact Messages
                        </h1>

                        <p className="mt-2 text-slate-600">
                            View messages submitted by travellers and guides.
                        </p>
                    </div>

                    <button
                        onClick={fetchMessages}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-primary-700 shadow-soft hover:bg-primary-50"
                    >
                        <FaRedo />
                        Refresh
                    </button>
                </div>

                <div className="mb-6 rounded-3xl bg-white p-5 shadow-soft">
                    <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name, email, subject, message..."
                                className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        >
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archived</option>
                        </select>

                        <button
                            onClick={fetchMessages}
                            className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
                    <div className="rounded-3xl bg-white shadow-soft ring-1 ring-slate-100">
                        {loading ? (
                            <LoadingSpinner />
                        ) : messages.length === 0 ? (
                            <div className="p-12 text-center">
                                <FaEnvelope className="mx-auto mb-4 text-5xl text-slate-300" />
                                <h3 className="text-xl font-bold text-slate-800">
                                    No messages found
                                </h3>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`cursor-pointer p-5 transition hover:bg-slate-50 ${
                                            selectedMessage?.id === message.id ? 'bg-primary-50/50' : ''
                                        }`}
                                        onClick={() => {
                                            setSelectedMessage(message);
                                            if (message.status === 'new') {
                                                updateStatus(message, 'read');
                                            }
                                        }}
                                    >
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                            <div>
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusClass(message.status)}`}>
                                                        {message.status}
                                                    </span>

                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                                                        {message.user_role || 'user'}
                                                    </span>
                                                </div>

                                                <h3 className="font-extrabold text-slate-900">
                                                    {message.subject}
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {message.name} · {message.email}
                                                </p>

                                                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                                    {message.message}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setSelectedMessage(message);
                                                    }}
                                                    className="rounded-xl bg-primary-50 p-2 text-primary-700 hover:bg-primary-100"
                                                >
                                                    <FaEye />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        deleteMessage(message);
                                                    }}
                                                    className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-xs text-slate-400">
                                            {new Date(message.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                        {selectedMessage ? (
                            <>
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusClass(selectedMessage.status)}`}>
                                            {selectedMessage.status}
                                        </span>

                                        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
                                            {selectedMessage.subject}
                                        </h2>

                                        <p className="mt-2 text-sm text-slate-500">
                                            From {selectedMessage.name} ({selectedMessage.email})
                                        </p>

                                        <p className="mt-1 text-xs capitalize text-primary-700">
                                            Role: {selectedMessage.user_role || 'user'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-5 rounded-3xl bg-slate-50 p-5">
                                    <p className="whitespace-pre-line leading-7 text-slate-700">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => updateStatus(selectedMessage, 'read')}
                                        className="w-full rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100"
                                    >
                                        Mark as Read
                                    </button>

                                    <button
                                        onClick={() => updateStatus(selectedMessage, 'replied')}
                                        className="w-full rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                                    >
                                        Mark as Replied
                                    </button>

                                    <button
                                        onClick={() => updateStatus(selectedMessage, 'archived')}
                                        className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
                                    >
                                        Archive
                                    </button>

                                    <button
                                        onClick={() => deleteMessage(selectedMessage)}
                                        className="w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
                                    >
                                        Delete Message
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                                <FaEnvelope className="mb-4 text-5xl text-slate-300" />
                                <h3 className="text-xl font-bold text-slate-800">
                                    Select a message
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Click any contact message to view full details.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactMessages;