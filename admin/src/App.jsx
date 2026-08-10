import React, { useContext } from 'react'
import Login from './pages/Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import { Route, Routes } from 'react-router-dom';
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

const App = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  return dToken || aToken ? (
    <div className='bg-[#F8F9FD] min-h-screen flex flex-col'>
      <ToastContainer />
      <Navbar />
      <div className='flex-1 flex items-start w-full relative min-h-[calc(100vh-60px)]'>
        <Sidebar />
        <main className='flex-1 w-full min-w-0 bg-[#F8F9FD] p-4 sm:p-6 lg:p-8 pb-20 min-h-[calc(100vh-60px)] overflow-x-hidden'>
          <Routes>
            {/* Admin Routes */}
            <Route path='/' element={<></>} />
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
          </Routes>
        </main>
      </div>
    </div>
  ) : (
    <Login />
  );
}

export default App