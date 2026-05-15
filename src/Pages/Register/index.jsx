import { useState } from "react";
import { Navbar } from "../../Components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";

// ── Validation Rules ───────────────────────────────────────
const validate = (formData) => {
    const errors = {};

    // Name
    if (!formData.userName.trim()) {
        errors.userName = "Name is required.";
    } else if (formData.userName.trim().length < 3) {
        errors.userName = "Name must be at least 3 characters.";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
        errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
        errors.email = "Enter a valid email address.";
    }

    // Password
    if (!formData.password) {
        errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[0-9]/.test(formData.password)) {
        errors.password = "Password must contain at least one number.";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
        errors.password = "Password must contain at least one special character (!@#$%^&*).";
    }

    return errors;
};

// ── Password Strength ──────────────────────────────────────
const getPasswordStrength = (password) => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8)            score++;
    if (/[A-Z]/.test(password))          score++;
    if (/[0-9]/.test(password))          score++;
    if (/[!@#$%^&*]/.test(password))     score++;

    if (score <= 1) return { label: "Weak",   color: "bg-red-400",    width: "w-1/4"  };
    if (score === 2) return { label: "Fair",   color: "bg-yellow-400", width: "w-2/4"  };
    if (score === 3) return { label: "Good",   color: "bg-blue-400",   width: "w-3/4"  };
    return              { label: "Strong", color: "bg-green-500",  width: "w-full" };
};

// ── Component ──────────────────────────────────────────────
export const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: ""
    });

    const [errors, setErrors]           = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading]         = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const strength = getPasswordStrength(formData.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // clear field error as user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        // run validation
        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            await register(formData);
            navigate("/login");
        } catch (err) {
            setServerError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-between h-full">

            {/* Left Section */}
            <div className="hidden md:flex w-1/2 bg-sky-100 text-black flex-col justify-center items-center p-12">
                <div
                    className="text-4xl font-bold text-gray-900 cursor-pointer mb-4"
                    onClick={() => navigate("/")}
                >
                    Health Care
                </div>
                <h1 className="text-4xl font-bold mb-4">Your Health, Our Priority</h1>
                <p className="text-lg text-center max-w-md">
                    Manage appointments, access health records, and stay connected
                    with healthcare professionals through our secure platform.
                </p>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
                    alt="healthcare"
                    className="w-80 mt-10"
                />
            </div>

            {/* Register Form */}
            <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-50">
                <div className="w-full max-w-md bg-white p-10 rounded-xl border">

                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h2>
                    <p className="text-gray-500 mb-6">Join our healthcare system and manage your health easily.</p>

                    {/* Server Error */}
                    {serverError && (
                        <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                        {/* Name */}
                        <div>
                            <input
                                type="text"
                                name="userName"
                                placeholder="Full Name"
                                value={formData.userName}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition
                                    ${errors.userName
                                        ? "border-red-400 focus:ring-red-300"
                                        : "focus:ring-orange-400"
                                    }`}
                            />
                            {errors.userName && (
                                <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition
                                    ${errors.email
                                        ? "border-red-400 focus:ring-red-300"
                                        : "focus:ring-orange-400"
                                    }`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition pr-12
                                        ${errors.password
                                            ? "border-red-400 focus:ring-red-300"
                                            : "focus:ring-orange-400"
                                        }`}
                                />
                                {/* Show/Hide toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-3 top-3.5 text-xs text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            {/* Password strength bar */}
                            {formData.password && strength && (
                                <div className="mt-2">
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                                    </div>
                                    <p className={`text-xs mt-1 font-medium
                                        ${strength.label === "Weak"   && "text-red-400"}
                                        ${strength.label === "Fair"   && "text-yellow-500"}
                                        ${strength.label === "Good"   && "text-blue-500"}
                                        ${strength.label === "Strong" && "text-green-500"}
                                    `}>
                                        {strength.label} password
                                    </p>
                                </div>
                            )}

                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}

                            {/* Password hints */}
                            {!errors.password && formData.password && strength?.label !== "Strong" && (
                                <ul className="text-xs text-gray-400 mt-2 space-y-0.5 list-disc list-inside">
                                    {formData.password.length < 8         && <li>At least 8 characters</li>}
                                    {!/[A-Z]/.test(formData.password)     && <li>One uppercase letter</li>}
                                    {!/[0-9]/.test(formData.password)     && <li>One number</li>}
                                    {!/[!@#$%^&*]/.test(formData.password)&& <li>One special character (!@#$%^&*)</li>}
                                </ul>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? "Creating Account..." : "Register"}
                        </button>
                    </form>

                    <p className="text-sm text-gray-500 mt-6 text-center">
                        Already have an account?
                        <span
                            className="text-orange-500 cursor-pointer ml-1"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};