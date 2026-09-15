import { tourAxios } from "./axiosConfig";

const pathId = encodeURIComponent;

export function createTour(data) {
  return tourAxios.post("/tours", data);
}
export function getGuideTours(guideId, config) {
  return tourAxios.get("/tours/guide/" + pathId(guideId), config);
}
export function getTourForTourist(tourId, touristId, config) {
  return tourAxios.get("/tours/" + pathId(tourId) + "/tourist/" + pathId(touristId), config);
}
export function publishTour(tourId, data) {
  return tourAxios.post("/tours/" + pathId(tourId) + "/publish", data);
}
export function archiveTour(tourId, data) {
  return tourAxios.post("/tours/" + pathId(tourId) + "/archive", data);
}
export function getPublishedTours(touristId, config) {
  return tourAxios.get("/tours/published", { ...config, params: { touristId } });
}
export function addKeyPoint(tourId, data) {
  return tourAxios.post("/tours/" + pathId(tourId) + "/key-points", data);
}
export function savePosition(data) {
  return tourAxios.post("/positions", data);
}
export function getPosition(touristId, config) {
  return tourAxios.get("/positions/" + pathId(touristId), config);
}
export function addToCart(data) {
  return tourAxios.post("/cart/add", data);
}
export function removeFromCart(data) {
  return tourAxios.post("/cart/remove", data);
}
export function getCart(touristId, config) {
  return tourAxios.get("/cart/" + pathId(touristId), config);
}
export function checkoutCart(data) {
  return tourAxios.post("/cart/checkout", data);
}
export function startExecution(data, config) {
  return tourAxios.post("/executions/start", data, config);
}
export function abandonExecution(touristId, tourId, config) {
  return tourAxios.post("/executions/" + pathId(touristId) + "/" + pathId(tourId) + "/abandon", undefined, config);
}
export function completeExecution(touristId, tourId, config) {
  return tourAxios.post("/executions/" + pathId(touristId) + "/" + pathId(tourId) + "/complete", undefined, config);
}
export function updateExecutionLocation(data, config) {
  return tourAxios.post("/executions/location-update", data, config);
}