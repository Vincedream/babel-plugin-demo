module.exports = function(babel) {
    var t = babel.types;
    return {
      visitor: {
        ArrayExpression: function(path, state) {
            path.replaceWith(
              t.callExpression(
                t.memberExpression(t.identifier(state.opts.name), t.identifier('init')),
                path.node.elements
              )
            );
        }
      }
    };
  };