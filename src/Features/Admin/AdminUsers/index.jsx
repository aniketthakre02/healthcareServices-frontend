import { Navbar } from '../../../Components/layout/Navbar';
import { Sidebar } from '../../../Components/layout/Sidebar';
import { useReducer, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../../../services/adminServices';
import { Edit2, Trash2, X, Check } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────
const ALL_ROLES = ["ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN"];

const roleStyles = {
    ROLE_ADMIN:   "bg-purple-100 text-purple-600",
    ROLE_DOCTOR:  "bg-blue-100 text-blue-600",
    ROLE_PATIENT: "bg-orange-100 text-orange-500"
};

// ── State ─────────────────────────────────────────────────
const initialState = {
    users: [],
    loading: false,
    error: "",
    success: "",
    editingUser: null,   // user currently being edited
    form: {
        userName: "",
        email: "",
        roles: []
    }
};

// ── Reducer ───────────────────────────────────────────────
const adminReducer = (state, action) => {
    switch (action.type) {

        case "FETCH_START":
            return { ...state, loading: true, error: "" };

        case "FETCH_SUCCESS":
            return { ...state, loading: false, users: action.payload };

        case "FETCH_ERROR":
            return { ...state, loading: false, error: action.payload };

        case "OPEN_EDIT":
            return {
                ...state,
                editingUser: action.payload,
                error: "",
                success: "",
                form: {
                    userName: action.payload.userName,
                    email:    action.payload.email,
                    roles:    [...action.payload.roles]
                }
            };

        case "CLOSE_EDIT":
            return { ...state, editingUser: null, error: "", success: "", form: initialState.form };

        case "FORM_CHANGE":
            return { ...state, form: { ...state.form, [action.field]: action.value } };

        case "TOGGLE_ROLE": {
            const hasRole = state.form.roles.includes(action.role);
            return {
                ...state,
                form: {
                    ...state.form,
                    roles: hasRole
                        ? state.form.roles.filter(r => r !== action.role)  // remove
                        : [...state.form.roles, action.role]                // add
                }
            };
        }

        case "SAVE_SUCCESS":
            return {
                ...state,
                editingUser: null,
                success: "User updated successfully!",
                users: state.users.map(u =>
                    u.userId === action.payload.userId ? action.payload : u
                )
            };

        case "DELETE_SUCCESS":
            return {
                ...state,
                success: "User deleted successfully!",
                users: state.users.filter(u => u.userId !== action.userId)
            };

        case "SET_ERROR":
            return { ...state, error: action.payload };

        default:
            return state;
    }
};

// ── Component ─────────────────────────────────────────────
export const AdminUsers = () => {
    const [state, dispatch] = useReducer(adminReducer, initialState);
    const { users, loading, error, success, editingUser, form } = state;

    useEffect(() => {
        dispatch({ type: "FETCH_START" });
        getAllUsers()
            .then(data => dispatch({ type: "FETCH_SUCCESS", payload: data }))
            .catch(() => dispatch({ type: "FETCH_ERROR", payload: "Failed to load users." }));
    }, []);

    const handleSave = async () => {
        if (!form.userName || !form.email || form.roles.length === 0) {
            dispatch({ type: "SET_ERROR", payload: "All fields are required and at least one role must be selected." });
            return;
        }
        try {
            const updated = await updateUser(editingUser.userId, {
                userName: form.userName,
                email:    form.email,
                roles:    form.roles   // sends Set<Role> as array — Spring handles it
            });
            dispatch({ type: "SAVE_SUCCESS", payload: updated });
        } catch (_err) {
            dispatch({ type: "SET_ERROR", payload: "Failed to update user." });
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUser(userId);
            dispatch({ type: "DELETE_SUCCESS", userId });
        } catch (_err) {
            dispatch({ type: "SET_ERROR", payload: "Failed to delete user." });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
                <Navbar /><Sidebar />
                <div className="ml-64 p-8 flex items-center justify-center h-96">
                    <p className="text-gray-400 text-sm">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
            <Navbar />
            <Sidebar />

            <div className="ml-64 p-8 space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
                    <p className="text-gray-500 mt-1">
                        Manage registered users and their roles.
                        <span className="ml-2 text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">
                            {users.length} users
                        </span>
                    </p>
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

                {/* TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-400 text-sm border-b border-gray-100">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Roles</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.userId} className="border-t border-gray-50 hover:bg-orange-50 transition">

                                    {/* Name */}
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {user.userName}
                                    </td>

                                    {/* Email */}
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {user.email}
                                    </td>

                                    {/* Roles — show all as badges */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {[...user.roles].map(role => (
                                                <span
                                                    key={role}
                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                                                        ${roleStyles[role] || "bg-gray-100 text-gray-500"}`}
                                                >
                                                    {role.replace("ROLE_", "")}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => dispatch({ type: "OPEN_EDIT", payload: user })}
                                                className="flex items-center gap-1 text-xs text-blue-500 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
                                            >
                                                <Edit2 size={12} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.userId)}
                                                className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT MODAL */}
            {editingUser && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => dispatch({ type: "CLOSE_EDIT" })}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-semibold text-gray-800">Edit User</h2>
                            <button onClick={() => dispatch({ type: "CLOSE_EDIT" })}>
                                <X size={20} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">

                            {/* Name */}
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">Name</label>
                                <input
                                    name="userName"
                                    value={form.userName}
                                    onChange={e => dispatch({ type: "FORM_CHANGE", field: "userName", value: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">Email</label>
                                <input
                                    name="email"
                                    value={form.email}
                                    onChange={e => dispatch({ type: "FORM_CHANGE", field: "email", value: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                                />
                            </div>

                            {/* Roles — checkbox based */}
                            <div>
                                <label className="text-sm text-gray-500 mb-2 block">Roles</label>
                                <div className="flex flex-col gap-2">
                                    {ALL_ROLES.map(role => (
                                        <label
                                            key={role}
                                            className="flex items-center gap-3 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.roles.includes(role)}
                                                onChange={() => dispatch({ type: "TOGGLE_ROLE", role })}
                                                className="w-4 h-4 accent-orange-500"
                                            />
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                                ${roleStyles[role]}`}>
                                                {role.replace("ROLE_", "")}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => dispatch({ type: "CLOSE_EDIT" })}
                                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};