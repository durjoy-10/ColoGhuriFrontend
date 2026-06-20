import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({
    children,
    adminOnly = false,
    guideOnly = false,
    travellerOnly = false,
}) => {
    const { user, loading, isAdmin, isGuide, isTraveller } = useAuth();

    if (loading) return <LoadingSpinner fullScreen />;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (guideOnly && !isGuide) {
        return <Navigate to="/" replace />;
    }

    if (travellerOnly && !isTraveller) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;