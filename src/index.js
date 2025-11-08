const buildTrie = (routes) => {
  const root = {};

  for (const { path, handler, method = 'GET' } of routes) {
    const segments = path.split('/').filter(Boolean);
    let node = root;

    for (const segment of segments) {
      const key = segment.startsWith(':') ? '__param__' : segment;
      node[key] = node[key] || {};
      node = node[key];

      if (segment.startsWith(':')) {
        node.__paramName__ = segment.slice(1);
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
        params[node.__paramName__] = segment;
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
