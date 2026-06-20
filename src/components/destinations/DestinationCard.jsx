import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowRight,
    FaMapMarkerAlt,
    FaStar,
    FaTicketAlt,
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import WishlistButton from '../engagement/WishlistButton';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:8000';

const DestinationCard = ({ destination }) => {
    const getImageUrl = () => {
        if (destination.primary_image) {
            return destination.primary_image.startsWith('http')
                ? destination.primary_image
                : `${SERVER_BASE_URL}${destination.primary_image}`;
        }

        if (destination.images && destination.images.length > 0) {
            const imgUrl = destination.images[0].image_url || destination.images[0].image;
            return imgUrl?.startsWith('http') ? imgUrl : `${SERVER_BASE_URL}${imgUrl}`;
        }

        return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80';
    };

    return (
        <div className="group card">
            <div className="relative h-64 overflow-hidden">
                <img
                    src={getImageUrl()}
                    alt={destination.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    onError={(event) => {
                        event.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80';
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/85 via-dark-950/15 to-transparent"></div>

                <div className="absolute left-4 top-4">
                    <span className="badge bg-white/90 text-primary-800 backdrop-blur capitalize">
                        {destination.destination_type || 'Destination'}
                    </span>
                </div>

                <div className="absolute right-4 top-4">
                    <WishlistButton
                        itemType="destination"
                        objectId={destination.destination_id}
                        initialWishlisted={destination.is_wishlisted}
                        size="icon"
                    />
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="line-clamp-1 text-2xl font-extrabold text-white">
                        {destination.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                        <FaMapMarkerAlt className="text-secondary-300" />
                        <span className="line-clamp-1">{destination.location}</span>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="mb-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <FaStar className="text-amber-400" />
                            Rating
                        </div>
                        <p className="mt-1 font-bold text-dark-800">
                            {destination.average_rating || '0.0'}
                            <span className="ml-1 text-xs font-medium text-slate-400">
                                ({destination.total_reviews || 0})
                            </span>
                        </p>
                    </div>

                    <div className="rounded-2xl bg-primary-50 p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary-700">
                            <FaTicketAlt />
                            Entry Fee
                        </div>
                        <p className="mt-1 font-bold text-primary-800">
                            {formatCurrency(destination.entry_fee || 0)}
                        </p>
                    </div>
                </div>

                {destination.best_time_to_visit && (
                    <p className="mb-5 rounded-2xl bg-secondary-50 px-4 py-3 text-sm text-secondary-800">
                        Best time: <span className="font-semibold">{destination.best_time_to_visit}</span>
                    </p>
                )}

                <Link
                    to={`/destinations/${destination.destination_id}`}
                    className="btn-primary w-full py-3 text-sm"
                >
                    View Details
                    <FaArrowRight />
                </Link>
            </div>
        </div>
    );
};

export default DestinationCard;