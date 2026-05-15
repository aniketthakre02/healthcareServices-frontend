import { Navbar } from '../../Components/layout/Navbar';
import { Sidebar } from '../../Components/layout/Sidebar';
import { useReducer } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword } from '../../services/authService';
import { User, Lock, Mail } from 'lucide-react';

const initialState = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    loading: false,
    error: "",
    success: ""
};

const settingsReducer = (state, action) => {
    switch (action.type) {
        case "FIELD_CHANGE":
            return { ...state, [action.field]: action.value };
        case "SUBMIT_START":
            return { ...state, loading: true, error: "", success: "" };
        case "SUBMIT_SUCCESS":
            return {
                ...initialState,  // reset all fields on success
                success: action.payload
            };
        case "SUBMIT_ERROR":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export const Settings = () => {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(settingsReducer, initialState);
    const { currentPassword, newPassword, confirmPassword, loading, error, success } = state;

    const handleChange = (e) => {
        dispatch({ type: "FIELD_CHANGE", field: e.target.name, value: e.target.value });
    };

    const handleSubmit = async () => {
        // frontend validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            dispatch({ type: "SUBMIT_ERROR", payload: "All fields are required." });
            return;
        }
        if (newPassword !== confirmPassword) {
            dispatch({ type: "SUBMIT_ERROR", payload: "New passwords do not match." });
            return;
        }
        if (newPassword.length < 6) {
            dispatch({ type: "SUBMIT_ERROR", payload: "New password must be at least 6 characters." });
            return;
        }
        if (newPassword === currentPassword) {
            dispatch({ type: "SUBMIT_ERROR", payload: "New password cannot be same as current password." });
            return;
        }

        dispatch({ type: "SUBMIT_START" });

        try {
            await changePassword({ currentPassword, newPassword });
            dispatch({ type: "SUBMIT_SUCCESS", payload: "Password changed successfully!" });
        } catch (err) {
            dispatch({
                type: "SUBMIT_ERROR",
                payload: err.response?.data || "Failed to change password. Please try again."
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
            <Navbar />
            <Sidebar />

            <div className="ml-64 p-8 space-y-6 max-w-3xl">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your account information and security.</p>
                </div>

                {/* PROFILE CARD */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={18} className="text-orange-500" />
                        Profile Information
                    </h2>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Full Name</label>
                            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50">
                                <User size={15} className="text-gray-400" />
                                <span className="text-sm text-gray-700">{user?.name || "N/A"}</span>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Email Address</label>
                            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50">
                                <Mail size={15} className="text-gray-400" />
                                <span className="text-sm text-gray-700">{user?.sub || "N/A"}</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400">
                            Profile details are managed by your administrator.
                        </p>
                    </div>
                </div>

                {/* CHANGE PASSWORD CARD */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Lock size={18} className="text-orange-500" />
                        Change Password
                    </h2>

                    {/* Feedback */}
                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-600 text-sm px-4 py-2 rounded-lg mb-4 border border-green-200">
                            {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter new password"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="mt-6 w-full py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </div>

            </div>
        </div>
    );
};