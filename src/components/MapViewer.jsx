import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.offline';
import localforage from 'localforage';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DirectionsIcon from '@mui/icons-material/Directions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import gasIcon from '../assets/OIP.png';
import vnGeo from '../Provinces.json';
import chroma from 'chroma-js';
import { useMap } from 'react-leaflet';
import Select from 'react-select';
// import fullVNGeo from './Provinces_included_Paracel_SpratlyIslands.geojson';
// Tạo danh sách màu với 63 màu khác nhau
const provinceColors = chroma.scale(['#0078d4', '#ff9800', '#4caf50'])
	.mode('lch') // dùng không gian màu mượt hơn
	.colors(34); // số lượng tỉnh thành

// Gán lại icon mặc định cho tất cả Marker
L.Marker.prototype.options.icon = L.icon({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});


const getProvinceColor = (provinceName) => {
	const colorMap = {
		'An Giang': '#f44336',
		'Bà Rịa - Vũng Tàu': '#e91e63',
		'Bắc Giang': '#9c27b0',
		'Bắc Kạn': '#673ab7',
		'Bạc Liêu': '#3f51b5',
		'Bắc Ninh': '#2196f3',
		'Bến Tre': '#03a9f4',
		'Bình Định': '#00bcd4',
		'Bình Dương': '#009688',
		'Bình Phước': '#4caf50',
		'Bình Thuận': '#8bc34a',
		'Cà Mau': '#cddc39',
		'Cần Thơ': '#ffeb3b',
		'Cao Bằng': '#ffc107',
		'Đà Nẵng': '#ff9800',
		'Đắk Lắk': '#ff5722',
		'Đắk Nông': '#795548',
		'Điện Biên': '#9e9e9e',
		'Đồng Nai': '#607d8b',
		'Đồng Tháp': '#e57373',
		'Gia Lai': '#f06292',
		'Hà Giang': '#ba68c8',
		'Hà Nam': '#9575cd',
		'Hà Nội': '#7986cb',
		'Hà Tĩnh': '#64b5f6',
		'Hải Dương': '#4dd0e1',
		'Hải Phòng': '#4db6ac',
		'Hậu Giang': '#81c784',
		'Hòa Bình': '#aed581',
		'Hưng Yên': '#dce775',
		'Khánh Hòa': '#fff176',
		'Kiên Giang': '#ffd54f',
		'Kon Tum': '#ffb74d',
		'Lai Châu': '#ff8a65',
		'Lâm Đồng': '#a1887f',
		'Lạng Sơn': '#e0e0e0',
		'Lào Cai': '#90a4ae',
		'Long An': '#f44336',
		'Nam Định': '#e91e63',
		'Nghệ An': '#9c27b0',
		'Ninh Bình': '#673ab7',
		'Ninh Thuận': '#3f51b5',
		'Phú Thọ': '#2196f3',
		'Phú Yên': '#03a9f4',
		'Quảng Bình': '#00bcd4',
		'Quảng Nam': '#009688',
		'Quảng Ngãi': '#4caf50',
		'Quảng Ninh': '#8bc34a',
		'Quảng Trị': '#cddc39',
		'Sóc Trăng': '#ffeb3b',
		'Sơn La': '#ffc107',
		'Tây Ninh': '#ff9800',
		'Thái Bình': '#ff5722',
		'Thái Nguyên': '#795548',
		'Thanh Hóa': '#9e9e9e',
		'Thừa Thiên Huế': '#607d8b',
		'Tiền Giang': '#e57373',
		'TP Hồ Chí Minh': '#3cb44b',
		'Trà Vinh': '#f06292',
		'Tuyên Quang': '#ba68c8',
		'Vĩnh Long': '#9575cd',
		'Vĩnh Phúc': '#7986cb',
		'Yên Bái': '#64b5f6'
	};

	return colorMap[provinceName] || '#cccccc'; // Màu mặc định nếu không tìm thấy
};

