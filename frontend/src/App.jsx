import React from 'react';
import PizzaBuilder from './PizzaBuilder.jsx';

export default function App() {
  return (
    <div style={{
            fontFamily: 'sans-serif',
            backgroundImage:
              "url('https://static.vecteezy.com/system/resources/previews/004/671/718/non_2x/pizza-icons-seamless-pattern-free-vector.jpg')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            opacity: 0.95
          }}>
      <main>
        <PizzaBuilder />
      </main>
      <footer>
        <div>
          <p style={{fontSize: 14, textAlign: 'center', padding: 12, color: '#ffffffff'}}>
            pizza-delivery-web &copy; 2faced0w0
          </p>
        </div>
      </footer>
    </div>
  );
}
