import { blogAxios } from "./axiosConfig";

export async function getAllBlogs() {
  return blogAxios.get("/blogs");
}

export async function getBlogById(blogId) {
  return blogAxios.get(`/blogs/${blogId}`);
}

export async function getBlogsByUser(userId) {
  return blogAxios.get(`/users/${userId}/blogs`);
}

export async function createBlog(data) {
  return blogAxios.post("/blogs", data);
}

export async function getBlogComments(blogId) {
  return blogAxios.get(`/blogs/${blogId}/comments`);
}

export async function addBlogComment(blogId, data) {
  return blogAxios.post(`/blogs/${blogId}/comments`, data);
}

export async function followUser(data) {
  return blogAxios.post("/follow", data);
}

export async function unfollowUser(data) {
  return blogAxios.delete("/follow", { data });
}

export async function getFollowing(userId) {
  return blogAxios.get(`/users/${userId}/following`);
}

export async function getFollowers(userId) {
  return blogAxios.get(`/users/${userId}/followers`);
}