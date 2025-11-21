import React from 'react';
import PizzaBuilder from './PizzaBuilder.jsx';

export default function App() {
  return (
    <div>
      <header style={{ padding: 12, background: '#fafafa', borderBottom: '1px solid #eee' }}>
        <h1 style={{textAlign: 'center', margin: 0, fontFamily: 'sans-serif' }}>Pizza Builder</h1>
      </header>
      <main>
        <PizzaBuilder />
      </main>
    </div>
  );
}
