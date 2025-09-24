'use client';

import { AreaConnection, RouteConnection, Area, Route } from '@/tina/__generated__/types';
import { useState, useEffect } from 'react';

interface MapClientPageProps {
  areasData: {
    areaConnection: AreaConnection;
  };
  routesData: {
    routeConnection: RouteConnection;
  };
}

export default function MapClientPage({ areasData, routesData }: MapClientPageProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const areas = areasData.areaConnection.edges || [];
  const routes = routesData.routeConnection.edges || [];

  // Parse coordinates from string format "47.2892, -121.321"
  const parseCoordinates = (coordString: string | null | undefined) => {
    if (!coordString) return null;
    const parts = coordString.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  };

  // Get areas with valid coordinates
  const mappableAreas = areas.filter(area => {
    if (!area?.node) return false;
    return parseCoordinates(area.node.summitCoords) !== null;
  });

  // Get routes for selected area
  const getRoutesForArea = (areaNode: Area) => {
    return routes.filter(route => {
      if (!route?.node) return false;
      return route.node.parentArea === areaNode || 
             (typeof route.node.parentArea === 'object' && 
              route.node.parentArea?._sys?.filename === areaNode._sys?.filename);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Interactive Map</h1>
      
      {/* Placeholder for map */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center mb-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Interactive Map Coming Soon</h3>
          <p className="text-gray-500">
            This will display areas and routes on an interactive Google Map
          </p>
        </div>
      </div>

      {/* Areas List with Coordinates */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Areas with Coordinates</h2>
          <div className="space-y-4">
            {mappableAreas.map((area, index) => {
              if (!area?.node) return null;
              
              const areaData = area.node as Area;
              const coords = parseCoordinates(areaData.summitCoords);
              const areaRoutes = getRoutesForArea(areaData);
              
              return (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedArea === areaData 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedArea(selectedArea === areaData ? null : areaData)}
                >
                  <h3 className="font-semibold text-lg">{areaData.title}</h3>
                  {coords && (
                    <p className="text-sm text-gray-600">
                      📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </p>
                  )}
                  <p className="text-sm text-blue-600">
                    {areaRoutes.length} route{areaRoutes.length !== 1 ? 's' : ''}
                  </p>
                </div>
              );
            })}
          </div>
          
          {mappableAreas.length === 0 && (
            <p className="text-gray-500">No areas with coordinates found.</p>
          )}
        </div>

        {/* Selected Area Details */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedArea ? `Routes in ${selectedArea.title}` : 'Select an area to view routes'}
          </h2>
          
          {selectedArea && (
            <div className="space-y-4">
              {getRoutesForArea(selectedArea).map((route, index) => {
                if (!route?.node) return null;
                
                const routeData = route.node as Route;
                
                return (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold">{routeData.title}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      {routeData.miles && <span>📏 {routeData.miles} mi</span>}
                      {routeData.gain && <span className="ml-3">⬆️ {routeData.gain}ft</span>}
                      {routeData.classRating && (
                        <span className="ml-3">🧗 {routeData.classRating.replace('class', 'Class ')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {getRoutesForArea(selectedArea).length === 0 && (
                <p className="text-gray-500">No routes found for this area.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions for enabling Google Maps */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Enable Interactive Mapping</h3>
        <p className="text-blue-800 mb-3">To replace this placeholder with a real interactive map:</p>
        <ol className="list-decimal ml-6 text-blue-700 space-y-1">
          <li>Get a Google Maps JavaScript API key from the Google Cloud Console</li>
          <li>Add <code className="bg-blue-100 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here</code> to your .env.local file</li>
          <li>Install the Google Maps package: <code className="bg-blue-100 px-1">npm install @googlemaps/js-api-loader</code></li>
          <li>The map will then show interactive markers for each area with clickable route information</li>
        </ol>
      </div>
    </div>
  );
}