import React from 'react';
import { Route, Clock, Navigation2, Cpu, Zap } from 'lucide-react';

const RouteResults = ({ data }) => {
  if (!data) return null;

  const distanceKm = data.distanceKm ?? (data.distance / 1000).toFixed(2);
  const estimatedTimeMins = data.estimatedMinutes ?? Math.round((data.distance / 1000) * 2);
  const metrics = data.algorithmMetrics || {};

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

      {metrics.algorithm && (
        <div className="stats-grid" style={{ marginTop: '0.75rem' }}>
          <div className="stat-box">
            <span className="stat-label">
              <Cpu size={14} />
              Algorithm
            </span>
            <span className="stat-value" style={{ fontSize: '1rem', color: '#2563eb' }}>
              {metrics.algorithm}
            </span>
          </div>

          <div className="stat-box">
            <span className="stat-label">
              <Zap size={14} color="#16a34a" />
              Nodes Evaluated
            </span>
            <span className="stat-value" style={{ fontSize: '1rem', color: '#16a34a' }}>
              {metrics.nodesEvaluated} {metrics.efficiencyGainPercent !== '0%' && `(${metrics.efficiencyGainPercent} faster)`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteResults;
