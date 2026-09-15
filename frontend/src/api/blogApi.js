import { blogAxios } from "./axiosConfig";
const pathId = encodeURIComponent;

export function getAllBlogs(config) {
  return blogAxios.get("/blogs", config);
}
export function getBlogById(blogId, config) {
  return blogAxios.get("/blogs/" + pathId(blogId), config);
}
export function getBlogsByUser(userId, config) {
  return blogAxios.get("/users/" + pathId(userId) + "/blogs", config);
}
export function createBlog(data) {
  return blogAxios.post("/blogs", data);
}
export function getBlogComments(blogId, config) {
  return blogAxios.get("/blogs/" + pathId(blogId) + "/comments", config);
}
export function addBlogComment(blogId, data) {
  return blogAxios.post("/blogs/" + pathId(blogId) + "/comments", data);
}
export function followUser(data) {
  return blogAxios.post("/follow", data);
}
export function unfollowUser(data) {
  return blogAxios.delete("/follow", { data });
}
export function getFollowing(userId, config) {
  return blogAxios.get("/users/" + pathId(userId) + "/following", config);
}
export function getFollowers(userId, config) {
  return blogAxios.get("/users/" + pathId(userId) + "/followers", config);
}