import React from 'react';
import 'leaflet/dist/leaflet.css';
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Polyline,
} from 'react-leaflet';
import { Link } from 'react-router-dom';

const MapView = ({
    points = [],
    height = '420px',
    showRoute = false,
    zoom = 7,
}) => {
    const cleanPoints = points
        .filter((p) => p.latitude && p.longitude)
        .map((p) => ({
            ...p,
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
        }));

    const center = cleanPoints.length > 0
        ? [cleanPoints[0].latitude, cleanPoints[0].longitude]
        : [23.685, 90.3563];

    const routePositions = cleanPoints.map((p) => [p.latitude, p.longitude]);

    return (
        <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-100">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height, width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {showRoute && routePositions.length > 1 && (
                    <Polyline
                        positions={routePositions}
                        pathOptions={{
                            weight: 4,
                        }}
                    />
                )}

                {cleanPoints.map((point, index) => (
                    <CircleMarker
                        key={`${point.destination_id || point.name}-${index}`}
                        center={[point.latitude, point.longitude]}
                        radius={10}
                        pathOptions={{
                            fillOpacity: 0.9,
                            weight: 2,
                        }}
                    >
                        <Popup>
                            <div className="min-w-[180px]">
                                <p className="font-bold">{point.name}</p>
                                <p className="text-sm">{point.location}</p>

                                {point.order && (
                                    <p className="mt-1 text-xs">
                                        Route Stop: {point.order}
                                    </p>
                                )}

                                {point.url && (
                                    <Link
                                        to={point.url}
                                        className="mt-2 inline-block text-sm font-bold text-blue-600"
                                    >
                                        View Details
                                    </Link>
                                )}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;