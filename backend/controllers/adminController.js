import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from 'cloudinary';
import userModel from "../models/userModel.js";
import bookModel from "../models/bookModel.js";
import orderModel from "../models/orderModel.js";
import { notifyAppointmentCancellation } from "../services/emailService.js";

//Api for adding doctor
const addDoctor = async (req, res) => {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
        return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
        return res.json({ success: false, message: "Please enter a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
        name,
        email,
        image: imageUrl,
        password: hashedPassword,
        speciality,
        degree,
        experience,
        about,
        fees,
        address: JSON.parse(address),
        date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor Added" });
};

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Api for get all doctor list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select("-password");
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({}).lean();

        // Fetch latest doctor and user profiles to ensure up-to-date pictures & details
        const docIds = [...new Set(appointments.map(a => a.docId).filter(Boolean))];
        const userIds = [...new Set(appointments.map(a => a.userId).filter(Boolean))];

        const [doctors, users] = await Promise.all([
            doctorModel.find({ _id: { $in: docIds } }).select('image name speciality address fees').lean(),
            userModel.find({ _id: { $in: userIds } }).select('image name dob gender phone').lean()
        ]);

        const docMap = new Map(doctors.map(d => [d._id.toString(), d]));
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        const updatedAppointments = appointments.map(app => {
            const doc = docMap.get(app.docId?.toString());
            const user = userMap.get(app.userId?.toString());
            return {
                ...app,
                docData: {
                    ...app.docData,
                    image: doc?.image || app.docData?.image,
                    name: doc?.name || app.docData?.name,
                    speciality: doc?.speciality || app.docData?.speciality,
                    address: doc?.address || app.docData?.address
                },
                userData: {
                    ...app.userData,
                    image: user?.image || app.userData?.image,
                    name: user?.name || app.userData?.name,
                    dob: user?.dob || app.userData?.dob,
                    gender: user?.gender || app.userData?.gender,
                    phone: user?.phone || app.userData?.phone
                }
            };
        });

        res.json({ success: true, appointments: updatedAppointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // releasing doctor slot safely
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        if (doctorData) {
            let slots_booked = doctorData.slots_booked || {};
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
                await doctorModel.findByIdAndUpdate(docId, { slots_booked });
            }
        }

        let refundMessage = '';
        let needsRefundChoice = false;

        if (appointmentData.payment && appointmentData.userId) {
            if (appointmentData.paidWithCoins) {
                const user = await userModel.findById(appointmentData.userId);
                if (user) {
                    user.therapiqueCoins = (user.therapiqueCoins || 0) + (appointmentData.amount || 0);
                    user.coinsTransactions.push({
                        type: 'earn',
                        amount: appointmentData.amount,
                        description: `Refund for Cancelled Appointment with Dr. ${doctorData?.name || appointmentData.docData?.name || 'Doctor'} (Admin Cancelled)`,
                        date: new Date()
                    });
                    await user.save();
                    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'refunded_tokens' });
                    refundMessage = `${appointmentData.amount} Therapique Tokens refunded to patient wallet.`;
                }
            } else {
                // Paid with real money / Razorpay -> Let patient choose on website!
                await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'pending_choice' });
                needsRefundChoice = true;
            }
        } else {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, refundStatus: 'none' });
        }

        const patient = await userModel.findById(appointmentData.userId);
        const patientName = patient?.name || appointmentData.userData?.name || 'Patient';
        const patientEmail = patient?.email || appointmentData.userData?.email;
        const doctorName = doctorData?.name || appointmentData.docData?.name || 'Doctor';
        const doctorEmail = doctorData?.email || appointmentData.docData?.email;

        await notifyAppointmentCancellation({
            appointmentId,
            patientEmail,
            patientName,
            doctorEmail,
            doctorName,
            slotDate,
            slotTime,
            cancelledBy: 'admin',
            refundMessage,
            needsRefundChoice,
            amount: appointmentData.amount || 0
        }).catch(e => console.log('Email error in admin cancellation:', e.message));

        res.json({ success: true, message: 'Appointment Cancelled' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get dashboard data for admin panel (including book catalog & order stats)
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({}).lean();
        const books = await bookModel.find({});
        const bookOrders = await orderModel.find({}).sort({ date: -1 });

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

        for (let order of bookOrders) {
            if (order.status !== 'Cancelled' && !order.isManualStatus) {
                const autoStatus = computeAutoStatus(order.date, order.status, order.isManualStatus);
                if (order.status !== autoStatus) {
                    order.status = autoStatus;
                    await order.save();
                }
            }
        }

        const docMap = new Map(doctors.map(d => [d._id.toString(), d]));
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        const updatedAppointments = appointments.map(app => {
            const doc = docMap.get(app.docId?.toString());
            const user = userMap.get(app.userId?.toString());
            return {
                ...app,
                docData: {
                    ...app.docData,
                    image: doc?.image || app.docData?.image,
                    name: doc?.name || app.docData?.name
                },
                userData: {
                    ...app.userData,
                    image: user?.image || app.userData?.image,
                    name: user?.name || app.userData?.name
                }
            };
        });

        const appointmentStats = {
            total: appointments.length,
            completed: appointments.filter(a => !a.cancelled && a.isCompleted).length,
            cancelled: appointments.filter(a => a.cancelled).length,
            upcoming: appointments.filter(a => !a.cancelled && !a.isCompleted).length
        };

        const bookOrderStats = {
            total: bookOrders.length,
            delivered: bookOrders.filter(o => o.status === 'Delivered').length,
            processing: bookOrders.filter(o => ['Order Placed', 'Packing & Preparing', 'Shipped', 'Out for Delivery', 'Processing', 'Pending'].includes(o.status) || (!['Delivered', 'Cancelled', 'Refunded'].includes(o.status))).length,
            cancelled: bookOrders.filter(o => ['Cancelled', 'Refunded'].includes(o.status)).length
        };

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            books: books.length,
            bookOrdersCount: bookOrders.length,
            appointmentStats,
            bookOrderStats,
            latestAppointments: updatedAppointments.reverse(),
            latestBookOrders: bookOrders.slice(0, 5)
        };

        res.json({ success: true, dashData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update doctor credentials (email and/or password) from admin panel
const updateDoctorCredentials = async (req, res) => {
    try {
        const { docId, email, password } = req.body;

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID is required" });
        }

        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        const updates = {};
        const messages = [];

        // If email is provided and differs
        if (email && email.trim()) {
            const trimmedEmail = email.trim().toLowerCase();
            if (!validator.isEmail(trimmedEmail)) {
                return res.json({ success: false, message: "Please enter a valid email address" });
            }

            if (trimmedEmail !== doctor.email) {
                // Check if another doctor already uses this email
                const existingDoctor = await doctorModel.findOne({ email: trimmedEmail, _id: { $ne: docId } });
                if (existingDoctor) {
                    return res.json({ success: false, message: "This email is already registered to another doctor" });
                }
                updates.email = trimmedEmail;
                messages.push(`Email updated to ${trimmedEmail}`);

                // Synchronize email across all appointments for this doctor
                await appointmentModel.updateMany({ docId }, { $set: { "docData.email": trimmedEmail } })
                    .catch(err => console.log("Doc email sync error:", err.message));
            }
        }

        // If new password is provided
        if (password && password.trim()) {
            const trimmedPassword = password.trim();
            if (trimmedPassword.length < 8) {
                return res.json({ success: false, message: "Password must be at least 8 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(trimmedPassword, salt);
            updates.password = hashedPassword;
            messages.push("Password updated successfully");
        }

        if (Object.keys(updates).length === 0) {
            return res.json({ success: true, message: "No changes to update", doctor });
        }

        const updatedDoctor = await doctorModel.findByIdAndUpdate(docId, updates, { new: true });

        res.json({
            success: true,
            message: messages.join(" & ") || "Doctor credentials updated successfully",
            doctor: updatedDoctor
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateDoctorEmail = updateDoctorCredentials;

export { addDoctor, loginAdmin, allDoctors, adminDashboard, appointmentsAdmin, appointmentCancel, updateDoctorEmail, updateDoctorCredentials };
