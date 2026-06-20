import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const WishlistButton = ({
    itemType,
    objectId,
    initialWishlisted = false,
    size = 'md',
    showText = false,
    className = '',
    onChange,
}) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [wishlisted, setWishlisted] = useState(initialWishlisted);
    const [loading, setLoading] = useState(false);

    const sizes = {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        icon: 'h-11 w-11',
    };

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to use wishlist.');
            navigate('/login');
            return;
        }

        if (!itemType || !objectId) {
            toast.error('Invalid wishlist item.');
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post('/engagement/wishlist/toggle/', {
                item_type: itemType,
                object_id: objectId,
            });

            setWishlisted(response.data.wishlisted);
            toast.success(response.data.message || 'Wishlist updated.');

            if (onChange) {
                onChange(response.data.wishlisted);
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
            toast.error(error.response?.data?.error || 'Failed to update wishlist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={loading}
            className={`
                inline-flex items-center justify-center gap-2 rounded-2xl font-bold shadow-sm transition
                ${wishlisted ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-700'}
                ${sizes[size] || sizes.md}
                ${className}
            `}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {loading ? (
                <FaSpinner className="animate-spin" />
            ) : wishlisted ? (
                <FaHeart />
            ) : (
                <FaRegHeart />
            )}

            {showText && (
                <span>
                    {wishlisted ? 'Saved' : 'Save'}
                </span>
            )}
        </button>
    );
};

export default WishlistButton;