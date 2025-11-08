export default (routes) => ({
  serve(path) {
    for (const route of routes) {
      const paramNames = [];
      const regexStr = route.path.replace(/:([\w]+)/g, (_, name) => {
        paramNames.push(name);
        return '(\\w+)';
      });
      const regex = new RegExp(`^${regexStr}$`);

      const match = path.match(regex);
      if (match) {
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });

        return {
          path,
          handler: route.handler,
          params
        };
      }
    }

    throw new Error(`Route not found: ${path}`);
  }
});
