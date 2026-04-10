"use client";

import { useEffect, useRef } from "react";

interface Appointment {
  id: string;
  clientName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  routeOrder: number | null;
  period: string;
}

interface RouteMapProps {
  appointments: Appointment[];
  originLat: number;
  originLng: number;
}

export default function RouteMap({
  appointments,
  originLat,
  originLng,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const directionsRendererRef =
    useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: originLat, lng: originLng },
        zoom: 10,
        mapId: "route-planner-map",
      });
    }

    // Clear existing markers
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    // Clear existing directions
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    const validAppointments = appointments.filter(
      (a) => a.latitude && a.longitude
    );

    if (validAppointments.length === 0) return;

    // Add markers
    validAppointments.forEach((apt) => {
      const pinContent = document.createElement("div");
      pinContent.className = "route-marker";
      pinContent.style.cssText = `
        background: ${apt.period === "AM" ? "#3b82f6" : "#f59e0b"};
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      `;
      pinContent.textContent = String(apt.routeOrder ?? "?");

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current!,
        position: { lat: apt.latitude!, lng: apt.longitude! },
        title: `${apt.routeOrder}. ${apt.clientName} - ${apt.address}`,
        content: pinContent,
      });

      markersRef.current.push(marker);
    });

    // Draw route if there are multiple points
    if (validAppointments.length > 1) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#3b82f6",
          strokeWeight: 4,
        },
      });
      directionsRendererRef.current = directionsRenderer;

      const sorted = [...validAppointments].sort(
        (a, b) => (a.routeOrder ?? 0) - (b.routeOrder ?? 0)
      );
      const waypoints = sorted.slice(1, -1).map((apt) => ({
        location: { lat: apt.latitude!, lng: apt.longitude! },
        stopover: true,
      }));

      directionsService.route(
        {
          origin: { lat: originLat, lng: originLng },
          destination: {
            lat: sorted[sorted.length - 1].latitude!,
            lng: sorted[sorted.length - 1].longitude!,
          },
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    }

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: originLat, lng: originLng });
    validAppointments.forEach((apt) => {
      bounds.extend({ lat: apt.latitude!, lng: apt.longitude! });
    });
    mapInstanceRef.current.fitBounds(bounds);
  }, [appointments, originLat, originLng]);

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div ref={mapRef} className="w-full h-[500px]" />
    </div>
  );
}
