import React, { useEffect, useState } from 'react';
import {
    FaClipboardList,
    FaRedo,
    FaSearch,
    FaUserShield,
} from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ActivityLogs = () => {
    const { get, loading } = useApi();

    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [actionType, setActionType] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [actionType]);

    const fetchLogs = async () => {
        const params = {};

        if (actionType) params.action_type = actionType;
        if (search) params.search = search;

        const response = await get('/operations/activity-logs/', params, false);
        setLogs(Array.isArray(response) ? response : response.results || []);
    };

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="badge badge-primary mb-3">
                            Admin Monitoring
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                            Activity Logs
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Track important system, admin, guide, booking, and email actions.
                        </p>
                    </div>

                    <button
                        onClick={fetchLogs}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-primary-700 shadow-soft hover:bg-primary-50"
                    >
                        <FaRedo />
                        Refresh
                    </button>
                </div>

                <div className="mb-6 rounded-3xl bg-white p-5 shadow-soft">
                    <div className="grid gap-4 md:grid-cols-[1fr_240px_auto]">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search logs..."
                                className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />
                        </div>

                        <select
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        >
                            <option value="">All Actions</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                            <option value="verify">Verify</option>
                            <option value="booking">Booking</option>
                            <option value="payment">Payment</option>
                            <option value="email">Email</option>
                            <option value="system">System</option>
                        </select>

                        <button
                            onClick={fetchLogs}
                            className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : logs.length === 0 ? (
                    <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
                        <FaClipboardList className="mx-auto mb-4 text-5xl text-slate-300" />
                        <h3 className="text-xl font-bold text-slate-800">
                            No logs found
                        </h3>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">Action</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">Actor</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">Description</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">Target</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">Time</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold capitalize text-primary-700">
                                                    {log.action_type}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-primary-600">
                                                        <FaUserShield />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">
                                                            {log.actor_name}
                                                        </p>
                                                        <p className="text-xs capitalize text-slate-500">
                                                            {log.actor_role}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">
                                                    {log.title}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {log.description}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {log.target_model || 'N/A'} #{log.target_id || ''}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;