// src/pages/ClaimServerPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { identityApi } from '../api/api';

const ClaimServerPage = () => {
  // NEW: State for the server URL, pre-filled with a common default
  const [serverUrl, setServerUrl] = useState('http://localhost:8000');
  const [token, setToken] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshServers, selectServer, availableServers } = useAuth();

  // Store the IDs of servers the user has *before* claiming the new one.
  // This helps us find the newly added server later.
  const [initialServerIds, setInitialServerIds] = useState(new Set());

  useEffect(() => {
    // Populate initialServerIds when availableServers is first loaded
    if (availableServers !== null && initialServerIds.size === 0) {
      setInitialServerIds(new Set(availableServers.map(s => s.server_unique_id)));
    }
  }, [availableServers, initialServerIds.size]); // Depend on availableServers being non-null

  const handleSubmit = async (e) => {
    e.preventDefault();
    // MODIFIED: Check for all three fields (URL, Token, Friendly Name)
    if (!token || !friendlyName || !serverUrl) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // MODIFIED: Include the serverUrl in the payload sent to the Identity Service
      await identityApi.post('/servers/claim', {
        claim_token: token,
        friendly_name: friendlyName,
        url: serverUrl, // This is the crucial new field
      });

      // On successful claim, refresh the list of servers the user has access to
      // Use the returned value from our updated refreshServers function.
      const newServerList = await refreshServers();

      // Find the server in the new list that was not in the old list.
      const newServer = newServerList.find(s => !initialServerIds.has(s.server_unique_id));

      // Automatically select the new server to make it active.
      if (newServer) {
        selectServer(newServer);
      }

      // Navigate directly to the settings page for immediate configuration.
      navigate('/settings');
    } catch (err) {
      // Provide a user-friendly error message
      const errorMsg = err.response?.data?.detail || 'Failed to claim server. The token may be invalid or expired.';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Claim Your Server</h2>
        <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
          Enter the details provided by your server's console output.
        </p>
        {error && <p className="error">{error}</p>}

        {/* NEW: Input field for the Server URL */}
        <input
          type="text"
          placeholder="Server URL (e.g., http://localhost:8000)"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Claim Token (e.g., A1B2)"
          value={token}
          onChange={(e) => setToken(e.target.value.toUpperCase())}
          maxLength="4" // Typically the token is short (e.g., 4 chars)
          required
        />
        <input
          type="text"
          placeholder="Friendly Name (e.g., Living Room TV)"
          value={friendlyName}
          onChange={(e) => setFriendlyName(e.target.value)}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Claiming...' : 'Claim Server'}
        </button>

        <div className="switch-link" style={{ marginTop: '25px' }}>
          {/* Link to go back to the previous page */}
          <a href="#" onClick={() => navigate(-1)}>Back</a>
        </div>
      </form>
    </div>
  );
};

export default ClaimServerPage;