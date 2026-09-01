import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import contactModel from "../models/contactModel.js";
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from 'razorpay';
import crypto from 'crypto';
import orderModel from "../models/orderModel.js";
import {
    sendAppointmentBookingEmail,
    sendDoctorNewAppointmentAlert,
    sendAppointmentCancellationEmail,
    sendRefundConfirmedEmail,
    sendBookOrderPlacedEmail,
    sendOrderStatusUpdateEmail,
    sendContactFormEmails
} from '../services/emailService.js';

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!userId) {
            return res.json({ success: false, message: "User ID missing or unauthorized" })
        }

        let parsedAddress = address
        if (typeof address === 'string') {
            try {
                parsedAddress = JSON.parse(address)
            } catch (e) {
                parsedAddress = address
            }
        }

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (phone !== undefined) updateData.phone = phone
        if (parsedAddress !== undefined) updateData.address = parsedAddress
        if (dob !== undefined) updateData.dob = dob
        if (gender !== undefined) updateData.gender = gender

        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            updateData.image = imageUpload.secure_url
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true })

        // Synchronize updated user profile image & info across all their past & active appointments
        const appointmentUserUpdates = {}
        if (updateData.image) appointmentUserUpdates["userData.image"] = updateData.image
        if (updateData.name) appointmentUserUpdates["userData.name"] = updateData.name
        if (updateData.phone) appointmentUserUpdates["userData.phone"] = updateData.phone
        if (updateData.dob) appointmentUserUpdates["userData.dob"] = updateData.dob
        if (updateData.gender) appointmentUserUpdates["userData.gender"] = updateData.gender
        if (Object.keys(appointmentUserUpdates).length > 0) {
            await appointmentModel.updateMany({ userId }, { $set: appointmentUserUpdates }).catch(err => console.log("Appointment user sync error:", err.message))
        }

        res.json({ success: true, message: 'Profile Updated', userData: updatedUser })

    } catch (error) {
        console.log("Error in updateProfile:", error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId }).lean()

        // Fetch latest doctor profiles to ensure doctor profile pictures and details are always up-to-date across all appointments
        const docIds = [...new Set(appointments.map(a => a.docId).filter(Boolean))]
        const doctors = await doctorModel.find({ _id: { $in: docIds } }).select('image name speciality address fees').lean()
        const docMap = new Map(doctors.map(d => [d._id.toString(), d]))

        const updatedAppointments = appointments.map(app => {
            const doc = docMap.get(app.docId?.toString())
            if (doc) {
                return {
                    ...app,
                    docData: {
                        ...app.docData,
                        image: doc.image || app.docData?.image,
                        name: doc.name || app.docData?.name,
                        speciality: doc.speciality || app.docData?.speciality,
                        address: doc.address || app.docData?.address,
                        fees: doc.fees !== undefined ? doc.fees : app.docData?.fees
                    }
                }
            }
            return app
        })

        res.json({ success: true, appointments: updatedAppointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId, refundChoice } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment already cancelled or not found' })
        }

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // Fetch patient info for cancellation email
        const patientUser = await userModel.findById(userId);

        // releasing doctor slot 
        const { docId, slotDate, slotTime, payment, amount, paidWithCoins } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked || {}

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
            await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        }

        // Handle Refunds if payment was completed
        if (payment && amount) {
            if (paidWithCoins || refundChoice === 'tokens') {
                // Refund as Tokens directly to user wallet
                const user = await userModel.findById(userId)
                if (user) {
                    user.therapiqueCoins = (user.therapiqueCoins || 0) + amount
                    user.coinsTransactions.push({
                        type: 'earn',
                        amount: amount,
                        description: `Refund for Cancelled Appointment (Dr. ${doctorData?.name || 'Doctor'})`,
                        date: new Date()
                    })
                    await user.save()
                    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'refunded_tokens' })
                    sendAppointmentCancellationEmail({
                        appointmentId,
                        patientEmail: patientUser?.email, patientName: patientUser?.name,
                        doctorEmail: doctorData?.email, doctorName: doctorData?.name, 
                        slotDate, slotTime,
                        cancelledBy: 'user',
                        refundMessage: `${amount} Therapique Tokens refunded to your wallet.`
                    }).catch(e => console.log('Email error:', e.message));
                    return res.json({ 
                        success: true, 
                        message: `Appointment Cancelled. ${amount} Therapique Tokens refunded to your wallet!`,
                        therapiqueCoins: user.therapiqueCoins,
                        refundedCoins: amount
                    })
                }
            } else if (refundChoice === 'bank') {
                // User chose direct Bank / UPI Refund via Razorpay
                try {
                    if (appointmentData.paymentId && razorpayInstance) {
                        await razorpayInstance.payments.refund(appointmentData.paymentId, {
                            amount: amount * 100,
                            speed: "optimum",
                            notes: { reason: "Appointment cancelled by user" }
                        })
                        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'refunded_bank' })
                        sendAppointmentCancellationEmail({
                            appointmentId,
                            patientEmail: patientUser?.email, patientName: patientUser?.name,
                            doctorEmail: doctorData?.email, doctorName: doctorData?.name, 
                            slotDate, slotTime,
                            cancelledBy: 'user',
                            refundMessage: `₹${amount} refund initiated to your bank/UPI via Razorpay.`
                        }).catch(e => console.log('Email error:', e.message));
                        const user = await userModel.findById(userId).select('therapiqueCoins')
                        return res.json({ 
                            success: true, 
                            message: `Appointment Cancelled. ₹${amount} refund initiated directly to your bank / UPI account via Razorpay!`,
                            therapiqueCoins: user?.therapiqueCoins || 0
                        })
                    }
                } catch (razorpayErr) {
                    console.log("Razorpay Bank Refund API fallback to wallet:", razorpayErr.message)
                }

                // Fallback: If Razorpay API key is in test mode or no paymentId exists, refund as 1:1 Tokens
                const user = await userModel.findById(userId)
                if (user) {
                    user.therapiqueCoins = (user.therapiqueCoins || 0) + amount
                    user.coinsTransactions.push({
                        type: 'earn',
                        amount: amount,
                        description: `Refund for Cancelled Appointment (Dr. ${doctorData?.name || 'Doctor'})`,
                        date: new Date()
                    })
                    await user.save()
                    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'refunded_tokens' })
                    sendAppointmentCancellationEmail({
                        appointmentId,
                        patientEmail: patientUser?.email, patientName: patientUser?.name,
                        doctorEmail: doctorData?.email, doctorName: doctorData?.name, 
                        slotDate, slotTime,
                        cancelledBy: 'user',
                        refundMessage: `₹${amount} credited as ${amount} Tokens to your wallet.`
                    }).catch(e => console.log('Email error:', e.message));
                    return res.json({ 
                        success: true, 
                        message: `Appointment Cancelled. ₹${amount} credited as ${amount} Tokens to your wallet!`,
                        therapiqueCoins: user.therapiqueCoins,
                        refundedCoins: amount
                    })
                }
            } else {
                // User cancelled without specifying choice -> mark pending_choice
                await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'pending_choice' });
                sendAppointmentCancellationEmail({
                    appointmentId,
                    patientEmail: patientUser?.email, patientName: patientUser?.name,
                    doctorEmail: doctorData?.email, doctorName: doctorData?.name, 
                    slotDate: appointmentData.slotDate, slotTime: appointmentData.slotTime,
                    cancelledBy: 'user',
                    needsRefundChoice: true,
                    amount
                }).catch(e => console.log('Email error:', e.message));
                const currentUser = await userModel.findById(userId).select('therapiqueCoins')
                return res.json({ 
                    success: true, 
                    message: 'Appointment Cancelled. Please choose your refund method on the website.', 
                    therapiqueCoins: currentUser?.therapiqueCoins || 0 
                });
            }
        }

        // No-payment cancellation email
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'none' })
        sendAppointmentCancellationEmail({
            appointmentId,
            patientEmail: patientUser?.email, patientName: patientUser?.name,
            doctorEmail: doctorData?.email, doctorName: doctorData?.name, 
            slotDate: appointmentData.slotDate, slotTime: appointmentData.slotTime,
            cancelledBy: 'user'
        }).catch(e => console.log('Email error:', e.message));
        const currentUser = await userModel.findById(userId).select('therapiqueCoins')
        res.json({ success: true, message: 'Appointment Cancelled', therapiqueCoins: currentUser?.therapiqueCoins || 0 })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

