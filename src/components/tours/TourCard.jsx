import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowRight,
    FaImage,
    FaLock,
    FaMoneyBillWave,
    FaStar,
    FaTag,
    FaUsers,
} from 'react-icons/fa';
import { formatCurrency, getStatusColor } from '../../utils/formatters';
import WishlistButton from '../engagement/WishlistButton';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || 'https://colo-ghuri-backend.onrender.com';

const TourCard = ({ tour }) => {
    const getImageUrl = () => {
        if (tour.cover_image_url) {
            return tour.cover_image_url.startsWith('http')
                ? tour.cover_image_url
                : `${SERVER_BASE_URL}${tour.cover_image_url}`;
        }

        if (tour.images && tour.images.length > 0) {
            const imgUrl = tour.images[0].image_url;
            return imgUrl?.startsWith('http') ? imgUrl : `${SERVER_BASE_URL}${imgUrl}`;
        }

        return 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';
    };

    const seatPercentage = tour.total_seats
        ? Math.min(100, Math.round((tour.available_seats / tour.total_seats) * 100))
        : 0;

    return (
        <div className="group card">
            <div className="relative h-60 overflow-hidden">
                <img
                    src={getImageUrl()}
                    alt={tour.tour_name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                        event.currentTarget.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/85 via-dark-950/20 to-transparent"></div>

                <div className="absolute right-4 top-4">
                    <WishlistButton
                        itemType="tour"
                        objectId={tour.tour_id}
                        initialWishlisted={tour.is_wishlisted}
                        size="icon"
                    />
                </div>

                <div className="absolute left-4 top-4 flex flex-col gap-2">
                    <span className={`badge shadow-lg ${getStatusColor(tour.status)}`}>
                        {tour.status}
                    </span>

                    {tour.discount_percentage > 0 && (
                        <span className="badge bg-red-500 text-white shadow-lg">
                            <FaTag />
                            {tour.discount_percentage}% OFF
                        </span>
                    )}
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="line-clamp-2 text-2xl font-extrabold text-white">
                        {tour.tour_name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-white/80">
                        {tour.description}
                    </p>
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2">
                    {tour.is_locked && (
                        <span className="badge bg-dark-900/80 text-white backdrop-blur">
                            <FaLock />
                            Completed
                        </span>
                    )}

                    {tour.images && tour.images.length > 0 && (
                        <span className="badge bg-white/20 text-white backdrop-blur">
                            <FaImage />
                            {tour.images.length}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5">
                <div className="mb-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-amber-50 p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                            <FaStar />
                            Rating
                        </div>
                        <p className="mt-1 font-bold text-amber-800">
                            {tour.rating_average || '0.0'}
                            <span className="ml-1 text-xs font-medium">
                                ({tour.review_count || 0})
                            </span>
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <FaUsers />
                            Seats
                        </div>
                        <p className="mt-1 font-bold text-slate-800">
                            {tour.available_seats} / {tour.total_seats}
                        </p>
                    </div>
                </div>

                <div className="mb-5">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-secondary-500"
                            style={{ width: `${seatPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="mb-5 flex items-end justify-between rounded-3xl bg-primary-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-700">
                        <FaMoneyBillWave />
                        Price
                    </div>

                    <div className="text-right">
                        {tour.discount_percentage > 0 && (
                            <p className="text-xs text-slate-400 line-through">
                                {formatCurrency(tour.price_per_person)}
                            </p>
                        )}

                        <p className="text-2xl font-extrabold text-primary-700">
                            {formatCurrency(tour.final_price)}
                        </p>
                        <p className="text-xs text-slate-500">
                            per person
                        </p>
                    </div>
                </div>

                <Link
                    to={`/tours/${tour.tour_id}`}
                    className="btn-primary w-full py-3 text-sm"
                >
                    View Details
                    <FaArrowRight />
                </Link>
            </div>
        </div>
    );
};

export default TourCard;