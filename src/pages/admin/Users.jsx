import React, { useEffect, useMemo, useState } from 'react';
import {
    FaEnvelope,
    FaPhone,
    FaSearch,
    FaTrash,
    FaUser,
    FaUserCheck,
    FaUserClock,
    FaUsers,
    FaRedo,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminUsers = () => {
    const { get, del, loading } = useApi();

    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [emailFilter, setEmailFilter] = useState('all');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const normalizeUsers = (res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.results)) return res.results;
        return [];
    };

    const fetchUsers = async () => {
        try {
            const res = await get('/users/users/', {}, false);
            setUsers(normalizeUsers(res));
            setError(null);
        } catch (err) {
            console.error('Users fetch error:', err);
            setError('Failed to load users.');
        }
    };

    const filteredUsers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !term ||
                user.username?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user.first_name?.toLowerCase().includes(term) ||
                user.last_name?.toLowerCase().includes(term) ||
                user.phone_number?.toLowerCase().includes(term);

            const matchesRole =
                roleFilter === 'all' || user.role === roleFilter;

            const matchesEmail =
                emailFilter === 'all' ||
                (emailFilter === 'verified' && user.email_verified) ||
                (emailFilter === 'unverified' && !user.email_verified);

            return matchesSearch && matchesRole && matchesEmail;
        });
    }, [users, searchTerm, roleFilter, emailFilter]);

    const counts = useMemo(() => {
        return {
            total: users.length,
            verified: users.filter((u) => u.email_verified).length,
            unverified: users.filter((u) => !u.email_verified).length,
            travellers: users.filter((u) => u.role === 'traveller').length,
            guides: users.filter((u) => u.role === 'guide').length,
            admins: users.filter((u) => u.role === 'admin').length,
        };
    }, [users]);

    const canDeleteUser = (user) => {
        if (!user) return false;
        if (user.is_superuser) return false;
        if (user.is_staff) return false;
        if (user.role === 'admin') return false;
        return true;
    };

    const handleDeleteUser = async (user) => {
        if (!canDeleteUser(user)) {
            toast.error('Admin, staff, or superuser accounts cannot be deleted.');
            return;
        }

        const displayName = user.username || user.email || `User ${user.id}`;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${displayName}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setDeletingId(user.id);
            await del(`/users/users/${user.id}/`, true);

            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            toast.success(`User "${displayName}" deleted successfully.`);
        } catch (err) {
            console.error('Delete user error:', err);
            const message =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                'Failed to delete user.';
            toast.error(message);
        } finally {
            setDeletingId(null);
        }
    };

    const roleBadgeClass = (role) => {
        if (role === 'admin') return 'bg-purple-50 text-purple-700 border-purple-100';
        if (role === 'guide') return 'bg-blue-50 text-blue-700 border-blue-100';
        if (role === 'traveller') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        return 'bg-slate-50 text-slate-700 border-slate-100';
    };

    if (loading && users.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="badge badge-primary mb-3">
                            User Management
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                            Manage Users
                        </h1>
                        <p className="mt-2 text-slate-600">
                            View all users and delete non-admin accounts when needed.
                        </p>
                    </div>

                    <button
                        onClick={fetchUsers}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-primary-700 shadow-soft transition hover:bg-primary-50"
                    >
                        <FaRedo />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="font-semibold text-red-700">{error}</p>
                        <button
                            onClick={fetchUsers}
                            className="mt-2 text-sm font-bold text-red-600 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-3xl bg-white p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500">All Users</p>
                                <p className="mt-1 text-3xl font-black text-slate-900">{counts.total}</p>
                            </div>
                            <FaUsers className="text-3xl text-primary-600" />
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Email Verified</p>
                                <p className="mt-1 text-3xl font-black text-emerald-700">{counts.verified}</p>
                            </div>
                            <FaUserCheck className="text-3xl text-emerald-600" />
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Email Unverified</p>
                                <p className="mt-1 text-3xl font-black text-orange-700">{counts.unverified}</p>
                            </div>
                            <FaUserClock className="text-3xl text-orange-600" />
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Role Breakdown</p>
                                <p className="mt-1 text-sm font-bold text-slate-700">
                                    {counts.travellers} travellers | {counts.guides} guides | {counts.admins} admins
                                </p>
                            </div>
                            <FaUser className="text-3xl text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-3xl bg-white p-5 shadow-soft">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search username, email, phone..."
                                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />
                        </div>

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        >
                            <option value="all">All Roles</option>
                            <option value="traveller">Traveller</option>
                            <option value="guide">Guide</option>
                            <option value="admin">Admin</option>
                        </select>

                        <select
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        >
                            <option value="all">All Email Status</option>
                            <option value="verified">Email Verified</option>
                            <option value="unverified">Email Unverified</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Email Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Joined
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="transition hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white shadow-md">
                                                        <FaUser />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">
                                                            {user.username}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'No full name'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="space-y-1 text-sm">
                                                    <p className="flex items-center gap-2 text-slate-700">
                                                        <FaEnvelope className="text-slate-400" />
                                                        {user.email || 'No email'}
                                                    </p>
                                                    <p className="flex items-center gap-2 text-slate-500">
                                                        <FaPhone className="text-slate-400" />
                                                        {user.phone_number || 'No phone'}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${roleBadgeClass(user.role)}`}>
                                                    {user.role || 'unknown'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                {user.email_verified ? (
                                                    <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {user.date_joined
                                                    ? new Date(user.date_joined).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={!canDeleteUser(user) || deletingId === user.id}
                                                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition ${
                                                        canDeleteUser(user)
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                                    }`}
                                                    title={
                                                        canDeleteUser(user)
                                                            ? 'Delete user'
                                                            : 'Admin/staff/superuser cannot be deleted'
                                                    }
                                                >
                                                    <FaTrash />
                                                    {deletingId === user.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <FaUsers className="mx-auto mb-4 text-5xl text-slate-300" />
                                            <h3 className="text-lg font-bold text-slate-700">
                                                No users found
                                            </h3>
                                            <p className="mt-1 text-slate-500">
                                                Try changing the search or filter options.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;