import apiClient from "../api/apiClient";

export const login = async (data) => {
  const response = await apiClient.post("/api/auth/login", data);
  return response.data;
};

export const register = async (data) => {
  const response = await apiClient.post("/api/auth/register", data);
  return response.data;
};

// Fix: backend endpoint is POST /patient/change-password (PatientController) 
// Keep backward compatible fallback to PUT /api/user/change-password if needed
export const changePassword = async (data) => {
    try {
        const response = await apiClient.post("/patient/change-password", data);
        return response.data;
    } catch (err) {
        // Fallback for legacy endpoint if patient endpoint not available
        if (err.response?.status === 404) {
            const response = await apiClient.put("/api/user/change-password", data);
            return response.data;
        }
        throw err;
    }
};
