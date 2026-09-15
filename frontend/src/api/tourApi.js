import { tourAxios } from "./axiosConfig";

export async function createTour(data) {
  return tourAxios.post("/tours", data);
}

export async function getGuideTours(guideId) {
  return tourAxios.get(`/tours/guide/${guideId}`);
}

export async function getTourForTourist(tourId, touristId) {
  return tourAxios.get(`/tours/${tourId}/tourist/${touristId}`);
}

export async function addKeyPoint(tourId, data) {
  return tourAxios.post(`/tours/${tourId}/key-points`, data);
}

export async function savePosition(data) {
  return tourAxios.post("/positions", data);
}

export async function getPosition(touristId) {
  return tourAxios.get(`/positions/${touristId}`);
}

export async function addToCart(data) {
  return tourAxios.post("/cart/add", data);
}

export async function getCart(touristId) {
  return tourAxios.get(`/cart/${touristId}`);
}

export async function checkoutCart(data) {
  return tourAxios.post("/cart/checkout", data);
}

export async function startExecution(data) {
  return tourAxios.post("/executions/start", data);
}

export async function abandonExecution(touristId, tourId) {
  return tourAxios.post(`/executions/${touristId}/${tourId}/abandon`);
}

export async function completeExecution(touristId, tourId) {
  return tourAxios.post(`/executions/${touristId}/${tourId}/complete`);
}

export async function updateExecutionLocation(data) {
  return tourAxios.post("/executions/location-update", data);
}