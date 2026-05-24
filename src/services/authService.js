import apiClient from "../api/apiClient";

export const login = async (data) => {
  const response = await apiClient.post("/api/auth/login", data);
  console.log("here in login function ", response.data);
  return response.data;
};

export const register = async (data) => {
  const response = await apiClient.post("/api/auth/register", data);
  return response.data;
};

export const changePassword = async (data) => {
    const response = await apiClient.put("/api/user/change-password", data);
    return response.data;
};
