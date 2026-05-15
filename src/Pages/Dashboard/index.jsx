import { Navbar } from '../../Components/layout/Navbar';
import { Sidebar } from '../../Components/layout/Sidebar'
import { StatsCard } from "../../Components/UI/StatsCard";
import { Users, UserCheck, Calendar, Activity, Plus } from "lucide-react";
import { appointments } from "../../utility/data/MockData";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const currentHour = new Date().getHours();

    let timeGreeting = "";
    if (currentHour < 12) {
        timeGreeting = "Good Morning";
    } else if (currentHour < 17) {
        timeGreeting = "Good Afternoon";
    } else {
        timeGreeting = "Good Evening";
    }
    
    const greeting = `${timeGreeting}`;


    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
            <Navbar />
            <Sidebar />
            <div className="ml-64 p-8 space-y-8">

                {/* HEADER */}
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">
                        {greeting}, <span className="text-orange-500">{user?.name}</span>
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Here's what's happening in your hospital today.
                    </p>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-4 gap-6">
                    <StatsCard title="Trusted Patients" value="1,245" icon={Users} />
                    <StatsCard title="Specialized Doctors" value="75" icon={UserCheck} />
                    <StatsCard title="Appointments Today" value="32" icon={Calendar} />
                    <StatsCard title="Available Doctors" value="18" icon={Activity} />
                </div>

                {/* APPOINTMENTS TABLE */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Recent Appointments
                        </h2>

                        <button
                            onClick={() => navigate("/appointments")}
                            className="flex items-center gap-2 text-orange-500 hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-500 text-sm">
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((item, index) => (
                                <tr key={index} className="border-t hover:bg-orange-50 transition">
                                    <td className="py-3">{item.name}</td>
                                    <td>{item.doctor}</td>
                                    <td>{item.date}</td>
                                    <td>
                                        <span className={`px-3 py-1 rounded-full text-sm
                      ${item.status === "Confirmed" && "bg-green-100 text-green-600"}
                      ${item.status === "Pending" && "bg-yellow-100 text-yellow-600"}
                    `}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 🚀 NEW SECTION: BOOK APPOINTMENT CTA */}
                <div className="bg-black text-white rounded-2xl p-8 flex justify-between items-center shadow-lg">

                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            Book a New Appointment
                        </h2>
                        <p className="text-gray-300">
                            Quickly schedule appointments for patients with available doctors.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/appointments")}
                        className="flex items-center gap-2 bg-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                    >
                        <Plus size={18} />
                        Book Now
                    </button>

                </div>

            </div>
        </div>
    )
};