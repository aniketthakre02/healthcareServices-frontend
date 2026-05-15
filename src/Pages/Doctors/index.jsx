import { Navbar } from '../../Components/layout/Navbar';
import { Sidebar } from '../../Components/layout/Sidebar';
import { useEffect, useState } from 'react';
import { Phone, Clock, User, Stethoscope } from 'lucide-react';
import { getAllDoctors } from '../../services/AllDoctorsService';
import { useDebounce } from '../../hooks/useDebounce';

// generates consistent avatar color per doctor
const avatarColors = [
  { bg: "bg-orange-100", text: "text-orange-500" },
  { bg: "bg-blue-100", text: "text-blue-500" },
  { bg: "bg-green-100", text: "text-green-500" },
  { bg: "bg-purple-100", text: "text-purple-500" },
  { bg: "bg-pink-100", text: "text-pink-500" },
  { bg: "bg-teal-100", text: "text-teal-500" },
];

const getInitials = (name) =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

export const Doctors = () => {
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [data, setData] = useState([]);

  const debouncedSearch=useDebounce(search,300);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await getAllDoctors();
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDoctors();
  }, [])
  console.log(data);

  // unique specializations for filter
  const specializations = ["All", ...new Set(data.map(d => d.specialization))];

  const filtered = data.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.specialization.toLowerCase().includes(debouncedSearch.toLowerCase());
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
                        {/* 👇 subtle indicator that search is pending */}
                        {search !== debouncedSearch && (
                            <span className="absolute right-3 top-2.5 text-xs text-gray-300">
                                ...
                            </span>
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
                  key={doctor.id}
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
                    {doctor.introduction}
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

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-3">
                    <button className="w-full py-2 text-sm font-semibold text-orange-500 border border-orange-200 rounded-lg hover:bg-orange-50 transition">
                      Book Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};