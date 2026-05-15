import {
    LayoutDashboard, Users, UserCheck,
    Calendar, FileText, Settings, Stethoscope
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const allMenus = {
    ROLE_PATIENT: [
        { name: "Dashboard",    icon: LayoutDashboard, path: "/dashboard"    },
        { name: "My Profile",   icon: Users,           path: "/patients"     },
        { name: "Appointments", icon: Calendar,        path: "/appointments" },
        { name: "Doctors",      icon: UserCheck,       path: "/doctors"      },
        { name: "Reports",      icon: FileText,        path: "/reports"      },
        { name: "Settings",     icon: Settings,        path: "/settings"     },
    ],
    ROLE_DOCTOR: [
        { name: "Dashboard",         icon: LayoutDashboard, path: "/dashboard"            },
        { name: "My Appointments",   icon: Calendar,        path: "/doctor/appointments"  },
        { name: "My Profile",        icon: Stethoscope,     path: "/doctor/profile"       },
        { name: "Settings",          icon: Settings,        path: "/settings"             },
    ],
    ROLE_ADMIN: [
        { name: "Dashboard",    icon: LayoutDashboard, path: "/dashboard"      },
        { name: "All Users",    icon: Users,           path: "/admin/users"    },
        { name: "Doctors",      icon: UserCheck,       path: "/doctors"        },
        { name: "Reports",      icon: FileText,        path: "/reports"        },
        { name: "Settings",     icon: Settings,        path: "/settings"       },
    ]
};

export const Sidebar = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user }  = useAuth();

    // get menu based on role, fallback to patient
    const menu = allMenus[user?.role] || allMenus["ROLE_PATIENT"];

    return (
        <div className="w-64 h-[calc(100vh-20px)] bg-white border-r border-gray-300 fixed left-0">

            {/* Role badge */}
            <div className="px-4 py-3 border-b border-gray-100">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full
                    ${user?.role === "ROLE_ADMIN"  && "bg-purple-100 text-purple-600"}
                    ${user?.role === "ROLE_DOCTOR"  && "bg-blue-100 text-blue-600"}
                    ${user?.role === "ROLE_PATIENT" && "bg-orange-100 text-orange-500"}
                `}>
                    {user?.role?.replace("ROLE_", "")}
                </span>
            </div>
            {menu.map((item, index) => {
                const Icon     = item.icon;
                const isActive = location.pathname === item.path;

                return (
                    <div
                        key={index}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-300 transition
                            ${isActive
                                ? "bg-orange-50 text-orange-500 font-semibold"
                                : "text-gray-800 hover:bg-gray-100"
                            }`}
                    >
                        <Icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-gray-600"}`} />
                        <span className="font-semibold">{item.name}</span>
                    </div>
                );
            })}
        </div>
    );
};