/* global BROWSER */

import { RouterBuilder, RoutesTranslations } from 'limosa';

export { RouterBuilder } from 'limosa';

export default function alpLimosa(routerBuilder, controllers) {
  if (!(typeof routerBuilder === 'function')) {
    throw new TypeError('Value of argument "routerBuilder" violates contract.\n\nExpected:\nFunction\n\nGot:\n' + _inspect(routerBuilder));
  }

  if (!(controllers instanceof Map)) {
    throw new TypeError('Value of argument "controllers" violates contract.\n\nExpected:\nMap\n\nGot:\n' + _inspect(controllers));
  }

  return app => {
    var config = app.config;
    var routeTranslationsConfig = config.get('routeTranslations');

    if (!(routeTranslationsConfig instanceof Map)) {
      throw new TypeError('Value of variable "routeTranslationsConfig" violates contract.\n\nExpected:\nMap\n\nGot:\n' + _inspect(routeTranslationsConfig));
    }

    var routeTranslations = new RoutesTranslations(routeTranslationsConfig);
    var builder = new RouterBuilder(routeTranslations, config.get('availableLanguages'));
    routerBuilder(builder);
    var router = app.router = builder.router;

    app.context.urlGenerator = function () {
      // eslint-disable-next-line prefer-rest-params
      return router.urlGenerator(this.language, ...arguments);
    };

    app.context.redirectTo = function (to, params) {
      if (!(typeof to === 'string')) {
        throw new TypeError('Value of argument "to" violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(to));
      }

      if (!(params == null || params instanceof Object)) {
        throw new TypeError('Value of argument "params" violates contract.\n\nExpected:\n?Object\n\nGot:\n' + _inspect(params));
      }

      // eslint-disable-next-line prefer-rest-params
      return this.redirect(router.urlGenerator(this.language, to, params));
    };

    app.controllers = controllers;

    /**
     *
     * @param {string} controllerName
     * @param {string} [actionName]
     * @returns {*}
     */
    app.context.callAction = function (controllerName, actionName) {
      if (!(typeof controllerName === 'string')) {
        throw new TypeError('Value of argument "controllerName" violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(controllerName));
      }

      if (!(actionName == null || typeof actionName === 'string')) {
        throw new TypeError('Value of argument "actionName" violates contract.\n\nExpected:\n?string\n\nGot:\n' + _inspect(actionName));
      }

      var route = this.route;

      if (!actionName) {
        actionName = controllerName;
        controllerName = route.controller;
      }

      var controller = controllers.get(controllerName);
      if (!controller) {
        this.status = 404;
        throw new Error(`Controller not found: ${ controllerName }`);
      }

      var action = controller[actionName];
      if (!action /* || !action.isAction*/) {
          this.status = 404;
          throw new Error(`Action not found: ${ route.controller }.${ route.action }`);
        }

      try {
        return Promise.resolve(controller[actionName].call(null, this));
      } catch (err) {
        return Promise.reject(err);
      }
    };

    return ctx => {
      var route = router.find(ctx.path, ctx.language);

      if (!route) {
        ctx.status = 404;
        throw new Error(`Route not found: ${ ctx.path }`);
      }

      ctx.route = route;

      return ctx.callAction(route.controller, route.action);
    };
  };
}

function _inspect(input, depth) {
  var maxDepth = 4;
  var maxKeys = 15;

  if (depth === undefined) {
    depth = 0;
  }

  depth += 1;

  if (input === null) {
    return 'null';
  } else if (input === undefined) {
    return 'void';
  } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return typeof input;
  } else if (Array.isArray(input)) {
    if (input.length > 0) {
      var _ret = function () {
        if (depth > maxDepth) return {
            v: '[...]'
          };

        var first = _inspect(input[0], depth);

        if (input.every(item => _inspect(item, depth) === first)) {
          return {
            v: first.trim() + '[]'
          };
        } else {
          return {
            v: '[' + input.slice(0, maxKeys).map(item => _inspect(item, depth)).join(', ') + (input.length >= maxKeys ? ', ...' : '') + ']'
          };
        }
      }();

      if (typeof _ret === "object") return _ret.v;
    } else {
      return 'Array';
    }
  } else {
    var keys = Object.keys(input);

    if (!keys.length) {
      if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
        return input.constructor.name;
      } else {
        return 'Object';
      }
    }

    if (depth > maxDepth) return '{...}';
    var indent = '  '.repeat(depth - 1);
    var entries = keys.slice(0, maxKeys).map(key => {
      return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key], depth) + ';';
    }).join('\n  ' + indent);

    if (keys.length >= maxKeys) {
      entries += '\n  ' + indent + '...';
    }

    if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
      return input.constructor.name + ' {\n  ' + indent + entries + '\n' + indent + '}';
    } else {
      return '{\n  ' + indent + entries + '\n' + indent + '}';
    }
  }
}
//# sourceMappingURL=index.js.map