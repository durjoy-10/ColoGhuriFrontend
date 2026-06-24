import React, { useMemo, useState } from 'react';
import {
    FaCheckCircle,
    FaCreditCard,
    FaMoneyBillWave,
    FaPhoneAlt,
    FaSpinner,
    FaUsers,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import axios from '../../api/axios';

const BookingForm = ({ tour, onSuccess, onClose, onCancel }) => {
    const [numberOfTravellers, setNumberOfTravellers] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [paymentId, setPaymentId] = useState('');
    const [guideReference, setGuideReference] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const guideMembers = useMemo(() => {
        if (Array.isArray(guideGroup?.guides)) return guideGroup.guides;
        if (Array.isArray(tour?.guides)) return tour.guides;
        if (Array.isArray(tour?.guide_members)) return tour.guide_members;
        return [];
    }, [guideGroup, tour]);

    const guideGroupName =
        guideGroup?.guide_groupname ||
        guideGroup?.name ||
        tour?.guide_group_name ||
        'Guide Group';

    const guideGroupPhone =
        guideGroup?.phone_number ||
        guideGroup?.phone ||
        tour?.guide_group_phone ||
        tour?.guide_phone ||
        'Not provided';

    const finalPrice = Number(
        tour?.final_price ||
            tour?.finalPrice ||
            tour?.discount_price ||
            tour?.price ||
            0
    );

    const availableSeats = Number(
        tour?.available_seats ||
            tour?.availableSeats ||
            tour?.max_travellers ||
            0
    );

    const totalAmount = Number(numberOfTravellers || 1) * finalPrice;

    const isMobilePayment =
        paymentMethod === 'bkash' || paymentMethod === 'nagad';

    const isCashPayment = paymentMethod === 'cash';

    const formatCurrency = (amount) => {
        return `BDT ${Number(amount || 0).toLocaleString('en-BD')}`;
    };

    const getTourId = () => {
        return tour?.tour_id || tour?.id;
    };

    const getTourName = () => {
        return tour?.tour_name || tour?.name || tour?.title || 'Tour Package';
    };

    const getGuideLabel = (guide) => {
        return (
            guide?.name ||
            guide?.username ||
            guide?.full_name ||
            guide?.email ||
            'Guide Member'
        );
    };

    const getGuideValue = (guide) => {
        return String(
            guide?.guide_id ||
                guide?.id ||
                guide?.email ||
                guide?.username ||
                getGuideLabel(guide)
        );
    };

    const validateForm = () => {
        const travellerCount = Number(numberOfTravellers);

        if (!travellerCount || travellerCount < 1) {
            toast.error('Please enter valid number of travellers.');
            return false;
        }

        if (availableSeats > 0 && travellerCount > availableSeats) {
            toast.error(`Only ${availableSeats} seats are available.`);
            return false;
        }

        if (isMobilePayment && paymentId.trim().length < 6) {
            toast.error(
                `Please enter a valid ${paymentMethod.toUpperCase()} Transaction ID.`
            );
            return false;
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

        setSubmitting(true);

        try {
            await axios.post('/tours/book/', {
                tour: getTourId(),
                number_of_travellers: Number(numberOfTravellers),
                total_amount: totalAmount.toFixed(2),
                payment_method: paymentMethod,
                payment_id: isMobilePayment ? paymentId.trim() : '',
                guide_reference: isCashPayment ? guideReference.trim() : '',
                special_requests: specialRequests.trim(),
            });

            toast.success('Booking submitted successfully.');

            if (onSuccess) {
                onSuccess();
            }

            closeForm();
        } catch (error) {
            console.error('Booking submit error:', error);

            const data = error.response?.data;

            const message =
                data?.error ||
                data?.message ||
                data?.detail ||
                'Failed to submit booking.';

            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-secondary-50 p-4">
                <h3 className="text-lg font-extrabold text-gray-900">
                    {getTourName()}
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
                                This is the phone number of the guide group that
                                created this tour. Traveller can use this number
                                for payment or tour-related communication.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                    Number of Travellers
                </label>

                <div className="relative">
                    <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                        type="number"
                        min="1"
                        max={availableSeats || undefined}
                        value={numberOfTravellers}
                        onChange={(event) =>
                            setNumberOfTravellers(event.target.value)
                        }
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 pl-12 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                    Payment Method
                </label>

                <div className="grid grid-cols-3 gap-3">
                    <PaymentOption
                        label="bKash"
                        value="bkash"
                        selected={paymentMethod === 'bkash'}
                        onClick={() => {
                            setPaymentMethod('bkash');
                            setGuideReference('');
                        }}
                    />

                    <PaymentOption
                        label="Nagad"
                        value="nagad"
                        selected={paymentMethod === 'nagad'}
                        onClick={() => {
                            setPaymentMethod('nagad');
                            setGuideReference('');
                        }}
                    />

                    <PaymentOption
                        label="Cash"
                        value="cash"
                        selected={paymentMethod === 'cash'}
                        onClick={() => {
                            setPaymentMethod('cash');
                            setPaymentId('');
                        }}
                    />
                </div>
            </div>

            {isMobilePayment && (
                <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
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
                                After sending payment, enter the Transaction ID
                                below.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Transaction ID / Payment ID
                        </label>

                        <input
                            type="text"
                            value={paymentId}
                            onChange={(event) => setPaymentId(event.target.value)}
                            placeholder="Enter transaction ID"
                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            required
                        />
                    </div>
                </div>
            )}

            {isCashPayment && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
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
                                Traveller can pay directly to the guide group at
                                the start of the tour. Select or enter guide
                                reference for tracking.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Guide Reference
                        </label>

                        {guideMembers.length > 0 ? (
                            <select
                                value={guideReference}
                                onChange={(event) =>
                                    setGuideReference(event.target.value)
                                }
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                required
                            >
                                <option value="">Select guide reference</option>

                                {guideMembers.map((guide) => (
                                    <option
                                        key={getGuideValue(guide)}
                                        value={getGuideValue(guide)}
                                    >
                                        {getGuideLabel(guide)}
                                        {guide?.phone_number
                                            ? ` - ${guide.phone_number}`
                                            : ''}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={guideReference}
                                onChange={(event) =>
                                    setGuideReference(event.target.value)
                                }
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
                    placeholder="Any special request..."
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <SummaryRow
                    label="Price per person"
                    value={formatCurrency(finalPrice)}
                />
                <SummaryRow label="Travellers" value={numberOfTravellers || 1} />
                <div className="my-3 border-t border-gray-200" />
                <SummaryRow
                    label="Total Amount"
                    value={formatCurrency(totalAmount)}
                    bold
                />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={closeForm}
                    disabled={submitting}
                    className="flex-1 rounded-2xl border border-gray-300 px-5 py-3 font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
                >
                    {submitting ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <FaCheckCircle />
                            Submit Booking
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

const PaymentOption = ({ label, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`rounded-2xl border px-3 py-3 text-sm font-extrabold transition ${
            selected
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
    >
        {label}
    </button>
);

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
                bold
                    ? 'font-extrabold text-primary-700'
                    : 'font-bold text-gray-800'
            }`}
        >
            {value}
        </span>
    </div>
);

export default BookingForm;