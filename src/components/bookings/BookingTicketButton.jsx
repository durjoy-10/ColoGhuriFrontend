import React from 'react';
import { FaFilePdf } from 'react-icons/fa';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const BookingTicketButton = ({ bookingId, className = '' }) => {
    const downloadTicket = async () => {
        try {
            const response = await axios.get(`/operations/bookings/${bookingId}/ticket/`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `colo-ghuri-booking-${bookingId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Ticket download error:', error);
            toast.error('Failed to download ticket.');
        }
    };

    return (
        <button
            type="button"
            onClick={downloadTicket}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 ${className}`}
        >
            <FaFilePdf />
            Ticket
        </button>
    );
};

export default BookingTicketButton;