// export const provinceCenters = {
//   'Hà Nội': [21.0285, 105.8542],
//   'Hue': [16.4637, 107.5909],
//   'Lai Châu': [22.394, 103.458],
//   'Điện Biên': [21.397, 103.032],
//   'Sơn La': [21.325, 103.918],
//   'Lạng Sơn': [21.848, 106.758],
//   'Quảng Ninh': [20.960, 107.031],
//   'Thanh Hóa': [19.808, 105.776],
//   'Nghệ An': [19.234, 104.920],
//   'Hà Tĩnh': [18.340, 105.907],
//   'Cao Bằng': [22.673, 106.249],
//   'Tuyên Quang': [21.817, 105.217],
//   'Lào Cai': [22.484, 103.950],
//   'Thái Nguyên': [21.602, 105.851],
//   'Phú Thọ': [21.133, 105.383],
//   'Bắc Ninh': [21.185, 106.055],
//   'Hưng Yên': [20.650, 106.067],
//   'Hải Phòng': [20.861, 106.680],
//   'Ninh Bình': [20.253, 105.976],
//   'Quảng Trị': [16.746, 107.192],
//   'Đà Nẵng': [16.051, 108.214],
//   'Quảng Ngãi': [15.123, 108.812],
//   'Gia Lai': [13.977, 108.001],
//   'Khánh Hòa': [12.246, 109.199],
//   'Lâm Đồng': [11.938, 108.438],
//   'Đắk Lắk': [12.677, 108.040],
//   'TP Hồ Chí Minh': [10.7769, 106.7009],
//   'Đồng Nai': [10.948, 106.819],
//   'Tây Ninh': [11.301, 106.099],
//   'Cần Thơ': [10.045, 105.746],
//   'Vĩnh Long': [10.250, 105.967],
//   'Đồng Tháp': [10.467, 105.630],
//   'Cà Mau': [9.176, 105.152],
//   'An Giang': [10.521, 105.125]
// };

export const provinceCenters = {
	'Hà Nội': [21.0285, 105.8542],
	'Huế': [16.4637, 107.5909],
	'Lai Châu': [22.394, 103.458],
	'Điện Biên': [21.397, 103.032],
	'Sơn La': [21.325, 103.918],
	'Lạng Sơn': [21.848, 106.758],
	'Quảng Ninh': [20.960, 107.031],
	'Thanh Hóa': [19.808, 105.776],
	'Nghệ An': [19.234, 104.920],
	'Hà Tĩnh': [18.340, 105.907],
	'Cao Bằng': [22.673, 106.249],
	'Tuyên Quang': [21.817, 105.217],
	'Lào Cai': [22.484, 103.950],
	'Thái Nguyên': [21.602, 105.851],
	'Phú Thọ': [21.133, 105.383],
	'Bắc Ninh': [21.185, 106.055],
	'Hưng Yên': [20.650, 106.067],
	'Hải Phòng': [20.861, 106.680],
	'Ninh Bình': [20.253, 105.976],
	'Quảng Trị': [16.746, 107.192],
	'Đà Nẵng': [16.051, 108.214],
	'Quảng Ngãi': [15.123, 108.812],
	'Gia Lai': [13.977, 108.001],
	'Khánh Hòa': [12.246, 109.199],
	'Lâm Đồng': [11.938, 108.438],
	'Đắk Lắk': [12.677, 108.040],
	'TP. Hồ Chí Minh': [10.7769, 106.7009],
	'Đồng Nai': [10.948, 106.819],
	'Tây Ninh': [11.301, 106.099],
	'Cần Thơ': [10.045, 105.746],
	'Vĩnh Long': [10.250, 105.967],
	'Đồng Tháp': [10.467, 105.630],
	'Cà Mau': [9.176, 105.152],
	'An Giang': [10.521, 105.125]
};


