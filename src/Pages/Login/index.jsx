import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {login as loginService} from "../../services/authService";
import { useAuth} from "../../contexts/AuthContext";

export const Login = () => {
    const navigate = useNavigate();
    const { login} = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
         
        try {
        console.log("am I even coming here");
        console.log(formData);
        const response = await loginService(formData);
         console.log(response.token +"Response");
      
         login(response.token);

         navigate("/dashboard");

        // ✅ store JWT token
        // localStorage.setItem("token", response.token);
        // ✅ redirect to dashboard
        
    } catch (error) {
        console.error("Login failed", error);

        alert("Invalid email or password"); // we’ll improve this later
    }
    };

    return (
        <>
            <div className="flex justify-between h-full">

                {/* Left Section */}
                <div className="hidden md:flex w-1/2 bg-sky-100 text-black flex-col justify-center items-center p-12">

                    <div
                        className="text-4xl font-bold text-gray-900 font-museo cursor-pointer mb-4"
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
                <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-50">

                    <div className="w-full max-w-md bg-white p-10 rounded-xl border border-gray-300">

                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Login to Your Account
                        </h2>

                        <p className="text-gray-500 mb-6">
                            Enter your credentials to continue.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />

                            <button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                            >
                                Login
                            </button>

                        </form>

                        <p className="text-sm text-gray-500 mt-6 text-center">
                            Don't have an account?
                            <span
                                className="text-orange-500 cursor-pointer ml-1"
                                onClick={() => navigate("/register")}
                            >
                                Register
                            </span>
                        </p>

                    </div>

                </div>

            </div>
        </>
    );
};