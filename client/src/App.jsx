import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Account from './pages/Account.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminAircraft from './pages/AdminAircraft.jsx';
import AdminDiscounts from './pages/AdminDiscounts.jsx';
import AdminFlightForm from './pages/AdminFlightForm.jsx';
import AdminFlights from './pages/AdminFlights.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import Bookings from './pages/Bookings.jsx';
import Flights from './pages/Flights.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Notifications from './pages/Notifications.jsx';
import Payment from './pages/Payment.jsx';
import Register from './pages/Register.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import SeatSelection from './pages/SeatSelection.jsx';
import SiteInfoPage from './pages/SiteInfoPage.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/company" element={<SiteInfoPage />} />
          <Route path="/help-center" element={<SiteInfoPage />} />
          <Route path="/privacy-settings" element={<SiteInfoPage />} />
          <Route path="/cookie-policy" element={<SiteInfoPage />} />
          <Route path="/privacy-policy" element={<SiteInfoPage />} />
          <Route path="/terms-of-service" element={<SiteInfoPage />} />
          <Route path="/company-details" element={<SiteInfoPage />} />
          <Route path="/partners" element={<SiteInfoPage />} />
          <Route path="/trips" element={<SiteInfoPage />} />
          <Route path="/international-sites" element={<SiteInfoPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
            path="/admin/aircraft"
            element={
              <ProtectedRoute adminOnly>
                <AdminAircraft />
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
