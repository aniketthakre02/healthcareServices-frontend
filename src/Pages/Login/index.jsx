import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email.trim() || !formData.password) {
            setError("Email and password are required.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await loginService(formData);
            if (!response.token) {
                throw new Error("No token received");
            }
            login(response.token);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            console.error("Login failed", err);
            const msg = err.normalizedMessage || err.response?.data?.error || err.response?.data?.message || "Invalid email or password";
            setError(typeof msg === "string" ? msg : "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-between min-h-screen">
            {/* Left Section */}
            <div className="hidden md:flex w-1/2 bg-sky-100 text-black flex-col justify-center items-center p-12">
                <div
                    className="text-4xl font-bold text-gray-900 cursor-pointer mb-4"
                    onClick={() => navigate("/")}
                >
                    Health Care
                </div>
                <h1 className="text-4xl font-bold mb-4">
                    Welcome Back!
                </h1>
                <p className="text-lg text-center max-w-md">
                    Access your healthcare dashboard, manage appointments,
                    and stay connected with your doctors securely.
                </p>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
                    alt="healthcare"
                    className="w-80 mt-10"
                />
            </div>

            {/* Login Form */}
            <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-50 p-6">
                <div className="w-full max-w-md bg-white p-10 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Login to Your Account
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Enter your credentials to continue.
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="text-sm text-gray-500 mt-6 text-center">
                        Don&apos;t have an account?
                        <span
                            className="text-orange-500 cursor-pointer ml-1 hover:underline font-medium"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
