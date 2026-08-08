import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/AppLogo.png";
import { useAuth } from "../../../contexts/AuthContext";

export const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <nav className="w-full h-20 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
            {/* LOGO */}
            <div
                className="flex items-center gap-3 text-2xl font-bold text-gray-900 cursor-pointer"
                onClick={() => navigate("/")}
            >
                <img src={logo} alt="Health Care Logo" className="h-9 w-9 object-contain" />
                <span>
                    Health <span className="text-orange-500">Care</span>
                </span>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex gap-4 items-center">
                {isAuthenticated ? (
                    <>
                        {/* USER NAME */}
                        <span className="font-semibold text-lg text-gray-800">
                            👋 {user?.name || user?.sub || "User"}
                        </span>

                        {/* LOGOUT */}
                        <button
                            className="bg-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-orange-600 transition shadow-sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        {/* LOGIN */}
                        <button
                            className="border border-gray-300 text-gray-800 px-5 py-2 rounded-full font-semibold hover:bg-gray-100 transition"
                            onClick={() => navigate("/login")}
                        >
                            Log In
                        </button>

                        {/* REGISTER */}
                        <button
                            className="bg-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-orange-600 transition shadow-sm"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};
