import React, { useEffect, useState } from 'react';
import { api } from './api.js';

export default function App() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pizzas').then(r => setPizzas(r)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Pizza Menu</h1>
      <ul>
        {pizzas.map(p => (
          <li key={p.id}>
            <strong>{p.name}</strong> - ${p.base_price} {p.description && <span>- {p.description}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
