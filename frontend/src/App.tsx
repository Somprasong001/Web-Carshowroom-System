import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import AuthFormAdmin from './components/AuthFormAdmin';
import HomeClient from './components/Client/Home';
import HomeAdmin from './components/Admin/Home';
import ActivityDetails from './components/Admin/ActivityDetails';
import Contacts from './components/Admin/Contacts'; // เพิ่มการนำเข้า
import OurCars from './components/Client/OurCars';
import CarList from './components/Client/CarList';
import Reviews from './components/Client/Reviews';
import ContactUs from './components/Client/ContactUs';
import MyBookings from './components/Client/MyBookings';
import CarFilter from './components/Client/CarFilter';
import CarDetails from './components/Client/CarDetails';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';

// คอมโพเนนต์ ProtectedRoute
const ProtectedRoute: React.FC<{ element: React.ReactElement; allowedRole: string }> = ({ element, allowedRole }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  console.log('ProtectedRoute:', { isAuthenticated, userRole, allowedRole, loading });

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
        <div className="flex items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Redirecting to /login because user is not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (userRole !== allowedRole) {
    console.log(`Redirecting to ${userRole === 'admin' ? '/admin/home' : '/client/home'} because userRole (${userRole}) does not match allowedRole (${allowedRole})`);
    return <Navigate to={userRole === 'admin' ? '/admin/home' : '/client/home'} replace />;
  }

  return element;
};

// คอมโพเนนต์ AppRoutes
const AppRoutes: React.FC = () => {
  const { isAuthenticated, userRole, loading } = useAuth();

  console.log('AppRoutes:', { isAuthenticated, userRole, loading });

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
        <div className="flex items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <div className="bg-[#0a0a0a] min-h-screen flex flex-col items-center justify-center">
        <Routes>
          {/* เส้นทางสำหรับ Client Login */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={userRole === 'admin' ? '/admin/home' : '/client/home'} replace />
              ) : (
                <AuthForm />
              )
            }
          />

          {/* เส้นทางสำหรับ Admin Login */}
          <Route
            path="/admin/login"
            element={
              isAuthenticated ? (
                <Navigate to={userRole === 'admin' ? '/admin/home' : '/client/home'} replace />
              ) : (
                <AuthFormAdmin />
              )
            }
          />

          {/* เส้นทางสำหรับ Client Home */}
          <Route
            path="/client/home"
            element={<ProtectedRoute element={<HomeClient />} allowedRole="client" />}
          />

          {/* เส้นทางสำหรับ Admin Home */}
          <Route
            path="/admin/home"
            element={<ProtectedRoute element={<HomeAdmin />} allowedRole="admin" />}
          />

          {/* เส้นทางสำหรับ Activity Details (Admin) */}
          <Route
            path="/admin/activity-details"
            element={<ProtectedRoute element={<ActivityDetails />} allowedRole="admin" />}
          />

          {/* เส้นทางสำหรับ Contacts (Admin) */}
          <Route
            path="/admin/contacts"
            element={<ProtectedRoute element={<Contacts />} allowedRole="admin" />}
          />

          {/* เส้นทางสำหรับ Our Cars */}
          <Route
            path="/client/home/our-cars"
            element={<ProtectedRoute element={<OurCars />} allowedRole="client" />}
          />

          {/* เส้นทางสำหรับ Car List */}
          <Route
            path="/client/home/car-list"
            element={<ProtectedRoute element={<CarList />} allowedRole="client" />}
          />

          {/* เส้นทางสำหรับ Filter Cars */}
          <Route
            path="/client/home/filter-cars"
            element={<ProtectedRoute element={<CarFilter />} allowedRole="client" />}
          />

          {/* เส้นทางสำหรับ Reviews */}
          <Route
            path="/client/home/reviews"
            element={<ProtectedRoute element={<Reviews />} allowedRole="client" />}
          />

          {/* เส้นทางสำหรับ Contact Us */}
          <Route
            path="/client/home/contact-us"
            element={<ProtectedRoute element={<ContactUs />} allowedRole="client" />}
          />

          {/* เส้นทางสำหรับ My Bookings */}
          <Route
            path="/client/home/my-bookings"
            element={<ProtectedRoute element={<MyBookings />} allowedRole="client" />}
          />

          {/* เส้นทางสำหรับ Car Details */}
          <Route
            path="/client/home/car-details/:id"
            element={<ProtectedRoute element={<CarDetails />} allowedRole="client" />}
          />

          {/* เส้นทางเก่า /home เพื่อ redirect ตาม role */}
          <Route
            path="/home"
            element={
              isAuthenticated ? (
                <Navigate to={userRole === 'admin' ? '/admin/home' : '/client/home'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* เส้นทางสำหรับ Admin (redirect ไป /admin/login) */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/login" replace />}
          />

          {/* เส้นทาง Default (redirect ไป /login) */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* เส้นทางสำหรับกรณีไม่พบหน้า */}
          <Route path="*" element={<div className="text-white text-center pt-20">404 - Page Not Found</div>} />
        </Routes>
      </div>
    </AnimatePresence>
  );
};

// คอมโพเนนต์หลัก
const App: React.FC = () => {
  return (
    <Router basename="/">
      <AuthProvider>
        <Suspense fallback={<div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;