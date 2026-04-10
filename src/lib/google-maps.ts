import {
  Client,
  TravelMode,
} from "@googlemaps/google-maps-services-js";

const client = new Client({});

function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not set");
  return key;
}

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await client.geocode({
      params: {
        address,
        key: getApiKey(),
      },
    });

    if (response.data.results.length === 0) return null;

    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  } catch (error) {
    console.error(`Geocoding failed for address: ${address}`, error);
    return null;
  }
}

interface Waypoint {
  id: string;
  lat: number;
  lng: number;
}

export async function optimizeRoute(
  origin: { lat: number; lng: number },
  waypoints: Waypoint[]
): Promise<{
  orderedIds: string[];
  totalDuration: string;
  totalDistance: string;
} | null> {
  if (waypoints.length === 0) return null;

  // If only one waypoint, no optimization needed
  if (waypoints.length === 1) {
    return {
      orderedIds: [waypoints[0].id],
      totalDuration: "N/A",
      totalDistance: "N/A",
    };
  }

  try {
    const response = await client.directions({
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${origin.lat},${origin.lng}`, // Return to origin
        waypoints: waypoints.map((wp) => `${wp.lat},${wp.lng}`),
        optimize: true,
        mode: TravelMode.driving,
        key: getApiKey(),
      },
    });

    if (response.data.routes.length === 0) return null;

    const route = response.data.routes[0];
    const waypointOrder = route.waypoint_order;

    const orderedIds = waypointOrder.map((index: number) => waypoints[index].id);

    let totalDurationSec = 0;
    let totalDistanceM = 0;
    for (const leg of route.legs) {
      totalDurationSec += leg.duration.value;
      totalDistanceM += leg.distance.value;
    }

    const hours = Math.floor(totalDurationSec / 3600);
    const minutes = Math.floor((totalDurationSec % 3600) / 60);
    const totalDuration =
      hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
    const totalDistance = `${(totalDistanceM / 1000).toFixed(1)} km`;

    return { orderedIds, totalDuration, totalDistance };
  } catch (error) {
    console.error("Route optimization failed:", error);
    return null;
  }
}
