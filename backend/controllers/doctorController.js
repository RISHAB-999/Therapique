import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import razorpay from 'razorpay'
import { v2 as cloudinary } from 'cloudinary';
import { sendAppointmentCancellationEmail } from '../services/emailService.js';

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

        const docId = req.docId || req.body.docId
        const appointments = await appointmentModel.find({ docId }).lean()

        // Fetch latest patient profile info (image, name, dob, gender, phone) so appointments always show updated profile pics
        const userIds = [...new Set(appointments.map(a => a.userId).filter(Boolean))]
        const users = await userModel.find({ _id: { $in: userIds } }).select('image name dob gender phone').lean()
        const userMap = new Map(users.map(u => [u._id.toString(), u]))

        const updatedAppointments = appointments.map(app => {
            const user = userMap.get(app.userId?.toString())
            if (user) {
                return {
                    ...app,
                    userData: {
                        ...app.userData,
                        image: user.image || app.userData?.image,
                        name: user.name || app.userData?.name,
                        dob: user.dob || app.userData?.dob,
                        gender: user.gender || app.userData?.gender,
                        phone: user.phone || app.userData?.phone
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

// API to cancel appointment for doctor panel with automatic token refund & slot release
const appointmentCancel = async (req, res) => {
    try {
        const docId = req.docId || req.body.docId
        const { appointmentId } = req.body

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

            // 3. Refund logic based on payment method
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
                        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'refunded_tokens' })
                        sendAppointmentCancellationEmail({
                            appointmentId,
                            patientEmail: user.email, patientName: user.name,
                            doctorEmail: doctorData?.email, doctorName: doctorData?.name, 
                            slotDate, slotTime,
                            cancelledBy: 'doctor',
                            refundMessage: `${amount} Therapique Tokens refunded to your wallet.`
                        }).catch(e => console.log('Email error:', e.message));
                        return res.json({ success: true, message: `Appointment Cancelled. ${amount} Therapique Tokens refunded to patient's wallet!` })
                    }
                } else {
                    // Paid with real money / Razorpay -> Let patient choose their preferred refund on the website!
                    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'pending_choice' });
                    const patient = await userModel.findById(userId);
                    sendAppointmentCancellationEmail({
                        appointmentId,
                        patientEmail: patient?.email,
                        patientName: patient?.name,
                        doctorEmail: doctorData?.email, doctorName: doctorData?.name, 
                        slotDate, slotTime,
                        cancelledBy: 'doctor',
                        needsRefundChoice: true,
                        amount: appointmentData.amount
                    }).catch(e => console.log('Email error:', e.message));
                    return res.json({ success: true, message: `Appointment Cancelled. Patient has been notified to choose their refund method on the website.` })
                }
            }

            // No-payment cancellation email
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'none' })
            const patient = await userModel.findById(userId);
            sendAppointmentCancellationEmail({
                appointmentId,
                patientEmail: patient?.email, patientName: patient?.name,
                doctorEmail: doctorData?.email, doctorName: doctorData?.name, 
                slotDate, slotTime,
                cancelledBy: 'doctor'
            }).catch(e => console.log('Email error:', e.message));
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

        const docId = req.docId || req.body.docId
        const { appointmentId } = req.body

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


// API to get doctor profile for Doctor Panel
const doctorProfile = async (req, res) => {
    try {

        const docId = req.docId || req.body.docId
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
        const docId = req.docId || req.body.docId
        const { fees, address, available, about, image } = req.body
        const imageFile = req.file

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID missing or unauthorized" })
        }

        let parsedAddress = address
        if (typeof address === 'string') {
            try {
                parsedAddress = JSON.parse(address)
            } catch (e) {
                parsedAddress = address
            }
        }

        let imageUrl = null
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            imageUrl = imageUpload.secure_url
        } else if (image && typeof image === 'string' && image.startsWith('data:image')) {
            const imageUpload = await cloudinary.uploader.upload(image, { resource_type: "image" })
            imageUrl = imageUpload.secure_url
        }

        const updateFields = {}
        if (fees !== undefined && fees !== '') updateFields.fees = Number(fees) || fees
        if (parsedAddress !== undefined) updateFields.address = parsedAddress
        if (available !== undefined) updateFields.available = (available === true || available === 'true')
        if (about !== undefined) updateFields.about = about
        if (imageUrl) {
            updateFields.image = imageUrl
        }

        const updatedDoctor = await doctorModel.findByIdAndUpdate(docId, updateFields, { new: true })

        if (!updatedDoctor) {
            return res.json({ success: false, message: "Doctor not found in database" })
        }

        // Synchronize updated doctor profile (image, fees, address, about) across all their appointments
        const appointmentDocUpdates = {}
        if (updateFields.image) appointmentDocUpdates["docData.image"] = updateFields.image
        if (updateFields.name) appointmentDocUpdates["docData.name"] = updateFields.name
        if (updateFields.fees) appointmentDocUpdates["docData.fees"] = updateFields.fees
        if (updateFields.address) appointmentDocUpdates["docData.address"] = updateFields.address
        if (updateFields.about) appointmentDocUpdates["docData.about"] = updateFields.about
        if (Object.keys(appointmentDocUpdates).length > 0) {
            await appointmentModel.updateMany({ docId }, { $set: appointmentDocUpdates }).catch(err => console.log("Appointment doc sync error:", err.message))
        }

        res.json({ success: true, message: 'Profile Updated Successfully', profileData: updatedDoctor })

    } catch (error) {
        console.log("Error in updateDoctorProfile:", error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {

        const docId = req.docId || req.body.docId

        const appointments = await appointmentModel.find({ docId }).lean()

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted && !item.cancelled) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        // Fetch latest patient profile info for recent appointments table
        const userIds = [...new Set(appointments.map(a => a.userId).filter(Boolean))]
        const users = await userModel.find({ _id: { $in: userIds } }).select('image name dob gender phone').lean()
        const userMap = new Map(users.map(u => [u._id.toString(), u]))

        const updatedAppointments = appointments.map(app => {
            const user = userMap.get(app.userId?.toString())
            if (user) {
                return {
                    ...app,
                    userData: {
                        ...app.userData,
                        image: user.image || app.userData?.image,
                        name: user.name || app.userData?.name
                    }
                }
            }
            return app
        })

        const appointmentStats = {
            total: appointments.length,
            completed: appointments.filter(a => a.isCompleted && !a.cancelled).length,
            cancelled: appointments.filter(a => a.cancelled).length,
            upcoming: appointments.filter(a => !a.cancelled && !a.isCompleted).length
        }

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            appointmentStats,
            latestAppointments: updatedAppointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to generate short-lived, one-time call ticket for doctor video call session
const generateCallTicket = async (req, res) => {
    try {
        const docId = req.docId || req.body.docId
        const { appointmentId } = req.body
        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        if (appointment.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized appointment access' })
        }

        const doctor = await doctorModel.findById(docId)
        const { createCallTicket } = await import('../socket/callTicketManager.js')
        const ticket = createCallTicket(appointmentId, docId, doctor.name)

        res.json({ success: true, ticket })
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
    updateDoctorProfile,
    generateCallTicket
}