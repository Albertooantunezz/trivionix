// src/pages/Ranking.jsx
import React, { useState, useEffect } from 'react';
import { getRanking } from '../utils/firestore';

const Ranking = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const data = await getRanking();
      setRanking(data);
    };
    fetchRanking();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Ranking General</h1>
      {ranking.map((item, index) => (
        <div key={index}>
          <strong>{index + 1}.</strong> {item.userId} - {item.score} puntos
        </div>
      ))}
    </div>
  );
};

export default Ranking;
