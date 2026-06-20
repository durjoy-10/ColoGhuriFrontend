import React from 'react';
import {
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt,
    FaUtensils,
    FaArrowDown,
} from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';

const TourItineraryTimeline = ({ destinations = [] }) => {
    if (!destinations || destinations.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <FaMapMarkerAlt className="mx-auto mb-3 text-4xl text-slate-300" />
                <h3 className="text-lg font-bold text-slate-700">
                    No itinerary added yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    The guide group has not added destination timeline for this tour.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
            <div className="mb-6">
                <span className="badge badge-primary mb-3">
                    Tour Plan
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">
                    Itinerary Timeline
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Day-by-day travel route, time schedule, stay duration, and meal plans.
                </p>
            </div>

            <div className="relative space-y-8">
                {destinations.map((item, index) => (
                    <div key={item.id || index} className="relative">
                        <div className="grid gap-5 md:grid-cols-[90px_1fr]">
                            <div className="flex md:flex-col md:items-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-500 text-xl font-black text-white shadow-lg">
                                    Day {item.order || index + 1}
                                </div>

                                {index !== destinations.length - 1 && (
                                    <div className="ml-8 hidden h-full min-h-24 w-0.5 bg-gradient-to-b from-primary-300 to-secondary-300 md:block"></div>
                                )}
                            </div>

                            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:bg-primary-50/40">
                                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-900">
                                            {item.destination_details?.name || 'Destination'}
                                        </h3>

                                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                            <FaMapMarkerAlt className="text-primary-600" />
                                            {item.destination_details?.location || 'Location not available'}
                                        </p>
                                    </div>

                                    <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-primary-700 shadow-sm">
                                        <FaClock />
                                        {item.stay_duration_hours || 0} hours
                                    </span>
                                </div>

                                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                                        <p className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <FaCalendarAlt className="text-primary-600" />
                                            Arrival
                                        </p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {formatDate(item.arrival_date)} · {item.arrival_time}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                                        <p className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <FaCalendarAlt className="text-secondary-600" />
                                            Departure
                                        </p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {formatDate(item.departure_date)} · {item.departure_time}
                                        </p>
                                    </div>
                                </div>

                                {item.destination_details?.description && (
                                    <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                                        {item.destination_details.description}
                                    </p>
                                )}

                                {item.food_plans && item.food_plans.length > 0 && (
                                    <div className="mt-5">
                                        <h4 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                                            <FaUtensils className="text-primary-600" />
                                            Meal Plan
                                        </h4>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {item.food_plans.map((food) => (
                                                <div
                                                    key={food.id || `${food.meal_type}-${food.day_number}`}
                                                    className="rounded-2xl bg-white p-3 shadow-sm"
                                                >
                                                    <p className="font-bold capitalize text-primary-700">
                                                        {food.meal_type}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                                        {food.meal_items}
                                                    </p>
                                                    {food.dietary_options && (
                                                        <p className="mt-2 rounded-xl bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                                                            {food.dietary_options}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {index !== destinations.length - 1 && (
                            <div className="my-4 flex justify-center md:hidden">
                                <FaArrowDown className="text-primary-500" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourItineraryTimeline;