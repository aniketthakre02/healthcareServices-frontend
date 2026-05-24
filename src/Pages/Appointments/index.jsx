import { Navbar } from '../../Components/layout/Navbar';
import { Sidebar } from '../../Components/layout/Sidebar';
import { Plus, X, Calendar, User } from 'lucide-react';
import { useReducer, useEffect } from 'react';
import { getAllDoctors, bookAppointment, getMyAppointments } from '../../services/appointmentService';

// ── Constants ─────────────────────────────────────────────
const filters = ["All", "REQUESTED", "APPROVED", "CANCELLED", "COMPLETED"];

const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-600",
    CONFIRMED: "bg-green-100 text-green-600",
    CANCELLED: "bg-red-100 text-red-500",
    COMPLETED: "bg-blue-100 text-blue-500"
};

const statusLabels = {
    REQUESTED: "Requested",
    APPROVED: "Approved",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed"
};

const formatDate = (dateTime) => {
    if (!dateTime) return "—";
    return new Date(dateTime).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
};

// ── State ─────────────────────────────────────────────────
const initialState = {
    filter: "All",
    myAppointments: [],   // real data from backend
    fetchingAppts: false,
    showModal: false,
    doctors: [],
    loading: false,
    error: "",
    success: "",
    form: {
        doctorId: "",
        doctorName: "",
        dateTime: "",
        reason: ""
    }
};

// ── Reducer ───────────────────────────────────────────────
const appointmentReducer = (state, action) => {
    switch (action.type) {

        case "SET_FILTER":
            return { ...state, filter: action.payload };

        case "FETCH_APPTS_START":
            return { ...state, fetchingAppts: true };

        case "FETCH_APPTS_SUCCESS":
            return { ...state, fetchingAppts: false, myAppointments: action.payload };

        case "FETCH_APPTS_ERROR":
            return { ...state, fetchingAppts: false, error: action.payload };

        case "OPEN_MODAL":
            return { ...state, showModal: true, loading: false, error: "", success: "" };

        case "CLOSE_MODAL":
            return {
                ...state,
                showModal: false,
                loading: false,
                error: "",
                success: "",
                form: initialState.form
            };

        case "SET_DOCTORS":
            return { ...state, doctors: action.payload };

        case "FORM_CHANGE":
            return { ...state, form: { ...state.form, [action.field]: action.value } };

        case "BOOKING_START":
            return { ...state, loading: true, error: "", success: "" };

        case "BOOKING_SUCCESS":
            return {
                ...state,
                loading: false,
                success: action.payload,
                // 👇 add newly booked appointment to list immediately
                myAppointments: [action.newAppt, ...state.myAppointments]
            };

        case "BOOKING_ERROR":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

// ── Component ─────────────────────────────────────────────
export const Appointments = () => {
    const [state, dispatch] = useReducer(appointmentReducer, initialState);
    const { filter, myAppointments, fetchingAppts, showModal, doctors, loading, error, success, form } = state;

    // fetch patient's own appointments on mount
    useEffect(() => {
        dispatch({ type: "FETCH_APPTS_START" });
        getMyAppointments()
            .then(data => {
                // console.log("Appointments:", data);
                dispatch({ type: "FETCH_APPTS_SUCCESS", payload: data });
            })
            .catch(() => dispatch({ type: "FETCH_APPTS_ERROR", payload: "Failed to load appointments." }));
    }, []);
    
    // fetch doctors when modal opens
    useEffect(() => {
        if (!showModal) return;
        getAllDoctors()
            .then(data => console.log(data) + "" + dispatch({ type: "SET_DOCTORS", payload: data })
            )
            .catch(err => console.error("Failed to fetch doctors:", err));
    }, [showModal]);

    const handleChange = (e) => {
        // alert(e.target.value);
        dispatch({ type: "FORM_CHANGE", field: e.target.name, value: e.target.value });
    };

    const handleBooking = async () => {
        if (!form.doctorId || !form.dateTime || !form.reason) {
            dispatch({ type: "BOOKING_ERROR", payload: "All fields are required." });
            return;
        }
        dispatch({ type: "BOOKING_START" });
        try {
            const newAppt = await bookAppointment({
                doctorId: form.doctorId,
                doctorName: form.doctorName,
                dateTime: form.dateTime,
                reason: form.reason
            });
            dispatch({
                type: "BOOKING_SUCCESS",
                payload: "Appointment booked successfully!",
                newAppt   // backend returns saved appointment, add to list
            });
            setTimeout(() => dispatch({ type: "CLOSE_MODAL" }), 1500);
        } catch (err) {
            dispatch({ type: "BOOKING_ERROR", payload: "Booking failed. Please try again." });
        }
    };

    // filter appointments by status
    const filtered = filter === "All"
        ? myAppointments
        : myAppointments.filter(a => a.status === filter);
    console.log("filtered" + filtered);

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
            <Navbar />
            <Sidebar />
            <div className="ml-64 p-8 space-y-6">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                        <p className="text-gray-500 mt-1">
                            Track and manage your appointments.
                            <span className="ml-2 text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">
                                {myAppointments.length} total
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={() => dispatch({ type: "OPEN_MODAL" })}
                        className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition"
                    >
                        <Plus size={16} />
                        Book Appointment
                    </button>
                </div>

                {/* FILTER TABS */}
                <div className="flex gap-2 flex-wrap">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => dispatch({ type: "SET_FILTER", payload: f })}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
                                ${filter === f
                                    ? "bg-orange-50 text-orange-500 border-orange-300"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {f === "All" ? "All" : statusLabels[f]}
                        </button>
                    ))}
                </div>

                {/* APPOINTMENTS TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    {fetchingAppts ? (
                        <div className="text-center text-gray-400 text-sm py-16">
                            Loading appointments...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-16">
                            No appointments found. Book your first one!
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-400 text-sm border-b border-gray-100">
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Doctor</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((appt) => (
                                    <tr key={appt.id} className="border-t border-gray-50 hover:bg-orange-50 transition">
                                        <td className="px-6 py-4 text-gray-400 text-sm">#{appt.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-orange-400" />
                                                <span className="text-sm text-gray-700">{appt.doctorName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-orange-400" />
                                                <span className="text-sm text-gray-600">{formatDate(appt.dateTime)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {appt.reason}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                ${statusStyles[appt.status] || "bg-gray-100 text-gray-500"}`}>
                                                {statusLabels[appt.status] || appt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => dispatch({ type: "CLOSE_MODAL" })}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-semibold text-gray-800">Book Appointment</h2>
                            <button onClick={() => dispatch({ type: "CLOSE_MODAL" })}>
                                <X size={20} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>
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
                                <label className="text-sm text-gray-500 mb-1 block">Select Doctor</label>
                                <select
                                    name="doctorId"
                                    value={form.doctorId}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                                >
                                    <option value="">-- Select a Doctor --</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.userId} value={doctor.userId}>
                                            {doctor.name} — {doctor.specialization}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="dateTime"
                                    value={form.dateTime}
                                    onChange={handleChange}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">Reason for Visit</label>
                                <textarea
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                    placeholder="Describe your reason for visit..."
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => dispatch({ type: "CLOSE_MODAL" })}
                                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBooking}
                                disabled={loading}
                                className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                            >
                                {loading ? "Booking..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};