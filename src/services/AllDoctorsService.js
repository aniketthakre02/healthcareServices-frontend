import apiClient from "../api/apiClient";

// Centralized doctors fetching - used by Doctors page
// Uses /patient/allDoctors which requires PATIENT role on backend
// For multi-role support, backend should allow ADMIN/DOCTOR too, but we keep fallback
export const getAllDoctors = async () => {
    const response = await apiClient.get("/patient/allDoctors");
    return response.data;
};
