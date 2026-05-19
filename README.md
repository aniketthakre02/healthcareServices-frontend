**Healthcare Management System - Frontend**

A modern full-stack Healthcare Management System built for hospitals and clinics to manage patients, doctors, appointments, and administrative operations efficiently.

This repository contains the frontend application developed using React, Tailwind CSS, and modern frontend architecture practices.

## Features
### Authentication & Authorization
- JWT-based login authentication
- Protected routes
- Role-based access control
- Secure session handling

### Patient Module
- Patient registration & login
- Book appointments with doctors
- View appointment details
- Access healthcare reports

### Doctor Module
- View assigned appointments
- Manage doctor profile information
- Appointment workflow management

###  Admin Module
- Manage all users
- Assign roles (Doctor/Admin)
- Monitor system users and operations

###  Frontend Features
- Responsive modern UI
- Dashboard layout with sidebar navigation
- Clean architecture & reusable components
- Context API for authentication state
- React Router protected routing
- Tailwind CSS styling
- API integration with Spring Boot backend

---

##  Tech Stack

### Frontend
- React
- React Router DOM
- Context API
- Tailwind CSS
- Axios
- Vite

### Backend
- Spring Boot
- Spring Security
- JWT Authentication
- MySQL
- JPA / Hibernate
--------------
## 📸 Screenshots

### 🏠 Landing Page
<img width="1920" height="858" alt="HeathCare_LandingPage" src="https://github.com/user-attachments/assets/c0707c99-9885-4676-8927-5960f51ace6c" />

### 🔐 Login Page
<img width="1903" height="864" alt="HC_LoginPage" src="https://github.com/user-attachments/assets/bdc89461-a4a5-40b8-8694-e1554e2b9fd4" />

### 📊 Dashboard
<img width="1896" height="868" alt="HC_Dashboard" src="https://github.com/user-attachments/assets/e32f2853-f23c-4fb5-852e-7608172aa6e6" />

### 📅 Appointment Module
<img width="1920" height="1080" alt="AppointmentBookingPage" src="https://github.com/user-attachments/assets/1585038f-16e9-49e4-b9cd-92220a01ca56" />
-------------------------------

## 📂 Project Structure
```bash
src/
│
├── components/
│   ├── layout/
│   ├── common/
│   └── ui/
│
├── pages/
│   ├── Dashboard/
│   ├── Login/
│   ├── Register/
│   └── Appointments/
│
├── contexts/
├── routes/
├── services/
├── hooks/
├── utils/
└── assets/
```

---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone https://github.com/aniketthakre02/healthcareServices-frontend
```

### Navigate Into Project

```bash
cd healthcare-frontend
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## 🔗 Backend Repository

Backend APIs are developed using Spring Boot.

https://github.com/aniketthakre02/HealthcareServices
-----------------------------

## 🔐 Authentication Flow

- User logs in with credentials
- Backend validates credentials
- JWT token returned from Spring Boot API
- Token stored locally
- Protected routes validate authentication state

---

## 🌟 Key Learning Outcomes

- Full-stack application architecture
- JWT authentication implementation
- React frontend structuring
- API integration using Axios
- Git branching workflow
- Protected routing
- Responsive dashboard UI development

---

## 📌 Future Improvements

- Notification system
- Medical report uploads
- Analytics dashboard
- Real-time appointment updates
- Email notifications

---

## 👨‍💻 Author

Aniket Thakre
