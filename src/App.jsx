import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/protectedRoutes';
import { Home }         from './Pages/Home';
import { Register }     from './Pages/Register';
import { Login }        from './Pages/Login';
import { Dashboard }    from './Pages/Dashboard';
import { Appointments } from './Pages/Appointments';
import { Doctors }      from './Pages/Doctors';
import { Reports }      from './Pages/Reports';
import { Settings }     from './Pages/Settings';
import { Patients }     from './Pages/Patients';
import { DoctorAppointments } from './Features/doctors/DoctorsAppointments';
import { DoctorProfile }      from './Features/doctors/DoctorProfile';
import { AdminUsers } from './Features/Admin/AdminUsers';

const NotFound = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-50 to-white px-6">
        <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-2">Page not found</p>
        <p className="text-gray-500 mb-8 text-center">The page you are looking for does not exist or you do not have access.</p>
        <a href="/dashboard" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
            Go to Dashboard
        </a>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/"         element={<Home />}     />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login"    element={<Login />}    />

                    {/* Shared — all authenticated roles */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>}  />
                    <Route path="/doctors"   element={<ProtectedRoute><Doctors /></ProtectedRoute>}   />

                    {/* Patient only */}
                    <Route path="/patients" element={
                        <ProtectedRoute allowedRoles={["ROLE_PATIENT"]}>
                            <Patients />
                        </ProtectedRoute>
                    }/>
                    <Route path="/appointments" element={
                        <ProtectedRoute allowedRoles={["ROLE_PATIENT"]}>
                            <Appointments />
                        </ProtectedRoute>
                    }/>
                    <Route path="/reports" element={
                        <ProtectedRoute allowedRoles={["ROLE_PATIENT", "ROLE_ADMIN"]}>
                            <Reports />
                        </ProtectedRoute>
                    }/>

                    {/* Doctor only */}
                    <Route path="/doctor/appointments" element={
                        <ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}>
                            <DoctorAppointments />
                        </ProtectedRoute>
                    }/>
                    <Route path="/doctor/profile" element={
                        <ProtectedRoute allowedRoles={["ROLE_DOCTOR"]}>
                            <DoctorProfile />
                        </ProtectedRoute>
                    }/>

                    {/* Admin only */}
                    <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                            <AdminUsers />
                        </ProtectedRoute>
                    }/>

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
