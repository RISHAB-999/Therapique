import React, { useContext } from 'react'
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';

import { SocketProvider } from '../../shared/sessions/providers/Socket.jsx'
import RoomPage from '../../shared/sessions/Room'

const App = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const location = useLocation();

  // Skip sidebar/navbar wrapper on session routes
  const isSessionRoute = location.pathname.startsWith("/session");

  if (!dToken && !aToken) return <Login />;

  return (
    <>
      <ToastContainer />
      {!isSessionRoute ? (
        <div className='bg-[#F8F9FD]'>
          {!isSessionRoute && <Navbar />}
          <div className='flex items-start'>
            <Sidebar />
            <SocketProvider>
              <Routes>
                {/* Admin Routes */}
                <Route path='/' element={<></>} />
                <Route path='/admin-dashboard' element={<Dashboard />} />
                <Route path='/all-appointments' element={<AllAppointments />} />
                <Route path='/add-doctor' element={<AddDoctor />} />

                {/* Doctor Routes */}
                <Route path='/doctor-list' element={<DoctorsList />} />
                <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
                <Route path='/doctor-appointments' element={<DoctorAppointments />} />
                <Route path='/doctor-profile' element={<DoctorProfile />} />

                {/* Session Route (still defined for routing, but won't render here) */}
                <Route path="/session/:roomId" element={<RoomPage />} />
              </Routes>
            </SocketProvider>
          </div>
        </div>
      ) : (
        // Session route full-width, no sidebar/navbar/flex
        <SocketProvider>
          <Routes>
            <Route path="/session/:roomId" element={<RoomPage />} />
          </Routes>
        </SocketProvider>
      )}
    </>
  );
}

export default App;