const MapController = ({ onMapReady }) => {
	const map = useMap();

	useEffect(() => {
		if (map) {
			onMapReady(map);
		}
	}, [map]);

	return null; // không render gì cả
};

const MapViewer = () => {
	const [map, setMap] = useState(null);
	// const map = useMap();
	const [points, setPoints] = useState([]);
	const [selectedPoint, setSelectedPoint] = useState(null);
	const [routeInfo, setRouteInfo] = useState(null);
	const provinceList = [...new Set(vnGeo.features.map(f => f.properties.TinhThanh))];
	const [selectedProvince, setSelectedProvince] = useState('');
	const [filteredPoints, setFilteredPoints] = useState([]);
	const provinceOptions = Object.keys(provinceCenters).map(name => ({
		label: name,
		value: name
	}));
	const colorMap = {};
	provinceList.forEach((name, index) => {
		colorMap[name] = provinceColors[index];
	});

	// const styleByProvince = (feature) => {
	// 	const provinceName = feature.properties.NAME_1; // hoặc tên khác tùy file
	// 	return {
	// 		fillColor: getProvinceColor(provinceName),
	// 		weight: 1,
	// 		color: '#333',
	// 		fillOpacity: 0.6
	// 	};
	// };

	const styleByProvince = (feature, layer) => {
		const name = feature.properties.TinhThanh;
		if (selectedProvince) {
			return {
				fillColor: name === selectedProvince ? colorMap[name] : '#ffffff', // chỉ tô màu tỉnh được chọn
				weight: 1,
				color: name === selectedProvince ? '#333' : '#aaa',
				fillOpacity: name === selectedProvince ? 0.7 : 0.2
			};
		}

		if (name === 'Hoàng Sa' || name === 'Trường Sa') {
			layer.bindTooltip(name, {
				permanent: true,
				direction: 'center',
				className: 'custom-label'
			});
		}
		// Nếu không chọn tỉnh nào → tô màu đầy đủ
		return {
			fillColor: colorMap[name] || '#e0e0e0',
			weight: 1,
			color: '#555',
			fillOpacity: 0.6
		};
	};

	const handleSearch = () => {
		const center = provinceCenters[selectedProvince];
		if (center) {
			map.setView(center, 12);

			const filtered = points.filter(p => p.province === selectedProvince);
			setFilteredPoints(filtered);
		}
	};

	const handleClearSearch = () => {
		setSelectedProvince('');
		setFilteredPoints([]);
		map.setView([10.7769, 106.7009], 6); // về lại toàn quốc
	};

	const handleProvinceChange = (option) => {
		const selected = option ? option.value : '';
		setSelectedProvince(selected);

		if (!selected) {
			setFilteredPoints([]);
			map.setView([10.7769, 106.7009], 6);
		}
	};


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
				console.log("Vị trí:", position.coords);
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
				console.error("Lỗi định vị:", error.message);
				alert("Không thể lấy vị trí hiện tại: " + error.message);
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0
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
				<MapController onMapReady={setMap} />
				<TileLayer url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png" />
				<GeoJSON data={vnGeo} style={styleByProvince} />
				{(filteredPoints.length > 0 ? filteredPoints : points).map((p) => (
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
			<div className="toolbar">
				<div className="toolbar-left">
					<img src={gasIcon} alt="Logo" className="logo" />
				</div>

				<div className="toolbar-right">
					<Select
						options={provinceOptions}
						value={selectedProvince ? { label: selectedProvince, value: selectedProvince } : null}
						onChange={handleProvinceChange}
						isClearable
						placeholder="TP/Tỉnh..."
						className="react-select-container"
						classNamePrefix="react-select"
					/>

					<select className="toolbar-select">
						<option>-- Tất cả --</option>
						<option>Trạm xăng</option>
						<option>Cửa hàng</option>
					</select>

					<button className="toolbar-btn" onClick={handleSearch}>🔍 Tìm</button>
				</div>
			</div>




		</>



	);
};

export default MapViewer;
