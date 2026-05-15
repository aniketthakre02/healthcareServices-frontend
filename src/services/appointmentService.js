import apiClient from "../api/apiClient";

//Getting all doctors for dropdown

export const getAllDoctors=async ()=>{
    const response=await apiClient.get("/patient/allDoctors");
    return response.data;
}

export const bookAppointment=async(formData)=>{
    const response= await apiClient.post("/appointments/BookAppointment",formData)
    return response.data;
}

export const getMyAppointments = async () => {
    const response = await apiClient.get("/patient/appointments");
    return response.data;
};