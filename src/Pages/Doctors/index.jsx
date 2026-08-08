import { Navbar } from '../../Components/layout/Navbar';
import { Sidebar } from '../../Components/layout/Sidebar';
import { useEffect, useReducer, useState } from 'react';
import { Phone, Clock, User, Stethoscope, X } from 'lucide-react';
import { getAllDoctors } from '../../services/AllDoctorsService';
import { bookAppointment } from '../../services/appointmentService';
import { useDebounce } from '../../hooks/useDebounce';

// ── Constants ─────────────────────────────────────────────
const avatarColors = [
    { bg: "bg-orange-100", text: "text-orange-500" },
    { bg: "bg-blue-100",   text: "text-blue-500"   },
    { bg: "bg-green-100",  text: "text-green-500"  },
    { bg: "bg-purple-100", text: "text-purple-500" },
    { bg: "bg-pink-100",   text: "text-pink-500"   },
    { bg: "bg-teal-100",   text: "text-teal-500"   },
];

const getInitials = (name) =>
    name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "DR";

// ── State ─────────────────────────────────────────────────
const initialState = {
    showModal: false,
    loading: false,
    error: "",
    success: "",
    selectedDoctor: null,   // 👈 stores the doctor whose card was clicked
    form: {
        dateTime: "",
        reason: ""
    }
};

// ── Reducer ───────────────────────────────────────────────
const reducer = (state, action) => {
    switch (action.type) {

        case "OPEN_MODAL":
            return {
                ...state,
                showModal: true,
                loading: false,
                error: "",
                success: "",
                selectedDoctor: action.doctor,  // 👈 set clicked doctor
                form: { dateTime: "", reason: "" }
            };

        case "CLOSE_MODAL":
            return {
                ...state,
                showModal: false,
                loading: false,
                error: "",
                success: "",
                selectedDoctor: null,
                form: { dateTime: "", reason: "" }
            };

        case "FORM_CHANGE":
            return { ...state, form: { ...state.form, [action.field]: action.value } };

        case "BOOKING_START":
            return { ...state, loading: true, error: "", success: "" };

        case "BOOKING_SUCCESS":
            return { ...state, loading: false, success: action.payload };

        case "BOOKING_ERROR":
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
};

// ── Component ─────────────────────────────────────────────
export const Doctors = () => {
    const [search, setSearch]           = useState("");
    const [selectedSpec, setSelectedSpec] = useState("All");
    const [data, setData]               = useState([]);
    const [fetchError, setFetchError]   = useState("");

    const [state, dispatch] = useReducer(reducer, initialState);
    const { showModal, loading, error, success, selectedDoctor, form } = state;

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const result = await getAllDoctors();
                setData(result);
            } catch (err) {
                setFetchError("Failed to load doctors.");
            }
        };
        fetchDoctors();
    }, []);

    const handleChange = (e) => {
        dispatch({ type: "FORM_CHANGE", field: e.target.name, value: e.target.value });
    };

    const handleBooking = async () => {
        if (!form.dateTime || !form.reason.trim()) {
            dispatch({ type: "BOOKING_ERROR", payload: "All fields are required." });
            return;
        }
        if (new Date(form.dateTime) <= new Date()) {
            dispatch({ type: "BOOKING_ERROR", payload: "Appointment must be in the future." });
            return;
        }
        if (!selectedDoctor?.userId) {
            dispatch({ type: "BOOKING_ERROR", payload: "No doctor selected." });
            return;
        }
        dispatch({ type: "BOOKING_START" });
        try {
            await bookAppointment({
                doctorId: selectedDoctor.userId,
                dateTime: form.dateTime,
                reason:   form.reason.trim()
            });
            dispatch({ type: "BOOKING_SUCCESS", payload: "Appointment booked successfully!" });
            setTimeout(() => dispatch({ type: "CLOSE_MODAL" }), 1500);
        } catch (err) {
            const msg = err.normalizedMessage || err.response?.data?.message || "Booking failed. Please try again.";
            dispatch({ type: "BOOKING_ERROR", payload: typeof msg === "string" ? msg : "Booking failed." });
        }
    };

    const specializations = ["All", ...new Set(data.map(d => d.specialization))];

    const filtered = data.filter(d => {
        const matchesSearch =
            d.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            d.specialization?.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesSpec = selectedSpec === "All" || d.specialization === selectedSpec;
        return matchesSearch && matchesSpec;
    });

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
            <Navbar />
            <Sidebar />

            <div className="ml-64 p-8 space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
                    <p className="text-gray-500 mt-1">
                        Meet our team of {data.length} specialized medical professionals.
                    </p>
                </div>

                {fetchError && (
                    <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg border border-red-200">
                        {fetchError}
                    </div>
                )}

                {/* SEARCH + FILTER */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or specialization..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:border-orange-400"
                        />
                        {search !== debouncedSearch && (
                            <span className="absolute right-3 top-2.5 text-xs text-gray-300">...</span>
                        )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {specializations.map(spec => (
                            <button
                                key={spec}
                                onClick={() => setSelectedSpec(spec)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
                                    ${selectedSpec === spec
                                        ? "bg-orange-50 text-orange-500 border-orange-300"
                                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>
                </div>

                {/* DOCTOR CARDS GRID */}
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">
                        No doctors found matching your search.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map((doctor, index) => {
                            const color = avatarColors[index % avatarColors.length];
                            return (
                                <div
                                    key={doctor.userId}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition space-y-4"
                                >
                                    {/* Avatar + Name */}
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${color.bg} ${color.text}`}>
                                            {getInitials(doctor.name)}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-800">{doctor.name}</h3>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                                                {doctor.specialization}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Introduction */}
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {doctor.introduction || "No introduction available."}
                                    </p>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <User size={14} className="text-orange-400" />
                                            {doctor.age} yrs, {doctor.gender}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Stethoscope size={14} className="text-orange-400" />
                                            {doctor.experience}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Phone size={14} className="text-orange-400" />
                                            {doctor.contact}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Clock size={14} className="text-orange-400" />
                                            {doctor.availability}
                                        </div>
                                    </div>

                                    {/* Book Button */}
                                    <div className="border-t border-gray-100 pt-3">
                                        <button
                                            onClick={() => dispatch({ type: "OPEN_MODAL", doctor })}
                                            className="w-full py-2 text-sm font-semibold text-orange-500 border border-orange-200 rounded-lg hover:bg-orange-50 transition"
                                        >
                                            Book Appointment
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
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
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-semibold text-gray-800">Book Appointment</h2>
                            <button onClick={() => dispatch({ type: "CLOSE_MODAL" })}>
                                <X size={20} className="text-gray-400 hover:text-gray-600" />
                            </button>
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

                        <div className="space-y-4">

                            {/* 👇 Pre-selected doctor — read only */}
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">Doctor</label>
                                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-orange-100 text-orange-500`}>
                                        {getInitials(selectedDoctor?.name)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{selectedDoctor?.name}</p>
                                        <p className="text-xs text-gray-400">{selectedDoctor?.specialization}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Date & Time */}
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

                            {/* Reason */}
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

                        {/* Actions */}
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