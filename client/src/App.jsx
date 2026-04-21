import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminDiscounts from './pages/AdminDiscounts.jsx';
import AdminFlightForm from './pages/AdminFlightForm.jsx';
import AdminFlights from './pages/AdminFlights.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import Bookings from './pages/Bookings.jsx';
import Flights from './pages/Flights.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Payment from './pages/Payment.jsx';
import Register from './pages/Register.jsx';
import SeatSelection from './pages/SeatSelection.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flights" element={<Flights />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/seat-selection"
            element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-flight"
            element={
              <ProtectedRoute adminOnly>
                <AdminFlightForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/flights/:id/edit"
            element={
              <ProtectedRoute adminOnly>
                <AdminFlightForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/discounts"
            element={
              <ProtectedRoute adminOnly>
                <AdminDiscounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/flights"
            element={
              <ProtectedRoute adminOnly>
                <AdminFlights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
