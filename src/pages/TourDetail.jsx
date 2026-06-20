import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight,
    FaImages,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaStar,
    FaUsers,
} from 'react-icons/fa';

import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookingForm from '../components/tours/BookingForm';
import WishlistButton from '../components/engagement/WishlistButton';
import ReviewSection from '../components/engagement/ReviewSection';
import TourItineraryTimeline from '../components/tours/TourItineraryTimeline';
import { formatCurrency, getStatusColor } from '../utils/formatters';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || 'https://colo-ghuri-backend.onrender.com';

const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { get, loading } = useApi();
    const { user, isAuthenticated } = useAuth();

    const [tour, setTour] = useState(null);
    const [showBooking, setShowBooking] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    useEffect(() => {
        fetchTourDetails();
        window.scrollTo(0, 0);
    }, [id]);

    const normalizeImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${SERVER_BASE_URL}${url}`;
    };

    const fetchTourDetails = async () => {
        try {
            const data = await get(`/tours/${id}/`, {}, false);
            setTour(data);
        } catch (error) {
            console.error('Tour detail fetch error:', error);
        }
    };

    const handleBookNow = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/tours/${id}` } });
            return;
        }

        if (user?.role !== 'traveller') {
            alert('Only travellers can book tours.');
            return;
        }

        setShowBooking(true);
    };

    const images = useMemo(() => {
        if (!tour) return [];

        const imageList = [];

        if (tour.cover_image_url) {
            imageList.push({
                url: normalizeImageUrl(tour.cover_image_url),
                caption: 'Cover Image',
                isPrimary: true,
            });
        }

        if (tour.cover_image && !tour.cover_image_url) {
            imageList.push({
                url: normalizeImageUrl(tour.cover_image),
                caption: 'Cover Image',
                isPrimary: true,
            });
        }

        if (tour.images && tour.images.length > 0) {
            tour.images.forEach((image) => {
                const imageUrl = image.image_url || image.image;
                const normalizedUrl = normalizeImageUrl(imageUrl);

                if (normalizedUrl && !imageList.some((item) => item.url === normalizedUrl)) {
                    imageList.push({
                        url: normalizedUrl,
                        caption: image.caption || 'Tour Image',
                        isPrimary: image.is_primary,
                    });
                }
            });
        }

        if (imageList.length === 0) {
            imageList.push({
                url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
                caption: tour.tour_name,
                isPrimary: true,
            });
        }

        return imageList;
    }, [tour]);

    const hasImages = images.length > 0;
    const currentImage = hasImages ? images[currentImageIndex] : null;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const seatPercentage = tour?.total_seats
        ? Math.min(100, Math.round((tour.available_seats / tour.total_seats) * 100))
        : 0;

    if (loading && !tour) {
        return <LoadingSpinner />;
    }

    if (!tour) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Tour not found</h2>
                <Link to="/tours" className="btn-primary mt-6">
                    Back to Tours
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient">
            <section className="relative overflow-hidden bg-dark-950 pt-8">
                <div className="absolute inset-0">
                    <img
                        src={currentImage?.url}
                        alt={tour.tour_name}
                        className="h-full w-full object-cover opacity-45"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-950/85 to-primary-950/75"></div>
                </div>

                <div className="container-custom relative z-10 py-10">
                    <Link
                        to="/tours"
                        className="mb-6 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                    >
                        <FaArrowLeft />
                        Back to Tours
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <span className={`badge shadow-lg ${getStatusColor(tour.status)}`}>
                                    {tour.status}
                                </span>

                                {tour.discount_percentage > 0 && (
                                    <span className="badge bg-red-500 text-white">
                                        {tour.discount_percentage}% OFF
                                    </span>
                                )}
                            </div>

                            <h1 className="font-display text-4xl font-black leading-tight text-white md:text-6xl">
                                {tour.tour_name}
                            </h1>

                            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
                                {tour.description}
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-5 text-slate-200">
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-amber-300" />
                                    <span>
                                        {tour.rating_average || '0.0'} / 5.0 ({tour.review_count || 0} reviews)
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaUsers className="text-primary-300" />
                                    <span>
                                        {tour.available_seats} / {tour.total_seats} seats available
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-secondary-300" />
                                    <span>
                                        {tour.guide_group_details?.guide_groupname || 'Guide group'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-start lg:justify-end">
                            <WishlistButton
                                itemType="tour"
                                objectId={tour.tour_id}
                                initialWishlisted={tour.is_wishlisted}
                                showText
                                size="lg"
                                className="bg-white text-primary-800 hover:bg-primary-50"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <main className="container-custom -mt-4 pb-12">
                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-8">
                        <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-100">
                            <div className="relative h-[300px] bg-slate-900 md:h-[500px]">
                                {currentImage ? (
                                    <img
                                        src={currentImage.url}
                                        alt={currentImage.caption || tour.tour_name}
                                        className="h-full w-full cursor-pointer object-cover"
                                        onClick={() => setShowLightbox(true)}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="text-center text-slate-400">
                                            <FaImages className="mx-auto mb-3 text-6xl" />
                                            <p>No images available</p>
                                        </div>
                                    </div>
                                )}

                                {images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                                        >
                                            <FaChevronLeft />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </>
                                )}

                                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto bg-slate-50 p-4">
                                    {images.map((image, index) => (
                                        <button
                                            key={`${image.url}-${index}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                                                currentImageIndex === index
                                                    ? 'border-primary-600 ring-4 ring-primary-100'
                                                    : 'border-transparent hover:border-primary-300'
                                            }`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                            <span className="badge badge-primary mb-3">
                                About Tour
                            </span>

                            <h2 className="text-2xl font-extrabold text-slate-900">
                                About This Tour
                            </h2>

                            <p className="mt-4 whitespace-pre-line leading-8 text-slate-600">
                                {tour.description || 'No description available for this tour.'}
                            </p>
                        </div>

                        <TourItineraryTimeline destinations={tour.destinations || []} />

                        <ReviewSection
                            itemType="tour"
                            objectId={tour.tour_id}
                            title="Tour Reviews"
                        />
                    </div>

                    <aside>
                        <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                            <h3 className="mb-5 text-xl font-extrabold text-slate-900">
                                Tour Details
                            </h3>

                            <div className="mb-6 rounded-3xl bg-primary-50 p-5">
                                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-700">
                                    <FaMoneyBillWave />
                                    Price per person
                                </p>

                                <div className="flex flex-wrap items-end gap-2">
                                    <span className="text-4xl font-black text-primary-800">
                                        {formatCurrency(tour.final_price)}
                                    </span>

                                    {tour.discount_percentage > 0 && (
                                        <span className="mb-1 text-sm text-slate-500 line-through">
                                            {formatCurrency(tour.price_per_person)}
                                        </span>
                                    )}
                                </div>

                                {tour.discount_percentage > 0 && (
                                    <p className="mt-2 text-sm font-bold text-emerald-600">
                                        You save {tour.discount_percentage}%
                                    </p>
                                )}
                            </div>

                            <div className="mb-6 space-y-4">
                                <InfoBox
                                    icon={<FaUsers />}
                                    title="Available Seats"
                                    value={`${tour.available_seats} / ${tour.total_seats}`}
                                />

                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="font-bold text-slate-600">
                                            Seat availability
                                        </span>
                                        <span className="font-bold text-primary-700">
                                            {seatPercentage}%
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-secondary-500"
                                            style={{ width: `${seatPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <InfoBox
                                    icon={<FaStar />}
                                    title="Rating"
                                    value={`${tour.rating_average || '0.0'} / 5.0 (${tour.review_count || 0} reviews)`}
                                />

                                <InfoBox
                                    icon={<FaMapMarkerAlt />}
                                    title="Guide Group"
                                    value={tour.guide_group_details?.guide_groupname || 'Not available'}
                                />

                                <InfoBox
                                    icon={<FaCalendarAlt />}
                                    title="Duration"
                                    value={`${tour.destinations?.length || 0} day${tour.destinations?.length === 1 ? '' : 's'}`}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleBookNow}
                                disabled={tour.available_seats === 0 || tour.status !== 'upcoming'}
                                className="btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {tour.available_seats === 0
                                    ? 'Sold Out'
                                    : tour.status !== 'upcoming'
                                        ? 'Booking Closed'
                                        : 'Book Now'}
                            </button>

                            <p className="mt-3 text-center text-xs text-slate-500">
                                You can review this tour after completing a booking.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>

            {showLightbox && currentImage && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
                    onClick={() => setShowLightbox(false)}
                >
                    <button
                        onClick={() => setShowLightbox(false)}
                        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
                    >
                        ×
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    prevImage();
                                }}
                                className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            >
                                <FaChevronLeft />
                            </button>

                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    nextImage();
                                }}
                                className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            >
                                <FaChevronRight />
                            </button>
                        </>
                    )}

                    <div onClick={(event) => event.stopPropagation()}>
                        <img
                            src={currentImage.url}
                            alt={currentImage.caption}
                            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
                        />

                        <p className="mt-3 text-center text-sm text-slate-300">
                            {currentImageIndex + 1} of {images.length}
                        </p>
                    </div>
                </div>
            )}

            {showBooking && (
                <BookingForm
                    tour={tour}
                    onClose={() => setShowBooking(false)}
                    onSuccess={() => {
                        setShowBooking(false);
                        fetchTourDetails();
                    }}
                />
            )}
        </div>
    );
};

const InfoBox = ({ icon, title, value }) => {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="mt-0.5 text-primary-600">
                {icon}
            </div>

            <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {title}
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                    {value}
                </p>
            </div>
        </div>
    );
};

export default TourDetail;