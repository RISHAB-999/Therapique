import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection
        .once("connected", () => {
            console.log("Database connected");
        })
    await mongoose.connect(process.env.MONGO_URI);
};

export default connectDB;