//Api to make payment of appointment using Razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//Api to make verify payment of appointment using Razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { 
                payment: true,
                paymentId: razorpay_payment_id || orderInfo.id || ""
            })

            // Send booking confirmation emails (non-blocking)
            const appointment = await appointmentModel.findById(orderInfo.receipt);
            if (appointment) {
                const patient = await userModel.findById(appointment.userId);
                const doctor = await doctorModel.findById(appointment.docId);
                if (patient && doctor) {
                    sendAppointmentBookingEmail({
                        appointmentId: appointment._id,
                        patientEmail: patient.email, patientName: patient.name,
                        doctorName: doctor.name, doctorSpeciality: doctor.speciality,
                        slotDate: appointment.slotDate, slotTime: appointment.slotTime,
                        amount: appointment.amount, paymentMethod: 'Razorpay'
                    }).catch(e => console.log('Email error:', e.message));
                    sendDoctorNewAppointmentAlert({
                        appointmentId: appointment._id,
                        doctorEmail: doctor.email, doctorName: doctor.name,
                        patientName: patient.name,
                        slotDate: appointment.slotDate, slotTime: appointment.slotTime
                    }).catch(e => console.log('Email error:', e.message));
                }
            }

            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment with immediate Razorpay payment
const bookAppointmentWithPayment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Create Razorpay order for immediate payment
        const options = {
            amount: docData.fees * 100,
            currency: process.env.CURRENCY,
            receipt: newAppointment._id.toString(),
        }

        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, message: 'Appointment Booked', order, appointmentId: newAppointment._id })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to handle contact form submission
