// Barrel for API services (re-exports remain stable via shims)
export { default as apiClient } from "./client";
export { authAPI } from "./authAPI";
export { productAPI } from "./productAPI";
export { cartAPI } from "./cartAPI";
export * from "./rtk/rtkAuthApi";
export * from "./rtk/baseApi";
export * from "./rtk/rtkProductsApi";
export * from "./rtk/rtkCartApi";
