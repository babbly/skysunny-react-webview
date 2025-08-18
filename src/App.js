import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import CheckPayment from './pages/CheckPayment';
import CompletePayment from './pages/CompletePayment';
import Coupon from './pages/Coupon';
import QrCode from './pages/QrCode';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/coupon" />} />
        <Route path="/check-payment" element={<CheckPayment />} />
        <Route path="/complete-payment" element={<CompletePayment />} />
        <Route path="/coupon" element={<Coupon />} />
        <Route path="/qr-code" element={<QrCode />} />
      </Routes>
    </Router>
  );
}

export default App;
