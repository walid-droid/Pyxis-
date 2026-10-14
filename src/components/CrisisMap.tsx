import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./CrisisMap.css";

const setifPosition: [number, number] = [36.1911, 5.4137];

function CrisisMap() {
  return (
    <MapContainer
      center={setifPosition}
      zoom={12}
      scrollWheelZoom={true}
      className="crisis-map"
    >
      
    <TileLayer
      attribution='Tiles &copy; Esri'
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    />


      <Marker position={setifPosition}>
        <Popup>Sétif — test marker</Popup>
      </Marker>
    </MapContainer>
  );
}

export default CrisisMap;