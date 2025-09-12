import express from 'express';
import { getProfile, loginUser, registerUser, updateProfile, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, contactForm, purchaseCoins, bookAppointmentWithCoins, bookAppointmentWithPayment } from '../controllers/userController.js';
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

export default userRouter;