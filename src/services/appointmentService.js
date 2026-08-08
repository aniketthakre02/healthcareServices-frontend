import apiClient from "../api/apiClient";

// Re-export getAllDoctors for backward compatibility but primary source is AllDoctorsService
export const getAllDoctors = async () => {
    const response = await apiClient.get("/patient/allDoctors");
    return response.data;
};

export const bookAppointment = async (formData) => {
    // Backend expects: doctorId, dateTime, reason (doctorName is ignored but we strip it)
    const payload = {
        doctorId: formData.doctorId,
        dateTime: formData.dateTime,
        reason: formData.reason,
    };
    const response = await apiClient.post("/appointments/BookAppointment", payload);
    return response.data;
};

export const getMyAppointments = async () => {
    const response = await apiClient.get("/patient/appointments");
    return response.data;
};
