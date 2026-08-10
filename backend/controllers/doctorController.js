import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import razorpay from 'razorpay'
import { v2 as cloudinary } from 'cloudinary';

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Synr1hf0zc3IAl',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
})

// API for doctor Login 
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await doctorModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment for doctor panel with automatic token refund & slot release
const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            if (appointmentData.cancelled) {
                return res.json({ success: false, message: 'Appointment is already cancelled' });
            }

            // 1. Mark appointment as cancelled
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

            // 2. Release doctor schedule slot
            const { slotDate, slotTime, userId, payment, amount } = appointmentData
            const doctorData = await doctorModel.findById(docId)
            if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
                let slots_booked = doctorData.slots_booked
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
                await doctorModel.findByIdAndUpdate(docId, { slots_booked })
            }

            // 3. Automatic Refund logic based on payment method
            if (payment && userId) {
                if (appointmentData.paidWithCoins) {
                    const user = await userModel.findById(userId)
                    if (user) {
                        user.therapiqueCoins = (user.therapiqueCoins || 0) + (amount || 0)
                        user.coinsTransactions.push({
                            type: 'earn',
                            amount: amount,
                            description: `Refund for Cancelled Appointment with Dr. ${doctorData?.name || 'Doctor'}`,
                            date: new Date()
                        })
                        await user.save()
                        return res.json({ success: true, message: `Appointment Cancelled. ${amount} Therapique Tokens refunded to patient's wallet!` })
                    }
                } else {
                    // Money payment via Razorpay -> Trigger Razorpay Bank Refund API
                    try {
                        if (appointmentData.paymentId && razorpayInstance) {
                            await razorpayInstance.payments.refund(appointmentData.paymentId, {
                                amount: amount * 100,
                                speed: "optimum",
                                notes: { reason: "Appointment cancelled by doctor" }
                            })
                            return res.json({ success: true, message: `Appointment Cancelled. ₹${amount} refund initiated to patient's original bank/UPI account via Razorpay!` })
                        }
                    } catch (err) {
                        console.log("Razorpay refund error fallback to wallet:", err.message)
                    }

                    // Fallback to wallet if in test mode or no paymentId
                    const user = await userModel.findById(userId)
                    if (user) {
                        user.therapiqueCoins = (user.therapiqueCoins || 0) + (amount || 0)
                        user.coinsTransactions.push({
                            type: 'earn',
                            amount: amount,
                            description: `Refund for Cancelled Appointment with Dr. ${doctorData?.name || 'Doctor'}`,
                            date: new Date()
                        })
                        await user.save()
                        return res.json({ success: true, message: `Appointment Cancelled. ₹${amount} credited as ${amount} Tokens to patient's wallet!` })
                    }
                }
            }

            return res.json({ success: true, message: 'Appointment Cancelled' })
        }

        return res.json({ success: false, message: 'Unauthorized or Appointment not found' })

    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.json({ success: true, message: 'Appointment Completed' })
        }

        return res.json({ success: false, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }

}

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body

        const docData = await doctorModel.findById(docId);
        if (!docData) {
            return res.json({
                success: false,
                message: "Doctor not found"
            });
        }

        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });

        res.json({
            success: true,
            message: "Doctor availability updated",
        });

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message,
        });
    }
}


// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available, about, image } = req.body
        const imageFile = req.file

        let parsedAddress = address
        if (typeof address === 'string') {
            try {
                parsedAddress = JSON.parse(address)
            } catch (e) {}
        }

        let imageUrl = null
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            imageUrl = imageUpload.secure_url
        } else if (image && typeof image === 'string' && image.startsWith('data:image')) {
            const imageUpload = await cloudinary.uploader.upload(image, { resource_type: "image" })
            imageUrl = imageUpload.secure_url
        }

        const updateFields = { fees, address: parsedAddress || address, available, about }
        if (imageUrl) {
            updateFields.image = imageUrl
        }

        await doctorModel.findByIdAndUpdate(docId, updateFields)

        res.json({ success: true, message: 'Profile Updated Successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {

        const { docId } = req.body

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailability,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
}