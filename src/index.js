const buildTrie = (routes) => {
  const root = {};

  for (const { path, handler, method = 'GET', constraints = {} } of routes) {
    const segments = path.split('/').filter(Boolean);
    let node = root;

    for (const segment of segments) {
      const isParam = segment.startsWith(':');
      const key = isParam ? '__param__' : segment;

      node[key] = node[key] || {};
      node = node[key];

      if (isParam) {
        const paramName = segment.slice(1);
        node.__paramName__ = paramName;

        if (constraints[paramName]) {
          node.__constraint__ = new RegExp(`^${constraints[paramName]}$`);
        }
      }
    }

    node.handlers = node.handlers || {};
    node.handlers[method.toUpperCase()] = handler;
  }

  return root;
};

export default (routes) => {
  const trie = buildTrie(routes);

  const serve = ({ path, method = 'GET' }) => {
    const segments = path.split('/').filter(Boolean);
    let node = trie;
    const params = {};

    for (const segment of segments) {
      if (node[segment]) {
        node = node[segment];
      } else if (node.__param__) {
        node = node.__param__;
        const paramName = node.__paramName__;

        if (node.__constraint__ && !node.__constraint__.test(segment)) {
          throw new Error(`Constraint failed for param ${paramName}: "${segment}"`);
        }

        params[paramName] = segment;
      } else {
        throw new Error(`Route not found: ${path}`);
      }
    }

    const handler = node.handlers?.[method.toUpperCase()];
    if (!handler) {
      throw new Error(`Route not found for ${method} ${path}`);
    }

    return { path, method: method.toUpperCase(), handler, params };
  };

  return { serve };
};
