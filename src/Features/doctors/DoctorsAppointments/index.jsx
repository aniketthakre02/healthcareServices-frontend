import { useReducer, useEffect } from 'react';
import { getDoctorAppointments, updateAppointmentStatus } from '../../../services/doctorService';
import { Sidebar } from '../../../Components/layout/Sidebar';
import { Navbar } from '../../../Components/layout/Navbar';
import { Calendar, User, Check, X } from 'lucide-react';

const filters = ["All", "REQUESTED", "APPROVED", "CANCELLED", "COMPLETED"];

const statusStyles = {
  REQUESTED: "bg-yellow-100 text-yellow-600",
  APPROVED: "bg-green-100 text-green-600",
  CANCELLED: "bg-red-100 text-red-500",
  COMPLETED: "bg-blue-100 text-blue-500",
  REJECTED: "bg-red-100 text-red-500"
};

const statusLabels = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  REJECTED: "Rejected"
};

const formatDate = (dateTime) => {
  if (!dateTime) return "—";
  return new Date(dateTime).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

const initialState = {
  appointments: [],
  filter: "All",
  loading: false,
  error: "",
  updatingId: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, appointments: Array.isArray(action.payload) ? action.payload : [] };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    case "UPDATE_START":
      return { ...state, updatingId: action.id, error: "" };
    case "UPDATE_SUCCESS":
      return {
        ...state,
        updatingId: null,
        appointments: state.appointments.map(a =>
          a.id === action.payload.id ? action.payload : a
        )
      };
    case "UPDATE_ERROR":
      return { ...state, updatingId: null, error: action.payload };
    default:
      return state;
  }
};

export const DoctorAppointments = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { appointments, filter, loading, error, updatingId } = state;

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    getDoctorAppointments()
      .then(data => {
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      })
      .catch(() => dispatch({ type: "FETCH_ERROR", payload: "Failed to load appointments." }));
  }, []);

  const handleStatus = async (appointmentId, status) => {
    dispatch({ type: "UPDATE_START", id: appointmentId });
    try {
      const updated = await updateAppointmentStatus(appointmentId, status);
      dispatch({ type: "UPDATE_SUCCESS", payload: updated });
    } catch (err) {
      const msg = err.normalizedMessage || err.response?.data?.message || "Failed to update status.";
      dispatch({ type: "UPDATE_ERROR", payload: typeof msg === "string" ? msg : "Failed to update status." });
    }
  };

  const filtered = filter === "All"
    ? appointments
    : appointments.filter(a => a.status === filter);

  // summary counts
  const pending = appointments.filter(a => a.status === "REQUESTED").length;
  const confirmed = appointments.filter(a => a.status === "APPROVED").length;

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
      <Navbar />
      <Sidebar />
      <div className='ml-64 p-8 space-y-6'>
        {/* HEADER */}
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>My Appointments</h1>
          <p className='text-gray-500 mt-1'>Review and manage appointment requests.</p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{appointments.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Requested</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">{pending}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{confirmed}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Cancelled</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {appointments.filter(a => a.status === "CANCELLED").length}
            </p>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg border border-red-200">
            {error}
          </div>
        )}
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
              {f === "All" ? "All" : statusLabels[f] || f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center text-gray-400 text-sm py-16">
              Loading appointments...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-16">
              No appointments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-100">
                    <th className="px-6 py-4">Id</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(appt => (
                    <tr key={appt.id} className="border-t border-gray-50 hover:bg-orange-50 transition">
                      <td className="px-6 py-4 text-gray-400 text-sm">#{appt.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-orange-400" />
                          <span className="text-sm text-gray-700">{appt.patientEmail}</span>
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
                      <td className="px-6 py-4">
                        {appt.status === "REQUESTED" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatus(appt.id, "APPROVED")}
                              disabled={updatingId === appt.id}
                              className="flex items-center gap-1 text-xs text-green-600 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition disabled:opacity-50"
                            >
                              <Check size={12} />
                              {updatingId === appt.id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleStatus(appt.id, "CANCELLED")}
                              disabled={updatingId === appt.id}
                              className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                            >
                              <X size={12} />
                              {updatingId === appt.id ? "..." : "Cancel"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};
