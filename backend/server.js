import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoutes.js'
import doctorRouter from './routes/doctorRoutes.js'
import userRouter from './routes/userRoutes.js'
import bookRouter from './routes/bookRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const PORT = process.env.PORT || 4000

connectDB();
connectCloudinary();

// MIDDLEWARES
app.use(express.json())
app.use(cors())

// Serve custom book cover images statically for frontend & admin apps
app.use('/book-covers', express.static(path.join(__dirname, '../frontend/src/assets/book pic')));

// API ENDPOINTS
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/book', bookRouter);

app.get('/', (req, res) => {
    res.send('Therapique Backend API Running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
