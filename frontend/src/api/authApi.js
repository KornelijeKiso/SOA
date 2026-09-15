import { authAxios } from "./axiosConfig";

export async function registerUser(data) {
  return authAxios.post("/auth/register", data);
}

export async function loginUser(data) {
  return authAxios.post("/auth/login", data);
}

export async function getMyProfile() {
  return authAxios.get("/profile/me");
}

export async function updateMyProfile(data) {
  return authAxios.put("/profile/me", data);
}