export default (routes) => ({
  serve(path) {
    const route = routes.find(r => r.path === path);
    if (!route) {
      throw new Error(`Route not found: ${path}`);
    }
    return route.handler;
  }
});
