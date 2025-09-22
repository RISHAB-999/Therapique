import mongoose from "mongoose"

const contactSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending", // pending, read, responded
        enum: ["pending", "read", "responded"]
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date
    },
    adminResponse: {
        type: String
    }
})

const contactModel = mongoose.models.contact || mongoose.model("contact", contactSchema)

export default contactModel
