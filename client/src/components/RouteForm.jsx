import React, { useState } from 'react';
import { Send, Search, RefreshCw } from 'lucide-react';
import SearchInput from './SearchInput';

const RouteForm = ({ onFindRoute, onClear, loading }) => {
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startLocation && endLocation) {
      onFindRoute(startLocation, endLocation);
    }
  };

  const handleClear = () => {
    setStartLocation(null);
    setEndLocation(null);
    onClear();
  };

  return (
    <div className="panel">
      <h2 className="panel-title">
        <Send size={20} color="#2563eb" />
        Plan Your Route
      </h2>
      <form onSubmit={handleSubmit}>
        <SearchInput 
          label="From" 
          placeholder="e.g. India Gate" 
          iconColor="#10b981" 
          selectedLocation={startLocation}
          onSelect={setStartLocation}
        />

        <SearchInput 
          label="To" 
          placeholder="e.g. Connaught Place" 
          iconColor="#ef4444" 
          selectedLocation={endLocation}
          onSelect={setEndLocation}
        />

        <button type="submit" className="btn btn-primary" disabled={loading || !startLocation || !endLocation}>
          {loading ? <RefreshCw size={18} className="loading-spinner" /> : <Search size={18} />}
          Find Route
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
          <RefreshCw size={18} />
          Clear
        </button>
      </form>
    </div>
  );
};

export default RouteForm;
