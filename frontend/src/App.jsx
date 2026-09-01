import React, { useState, useContext, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from './components/ScrollToTop.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { PageTransition } from './components/ScrollReveal'
import { AppContext } from './context/AppContext'
import PendingRefundModal from './components/PendingRefundModal.jsx'

// Lazy-load all non-homepage routes for faster initial load
const Doctors = lazy(() => import('./pages/Doctors'))
const Login = lazy(() => import('./pages/Login'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const MyProfile = lazy(() => import('./pages/MyProfile'))
const MyAppointments = lazy(() => import('./pages/MyAppointments'))
const Appointments = lazy(() => import('./pages/Appointments'))
const CoinsShop = lazy(() => import('./pages/CoinsShop'))
const Verify = lazy(() => import('./pages/Verify.jsx'))
const Library = lazy(() => import('./pages/Library.jsx'))
const Shop = lazy(() => import('./pages/Shop.jsx'))
const CategoryShop = lazy(() => import('./pages/CategoryShop.jsx'))
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const AddressForm = lazy(() => import('./pages/AddressForm.jsx'))
const MyOrders = lazy(() => import('./pages/MyOrders.jsx'))
const TrackOrder = lazy(() => import('./pages/TrackOrder.jsx'))
const VideoCallPage = lazy(() => import('./components/videocall/VideoCallPage.jsx'))
const PrivacyTerms = lazy(() => import('./pages/PrivacyTerms.jsx'))

// Minimal loading fallback that matches the site theme
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
  </div>
)

const App = () => {
  const location = useLocation();
  const { setHeroReady } = useContext(AppContext);
  // Show splash screen on home page load / refresh
  const [showSplash, setShowSplash] = useState(() => location.pathname === '/');

  const handleSplitStart = () => {
    setHeroReady(true);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setHeroReady(true);
  };

  // Define routes that should NOT have navbar/footer
  const isVideoCallRoute = 
    location.pathname.startsWith('/video-call') || 
    location.pathname.startsWith('/video_call') ||
    location.pathname.includes('video_call') ||
    location.pathname.includes('video-call')

  const hideLayoutRoutes = ["/login", "/verify"];
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname) || isVideoCallRoute;

  if (isVideoCallRoute) {
    return (
      <>
        <ToastContainer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path='/video-call/:appointmentId' element={<VideoCallPage />} />
            <Route path='/video_call/:appointmentId' element={<VideoCallPage />} />
          </Routes>
        </Suspense>
      </>
    )
  }

  const getBasePagePath = (pathname) => {
    if (!pathname) return '/'
    const lower = pathname.toLowerCase()
    if (lower.startsWith('/doctors')) return '/doctors'
    if (lower.startsWith('/shop')) return '/shop'
    return pathname
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} onSplitStart={handleSplitStart} />}
      </AnimatePresence>
      <ScrollToTop />
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-h-screen'>
        <ToastContainer />
        <PendingRefundModal />
        <Navbar />
          <PageTransition pathname={getBasePagePath(location.pathname)}>
            <div key={`content-${getBasePagePath(location.pathname)}`}>
              <Suspense fallback={<PageLoader />}>
                <Routes location={location}>
                  {/* Public Routes */}
                  <Route path='/' element={<Home />} />
                  <Route path='/doctors' element={<Doctors />} />
                  <Route path='/doctors/:speciality' element={<Doctors />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/about' element={<About />} />
                  <Route path='/contact' element={<Contact />} />
                  <Route path='/Library' element={<Library />} />
                  <Route path='/verify' element={<Verify />} />
                  <Route path='/privacy-terms' element={<PrivacyTerms />} />
                  <Route path='/privacy-policy' element={<PrivacyTerms />} />

                  {/* Protected Routes (Require Account) */}
                  <Route path='/appointment/:docId' element={
                    <ProtectedRoute context="doctor" title="Doctor Appointment" message="Please log in or create an account to book an appointment with a doctor">
                      <Appointments />
                    </ProtectedRoute>
                  } />
                  <Route path='/my-appointments' element={
                    <ProtectedRoute context="consultations" title="My Consultations" message="Please log in to view and manage your consultations">
                      <MyAppointments />
                    </ProtectedRoute>
                  } />
                  <Route path='/my-profile' element={
                    <ProtectedRoute context="profile" title="My Profile" message="Please log in to view and manage your profile">
                      <MyProfile />
                    </ProtectedRoute>
                  } />
                  <Route path='/coins-shop' element={
                    <ProtectedRoute context="coins" title="Token Wallet & Shop" message="Please log in to visit the token wallet & shop">
                      <CoinsShop />
                    </ProtectedRoute>
                  } />
                  <Route path='/Shop' element={
                    <ProtectedRoute context="book" title="Psychology Books" message="Please log in or create an account to explore the bookstore">
                      <Shop />
                    </ProtectedRoute>
                  } />
                  <Route path='/Shop/:category' element={
                    <ProtectedRoute context="book" title="Book Categories" message="Please log in or create an account to browse books">
                      <CategoryShop />
                    </ProtectedRoute>
                  } />
                  <Route path='/Shop/:category/:id' element={
                    <ProtectedRoute context="book" title="Book Details" message="Please log in or create an account to view book details">
                      <ProductDetail />
                    </ProtectedRoute>
                  } />
                  <Route path='/cart' element={
                    <ProtectedRoute context="cart" title="Shopping Cart" message="Please log in to access your cart">
                      <Cart />
                    </ProtectedRoute>
                  } />
                  <Route path='/address-form' element={
                    <ProtectedRoute context="checkout" title="Delivery & Checkout" message="Please log in to enter delivery address">
                      <AddressForm />
                    </ProtectedRoute>
                  } />
                  <Route path='/my-orders' element={
                    <ProtectedRoute context="orders" title="Order Tracking" message="Please log in to view and track your orders">
                      <MyOrders />
                    </ProtectedRoute>
                  } />
                  <Route path='/track-order/:orderId' element={
                    <ProtectedRoute context="orders" title="Order Tracking" message="Please log in to track your order">
                      <TrackOrder />
                    </ProtectedRoute>
                  } />
                  <Route path='/video-call/:appointmentId' element={
                    <ProtectedRoute context="videocall" title="Video Consultation" message="Please log in to join your session">
                      <VideoCallPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Suspense>
            </div>
          </PageTransition>
        </div>
      {!shouldHideLayout && <Footer />}
    </>
  )
}

export default App
