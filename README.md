# 🩺 Therapique - Mental Health Appointment Platform

A comprehensive mental health appointment booking platform connecting patients with trusted healthcare professionals. Built with modern web technologies for seamless healthcare management.

## ✨ Features

### 👤 Patient Portal

- **Easy Registration & Login** - Secure user authentication system
- **Doctor Discovery** - Browse doctors by specialty (Clinical, Counseling, Child & Adolescent , Marriage & Family Therapist, Trauma, Addiction , CBT, Art & Music Therapist etc.)
- **Smart Booking** - Schedule appointments with available time slots
- **Profile Management** - Update personal information and medical history
- **Appointment Tracking** - View, manage, and cancel appointments
- **Multiple Payment Options** - Razorpay and Stripe integration for secure payments
- **Appointment History** - Complete track record of past and upcoming appointments

### 👨‍⚕️ Doctor Dashboard

- **Professional Profile** - Manage doctor information, specialties, and availability
- **Appointment Management** - View, approve, and complete patient appointments
- **Patient Information** - Access patient details and appointment history
- **Earnings Dashboard** - Track consultation fees and earnings
- **Schedule Control** - Set availability and manage time slots

### 🔐 Admin Panel

- **Doctor Management** - Add, remove, and verify healthcare professionals
- **Appointment Oversight** - Monitor all platform appointments
- **User Management** - Oversee patient registrations and activities
- **Analytics Dashboard** - Platform usage statistics and insights

## 🛠️ Tech Stack

### Frontend

- **React.js** - Modern UI library for building interactive interfaces
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router** - Client-side routing for single-page application
- **Axios** - HTTP client for API communication
- **React Toastify** - Elegant notifications and alerts

### Backend

- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - Object modeling for MongoDB
- **JWT** - JSON Web Tokens for secure authentication
- **bcrypt** - Password hashing for security

### Payment Integration

- **Razorpay** - Indian payment gateway
- **Stripe** - International payment processing

### Cloud Services

- **Cloudinary** - Image storage and optimization
- **MongoDB Atlas** - Cloud database hosting

## 📁 Project Structure

```
Therapique/
├── frontend/           # Patient-facing React application
├── admin/             # Admin & Doctor dashboard React app
├── backend/           # Node.js/Express API server
│   ├── controllers/   # Business logic handlers
│   ├── models/        # Database schemas
│   ├── routes/        # API route definitions
│   ├── middlewares/   # Authentication & validation
│   └── config/        # Database & cloud configurations
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Razorpay/Stripe accounts

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/RISHAB-999/Therapique.git
   cd Therapique
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

   Create `.env` file:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend
   npm install
   ```

   Create `.env` file:

   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. **Admin Panel Setup**

   ```bash
   cd ../admin
   npm install
   ```

   Create `.env` file:

   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

### Running the Application

1. **Start Backend Server**

   ```bash
   cd backend
   npm run server
   ```

2. **Start Frontend (Patient Portal)**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Start Admin Panel**
   ```bash
   cd admin
   npm run dev
   ```

## 🎯 Key Functionalities

### Authentication & Security

- JWT-based authentication for users, doctors, and admins
- Password encryption using bcrypt
- Protected routes and middleware validation
- Secure payment processing

### Appointment System

- Real-time slot availability checking
- Automated appointment confirmations
- Email/SMS notifications
- Cancellation and rescheduling options

### Payment Processing

- Multiple payment gateway support
- Secure transaction handling
- Payment verification and confirmation
- Refund management for cancellations

### File Management

- Doctor profile image uploads
- Medical document storage
- Cloudinary integration for optimized media delivery

## 🔧 API Endpoints

### User Routes

- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/get-profile` - Get user profile
- `POST /api/user/update-profile` - Update profile
- `POST /api/user/book-appointment` - Book appointment
- `POST /api/user/payment-razorpay` - Razorpay payment
- `POST /api/user/payment-stripe` - Stripe payment

### Doctor Routes

- `GET /api/doctor/list` - Get all doctors
- `POST /api/doctor/login` - Doctor login
- `GET /api/doctor/appointments` - Doctor appointments
- `POST /api/doctor/complete-appointment` - Mark appointment complete

### Admin Routes

- `POST /api/admin/add-doctor` - Add new doctor
- `GET /api/admin/all-appointments` - Get all appointments
- `POST /api/admin/cancel-appointment` - Cancel appointment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

**RISHAB-999** - [GitHub Profile](https://github.com/RISHAB-999)

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Tailwind CSS for the beautiful design system
- MongoDB for reliable data storage
- Cloudinary for image management solutions

---

**Built with ❤️ for better healthcare accessibility**
