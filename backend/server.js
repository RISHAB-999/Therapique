import express from 'express'
import cors from 'cors'
import compression from 'compression'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoutes.js'
import doctorRouter from './routes/doctorRoutes.js'
import userRouter from './routes/userRoutes.js'
import bookRouter from './routes/bookRoutes.js'
import assistantRouter from './routes/assistantRoutes.js'
import { initializeSocket } from './socket/index.js'
import doctorModel from './models/doctorModel.js'
import userModel from './models/userModel.js'
import appointmentModel from './models/appointmentModel.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 4000

connectDB().then(() => {
    // Defer appointment image sync to background — runs 5s after startup to avoid blocking initial requests
    setTimeout(async () => {
        try {
            const doctors = await doctorModel.find({}).select('image name').lean();
            for (const doc of doctors) {
                if (doc.image) {
                    await appointmentModel.updateMany(
                        { docId: doc._id.toString() },
                        { $set: { "docData.image": doc.image, "docData.name": doc.name } }
                    );
                }
            }
            const users = await userModel.find({}).select('image name').lean();
            for (const user of users) {
                if (user.image) {
                    await appointmentModel.updateMany(
                        { userId: user._id.toString() },
                        { $set: { "userData.image": user.image, "userData.name": user.name } }
                    );
                }
            }
        } catch (e) {
            console.log("Appointment media sync info:", e.message);
        }
    }, 5000);
});
connectCloudinary();

// MIDDLEWARES
app.use(compression()) // Gzip/Brotli compress all API responses (~60-80% size reduction)
app.use(express.json())
app.use(cors())

// Serve custom book cover images statically for frontend & admin apps
app.use('/book-covers', express.static(path.join(__dirname, '../frontend/src/assets/book pic')));

// API ENDPOINTS
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/book', bookRouter);
app.use('/api/assistant', assistantRouter);

app.get('/', (req, res) => {
    res.send('Therapique Backend API Running');
});

// Initialize Socket.io WebRTC signaling server
initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server & Socket.io running on port ${PORT}`);
});
