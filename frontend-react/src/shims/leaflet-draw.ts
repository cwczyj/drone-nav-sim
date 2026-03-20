// Shim for leaflet-draw to fix ESM compatibility with Vite 8 / Rolldown
// leaflet-draw doesn't have proper ESM exports, so we need to import it as a side effect
// and then access the Draw namespace from the global L (Leaflet) object

import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';

// Import leaflet-draw as a side effect to attach Draw to L
import 'leaflet-draw';

// Re-export Draw from the Leaflet namespace
export default L.Draw;
export const Draw = L.Draw;