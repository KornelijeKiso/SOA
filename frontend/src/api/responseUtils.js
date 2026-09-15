export function asList(value) {
  return Array.isArray(value) ? value.filter((item) => item != null) : [];
}

export function commaList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function apiError(error, fallback = "Request failed.") {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  const validation = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat().filter((item) => typeof item === "string").join(" ")
    : "";
  return validation || data?.error || data?.message || data?.detail || data?.title ||
    (error?.response?.status ? fallback + " (HTTP " + error.response.status + ")" : fallback);
}

export function tourStatus(value) {
  const statuses = ["Draft", "Published", "Archived"];
  return statuses[Number(value)] ?? String(value ?? "Unknown");
}

export function difficultyName(value) {
  return ["Easy", "Medium", "Hard"][Number(value)] ?? String(value ?? "Unknown");
}

export function validPosition(value) {
  return typeof value?.latitude === "number" && Number.isFinite(value.latitude) &&
    Math.abs(value.latitude) <= 90 &&
    typeof value?.longitude === "number" && Number.isFinite(value.longitude) &&
    Math.abs(value.longitude) <= 180;
}