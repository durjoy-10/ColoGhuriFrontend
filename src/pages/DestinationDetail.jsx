import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    FaArrowLeft,
    FaClock,
    FaImages,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaStar,
    FaTicketAlt,
} from 'react-icons/fa';

import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WishlistButton from '../components/engagement/WishlistButton';
import ReviewSection from '../components/engagement/ReviewSection';
import MapView from '../components/maps/MapView';
import { formatCurrency } from '../utils/formatters';

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || 'https://colo-ghuri-backend.onrender.com';

const DestinationDetail = () => {
    const { id } = useParams();
    const { get, loading } = useApi();

    const [destination, setDestination] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    useEffect(() => {
        fetchDestination();
        window.scrollTo(0, 0);
    }, [id]);

    const normalizeImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${SERVER_BASE_URL}${url}`;
    };

    const fetchDestination = async () => {
        try {
            const data = await get(`/destinations/${id}/`, {}, false);
            setDestination(data);
        } catch (error) {
            console.error('Destination detail fetch error:', error);
        }
    };

    const images = useMemo(() => {
        if (!destination) return [];

        const imageList = [];

        if (destination.primary_image) {
            imageList.push({
                url: normalizeImageUrl(destination.primary_image),
                caption: 'Primary Image',
            });
        }

        if (destination.images && destination.images.length > 0) {
            destination.images.forEach((image) => {
                const imageUrl = image.image_url || image.image;
                const normalizedUrl = normalizeImageUrl(imageUrl);

                if (normalizedUrl && !imageList.some((item) => item.url === normalizedUrl)) {
                    imageList.push({
                        url: normalizedUrl,
                        caption: image.caption || destination.name,
                    });
                }
            });
        }

        if (imageList.length === 0) {
            imageList.push({
                url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
                caption: destination.name,
            });
        }

        return imageList;
    }, [destination]);

    const selectedImage = images[selectedImageIndex];

    const hasMapLocation =
        destination?.latitude &&
        destination?.longitude &&
        !Number.isNaN(Number(destination.latitude)) &&
        !Number.isNaN(Number(destination.longitude));

    if (loading && !destination) {
        return <LoadingSpinner />;
    }

    if (!destination) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800">
                    Destination not found
                </h2>

                <Link to="/destinations" className="btn-primary mt-6">
                    Back to Destinations
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient">
            <section className="relative overflow-hidden bg-dark-950 pt-8">
                <div className="absolute inset-0">
                    <img
                        src={selectedImage?.url}
                        alt={destination.name}
                        className="h-full w-full object-cover opacity-45"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-950/85 to-primary-950/75"></div>
                </div>

                <div className="container-custom relative z-10 py-10">
                    <Link
                        to="/destinations"
                        className="mb-6 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                    >
                        <FaArrowLeft />
                        Back to Destinations
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
                        <div>
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <span className="badge bg-white/10 text-white border border-white/10 capitalize">
                                    {destination.destination_type || 'Destination'}
                                </span>

                                {destination.is_popular && (
                                    <span className="badge bg-amber-400 text-amber-950">
                                        Popular
                                    </span>
                                )}
                            </div>

                            <h1 className="font-display text-4xl font-black leading-tight text-white md:text-6xl">
                                {destination.name}
                            </h1>

                            <div className="mt-5 flex flex-wrap items-center gap-5 text-slate-200">
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-secondary-300" />
                                    <span>{destination.location}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaStar className="text-amber-300" />
                                    <span>
                                        {destination.average_rating || '0.0'} / 5.0 ({destination.total_reviews || 0} reviews)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-start lg:justify-end">
                            <WishlistButton
                                itemType="destination"
                                objectId={destination.destination_id}
                                initialWishlisted={destination.is_wishlisted}
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
                            <div className="relative h-[280px] bg-slate-900 md:h-[460px]">
                                <img
                                    src={selectedImage?.url}
                                    alt={selectedImage?.caption || destination.name}
                                    className="h-full w-full cursor-pointer object-cover"
                                    onClick={() => setShowLightbox(true)}
                                    onError={(event) => {
                                        event.currentTarget.src =
                                            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80';
                                    }}
                                />

                                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                                    {selectedImageIndex + 1} / {images.length}
                                </div>
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto bg-slate-50 p-4">
                                    {images.map((image, index) => (
                                        <button
                                            key={`${image.url}-${index}`}
                                            type="button"
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                                                selectedImageIndex === index
                                                    ? 'border-primary-600 ring-4 ring-primary-100'
                                                    : 'border-transparent hover:border-primary-300'
                                            }`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="h-full w-full object-cover"
                                                onError={(event) => {
                                                    event.currentTarget.src =
                                                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                            <span className="badge badge-primary mb-3">
                                About Destination
                            </span>

                            <h2 className="text-2xl font-extrabold text-slate-900">
                                About {destination.name}
                            </h2>

                            <p className="mt-4 whitespace-pre-line leading-8 text-slate-600">
                                {destination.description || 'No description available for this destination.'}
                            </p>
                        </div>

                        {destination.images?.length > 0 && (
                            <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                                        <FaImages />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-extrabold text-slate-900">
                                            Gallery
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Explore more photos of this destination.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                    {images.map((image, index) => (
                                        <button
                                            key={`${image.url}-gallery-${index}`}
                                            type="button"
                                            onClick={() => {
                                                setSelectedImageIndex(index);
                                                setShowLightbox(true);
                                            }}
                                            className="group h-44 overflow-hidden rounded-2xl bg-slate-100"
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.caption}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                                onError={(event) => {
                                                    event.currentTarget.src =
                                                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasMapLocation && (
                            <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                                <span className="badge badge-primary mb-3">
                                    Location Map
                                </span>

                                <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                                    Map Location
                                </h2>

                                <MapView
                                    points={[
                                        {
                                            name: destination.name,
                                            location: destination.location,
                                            latitude: destination.latitude,
                                            longitude: destination.longitude,
                                            url: `/destinations/${destination.destination_id}`,
                                        },
                                    ]}
                                    height="380px"
                                    zoom={10}
                                />
                            </div>
                        )}

                        {!hasMapLocation && (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-soft">
                                <FaMapMarkerAlt className="mx-auto mb-3 text-4xl text-slate-300" />
                                <h3 className="text-lg font-bold text-slate-700">
                                    Map location not added
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add latitude and longitude for this destination from the admin panel to show map.
                                </p>
                            </div>
                        )}

                        <ReviewSection
                            itemType="destination"
                            objectId={destination.destination_id}
                            title="Destination Reviews"
                        />
                    </div>

                    <aside className="space-y-6">
                        <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                            <h3 className="mb-5 text-xl font-extrabold text-slate-900">
                                Destination Information
                            </h3>

                            <div className="space-y-4">
                                <div className="rounded-2xl bg-primary-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-700">
                                        <FaMoneyBillWave />
                                        Entry Fee
                                    </div>

                                    <p className="text-2xl font-black text-primary-800">
                                        {formatCurrency(destination.entry_fee || 0)}
                                    </p>
                                </div>

                                <InfoBox
                                    icon={<FaClock />}
                                    title="Best Time to Visit"
                                    value={destination.best_time_to_visit || 'Not specified'}
                                />

                                <InfoBox
                                    icon={<FaInfoCircle />}
                                    title="Destination Type"
                                    value={destination.destination_type || 'Not specified'}
                                    capitalize
                                />

                                <InfoBox
                                    icon={<FaClock />}
                                    title="Opening Hours"
                                    value={destination.opening_hours || 'Not specified'}
                                />

                                <InfoBox
                                    icon={<FaTicketAlt />}
                                    title="Rating"
                                    value={`${destination.average_rating || '0.0'} / 5.0 (${destination.total_reviews || 0} reviews)`}
                                />

                                {hasMapLocation && (
                                    <InfoBox
                                        icon={<FaMapMarkerAlt />}
                                        title="Coordinates"
                                        value={`${destination.latitude}, ${destination.longitude}`}
                                    />
                                )}
                            </div>

                            <Link to="/tours" className="btn-primary mt-6 w-full">
                                Find Tours
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>

            {showLightbox && selectedImage && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
                    onClick={() => setShowLightbox(false)}
                >
                    <button
                        type="button"
                        onClick={() => setShowLightbox(false)}
                        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
                    >
                        ×
                    </button>

                    <img
                        src={selectedImage.url}
                        alt={selectedImage.caption}
                        className="max-h-[85vh] max-w-full rounded-2xl object-contain"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

const InfoBox = ({ icon, title, value, capitalize = false }) => {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="mt-0.5 text-primary-600">
                {icon}
            </div>

            <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {title}
                </p>

                <p className={`mt-1 font-semibold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
    );
};

export default DestinationDetail;