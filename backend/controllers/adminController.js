import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from 'cloudinary';

import userModel from "../models/userModel.js";

//Api for adding doctor
const addDoctor = async (req, res) => {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
        return res.json({
            success: false,
            message: "Missing Details"
        });
    }

    //Validating email format
    if (!validator.isEmail(email)) {
        return res.json({
            success: false,
            message: "Invalid email format"
        });
    }

    //Validating strong password
    if (password.length < 8) {
        return res.json({
            success: false,
            message: "Weak password. Please enter a strong password."
        });
    }

    //hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
    });

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
    try {
        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();
        res.json({
            success: true,
            message: "Doctor added successfully",
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
}

//Admin login

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({
                success: false,
                message: "Missing email or password"
            });
        }

        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.json({
                success: false,
                message: "Invalid email or password"
            });
        } else {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({
                success: true,
                message: "Admin login successful",
                token
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }

};

//api to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password');
        res.json({
            success: true,
            data: doctors
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const {  appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

      
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export { addDoctor, loginAdmin, allDoctors, adminDashboard, appointmentsAdmin, appointmentCancel };
