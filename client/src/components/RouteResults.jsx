import React from 'react';
import { Route, Clock, Navigation2, MapPin } from 'lucide-react';

const RouteResults = ({ data }) => {
  if (!data) return null;

  // Use pre-calculated values from API (Dijkstra edge-weight sum)
  const distanceKm = data.distanceKm ?? (data.distance / 1000).toFixed(2);
  const estimatedTimeMins = data.estimatedMinutes ?? Math.round((data.distance / 1000) * 2);
  const waypointsCount = data.path ? data.path.length : 0;

  return (
    <div className="panel">
      <h2 className="panel-title">
        <Navigation2 size={20} color="#2563eb" />
        Route Details
      </h2>
      
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">
            <Route size={14} />
            Distance
          </span>
          <span className="stat-value">{distanceKm} km</span>
        </div>
        
        <div className="stat-box">
          <span className="stat-label">
            <Clock size={14} />
            Estimated Time
          </span>
          <span className="stat-value">{estimatedTimeMins} mins</span>
        </div>
      </div>

      <div className="stat-box" style={{ width: '100%', boxSizing: 'border-box' }}>
        <span className="stat-label">
          <MapPin size={14} />
          Road Segments
        </span>
        <span className="stat-value" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {waypointsCount} road intersections evaluated
        </span>
      </div>
    </div>
  );
};

export default RouteResults;
