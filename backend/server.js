import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoutes.js'


const app = express()
const PORT = process.env.PORT || 5000

connectDB();
connectCloudinary()

//MIDDLEWARES
app.use(express.json())
app.use(cors())

//API ENDPOINTS

app.use('/api/admin', adminRouter);
//loacalhost:5000/api/admin

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
