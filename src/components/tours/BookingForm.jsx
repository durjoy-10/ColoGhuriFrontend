import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCreditCard, FaMoneyBillWave, FaPhoneAlt, FaUsers } from 'react-icons/fa';

import axios from '../../api/axios';
import { useApi } from '../../hooks/useApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../utils/constants';

const BookingForm = ({ tour, onClose, onCancel, onSuccess }) => {
    const { post, loading } = useApi();

    const [numberOfTravellers, setNumberOfTravellers] = useState(1);
    const [specialRequests, setSpecialRequests] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [transactionId, setTransactionId] = useState('');
    const [guideReference, setGuideReference] = useState('');
    const [guideList, setGuideList] = useState([]);
    const [loadingGuides, setLoadingGuides] = useState(false);

    const closeForm = onClose || onCancel || (() => {});

    const guideGroup = useMemo(() => {
        if (tour?.guide_group_details && typeof tour.guide_group_details === 'object') {
            return tour.guide_group_details;
        }

        if (tour?.guide_group && typeof tour.guide_group === 'object') {
            return tour.guide_group;
        }

        return {};
    }, [tour]);

    const guideGroupName =
        guideGroup?.guide_groupname ||
        guideGroup?.name ||
        tour?.guide_group_name ||
        'Guide Group';

    const guideGroupPhone =
        guideGroup?.phone_number ||
        guideGroup?.phone ||
        tour?.phone_number ||
        tour?.guide_group_phone ||
        tour?.guide_phone ||
        'Not provided';

    const guideMembers = useMemo(() => {
        if (Array.isArray(guideGroup?.guides)) return guideGroup.guides;
        if (Array.isArray(tour?.guide_members)) return tour.guide_members;
        if (Array.isArray(tour?.guides)) return tour.guides;
        return [];
    }, [guideGroup, tour]);

    const tourId = tour?.tour_id || tour?.id;
    const tourName = tour?.tour_name || tour?.name || tour?.title || 'Tour Package';
    const finalPrice = Number(tour?.final_price || tour?.finalPrice || tour?.price_per_person || tour?.price || 0);
    const availableSeats = Number(tour?.available_seats || tour?.availableSeats || 0);
    const totalAmount = Number(numberOfTravellers || 1) * finalPrice;

    const isMobilePayment =
        paymentMethod === 'bkash' ||
        paymentMethod === 'nagad' ||
        paymentMethod === 'rocket';

    const isCashPayment = paymentMethod === 'cash';

    useEffect(() => {
        if (isCashPayment) {
            fetchGuideGroupMembers();
        }
    }, [paymentMethod, tourId]);

    const getGuideGroupId = () => {
        return (
            guideGroup?.guide_group_id ||
            guideGroup?.id ||
            tour?.guide_group_id ||
            (typeof tour?.guide_group === 'number' ? tour.guide_group : null)
        );
    };

    const fetchGuideGroupMembers = async () => {
        if (guideMembers.length > 0) {
            const formatted = guideMembers.map((guide) => ({
                id: guide.guide_id || guide.id || guide.user_id || guide.email || guide.username,
                name: guide.name || guide.full_name || guide.username || guide.email || 'Guide Member',
                username: guide.username || guide.email || guide.name || '',
                phone_number: guide.phone_number || guide.phone || '',
            }));

            setGuideList(formatted);
            return;
        }

        const guideGroupId = getGuideGroupId();

        if (!guideGroupId) {
            setGuideList([]);
            return;
        }

        setLoadingGuides(true);

        try {
            const response = await axios.get(`/guides/groups/${guideGroupId}/`);
            const guides = response.data?.guides || [];

            const activeGuides = guides
                .filter((guide) => guide.is_active !== false)
                .map((guide) => ({
                    id: guide.guide_id || guide.id || guide.user_id || guide.email || guide.username,
                    name: guide.name || guide.full_name || guide.username || guide.email || 'Guide Member',
                    username: guide.username || guide.email || guide.name || '',
                    phone_number: guide.phone_number || guide.phone || '',
                }));

            setGuideList(activeGuides);
        } catch (error) {
            console.error('Error fetching guides:', error);
            setGuideList([]);
        } finally {
            setLoadingGuides(false);
        }
    };

    const validateForm = () => {
        const travellers = Number(numberOfTravellers);

        if (!travellers || travellers < 1) {
            toast.error('Please enter a valid number of travellers.');
            return false;
        }

        if (availableSeats > 0 && travellers > availableSeats) {
            toast.error(`Only ${availableSeats} seats available.`);
            return false;
        }

        if (isMobilePayment) {
            if (!transactionId.trim()) {
                toast.error(`Please enter ${paymentMethod.toUpperCase()} Transaction ID.`);
                return false;
            }

            if (transactionId.trim().length < 6) {
                toast.error('Invalid Transaction ID.');
                return false;
            }
        }

        if (isCashPayment && !guideReference.trim()) {
            toast.error('Please select or enter a guide reference.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        const bookingData = {
            tour: tourId,
            number_of_travellers: Number(numberOfTravellers),
            total_amount: totalAmount.toFixed(2),
            special_requests: specialRequests.trim(),
            payment_method: paymentMethod,
            payment_id: isMobilePayment ? transactionId.trim() : '',
            guide_reference: isCashPayment ? guideReference.trim() : '',
        };

        try {
            await post('/tours/book/', bookingData, false);

            toast.success('Booking submitted successfully.');

            if (onSuccess) {
                onSuccess();
            } else {
                closeForm();
            }
        } catch (error) {
            console.error('Booking submit error:', error);

            const data = error.response?.data;

            toast.error(
                data?.error ||
                    data?.message ||
                    data?.detail ||
                    'Failed to submit booking.'
            );
        }
    };

    return (
        <Modal isOpen={true} onClose={closeForm} title="Book Tour" size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-secondary-50 p-4">
                    <h3 className="text-lg font-extrabold text-gray-900">
                        {tourName}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-gray-600">
                        Price per person: {formatCurrency(finalPrice)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Available seats: {availableSeats || 'Not specified'}
                    </p>

                    <div className="mt-4 rounded-2xl border border-primary-100 bg-white/90 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                                <FaPhoneAlt />
                            </div>

                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Guide Group Contact
                                </p>

                                <p className="mt-1 text-sm font-extrabold text-gray-900">
                                    {guideGroupName}
                                </p>

                                <p className="mt-1 text-base font-extrabold text-primary-700">
                                    📞 {guideGroupPhone}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    This is the phone number of the guide group that created this tour.
                                    Use this number for payment or tour-related communication.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                        Number of Travellers <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                        <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="number"
                            min="1"
                            max={availableSeats || undefined}
                            value={numberOfTravellers}
                            onChange={(event) => {
                                const value = Number(event.target.value);
                                setNumberOfTravellers(value > 0 ? value : 1);
                            }}
                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 pl-12 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                        Payment Method <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {PAYMENT_METHODS.map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => {
                                    setPaymentMethod(method);
                                    setTransactionId('');
                                    setGuideReference('');
                                }}
                                className={`rounded-2xl border px-3 py-3 text-sm font-extrabold capitalize transition ${
                                    paymentMethod === method
                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                {isMobilePayment && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                                <FaCreditCard />
                            </div>

                            <div className="flex-1">
                                <h4 className="font-extrabold text-gray-900">
                                    {paymentMethod.toUpperCase()} Payment Instruction
                                </h4>

                                <p className="mt-2 text-sm text-gray-600">
                                    Send money to this guide group number:
                                </p>

                                <p className="mt-1 text-lg font-extrabold text-primary-700">
                                    {guideGroupPhone}
                                </p>

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    After sending payment, enter the Transaction ID below.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Transaction ID / Payment ID <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                value={transactionId}
                                onChange={(event) => setTransactionId(event.target.value)}
                                placeholder={`Enter ${paymentMethod.toUpperCase()} transaction ID`}
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                required
                            />
                        </div>
                    </div>
                )}

                {isCashPayment && (
                    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white">
                                <FaMoneyBillWave />
                            </div>

                            <div className="flex-1">
                                <h4 className="font-extrabold text-gray-900">
                                    Cash Payment Instruction
                                </h4>

                                <p className="mt-2 text-sm font-semibold text-gray-700">
                                    Guide Group Phone: {guideGroupPhone}
                                </p>

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    Traveller can pay directly to the guide group at the start of the tour.
                                    Select or enter guide reference for tracking.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Guide Reference <span className="text-red-500">*</span>
                            </label>

                            {loadingGuides ? (
                                <div className="rounded-2xl border border-gray-300 bg-white p-3 text-sm text-gray-500">
                                    Loading guides...
                                </div>
                            ) : guideList.length > 0 ? (
                                <select
                                    value={guideReference}
                                    onChange={(event) => setGuideReference(event.target.value)}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                    required
                                >
                                    <option value="">Select a guide</option>

                                    {guideList.map((guide) => (
                                        <option
                                            key={guide.id || guide.username || guide.name}
                                            value={guide.username || guide.id || guide.name}
                                        >
                                            {guide.name}
                                            {guide.phone_number ? ` - ${guide.phone_number}` : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={guideReference}
                                    onChange={(event) => setGuideReference(event.target.value)}
                                    placeholder="Enter guide reference"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                    required
                                />
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                        Special Requests
                    </label>

                    <textarea
                        value={specialRequests}
                        onChange={(event) => setSpecialRequests(event.target.value)}
                        rows="3"
                        placeholder="Any special requirements?"
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <SummaryRow
                        label="Price per person"
                        value={formatCurrency(finalPrice)}
                    />
                    <SummaryRow
                        label="Number of travellers"
                        value={numberOfTravellers}
                    />
                    <div className="my-3 border-t border-gray-200" />
                    <SummaryRow
                        label="Total Amount"
                        value={formatCurrency(totalAmount)}
                        bold
                    />
                </div>

                <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={closeForm}
                        fullWidth
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        fullWidth
                    >
                        Confirm Booking
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

const SummaryRow = ({ label, value, bold = false }) => (
    <div className="flex items-center justify-between gap-4 py-1">
        <span
            className={`text-sm ${
                bold ? 'font-extrabold text-gray-900' : 'font-medium text-gray-500'
            }`}
        >
            {label}
        </span>

        <span
            className={`text-sm ${
                bold ? 'font-extrabold text-primary-700' : 'font-bold text-gray-800'
            }`}
        >
            {value}
        </span>
    </div>
);

export default BookingForm;