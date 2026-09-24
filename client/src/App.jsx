import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import MapView from './components/MapView';
import RouteForm from './components/RouteForm';
import RouteResults from './components/RouteResults';
import { fetchRoute } from './services/routeApi';
import './index.css';

function App() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markers, setMarkers] = useState({ start: null, end: null });

  const handleFindRoute = async (startLoc, endLoc) => {
    setLoading(true);
    setError(null);
    setRouteData(null);
    
    // Position markers immediately at search location
    setMarkers({
      start: [startLoc.lat, startLoc.lon],
      end: [endLoc.lat, endLoc.lon]
    });

    try {
      const data = await fetchRoute(startLoc, endLoc);
      setRouteData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRouteData(null);
    setError(null);
    setMarkers({ start: null, end: null });
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-area">
          <MapPin color="#3b82f6" />
          <span>RouteX</span>
          <span style={{ fontWeight: 400, fontSize: '0.875rem', opacity: 0.8, marginLeft: '1rem' }}>
            Smarter Routes, Brighter Journeys
          </span>
        </div>
      </header>
      
      <main className="main-content">
        <div className="sidebar">
          <RouteForm 
            onFindRoute={handleFindRoute} 
            onClear={handleClear} 
            loading={loading} 
          />
          
          {error && (
            <div className="panel error-msg">
              {error}
            </div>
          )}

          {routeData && !loading && (
            <RouteResults data={routeData} />
          )}
        </div>
        
        <MapView 
          coordinates={routeData?.coordinates || []} 
          markers={markers} 
        />
      </main>
    </div>
  );
}

export default App;
