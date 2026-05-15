import { Navbar } from '../../../Components/layout/Navbar';
import { Sidebar } from '../../../Components/layout/Sidebar';
import { useReducer, useEffect } from 'react';
import { getDoctorProfile, updateDoctorProfile } from '../../../services/doctorSerivce';
import { User, Phone, Clock, Stethoscope, Edit2, X, Check } from 'lucide-react';

// ── State ─────────────────────────────────────────────────
const initialState = {
    profile: null,
    loading: false,
    saving: false,
    isEditing: false,
    error: "",
    success: "",
    form: {
        name: "",
        age: "",
        gender: "",
        specialization: "",
        contact: "",
        experience: "",
        introduction: "",
        availability: ""
    }
};

// ── Reducer ───────────────────────────────────────────────
const doctorProfileReducer = (state, action) => {
    switch (action.type) {

        case "FETCH_START":
            return { ...state, loading: true, error: "" };

        case "FETCH_SUCCESS":
            return {
                ...state,
                loading: false,
                profile: action.payload,
                form: {
                    name:           action.payload.name           || "",
                    age:            action.payload.age            || "",
                    gender:         action.payload.gender         || "",
                    specialization: action.payload.specialization || "",
                    contact:        action.payload.contact        || "",
                    experience:     action.payload.experience     || "",
                    introduction:   action.payload.introduction   || "",
                    availability:   action.payload.availability   || ""
                }
            };

        case "FETCH_ERROR":
            return { ...state, loading: false, error: action.payload };

        case "OPEN_EDIT":
            return { ...state, isEditing: true, error: "", success: "" };

        case "CLOSE_EDIT":
            return {
                ...state,
                isEditing: false,
                error: "",
                success: "",
                form: {
                    name:           state.profile.name           || "",
                    age:            state.profile.age            || "",
                    gender:         state.profile.gender         || "",
                    specialization: state.profile.specialization || "",
                    contact:        state.profile.contact        || "",
                    experience:     state.profile.experience     || "",
                    introduction:   state.profile.introduction   || "",
                    availability:   state.profile.availability   || ""
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
const Field = ({ label, value, name, isEditing, onChange, type = "text", options }) => (
    <div>
        <label className="text-xs text-gray-400 mb-1 block">{label}</label>
        {isEditing ? (
            options ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                >
                    <option value="">Select {label}</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
            )
        ) : (
            <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                {value || "—"}
            </p>
        )}
    </div>
);

// ── Component ─────────────────────────────────────────────
export const DoctorProfile = () => {
    const [state, dispatch] = useReducer(doctorProfileReducer, initialState);
    const { profile, loading, saving, isEditing, error, success, form } = state;

    useEffect(() => {
        dispatch({ type: "FETCH_START" });
        getDoctorProfile()
            .then(data => dispatch({ type: "FETCH_SUCCESS", payload: data }))
            .catch(() => dispatch({ type: "FETCH_ERROR", payload: "Failed to load profile." }));
    }, []);

    const handleChange = (e) => {
        dispatch({ type: "FORM_CHANGE", field: e.target.name, value: e.target.value });
    };

    const handleSave = async () => {
        if (!form.name || !form.specialization || !form.contact) {
            dispatch({ type: "SAVE_ERROR", payload: "Name, specialization and contact are required." });
            return;
        }
        dispatch({ type: "SAVE_START" });
        try {
            const updated = await updateDoctorProfile({
                name:           form.name,
                age:            parseInt(form.age),
                gender:         form.gender,
                specialization: form.specialization,
                contact:        form.contact,
                experience:     form.experience,
                introduction:   form.introduction,
                availability:   form.availability
            });
            dispatch({ type: "SAVE_SUCCESS", payload: updated });
        } catch (err) {
            dispatch({ type: "SAVE_ERROR", payload: "Failed to update profile. Please try again." });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
                <Navbar /><Sidebar />
                <div className="ml-64 p-8 flex items-center justify-center h-96">
                    <p className="text-gray-400 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
            <Navbar />
            <Sidebar />

            <div className="ml-64 p-8 space-y-6 max-w-4xl">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-500 mt-1">Manage your professional information.</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => dispatch({ type: "OPEN_EDIT" })}
                            className="flex items-center gap-1.5 text-sm text-orange-500 border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-50 transition"
                        >
                            <Edit2 size={14} /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => dispatch({ type: "CLOSE_EDIT" })}
                                className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                            >
                                <X size={14} /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 text-sm text-white bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                            >
                                <Check size={14} />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Feedback */}
                {error && (
                    <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 text-green-600 text-sm px-4 py-2 rounded-lg border border-green-200">
                        {success}
                    </div>
                )}

                {/* PROFILE CARD — Avatar + Basic info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                            {profile?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "DR"}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">{profile?.name || "—"}</h2>
                            <p className="text-sm text-blue-500">{profile?.specialization || "—"}</p>
                            <p className="text-xs text-gray-400">{profile?.email || "—"}</p>
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
                        <User size={15} className="text-orange-400" />
                        Personal Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Full Name"   name="name"   value={form.name}   isEditing={isEditing} onChange={handleChange} />
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Email</label>
                            <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">{profile?.email || "—"}</p>
                        </div>
                        <Field label="Age"    name="age"    value={form.age}    isEditing={isEditing} onChange={handleChange} type="number" />
                        <Field label="Gender" name="gender" value={form.gender} isEditing={isEditing} onChange={handleChange}
                            options={["Male", "Female", "Other"]} />
                        <Field label="Contact" name="contact" value={form.contact} isEditing={isEditing} onChange={handleChange} />
                        <Field label="Availability" name="availability" value={form.availability} isEditing={isEditing} onChange={handleChange}
                            options={["Mon - Fri", "Mon - Sat", "Tue - Sat", "Wed - Sun", "All Days"]} />
                    </div>
                </div>

                {/* PROFESSIONAL CARD */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
                        <Stethoscope size={15} className="text-orange-400" />
                        Professional Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Specialization" name="specialization" value={form.specialization} isEditing={isEditing} onChange={handleChange} />
                        <Field label="Experience"     name="experience"     value={form.experience}     isEditing={isEditing} onChange={handleChange} />
                    </div>

                    <div className="mt-4">
                        <label className="text-xs text-gray-400 mb-1 block">Introduction</label>
                        {isEditing ? (
                            <textarea
                                name="introduction"
                                value={form.introduction}
                                onChange={handleChange}
                                rows={4}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
                            />
                        ) : (
                            <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg leading-relaxed">
                                {profile?.introduction || "—"}
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};