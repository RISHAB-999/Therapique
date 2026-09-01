import React, { useContext, useEffect } from 'react'
import Login from './pages/Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import AddBook from './pages/Admin/AddBook';
import BookList from './pages/Admin/BookList';
import BookOrders from './pages/Admin/BookOrders';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import { useDoctorSocket } from './hooks/useDoctorSocket';
import IncomingCallModal from './components/IncomingCallModal';
import DoctorVideoCallPage from './components/videocall/DoctorVideoCallPage';

const App = () => {
  const { dToken, doctorSocket } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const location = useLocation()
  const navigate = useNavigate()

  const handleAcceptIncomingCall = (callData) => {
    if (doctorSocket) {
      doctorSocket.acceptCall(callData)
    }
    navigate(`/doctor-video-call/${callData.appointmentId}`)
  }

  const isVideoCallRoute = 
    location.pathname.startsWith('/doctor-video-call/') || 
    location.pathname.startsWith('/doctor_video_call/') || 
    location.pathname.startsWith('/doctor%20video%20call/')

  if (isVideoCallRoute) {
    return (
      <>
        <ToastContainer />
        <Routes>
          <Route path='/doctor-video-call/:appointmentId' element={<DoctorVideoCallPage />} />
          <Route path='/doctor_video_call/:appointmentId' element={<DoctorVideoCallPage />} />
          <Route path='/doctor%20video%20call/:appointmentId' element={<DoctorVideoCallPage />} />
          <Route path='*' element={<Navigate to='/doctor-appointments' replace />} />
        </Routes>
      </>
    )
  }

  return dToken || aToken ? (
    <div className='bg-[#F8F9FD] min-h-screen flex flex-col'>
      <ToastContainer />
      <Navbar />
      <div className='flex-1 flex items-start w-full relative min-h-[calc(100vh-60px)]'>
        <Sidebar />
        <main className='flex-1 w-full min-w-0 bg-[#F8F9FD] p-4 sm:p-6 lg:p-8 pb-20 min-h-[calc(100vh-60px)] overflow-x-hidden'>
          <Routes>
            {/* Space & Underscore URL Normalization Redirects */}
            <Route path='/doctor%20appointments' element={<Navigate to='/doctor-appointments' replace />} />
            <Route path='/doctor_appointments' element={<Navigate to='/doctor-appointments' replace />} />
            <Route path='/doctor%20profile' element={<Navigate to='/doctor-profile' replace />} />
            <Route path='/doctor_profile' element={<Navigate to='/doctor-profile' replace />} />
            <Route path='/doctor%20dashboard' element={<Navigate to='/doctor-dashboard' replace />} />
            <Route path='/doctor_dashboard' element={<Navigate to='/doctor-dashboard' replace />} />
            <Route path='/admin%20dashboard' element={<Navigate to='/admin-dashboard' replace />} />
            <Route path='/admin_dashboard' element={<Navigate to='/admin-dashboard' replace />} />
            <Route path='/all_appointments' element={<Navigate to='/all-appointments' replace />} />

            {/* Admin Routes */}
            <Route path='/admin-dashboard' element={<Dashboard />} />
            <Route path='/all-appointments' element={<AllAppointments />} />
            <Route path='/add-doctor' element={<AddDoctor />} />
            <Route path='/doctor-list' element={<DoctorsList />} />

            {/* Library / Book Store Admin Routes */}
            <Route path='/add-book' element={<AddBook />} />
            <Route path='/book-list' element={<BookList />} />
            <Route path='/book-orders' element={<BookOrders />} />
            
            {/* Doctor Routes */}
            <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
            <Route path='/doctor-appointments' element={<DoctorAppointments />} />
            <Route path='/doctor-profile' element={<DoctorProfile />} />
            <Route path='/doctor-video-call/:appointmentId' element={<DoctorVideoCallPage />} />
            <Route path='/doctor_video_call/:appointmentId' element={<DoctorVideoCallPage />} />

            {/* Wildcard Fallback */}
            <Route path='*' element={<Navigate to={dToken ? '/doctor-dashboard' : aToken ? '/admin-dashboard' : '/'} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  ) : (
    <Login />
  );
}

export default App