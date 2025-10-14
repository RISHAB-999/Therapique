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
import { v4 as uuidv4 } from "uuid";  // 🔥 add this at the top


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

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

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
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
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

        // checking for slot availability 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            } else {
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
            date: Date.now(),
            roomId: uuidv4()  // ✅ generate and attach unique roomId here
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

        res.json({
            success: true,
            message: 'Appointment Booked',
            order,
            appointmentId: newAppointment._id,
            roomId: newAppointment.roomId  // ✅ return it to frontend
        })

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
,            roomId: uuidv4()  // ✅ generate and attach unique roomId here
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

export { registerUser, loginUser, getProfile, updateProfile, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, contactForm, purchaseCoins, verifyCoinsPayment, bookAppointmentWithCoins, bookAppointmentWithPayment }
