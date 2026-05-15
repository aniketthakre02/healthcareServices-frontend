import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import {AdminUsers} from './Features/Admin/AdminUsers';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/"         element={<Home />}     />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login"    element={<Login />}    />

                    {/* Shared — all roles */}
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

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;