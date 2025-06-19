import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Header from '../components/Header';
import SeriesCard from '../components/SeriesCard';
import SeasonModal from '../components/SeasonModal';

export default function SeriesPage() {
  const [series, setSeries] = useState([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('Loading series…');

  useEffect(() => {
    api.get('/library/series')
      .then((r) => {
        setSeries(r.data);
        setStatus('');
      })
      .catch(() => setStatus('Failed to load series'));
  }, []);

  const list = !filter
    ? series
    : series.filter((s) => s.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <Header onSearchChange={setFilter} />
      {status && !list.length ? (
        <p id="status-message">{status}</p>
      ) : (
        <div id="library">
          {list.map((s) => (
            <SeriesCard key={s.id} series={s} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <SeasonModal series={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}