import React, { useEffect, useState } from 'react';
import {
    FaCalendarAlt,
    FaPlus,
    FaRedo,
    FaTrash,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GuideAvailability = () => {
    const { get, post, del, loading } = useApi();

    const [slots, setSlots] = useState([]);
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        status: 'available',
        reason: '',
    });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        const response = await get('/operations/guide-availability/', {}, false);
        setSlots(Array.isArray(response) ? response : response.results || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await post('/operations/guide-availability/', formData, true);
            setFormData({
                start_date: '',
                end_date: '',
                status: 'available',
                reason: '',
            });
            fetchSlots();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteSlot = async (slot) => {
        const confirmed = window.confirm('Delete this availability slot?');

        if (!confirmed) return;

        try {
            await del(`/operations/guide-availability/${slot.id}/`, true);
            setSlots((prev) => prev.filter((item) => item.id !== slot.id));
            toast.success('Availability deleted.');
        } catch (error) {
            toast.error('Failed to delete availability.');
        }
    };

    const badgeClass = (status) => {
        if (status === 'available') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (status === 'booked') return 'bg-blue-50 text-blue-700 border-blue-100';
        return 'bg-red-50 text-red-700 border-red-100';
    };

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="badge badge-primary mb-3">
                            Guide Calendar
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                            Guide Availability
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Mark available, unavailable, or booked dates for your guide group.
                        </p>
                    </div>

                    <button
                        onClick={fetchSlots}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-primary-700 shadow-soft hover:bg-primary-50"
                    >
                        <FaRedo />
                        Refresh
                    </button>
                </div>

                <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100"
                    >
                        <h2 className="mb-5 flex items-center gap-3 text-xl font-extrabold text-slate-900">
                            <FaPlus className="text-primary-600" />
                            Add Availability
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    required
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                >
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                    <option value="booked">Booked</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Reason / Note
                                </label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    rows="4"
                                    placeholder="Example: Eid vacation, already booked, available for Sylhet route..."
                                    className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                />
                            </div>

                            <button type="submit" className="btn-primary w-full">
                                Save Availability
                            </button>
                        </div>
                    </form>

                    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                        <h2 className="mb-5 flex items-center gap-3 text-xl font-extrabold text-slate-900">
                            <FaCalendarAlt className="text-primary-600" />
                            Calendar Slots
                        </h2>

                        {loading ? (
                            <LoadingSpinner />
                        ) : slots.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                                No availability added yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {slots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                                    >
                                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                            <div>
                                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${badgeClass(slot.status)}`}>
                                                    {slot.status}
                                                </span>

                                                <h3 className="mt-3 font-bold text-slate-900">
                                                    {slot.start_date} to {slot.end_date}
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {slot.reason || 'No note added'}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => deleteSlot(slot)}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
                                            >
                                                <FaTrash />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideAvailability;