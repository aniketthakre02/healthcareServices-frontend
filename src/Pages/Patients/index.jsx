import { Navbar } from '../../Components/layout/Navbar';
import { Sidebar } from '../../Components/layout/Sidebar';
import { useReducer, useEffect } from 'react';
import { User, Phone, Calendar, Edit2, X, Check } from 'lucide-react';
import { getMyProfile, updateMyProfile, getMyAppointments } from '../../services/UserService';

// ── State ─────────────────────────────────────────────────
const initialState = {
    profile: null,
    appointments: [],
    isEditing: false,
    loading: false,
    saving: false,
    error: "",
    success: "",
    form: {
        name: "",
        age: "",
        gender: "",
        contact: ""
    }
};

// ── Reducer ───────────────────────────────────────────────
const patientReducer = (state, action) => {
    switch (action.type) {

        case "FETCH_SUCCESS":
            return {
                ...state,
                loading: false,
                profile: action.profile,
                appointments: action.appointments,
                form: {
                    name:    action.profile.name    || "",
                    age:     action.profile.age     || "",
                    gender:  action.profile.gender  || "",
                    contact: action.profile.contact || ""
                }
            };

        case "FETCH_ERROR":
            return { ...state, loading: false, error: action.payload };

        case "SET_LOADING":
            return { ...state, loading: true, error: "" };

        case "OPEN_EDIT":
            return { ...state, isEditing: true, error: "", success: "" };

        case "CLOSE_EDIT":
            return {
                ...state,
                isEditing: false,
                error: "",
                success: "",
                // reset form back to current profile values
                form: {
                    name:    state.profile.name    || "",
                    age:     state.profile.age     || "",
                    gender:  state.profile.gender  || "",
                    contact: state.profile.contact || ""
                }
            };

        case "FORM_CHANGE":
            return { ...state, form: { ...state.form, [action.field]: action.value } };

        case "SAVE_START":
            return { ...state, saving: true, error: "", success: "" };

        case "SAVE_SUCCESS":
            return {
                ...state,
                saving: false,
                isEditing: false,
                success: "Profile updated successfully!",
                profile: { ...state.profile, ...action.payload }
            };

        case "SAVE_ERROR":
            return { ...state, saving: false, error: action.payload };

        default:
            return state;
    }
};

// ── Helpers ───────────────────────────────────────────────
const statusStyles = {
    CONFIRMED: "bg-green-100 text-green-600",
    PENDING:   "bg-yellow-100 text-yellow-600",
    CANCELLED: "bg-red-100 text-red-500",
    COMPLETED: "bg-blue-100 text-blue-500"
};

const formatDate = (dateTime) => {
    if (!dateTime) return "—";
    return new Date(dateTime).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
};


// export const Patients = () => {
//     return <div>here we are</div>;
// };

// ── Component ─────────────────────────────────────────────
export const Patients = () => {
    const [state, dispatch] = useReducer(patientReducer, initialState);
    const { profile, appointments, isEditing, loading, saving, error, success, form } = state;

    // fetch profile + appointments together on mount
    useEffect(() => {
        dispatch({ type: "SET_LOADING" });
        Promise.all([getMyProfile(), getMyAppointments()])
            .then(([profileData, appointmentsData]) => {
                dispatch({
                    type: "FETCH_SUCCESS",
                    profile: profileData,
                    appointments: appointmentsData
                });
            })
            .catch(() => dispatch({ type: "FETCH_ERROR", payload: "Failed to load patient data." }));
    }, []);

    const handleChange = (e) => {
        dispatch({ type: "FORM_CHANGE", field: e.target.name, value: e.target.value });
    };

    const handleSave = async () => {
        if (!form.name || !form.age || !form.gender || !form.contact) {
            dispatch({ type: "SAVE_ERROR", payload: "All fields are required." });
            return;
        }

        dispatch({ type: "SAVE_START" });
        try {
            const updated = await updateMyProfile({
                name:    form.name,
                age:     parseInt(form.age),
                gender:  form.gender,
                contact: form.contact
            });
            dispatch({ type: "SAVE_SUCCESS", payload: updated });
        } catch (err) {
            dispatch({ type: "SAVE_ERROR", payload: "Failed to update profile. Please try again." });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
                <Navbar />
                <Sidebar />
                <div className="ml-64 p-8 flex items-center justify-center h-96">
                    <p className="text-gray-400 text-sm">Loading patient data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
            <Navbar />
            <Sidebar />

            <div className="ml-64 p-8 space-y-6 max-w-5xl">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500 mt-1">View and manage your personal information and appointments.</p>
                </div>

                {/* PROFILE CARD */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                            <User size={18} className="text-orange-500" />
                            Personal Information
                        </h2>
                        {!isEditing ? (
                            <button
                                onClick={() => dispatch({ type: "OPEN_EDIT" })}
                                className="flex items-center gap-1.5 text-sm text-orange-500 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition"
                            >
                                <Edit2 size={14} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => dispatch({ type: "CLOSE_EDIT" })}
                                    className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <X size={14} />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 text-sm text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                                >
                                    <Check size={14} />
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        )}
                    </div>

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

                    {/* Profile Fields */}
                    <div className="grid grid-cols-2 gap-4">

                        {/* Name */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                            {isEditing ? (
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                                />
                            ): (
                                <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                    {profile?.name || "—"}
                                </p>
                            )}
                        </div>

                        {/* Email — never editable */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Email Address</label>
                            <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                {profile?.email || "—"}
                            </p>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Age</label>
                            {isEditing ? (
                                <input
                                    name="age"
                                    type="number"
                                    value={form.age}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                                />
                            ) : (
                                <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                    {profile?.age || "—"}
                                </p>
                            )}
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Gender</label>
                            {isEditing ? (
                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                    {profile?.gender || "—"}
                                </p>
                            )}
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Contact</label>
                            {isEditing ? (
                                <input
                                    name="contact"
                                    value={form.contact}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                                />
                            ) : (
                                <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-2">
                                    <Phone size={13} className="text-gray-400" />
                                    {profile?.contact || "—"}
                                </p>
                            )}
                        </div>

                    </div>
                </div>

                {/* APPOINTMENTS SECTION */}
                <div>
                    <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
                        <Calendar size={18} className="text-orange-500" />
                        My Appointments
                        <span className="ml-1 text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">
                            {appointments.length}
                        </span>
                    </h2>

                    {appointments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
                            No appointments found. Book your first appointment!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {appointments.map((appt) => (
                                <div
                                    key={appt.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 hover:shadow-md transition"
                                >
                                    {/* Top row — ID + status */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Appointment #{appt.id}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                            ${statusStyles[appt.status] || "bg-gray-100 text-gray-500"}`}>
                                            {appt.status}
                                        </span>
                                    </div>

                                    {/* Doctor */}
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-orange-400" />
                                        <span className="text-sm text-gray-600">
                                            Doctor ID: <span className="font-medium text-gray-800">{appt.doctorId}</span>
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-orange-400" />
                                        <span className="text-sm text-gray-600">{formatDate(appt.dateTime)}</span>
                                    </div>

                                    {/* Reason */}
                                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500">
                                        {appt.reason}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};