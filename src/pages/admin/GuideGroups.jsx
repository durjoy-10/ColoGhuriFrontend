import React, { useEffect, useState } from 'react';
import {
    FaBan,
    FaCheckCircle,
    FaClock,
    FaEnvelope,
    FaEye,
    FaMapMarkerAlt,
    FaPhone,
    FaSpinner,
    FaUserCheck,
    FaUsers,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';

const AdminGuideGroups = () => {
    const { get, post, del } = useApi();

    const [pendingGroups, setPendingGroups] = useState([]);
    const [verifiedGroups, setVerifiedGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [verifyingId, setVerifyingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const getGroupId = (group) => {
        return group?.guide_group_id || group?.id;
    };

    const normalizeList = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
    };

    const fetchGroups = async () => {
        setFetching(true);

        try {
            const pendingRes = await get('/guides/pending-groups/', {}, false);
            const verifiedRes = await get('/guides/groups/', {}, false);

            setPendingGroups(normalizeList(pendingRes));
            setVerifiedGroups(normalizeList(verifiedRes));
        } catch (error) {
            console.error('Guide groups fetch error:', error);
            toast.error('Failed to load guide groups');
        } finally {
            setFetching(false);
        }
    };

    const verifyGroup = async (groupId) => {
        if (!groupId || verifyingId) return;

        setVerifyingId(groupId);

        try {
            const response = await post(
                `/guides/verify-group/${groupId}/`,
                {},
                false
            );

            toast.success(
                response?.message ||
                    'Guide group verified successfully. Emails are being sent.'
            );

            setPendingGroups((prev) =>
                prev.filter((group) => getGroupId(group) !== groupId)
            );

            await fetchGroups();

            setShowModal(false);
            setSelectedGroup(null);
        } catch (error) {
            console.error('Guide group verify error:', error);

            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                'Failed to verify guide group';

            toast.error(message);
        } finally {
            setVerifyingId(null);
        }
    };

    const rejectGroup = async (groupId) => {
        if (!groupId || rejectingId) return;

        const ok = window.confirm(
            'Reject this guide group? This will delete all guide records under this group.'
        );

        if (!ok) return;

        setRejectingId(groupId);

        try {
            await del(`/guides/reject-group/${groupId}/`, false);

            toast.success('Guide group rejected and removed');

            setPendingGroups((prev) =>
                prev.filter((group) => getGroupId(group) !== groupId)
            );

            await fetchGroups();
        } catch (error) {
            console.error('Guide group reject error:', error);

            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                'Failed to reject guide group';

            toast.error(message);
        } finally {
            setRejectingId(null);
        }
    };

    const viewGroupDetails = (group) => {
        setSelectedGroup(group);
        setShowModal(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const guidesOf = (group) => {
        if (Array.isArray(group?.guides)) return group.guides;
        if (Array.isArray(group?.members)) return group.members;
        return [];
    };

    if (fetching) {
        return (
            <div className="p-6 flex justify-center items-center h-96">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-3" />
                    <p className="text-gray-500">Loading guide groups...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Guide Group Management
                </h1>
                <p className="text-gray-600">
                    Review, verify, or reject guide group registrations
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">
                                Pending Guide Groups
                            </p>
                            <p className="text-3xl font-bold text-orange-600">
                                {pendingGroups.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Awaiting verification
                            </p>
                        </div>
                        <FaClock className="text-4xl text-orange-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">
                                Verified Guide Groups
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {verifiedGroups.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Active on platform
                            </p>
                        </div>
                        <FaUserCheck className="text-4xl text-green-500 opacity-50" />
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaClock className="text-orange-500" />
                    Pending Verifications ({pendingGroups.length})
                </h2>

                {pendingGroups.length === 0 ? (
                    <div className="bg-green-50 p-8 rounded-lg text-center">
                        <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                        <p className="text-green-700 font-semibold">
                            No pending guide groups
                        </p>
                        <p className="text-sm text-green-600">
                            All guide groups have been verified
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pendingGroups.map((group) => {
                            const groupId = getGroupId(group);
                            const isVerifying = verifyingId === groupId;
                            const isRejecting = rejectingId === groupId;
                            const guides = guidesOf(group);

                            return (
                                <div
                                    key={groupId}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="p-5">
                                        <div className="flex flex-wrap justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {group.guide_groupname
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            'G'}
                                                    </div>

                                                    <div>
                                                        <h3 className="font-bold text-xl text-gray-800">
                                                            {
                                                                group.guide_groupname
                                                            }
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            Registered on{' '}
                                                            {formatDate(
                                                                group.created_at
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <FaEnvelope className="text-gray-400" />
                                                        <span className="break-all">
                                                            {group.email ||
                                                                'N/A'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <FaPhone className="text-gray-400" />
                                                        <span>
                                                            {group.phone_number ||
                                                                'N/A'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <FaUsers className="text-gray-400" />
                                                        <span>
                                                            {group.guide_group_number ||
                                                                guides.length ||
                                                                0}{' '}
                                                            guides in group
                                                        </span>
                                                    </div>

                                                    {group.address && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <FaMapMarkerAlt className="text-gray-400" />
                                                            <span className="truncate">
                                                                {
                                                                    group.address
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {group.description && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-700">
                                                            {group.description}
                                                        </p>
                                                    </div>
                                                )}

                                                {guides.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-semibold text-gray-700 mb-2">
                                                            Group Members
                                                        </p>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {guides.map(
                                                                (guide) => (
                                                                    <div
                                                                        key={
                                                                            guide.guide_id ||
                                                                            guide.id ||
                                                                            guide.email
                                                                        }
                                                                        className="bg-gray-50 rounded-lg px-3 py-2"
                                                                    >
                                                                        <p className="font-medium text-gray-800">
                                                                            {guide.name ||
                                                                                guide.username ||
                                                                                'Guide'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 break-all">
                                                                            {
                                                                                guide.email
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        viewGroupDetails(group);
                                                    }}
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    <FaEye />
                                                    View
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        verifyGroup(groupId);
                                                    }}
                                                    disabled={
                                                        isVerifying ||
                                                        verifyingId !== null
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {isVerifying ? (
                                                        <FaSpinner className="animate-spin" />
                                                    ) : (
                                                        <FaCheckCircle />
                                                    )}
                                                    {isVerifying
                                                        ? 'Verifying...'
                                                        : 'Verify Group'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        rejectGroup(groupId);
                                                    }}
                                                    disabled={
                                                        isRejecting ||
                                                        rejectingId !== null
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {isRejecting ? (
                                                        <FaSpinner className="animate-spin" />
                                                    ) : (
                                                        <FaBan />
                                                    )}
                                                    {isRejecting
                                                        ? 'Rejecting...'
                                                        : 'Reject'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaUserCheck className="text-green-500" />
                    Verified Guide Groups ({verifiedGroups.length})
                </h2>

                {verifiedGroups.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <p className="text-gray-500">
                            No verified guide groups yet
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {verifiedGroups.map((group) => {
                            const groupId = getGroupId(group);
                            return (
                                <div
                                    key={groupId}
                                    className="bg-white rounded-lg shadow p-5"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {group.guide_groupname
                                                ?.charAt(0)
                                                ?.toUpperCase() || 'G'}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800">
                                                {group.guide_groupname}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {group.email || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {group.phone_number || 'N/A'}
                                            </p>

                                            <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                Verified
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                viewGroupDetails(group)
                                            }
                                            className="text-primary-600 hover:text-primary-700"
                                        >
                                            <FaEye />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && selectedGroup && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4 flex justify-between items-center sticky top-0">
                            <h2 className="text-xl font-bold text-white">
                                Guide Group Details
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-white hover:text-gray-200 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedGroup.guide_groupname
                                        ?.charAt(0)
                                        ?.toUpperCase() || 'G'}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {selectedGroup.guide_groupname}
                                    </h3>

                                    <span
                                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                                            selectedGroup.is_verified
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {selectedGroup.is_verified
                                            ? 'Verified'
                                            : 'Pending Verification'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoBox
                                    label="Email"
                                    value={selectedGroup.email}
                                />
                                <InfoBox
                                    label="Phone"
                                    value={selectedGroup.phone_number}
                                />
                                <InfoBox
                                    label="Number of Guides"
                                    value={
                                        selectedGroup.guide_group_number ||
                                        guidesOf(selectedGroup).length
                                    }
                                />
                                <InfoBox
                                    label="Registered On"
                                    value={formatDate(selectedGroup.created_at)}
                                />

                                {selectedGroup.address && (
                                    <InfoBox
                                        label="Address"
                                        value={selectedGroup.address}
                                        wide
                                    />
                                )}

                                {selectedGroup.description && (
                                    <InfoBox
                                        label="Description"
                                        value={selectedGroup.description}
                                        wide
                                    />
                                )}
                            </div>

                            {guidesOf(selectedGroup).length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-3">
                                        Guide Members
                                    </h4>

                                    <div className="space-y-2">
                                        {guidesOf(selectedGroup).map(
                                            (guide) => (
                                                <div
                                                    key={
                                                        guide.guide_id ||
                                                        guide.id ||
                                                        guide.email
                                                    }
                                                    className="bg-gray-50 rounded-lg p-3"
                                                >
                                                    <p className="font-semibold text-gray-800">
                                                        {guide.name ||
                                                            guide.username ||
                                                            'Guide'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 break-all">
                                                        {guide.email}
                                                    </p>
                                                    {guide.phone_number && (
                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                guide.phone_number
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t">
                                {!selectedGroup.is_verified && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            verifyGroup(
                                                getGroupId(selectedGroup)
                                            );
                                        }}
                                        disabled={
                                            verifyingId ===
                                                getGroupId(selectedGroup) ||
                                            verifyingId !== null
                                        }
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                                    >
                                        {verifyingId ===
                                        getGroupId(selectedGroup)
                                            ? 'Verifying...'
                                            : 'Verify Group'}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoBox = ({ label, value, wide = false }) => (
    <div className={`bg-gray-50 p-3 rounded-lg ${wide ? 'md:col-span-2' : ''}`}>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium break-all">{value || 'N/A'}</p>
    </div>
);

export default AdminGuideGroups;