import express from 'express';
import { getProfile, loginUser, registerUser, updateProfile, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, contactForm, purchaseCoins, verifyCoinsPayment, bookAppointmentWithCoins, bookAppointmentWithPayment, createBookOrderRazorpay, verifyBookOrderRazorpay, placeBookOrderCOD, placeBookOrderTokens, getUserOrders, getSingleOrder, updateOrderStatus } from '../controllers/userController.js';
import upload from '../middlewares/multer.js';
import authUser from '../middlewares/authUser.js';
const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/contact", authUser, contactForm)

userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment-payment", authUser, bookAppointmentWithPayment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)

userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)

// Coin-related routes
userRouter.post("/book-appointment-coins", authUser, bookAppointmentWithCoins)
userRouter.post("/purchase-coins", authUser, purchaseCoins)
userRouter.post("/verify-coins-payment", authUser, verifyCoinsPayment)

// Book Order routes
userRouter.post("/create-book-order-razorpay", authUser, createBookOrderRazorpay)
userRouter.post("/verify-book-order-razorpay", authUser, verifyBookOrderRazorpay)
userRouter.post("/place-book-order-cod", authUser, placeBookOrderCOD)
userRouter.post("/place-book-order-tokens", authUser, placeBookOrderTokens)
userRouter.get("/user-orders", authUser, getUserOrders)
userRouter.get("/order/:orderId", authUser, getSingleOrder)
userRouter.post("/update-order-status", updateOrderStatus)

export default userRouter;