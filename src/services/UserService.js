import apiClient from "../api/apiClient";

export const getMyProfile = async () => {
    const response = await apiClient.get("/patient/myProfile");
    return response.data;
};

export const updateMyProfile = async (data) => {
    const response = await apiClient.put("/patient/updateMyProfile", data);
    return response.data;
};

export const getMyAppointments = async () => {
    const response = await apiClient.get("/patient/appointments");
    return response.data;
};