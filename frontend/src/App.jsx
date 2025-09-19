import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointments from './pages/Appointments'
import CoinsShop from './pages/CoinsShop'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify.jsx'

import { SocketProvider } from '../../shared/sessions/providers/Socket.jsx'
// import { PeerProvider } from '../../shared/sessions/providers/Peer'
import RoomPage from '../../shared/sessions/Room'

const App = () => {
  const location = useLocation();

  // Define routes that should NOT have navbar/footer
  const hideLayoutNavbar = ["/verify"];
  const hideLayoutFooter = ["/login", "/verify"];

  // Navbar should be hidden if current path is in hideLayoutNavbar OR starts with /session
  const shouldHideNavbar =
    hideLayoutNavbar.includes(location.pathname) ||
    location.pathname.startsWith("/session");

  // Footer should be hidden if current path is in hideLayoutFooter OR starts with /session
  const shouldHideFooter =
    hideLayoutFooter.includes(location.pathname) ||
    location.pathname.startsWith("/session");

  // Wrapper should be skipped for session pages
  const skipWrapper = location.pathname.startsWith("/session");

  return (
    <>
      {!skipWrapper ? (
        <div className="mx-4 sm:mx-[10%]">
          <ToastContainer />
          {!shouldHideNavbar && <Navbar />}
          <SocketProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:speciality" element={<Doctors />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/appointment/:docId" element={<Appointments />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/coins-shop" element={<CoinsShop />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/session/:roomId" element={<RoomPage />} />
            </Routes>
          </SocketProvider>
          {!shouldHideFooter && <Footer />}
        </div>
      ) : (
        // For /session/:roomId we skip the mx wrapper but keep ToastContainer and Routes
        <>
          <ToastContainer />
          <SocketProvider>
            <Routes>
              <Route path="/session/:roomId" element={<RoomPage />} />
            </Routes>
          </SocketProvider>
        </>
      )}
    </>
  );
};

export default App;
