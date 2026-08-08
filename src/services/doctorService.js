import apiClient from "../api/apiClient";

export const getDoctorProfile = async () => {
    const response = await apiClient.get("/doctor/myProfile");
    return response.data;
};

export const updateDoctorProfile = async (data) => {
    // Filter out empty age to avoid NaN issues; backend now handles Integer null
    const payload = { ...data };
    if (payload.age === "" || payload.age === null || Number.isNaN(payload.age)) {
        delete payload.age;
    }
    const response = await apiClient.put("/doctor/updateMyProfile", payload);
    return response.data;
};

export const getDoctorAppointments = async () => {
    const response = await apiClient.get("/doctor/myAppointments");
    return response.data;
};

export const updateAppointmentStatus = async (appointmentId, status) => {
    const response = await apiClient.put(
        `/doctor/appointment/${appointmentId}/status?status=${status}`
    );
    return response.data;
};
