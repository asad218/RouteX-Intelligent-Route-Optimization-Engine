import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { searchPlace } from '../services/geocodingApi';

const SearchInput = ({ label, placeholder, iconColor, onSelect, selectedLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  
  // Update query when selectedLocation is set externally (or cleared)
  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation.name);
    } else {
      setQuery('');
    }
  }, [selectedLocation]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query.trim() !== '' && (!selectedLocation || query !== selectedLocation.name)) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchTerm) => {
    setIsLoading(true);
    try {
      const data = await searchPlace(searchTerm);
      setResults(data);
      setIsOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (location) => {
    setQuery(location.name);
    setIsOpen(false);
    onSelect(location);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    // If user starts typing after a selection, clear the selection internally
    if (selectedLocation && e.target.value !== selectedLocation.name) {
      onSelect(null);
    }
  };

  return (
    <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <MapPin size={16} className="input-icon" color={iconColor} />
        <input
          type="text"
          className="input-field"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {isLoading && (
          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
            <Loader2 size={16} className="loading-spinner" color="#9ca3af" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          marginTop: '4px',
          padding: 0,
          margin: 0,
          listStyle: 'none',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {results.map((result, idx) => (
            <li 
              key={idx}
              onClick={() => handleSelect(result)}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: idx === results.length - 1 ? 'none' : '1px solid #f3f4f6',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ fontWeight: 500 }}>{result.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {result.displayName}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchInput;
