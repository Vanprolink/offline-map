import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.offline';
import localforage from 'localforage';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DirectionsIcon from '@mui/icons-material/Directions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import gasIcon from '../assets/OIP (1).png';
// Gán lại icon mặc định cho tất cả Marker
L.Marker.prototype.options.icon = L.icon({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});



const MapViewer = () => {
	const [map, setMap] = useState(null);
	const [points, setPoints] = useState([]);
	const [selectedPoint, setSelectedPoint] = useState(null);
	const [routeInfo, setRouteInfo] = useState(null);

	useEffect(() => {
		fetch('/locations.json')
			.then((res) => res.json())
			.then((data) => setPoints(data));

		if (map) {
			const offlineLayer = L.tileLayer.offline(
				'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				localforage,
				{
					subdomains: 'abc',
					minZoom: 13,
					maxZoom: 19,
					crossOrigin: true,
				}
			);

			offlineLayer.addTo(map);

			const controlSaveTiles = L.control.savetiles(offlineLayer, {
				zoomlevels: [13, 14, 15],
				confirm: (layer, callback) => callback(),
				confirmRemoval: (layer, callback) => callback(),
			});

			controlSaveTiles.addTo(map);
		}
	}, [map]);

	const calculateRoute = (destLat, destLng) => {
		debugger
		if (!navigator.geolocation) {
			alert("Trình duyệt không hỗ trợ định vị.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const originLat = position.coords.latitude;
				const originLng = position.coords.longitude;

				const R = 6371;
				const dLat = (destLat - originLat) * Math.PI / 180;
				const dLng = (destLng - originLng) * Math.PI / 180;
				const a =
					Math.sin(dLat / 2) ** 2 +
					Math.cos(originLat * Math.PI / 180) *
					Math.cos(destLat * Math.PI / 180) *
					Math.sin(dLng / 2) ** 2;
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				const distance = R * c;
				const estimatedTime = (distance / 40).toFixed(2);

				setRouteInfo({
					origin: { lat: originLat, lng: originLng },
					destination: { lat: destLat, lng: destLng },
					distance: distance.toFixed(2),
					time: estimatedTime,
				});
			},
			(error) => {
				alert("Không thể lấy vị trí hiện tại: " + error.message);
			}
		);
	};




	return (
		<>
			<MapContainer
				center={[10.7769, 106.7009]}
				zoom={13}
				style={{ height: '100vh', width: '100%' }}
				whenCreated={(mapInstance) => {
					mapInstance.on('click', () => setSelectedPoint(null));
				}}
			>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				{points.map((p) => (
					<Marker
						key={p.id}
						position={[p.lat, p.lng]}
						eventHandlers={{
							click: () => {
								if (selectedPoint && selectedPoint.id !== p.id) {
									setSelectedPoint(null);
								}
							}
						}}
					// icon={customIcon}
					>
						<Popup>
							<div style={{ minWidth: '250px', fontFamily: 'Segoe UI' }}>
								<h3> {p.name}</h3>
								<p> <strong>Địa chỉ:</strong> {p.address}</p>
								<p> <strong>Điện thoại:</strong> {p.phone}</p>
								<p> <strong>Email:</strong> {p.email}</p>
								<p> <strong>Giờ hoạt động:</strong> {p.hours}</p>
								<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
									<button className='btn-action' onClick={() => {
										setSelectedPoint(p);
									}}
										title="Xem chi tiết">
										<InfoOutlinedIcon style={{ fontSize: 24, color: '#0078d4' }} />
									</button>

									<a
										href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
										target="_blank"
										rel="noopener noreferrer"
										title="Chỉ đường"
										className='btn-action'
									>
										<DirectionsIcon style={{ fontSize: 24, color: '#0078d4' }} />
									</a>

									<button className='btn-action' onClick={() => calculateRoute(p.lat, p.lng)} title="Tính khoảng cách">
										<AccessTimeIcon style={{ fontSize: 24, color: '#0078d4' }} />
									</button>
								</div>
							</div>
						</Popup>
					</Marker>
				))}
			</MapContainer>
			{selectedPoint && (
				<div className="custom-popup">
					<button className="close-btn" onClick={() => setSelectedPoint(null)}>Đóng</button>
					<h2>{selectedPoint.name}</h2>
					<p><strong>Địa chỉ:</strong> {selectedPoint.address}</p>
					<p><strong>Điện thoại:</strong> {selectedPoint.phone}</p>
					<p><strong>Email:</strong> {selectedPoint.email}</p>
					<p><strong>Giờ hoạt động:</strong> {selectedPoint.hours}</p>
				</div>
			)}

			{routeInfo && (
				<div className="route-popup">
					<button className="close-btn" onClick={() => setRouteInfo(null)}>×</button>
					<h3>📍 Tính khoảng cách</h3>
					<p><strong>Vị trí hiện tại:</strong> {routeInfo.origin.lat.toFixed(5)}, {routeInfo.origin.lng.toFixed(5)}</p>
					<p><strong>Điểm đến:</strong> {routeInfo.destination.lat}, {routeInfo.destination.lng}</p>
					<p><strong>Quãng đường:</strong> {routeInfo.distance} km</p>
					<p><strong>Thời gian dự kiến:</strong> {routeInfo.time} giờ</p>
				</div>
			)}


		</>



	);
};

export default MapViewer;
