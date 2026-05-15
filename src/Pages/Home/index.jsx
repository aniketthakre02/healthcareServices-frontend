import { Navbar } from "../../Components/layout/Navbar";
import heroImg from "../../assets/images/Bg_landing.png";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="w-full bg-white text-gray-900">

        {/* HERO */}
        <section className="min-h-screen flex items-center px-6 md:px-16 bg-gradient-to-r from-orange-50 to-white">
          <div className="grid md:grid-cols-2 gap-10 items-center w-full max-w-7xl mx-auto">

            {/* LEFT */}
            <div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Your Hospital Care, <br />
                <span className="text-orange-500">All in One Place</span>
              </h1>

              <p className="text-gray-600 text-lg mb-8">
                A modern healthcare management platform designed for hospitals and clinics
                to simplify patient care, appointment booking, doctor coordination,
                and medical record management — all through one secure system.
              </p>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  Register as Patient
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="border border-black text-black px-8 py-3 rounded-lg font-semibold hover:bg-black hover:text-white transition"
                >
                  Login to Portal
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex justify-center">
              <img
                src={heroImg}
                alt="Healthcare"
                className="w-full max-w-md"
              />
            </div>

          </div>
        </section>


        {/* STATS */}
        <section className="py-12 border-t border-gray-100">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 text-center gap-8">

            <div>
              <h3 className="text-3xl font-bold text-orange-500">1000+</h3>
              <p className="text-gray-600">Appointments Managed</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-orange-500">500+</h3>
              <p className="text-gray-600">Registered Patients</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-orange-500">24/7</h3>
              <p className="text-gray-600">Access to Healthcare Portal</p>
            </div>

          </div>
        </section>


        {/* FEATURES */}
        <section className="py-20 px-6 md:px-16 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">
            Hospital Management Features
          </h2>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

            <div className="bg-white p-8 rounded-xl border hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-orange-500">
                Patient Portal
              </h3>
              <p className="text-gray-600">
                Patients can register, book appointments, view medical reports,
                and manage their healthcare information securely.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-orange-500">
                Doctor Dashboard
              </h3>
              <p className="text-gray-600">
                Doctors can manage appointments, review patient details,
                and update their professional information efficiently.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-orange-500">
                Admin Management
              </h3>
              <p className="text-gray-600">
                Administrators can manage users, assign roles,
                monitor hospital operations, and maintain system control.
              </p>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-black text-center text-white px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simplify Healthcare Management for Patients and Staff
          </h2>

          <p className="mb-8 text-lg text-gray-300">
            Register today to book appointments, connect with doctors,
            and experience a smarter hospital management system.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="bg-orange-500 text-white px-10 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Create Your Account
          </button>
        </section>


        {/* FOOTER */}
        <footer className="text-center py-6 text-gray-500 text-sm border-t">
          © 2026 Healthcare Management System • Built for Modern Hospitals & Clinics
        </footer>

      </div>
    </>
  );
};