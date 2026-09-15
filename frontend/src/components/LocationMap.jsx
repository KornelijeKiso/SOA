import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerUrl from "leaflet/dist/images/marker-icon.png";
import markerRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { validPosition } from "../api/responseUtils";

const icon = L.icon({
  iconUrl: markerUrl, iconRetinaUrl: markerRetinaUrl, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
});
const defaultCenter = [44.7866, 20.4489];

export default function LocationMap({ position, onSelect, disabled = false }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const callback = useRef(onSelect);
  const disabledRef = useRef(disabled);
  const [tileError, setTileError] = useState(false);
  callback.current = onSelect;
  disabledRef.current = disabled;

  useEffect(() => {
    const map = L.map(container.current).setView(defaultCenter, 13);
    mapRef.current = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).on("tileerror", () => setTileError(true)).addTo(map);
    map.on("click", (event) => {
      if (disabledRef.current) return;
      const point = event.latlng.wrap();
      callback.current?.({ latitude: point.lat, longitude: point.lng });
    });
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!validPosition(position)) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    const point = [position.latitude, position.longitude];
    if (markerRef.current) markerRef.current.setLatLng(point);
    else markerRef.current = L.marker(point, { icon }).addTo(map);
    map.setView(point, map.getZoom(), { animate: false });
  }, [position?.latitude, position?.longitude]);

  return <>
    <p className="muted">Click the map to select a location.</p>
    <div ref={container} className="location-map" aria-label="Location selection map" />
    {tileError && <p className="error" role="alert">Some map tiles could not load. Check your connection and reload the page.</p>}
    {validPosition(position) && <p>
      Selected latitude: {position.latitude.toFixed(6)}; longitude: {position.longitude.toFixed(6)}
    </p>}
  </>;
}