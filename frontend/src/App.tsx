import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PizzaBuilder from './PizzaBuilder';
import MyOrders from './user/MyOrders';
import AdminDashboard from './admin/AdminDashboard';
import PlaceOrder from './user/PlaceOrder';

export default function App() {
  return (
    <Router>
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
          <Routes>
            <Route path="/" element={<PizzaBuilder />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/place-order" element={<PlaceOrder />} />
          </Routes>
        </main>
        <footer>
          <div>
            <p style={{fontSize: 14, textAlign: 'center', padding: 12, color: '#ffffffff'}}>
              pizza-delivery-web &copy; 2faced0w0
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
