export const ROUTES = {
  dashboard: "/dashboard",
  products: "/dashboard/products",
  addProduct: "/dashboard/products/add",
  editProduct: (id: string) => `/dashboard/products/edit/${id}`,
  orders: "/dashboard/orders",
  cart: "/dashboard/cart",
  favorites: "/dashboard/favorites",
  messages: "/dashboard/messages",
  settings: "/dashboard/settings",
  login: "/login",
  register: "/register",
  home: "/",
};
