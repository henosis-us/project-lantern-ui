import React, { useEffect, useState } from 'react';
import api from '../api/api';
import EpisodeList from './EpisodeList';
import PlayerOverlay from './PlayerOverlay'; // Import PlayerOverlay

export default function SeasonModal({ series, onClose, onPlayEpisode }) {
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [status, setStatus] = useState('loading');
  const [playingEpisode, setPlayingEpisode] = useState(null); // State for the episode to play

  useEffect(() => {
    if (!series) return;
    setStatus('loading');
    
    api.get(`/library/series/${series.id}/episodes`)
      .then((r) => {
        const episodesData = r.data || [];
        setAllEpisodes(episodesData);
        
        const uniqueSeasons = [...new Set(episodesData.map(e => e.season))].sort((a, b) => a - b);
        setSeasons(uniqueSeasons);

        // Automatically select the first season available
        if (uniqueSeasons.length > 0) {
          setSelectedSeason(uniqueSeasons[0]);
        }
        
        setStatus('loaded');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [series]);

  // When an episode is selected, set it in local state to trigger the player
  const handlePlayEpisodeLocally = (episode) => {
    setPlayingEpisode(episode);
  };

  // If an episode is being played, render the PlayerOverlay instead of the series details.
  if (playingEpisode) {
    return <PlayerOverlay movie={playingEpisode} onClose={() => setPlayingEpisode(null)} />;
  }

  // Filter episodes for the currently selected season
  const episodesForSelectedSeason = allEpisodes.filter(e => e.season === selectedSeason);

  const heroStyle = series.backdrop_path
    ? { backgroundImage: `url(https://image.tmdb.org/t/p/w1280${series.backdrop_path})` }
    : { backgroundColor: '#222' };

  const posterArt = series.poster_path
    ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
    : 'https://via.placeholder.com/500x750.png?text=No+Poster';

  return (
    <div className="series-detail-page">
      <div className="series-hero" style={heroStyle}>
        <button className="back-button" onClick={onClose}>←</button>
        <div className="series-hero-content">
          <img src={posterArt} alt={`${series.title} Poster`} className="series-hero-poster" />
          <div className="series-hero-info">
            <h1>{series.title}</h1>
            <p>{series.overview || 'No overview available.'}</p>
          </div>
        </div>
      </div>

      <div className="series-browser">
        {status === 'loading' && <p>Loading episodes...</p>}
        {status === 'error' && <p>Could not load episode information.</p>}
        
        {status === 'loaded' && (
          <>
            <div className="season-tabs">
              {seasons.length > 0 ? seasons.map((s) => (
                <button 
                  key={s} 
                  className={selectedSeason === s ? 'active' : ''}
                  onClick={() => setSelectedSeason(s)}
                >
                  {s === 0 ? 'Specials' : `Season ${s}`}
                </button>
              )) : <p>No seasons found.</p>}
            </div>

            <EpisodeList 
              episodes={episodesForSelectedSeason}
              onPlay={handlePlayEpisodeLocally} /* Use the local handler */
            />
          </>
        )}
      </div>
    </div>
  );
}