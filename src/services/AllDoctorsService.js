import apiClient from "../api/apiClient";

export const getAllDoctors=async()=>{
    const response=await apiClient.get("/patient/allDoctors");
    return response.data;
}
