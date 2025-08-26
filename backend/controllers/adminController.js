import doctorModel from "../models/doctorModel.js";
import validator from "validator"
import bcrypt from "bcrypt";
import { v2 as cloudinary } from 'cloudinary';
import jwt from "jsonwebtoken";

//Api for adding doctor
const addDoctor = async (req, res) => {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    console.log({ name, email, password, speciality, degree, experience, about, fees, address });
    console.log(imageFile);

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

export { addDoctor, loginAdmin };
