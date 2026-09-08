/**
 * Centralized Application Routes for Therapique Frontend
 * Single source of truth for all application navigation paths and parameterized route builders.
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  DOCTORS: '/doctors',
  DOCTORS_SPECIALITY: (speciality = ':speciality') => `/doctors/${speciality}`,
  LOGIN: '/login',
  ABOUT: '/about',
  CONTACT: '/contact',
  LIBRARY: '/Library',
  BLOG: '/blog',
  VERIFY: '/verify',
  PRIVACY_TERMS: '/privacy-terms',
  PRIVACY_POLICY: '/privacy-policy',

  // Protected Routes
  APPOINTMENT: (docId = ':docId') => `/appointment/${docId}`,
  MY_APPOINTMENTS: '/my-appointments',
  MY_PROFILE: '/my-profile',
  COINS_SHOP: '/coins-shop',
  SHOP: '/Shop',
  SHOP_CATEGORY: (category = ':category') => `/Shop/${category}`,
  SHOP_PRODUCT: (category = ':category', id = ':id') => `/Shop/${category}/${id}`,
  CART: '/cart',
  ADDRESS_FORM: '/address-form',
  MY_ORDERS: '/my-orders',
  TRACK_ORDER: (orderId = ':orderId') => `/track-order/${orderId}`,
  VIDEO_CALL: (appointmentId = ':appointmentId') => `/video-call/${appointmentId}`,
}

export default ROUTES
