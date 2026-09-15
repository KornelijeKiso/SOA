const TOKEN_KEY = "token";
const PROFILE_KEY = "profile";

export function saveToken(token) {
  if (typeof token !== "string" || !token.trim()) throw new Error("Missing login token.");
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token && token !== "undefined" && token !== "null" ? token : null;
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

export function getUserId() {
  const email = getProfile()?.email;
  return typeof email === "string" ? email : "";
}

export function getRole() {
  return getProfile()?.role;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken() && getUserId() && ["GUIDE", "TOURIST"].includes(getRole()));
}

export function homePath() {
  return isLoggedIn() ? (getRole() === "GUIDE" ? "/tours" : "/tours/published") : "/login";
}