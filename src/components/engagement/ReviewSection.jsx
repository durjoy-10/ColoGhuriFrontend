import React, { useEffect, useState } from 'react';
import {
    FaStar,
    FaRegStar,
    FaTrash,
    FaUserCircle,
    FaSpinner,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ReviewSection = ({ itemType, objectId, title = 'Reviews' }) => {
    const { user, isAuthenticated } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const endpoint =
        itemType === 'tour'
            ? `/engagement/reviews/tours/${objectId}/`
            : `/engagement/reviews/destinations/${objectId}/`;

    useEffect(() => {
        fetchReviews();
    }, [itemType, objectId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await axios.get(endpoint);
            setReviews(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Review fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const averageRating =
        reviews.length > 0
            ? (
                reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
                reviews.length
            ).toFixed(1)
            : '0.0';

    const submitReview = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to write a review.');
            return;
        }

        if (!rating) {
            toast.error('Please select a rating.');
            return;
        }

        try {
            setSubmitting(true);

            await axios.post(endpoint, {
                rating,
                comment,
            });

            toast.success('Review submitted successfully.');
            setComment('');
            setRating(5);
            fetchReviews();
        } catch (error) {
            console.error('Review submit error:', error);
            toast.error(error.response?.data?.error || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteReview = async (review) => {
        const confirmed = window.confirm('Are you sure you want to delete this review?');

        if (!confirmed) return;

        try {
            await axios.delete(`/engagement/reviews/${itemType}/${review.id}/delete/`);
            toast.success('Review deleted.');
            fetchReviews();
        } catch (error) {
            console.error('Delete review error:', error);
            toast.error(error.response?.data?.error || 'Failed to delete review.');
        }
    };

    const StarInput = () => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl text-amber-400 transition hover:scale-110"
                >
                    {star <= rating ? <FaStar /> : <FaRegStar />}
                </button>
            ))}
        </div>
    );

    const StarDisplay = ({ value }) => (
        <div className="flex gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                    {star <= value ? <FaStar /> : <FaRegStar />}
                </span>
            ))}
        </div>
    );

    return (
        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {reviews.length} review{reviews.length !== 1 ? 's' : ''} · Average rating {averageRating}/5
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-amber-700">
                    <FaStar />
                    <span className="font-black">{averageRating}</span>
                </div>
            </div>

            {isAuthenticated ? (
                <form onSubmit={submitReview} className="mb-8 rounded-3xl bg-slate-50 p-5">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Your rating
                    </label>

                    <StarInput />

                    <label className="mb-2 mt-4 block text-sm font-bold text-slate-700">
                        Your review
                    </label>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="4"
                        placeholder="Share your experience..."
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
                    >
                        {submitting && <FaSpinner className="animate-spin" />}
                        Submit Review
                    </button>

                    {itemType === 'tour' && user?.role === 'traveller' && (
                        <p className="mt-3 text-xs text-slate-500">
                            Note: Tour reviews are accepted only after your booking is completed.
                        </p>
                    )}
                </form>
            ) : (
                <div className="mb-8 rounded-3xl bg-primary-50 p-5 text-sm text-primary-700">
                    Please login to write a review.
                </div>
            )}

            {loading ? (
                <div className="py-8 text-center text-slate-500">
                    Loading reviews...
                </div>
            ) : reviews.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
                    <FaStar className="mx-auto mb-3 text-4xl text-slate-300" />
                    <h3 className="font-bold text-slate-700">No reviews yet</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Be the first to share your experience.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    {review.user_image ? (
                                        <img
                                            src={review.user_image}
                                            alt={review.user_name}
                                            className="h-11 w-11 rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                            <FaUserCircle className="text-2xl" />
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-bold text-slate-900">
                                            {review.user_name}
                                        </p>
                                        <div className="mt-1">
                                            <StarDisplay value={review.rating} />
                                        </div>
                                    </div>
                                </div>

                                {review.can_delete && (
                                    <button
                                        onClick={() => deleteReview(review)}
                                        className="rounded-xl bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>

                            {review.comment && (
                                <p className="mt-4 leading-7 text-slate-600">
                                    {review.comment}
                                </p>
                            )}

                            <p className="mt-3 text-xs text-slate-400">
                                {new Date(review.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;