import { Navbar } from '../../Components/layout/Navbar';
import { Sidebar } from '../../Components/layout/Sidebar';
import { useState, useMemo } from 'react';
import { appointmentHistory } from '../../utility/data/appointmentHistory';
import { FileText, Download } from 'lucide-react';

const statusOptions = ["All", "Completed", "Cancelled"];
const specializationOptions = ["All", ...new Set(appointmentHistory.map(a => a.specialization))];

export const Reports = () => {
    const [search, setSearch]       = useState("");
    const [status, setStatus]       = useState("All");
    const [spec, setSpec]           = useState("All");
    const [fromDate, setFromDate]   = useState("");
    const [toDate, setToDate]       = useState("");

    // derived filtered data — useMemo so it only recomputes when filters change
    const filtered = useMemo(() => {
        return appointmentHistory.filter(a => {
            const matchesSearch = a.patient.toLowerCase().includes(search.toLowerCase()) ||
                                  a.doctor.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = status === "All" || a.status === status;
            const matchesSpec   = spec === "All" || a.specialization === spec;
            const matchesFrom   = !fromDate || a.date >= fromDate;
            const matchesTo     = !toDate   || a.date <= toDate;
            return matchesSearch && matchesStatus && matchesSpec && matchesFrom && matchesTo;
        });
    }, [search, status, spec, fromDate, toDate]);

    // summary stats derived from filtered data
    const total     = filtered.length;
    const completed = filtered.filter(a => a.status === "Completed").length;
    const cancelled = filtered.filter(a => a.status === "Cancelled").length;

    const handleExport = () => {
        const headers = ["ID", "Patient", "Doctor", "Specialization", "Date", "Reason", "Status"];
        const rows = filtered.map(a =>
            [a.id, a.patient, a.doctor, a.specialization, a.date, a.reason, a.status].join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "appointment_report.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-50 to-white">
            <Navbar />
            <Sidebar />

            <div className="ml-64 p-8 space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                        <p className="text-gray-500 mt-1">View and export appointment history.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-sm text-gray-400">Total Appointments</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{total}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-sm text-gray-400">Completed</p>
                        <p className="text-3xl font-bold text-green-500 mt-1">{completed}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-sm text-gray-400">Cancelled</p>
                        <p className="text-3xl font-bold text-red-400 mt-1">{cancelled}</p>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-wrap gap-3 items-center">

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search patient or doctor..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:border-orange-400"
                        />

                        {/* Status filter */}
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                        >
                            {statusOptions.map(s => <option key={s}>{s}</option>)}
                        </select>

                        {/* Specialization filter */}
                        <select
                            value={spec}
                            onChange={e => setSpec(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                        >
                            {specializationOptions.map(s => <option key={s}>{s}</option>)}
                        </select>

                        {/* Date range */}
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                        />
                        <span className="text-gray-400 text-sm">to</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                        />

                        {/* Clear filters */}
                        {(search || status !== "All" || spec !== "All" || fromDate || toDate) && (
                            <button
                                onClick={() => {
                                    setSearch(""); setStatus("All");
                                    setSpec("All"); setFromDate(""); setToDate("");
                                }}
                                className="text-sm text-orange-500 hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-400 text-sm border-b border-gray-100">
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Doctor</th>
                                <th className="px-6 py-4">Specialization</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-gray-400 py-12">
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id} className="border-t border-gray-50 hover:bg-orange-50 transition">
                                        <td className="px-6 py-4 text-gray-400 text-sm">{item.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{item.patient}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.doctor}</td>
                                        <td className="px-6 py-4 text-gray-500">{item.specialization}</td>
                                        <td className="px-6 py-4 text-gray-500">{item.date}</td>
                                        <td className="px-6 py-4 text-gray-500">{item.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                ${item.status === "Completed" && "bg-green-100 text-green-600"}
                                                ${item.status === "Cancelled" && "bg-red-100 text-red-500"}
                                            `}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};