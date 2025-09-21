# 🩺 Therapique - Mental Health Appointment Platform

A comprehensive full-stack mental health appointment booking platform connecting patients with verified therapists and healthcare professionals. Built with React, Node.js, and MongoDB.

## ✨ Features

**� Patient Portal:** Secure registration/login, browse therapists by specialty (Clinical, Counseling, Child & Adolescent, Marriage & Family, Trauma, Addiction, CBT, Art & Music therapy), smart appointment booking, profile management, payment integration (Razorpay/Stripe), appointment history.

**� Doctor Dashboard:** Professional profile management, appointment oversight, patient information access, earnings tracking, schedule control.

**� Admin Panel:** Doctor verification/management, appointment monitoring, user oversight, analytics dashboard.

## 🛠️ Tech Stack

**Frontend:** React.js, Tailwind CSS, React Router, Axios, React Toastify  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt  
**Payments:** Razorpay, Stripe  
**Cloud:** Cloudinary (image storage), MongoDB Atlas

## 📁 Project Structure

```
Therapique/
├── frontend/    # Patient portal (React + Vite) - Port 5173
├── admin/       # Admin/Doctor dashboard (React + Vite) - Port 5174  
└── backend/     # REST API server (Node.js/Express) - Port 5000
```

## 🚀 Quick Start

### Prerequisites
Node.js (v14+), MongoDB, Cloudinary account, Razorpay/Stripe accounts

### Installation & Setup

```bash
# Clone repository
git clone https://github.com/RISHAB-999/Therapique.git
cd Therapique

# Backend setup
cd backend && npm install
# Create .env: MONGODB_URI, CLOUDINARY_*, JWT_SECRET, RAZORPAY_*, STRIPE_*

# Frontend setup  
cd ../frontend && npm install
# Create .env: VITE_BACKEND_URL=http://localhost:5000

# Admin setup
cd ../admin && npm install  
# Create .env: VITE_BACKEND_URL=http://localhost:5000

# Run all services
cd ../backend && npm run server     # Port 5000
cd ../frontend && npm run dev       # Port 5173  
cd ../admin && npm run dev          # Port 5174
```

## 🔧 Key API Endpoints

**User:** `/api/user/register|login|get-profile|book-appointment|payment-razorpay|payment-stripe`  
**Doctor:** `/api/doctor/list|login|appointments|complete-appointment`  
**Admin:** `/api/admin/add-doctor|all-appointments|cancel-appointment|dashboard`

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 👥 Authors

**RISHAB-999** - [GitHub](https://github.com/RISHAB-999) | **Ishaan Jain** - Co-Founder & Backend Developer

---
**Built with ❤️ for better healthcare accessibility**
