import apiClient from "../api/apiClient";

export const getAllUsers = async () => {
    const response = await apiClient.get("/admin/users");
    return response.data;
};

export const updateUser = async (userId, data) => {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
};