const contactForm = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, message, userId } = req.body;
        
        // Check if all required fields are provided
        if (!firstName || !lastName || !email || !phone || !message) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' });
        }
        
        // Validate phone number (basic validation)
        if (phone.length < 10) {
            return res.json({ success: false, message: 'Please enter a valid phone number' });
        }

        // Create new contact entry in database
        const contactData = new contactModel({
            userId,
            firstName,
            lastName,
            email,
            phone,
            message
        });

        const savedContact = await contactData.save();

        // Send email notifications (admin alert + user auto-reply)
        sendContactFormEmails({ firstName, lastName, email, phone, message })
            .catch(e => console.log('Email error:', e.message));

        res.json({ 
            success: true, 
            message: 'Thank you for contacting us! We will get back to you soon.',
            contactId: savedContact._id
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to purchase Therapique coins
const purchaseCoins = async (req, res) => {
    try {
        const { userId, coinPackage } = req.body;
        
        // Define coin packages with prices and bonus coins
        const coinPackages = {
            basic: { coins: 100, price: 99, bonus: 0 },
            standard: { coins: 500, price: 499, bonus: 50 },
            premium: { coins: 1000, price: 999, bonus: 150 },
            mega: { coins: 2000, price: 1899, bonus: 400 }
        };

        if (!coinPackages[coinPackage]) {
            return res.json({ success: false, message: 'Invalid coin package' });
        }

        const packageData = coinPackages[coinPackage];
        const totalCoins = packageData.coins + packageData.bonus;

        // Create Razorpay order for coin purchase
        const receiptId = `coins_${Date.now().toString().slice(-8)}`;
        const options = {
            amount: packageData.price * 100, // amount in paise
            currency: process.env.CURRENCY,
            receipt: receiptId,
            notes: {
                userId: userId,
                coinPackage: coinPackage,
                totalCoins: totalCoins
            }
        };

        const order = await razorpayInstance.orders.create(options);

        res.json({ 
            success: true, 
            order,
            packageData: {
                ...packageData,
                totalCoins
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to verify coin purchase payment
const verifyCoinsPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // Verify the payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is verified, get order details
            const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
            
            if (orderInfo.status === 'paid') {
                const { userId, coinPackage, totalCoins } = orderInfo.notes;
                
                // Update user's coin balance
                const user = await userModel.findById(userId);
                user.therapiqueCoins += parseInt(totalCoins);
                
                // Add transaction record
                user.coinsTransactions.push({
                    type: 'purchase',
                    amount: parseInt(totalCoins),
                    description: `Purchased ${coinPackage} package`,
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id
                });

                await user.save();

                res.json({ 
                    success: true, 
                    message: `Successfully purchased ${totalCoins} Therapique coins!`,
                    newBalance: user.therapiqueCoins
                });
            } else {
                res.json({ success: false, message: 'Payment not completed' });
            }
        } else {
            res.json({ success: false, message: 'Invalid payment signature' });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to book appointment with coins
const bookAppointmentWithCoins = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;
        const docData = await doctorModel.findById(docId).select("-password");

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' });
        }

        const user = await userModel.findById(userId);
        const appointmentCost = docData.fees; // Cost in coins equals the fee amount

        // Check if user has enough coins
        if (user.therapiqueCoins < appointmentCost) {
            return res.json({ 
                success: false, 
                message: `Insufficient coins. You need ${appointmentCost} coins but have only ${user.therapiqueCoins}` 
            });
        }

        let slots_booked = docData.slots_booked;

        // Check for slot availability 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime);
        }

        const userData = await userModel.findById(userId).select("-password");
        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
            payment: true, // Mark as paid since coins were used
            paidWithCoins: true
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // Deduct coins from user account
        user.therapiqueCoins -= appointmentCost;
        
        // Add transaction record
        user.coinsTransactions.push({
            type: 'spend',
            amount: appointmentCost,
            description: `Appointment with ${docData.name}`,
            appointmentId: newAppointment._id
        });

        await user.save();

        // Save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        // Send booking confirmation emails (non-blocking)
        sendAppointmentBookingEmail({
            appointmentId: newAppointment._id,
            patientEmail: userData.email, patientName: userData.name,
            doctorName: docData.name, doctorSpeciality: docData.speciality,
            slotDate, slotTime, amount: appointmentCost, paymentMethod: 'Therapique Tokens'
        }).catch(e => console.log('Email error:', e.message));
        sendDoctorNewAppointmentAlert({
            appointmentId: newAppointment._id,
            doctorEmail: docData.email, doctorName: docData.name,
            patientName: userData.name, slotDate, slotTime
        }).catch(e => console.log('Email error:', e.message));

        res.json({ 
            success: true, 
            message: 'Appointment Booked with Therapique Coins!',
            remainingCoins: user.therapiqueCoins
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to create book order with Razorpay
const createBookOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        if (!items || items.length === 0 || !amount || !address) {
            return res.json({ success: false, message: 'Invalid order details' });
        }

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "RazorPay",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: process.env.CURRENCY || 'INR',
            receipt: newOrder._id.toString(),
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        res.json({
            success: true,
            order: razorpayOrder,
            orderId: newOrder._id
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to verify book order Razorpay payment
const verifyBookOrderRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            await orderModel.findByIdAndUpdate(orderId, { payment: true, status: 'Paid' });

            // Send order invoice email (non-blocking)
            const order = await orderModel.findById(orderId);
            if (order) {
                const customer = await userModel.findById(order.userId);
                sendBookOrderPlacedEmail({
                    userEmail: customer?.email, userName: customer?.name,
                    orderId: order._id, items: order.items,
                    amount: order.amount, paymentMethod: 'Razorpay', address: order.address
                }).catch(e => console.log('Email error:', e.message));
            }

            res.json({ success: true, message: "Payment Successful & Order Placed!" });
        } else {
            res.json({ success: false, message: 'Invalid Signature. Payment Failed' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to place COD book order
const placeBookOrderCOD = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        if (!items || items.length === 0 || !amount || !address) {
            return res.json({ success: false, message: 'Invalid order details' });
        }

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Send order invoice email (non-blocking)
        const customer = await userModel.findById(userId);
        sendBookOrderPlacedEmail({
            userEmail: customer?.email, userName: customer?.name,
            orderId: newOrder._id, items, amount,
            paymentMethod: 'Cash on Delivery', address
        }).catch(e => console.log('Email error:', e.message));

        res.json({ success: true, message: 'Order Placed Successfully via Cash on Delivery!' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to place Book Order using Therapique Tokens
const placeBookOrderTokens = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        if (!items || items.length === 0 || !amount || !address) {
            return res.json({ success: false, message: 'Invalid order details' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (userData.therapiqueCoins < amount) {
            return res.json({ 
                success: false, 
                message: `Insufficient Therapique Tokens balance! Required: T ${amount}, Available: T ${userData.therapiqueCoins}.` 
            });
        }

        // Deduct token amount as clean integer and record transaction
        userData.therapiqueCoins = Math.round(userData.therapiqueCoins - amount);
        userData.coinsTransactions.push({
            type: 'spend',
            amount: Math.round(amount),
            description: `Book Order Purchase (${items.length} items)`,
            date: new Date()
        });

        await userData.save();

        const orderData = {
            userId,
            items,
            amount: Math.round(amount),
            address,
            paymentMethod: "Therapique Tokens",
            payment: true,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Send order invoice email (non-blocking)
        sendBookOrderPlacedEmail({
            userEmail: userData.email, userName: userData.name,
            orderId: newOrder._id, items, amount: Math.round(amount),
            paymentMethod: 'Therapique Tokens', address
        }).catch(e => console.log('Email error:', e.message));

        res.json({ 
            success: true, 
            message: `Order Placed Successfully using T ${Math.round(amount)} Therapique Tokens!`,
            remainingCoins: Math.round(userData.therapiqueCoins)
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const computeAutoStatus = (orderDate, currentStatus, isManualStatus = false) => {
    if (isManualStatus) return currentStatus;
    if (currentStatus === 'Cancelled') return 'Cancelled';
    const elapsedHours = (Date.now() - new Date(orderDate).getTime()) / (1000 * 60 * 60);
    if (elapsedHours < 2) return 'Order Placed';
    if (elapsedHours < 6) return 'Packing & Preparing';
    if (elapsedHours < 24) return 'Shipped';
    if (elapsedHours < 48) return 'Out for Delivery';
    return 'Delivered';
};

// API to get user book orders
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        let orders = await orderModel.find({ userId }).sort({ date: -1 });
        
        for (let order of orders) {
            if (order.status !== 'Cancelled' && !order.isManualStatus) {
                const autoStatus = computeAutoStatus(order.date, order.status, order.isManualStatus);
                if (order.status !== autoStatus) {
                    order.status = autoStatus;
                    await order.save();
                }
            }
        }

        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get single order details by orderId
const getSingleOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.body;
        const order = await orderModel.findOne({ _id: orderId, userId });
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, order });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update order status (for Admin / Live Simulator)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.json({ success: false, message: 'Missing orderId or status' });
        }
        await orderModel.findByIdAndUpdate(orderId, { status, isManualStatus: true });

        // Send status update email (non-blocking)
        const order = await orderModel.findById(orderId);
        if (order) {
            const customer = await userModel.findById(order.userId);
            sendOrderStatusUpdateEmail({
                userEmail: customer?.email, userName: customer?.name,
                orderId: order._id, status
            }).catch(e => console.log('Email error:', e.message));
        }

        res.json({ success: true, message: `Order status updated to "${status}"` });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to claim pending refund for a cancelled appointment (tokens or bank)
const claimRefund = async (req, res) => {
    try {
        const { userId, appointmentId, refundChoice } = req.body;

        if (!appointmentId || !refundChoice) {
            return res.json({ success: false, message: "Appointment ID and refund choice are required" });
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointment.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        if (!appointment.cancelled) {
            return res.json({ success: false, message: "This appointment is not cancelled" });
        }

        if (appointment.refundStatus && appointment.refundStatus !== 'pending_choice') {
            return res.json({ success: false, message: `Refund has already been processed as ${appointment.refundStatus}` });
        }

        const amount = appointment.amount || 0;
        const user = await userModel.findById(userId);
        const doctor = await doctorModel.findById(appointment.docId);

        if (refundChoice === 'tokens') {
            // Instant 1:1 Tokens credit
            user.therapiqueCoins = (user.therapiqueCoins || 0) + amount;
            user.coinsTransactions.push({
                type: 'earn',
                amount: amount,
                description: `Refund for Cancelled Session (Dr. ${doctor?.name || appointment.docData?.name || 'Doctor'})`,
                date: new Date()
            });
            await user.save();

            appointment.refundStatus = 'refunded_tokens';
            await appointment.save();

            sendRefundConfirmedEmail({
                appointmentId: appointment._id,
                patientEmail: user.email,
                patientName: user.name,
                doctorName: doctor?.name || appointment.docData?.name,
                amount,
                refundMethod: 'tokens'
            }).catch(e => console.log('Email error:', e.message));

            return res.json({
                success: true,
                message: `₹${amount} successfully credited as ${amount} Therapique Tokens to your wallet!`,
                therapiqueCoins: user.therapiqueCoins,
                refundStatus: 'refunded_tokens'
            });
        } else if (refundChoice === 'bank') {
            // Direct Razorpay refund
            try {
                if (appointment.paymentId && razorpayInstance) {
                    await razorpayInstance.payments.refund(appointment.paymentId, {
                        amount: amount * 100,
                        speed: "optimum",
                        notes: { reason: "Refund claimed by patient for cancelled appointment" }
                    });
                }
            } catch (err) {
                console.log("Razorpay refund API call error:", err.message);
            }

            appointment.refundStatus = 'refunded_bank';
            await appointment.save();

            sendRefundConfirmedEmail({
                appointmentId: appointment._id,
                patientEmail: user.email,
                patientName: user.name,
                doctorName: doctor?.name || appointment.docData?.name,
                amount,
                refundMethod: 'bank'
            }).catch(e => console.log('Email error:', e.message));

            return res.json({
                success: true,
                message: `₹${amount} refund initiated directly to your original Bank / UPI account via Razorpay!`,
                therapiqueCoins: user.therapiqueCoins || 0,
                refundStatus: 'refunded_bank'
            });
        } else {
            return res.json({ success: false, message: "Invalid refund choice. Must be 'tokens' or 'bank'." });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    listAppointment, 
    cancelAppointment, 
    claimRefund,
    paymentRazorpay, 
    verifyRazorpay, 
    contactForm, 
    purchaseCoins, 
    verifyCoinsPayment, 
    bookAppointmentWithCoins, 
    bookAppointmentWithPayment,
    createBookOrderRazorpay,
    verifyBookOrderRazorpay,
    placeBookOrderCOD,
    placeBookOrderTokens,
    getUserOrders,
    getSingleOrder,
    updateOrderStatus
}
