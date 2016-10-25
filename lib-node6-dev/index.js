'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouterBuilder = undefined;

var _limosa = require('limosa');

Object.defineProperty(exports, 'RouterBuilder', {
  enumerable: true,
  get: function get() {
    return _limosa.RouterBuilder;
  }
});
exports.default = alpLimosa;

var _tcombForked = require('tcomb-forked');

var _tcombForked2 = _interopRequireDefault(_tcombForked);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function alpLimosa(routerBuilder, controllers) {
  _assert(routerBuilder, _tcombForked2.default.Function, 'routerBuilder');

  _assert(controllers, Map, 'controllers');

  return app => {
    const config = app.config;
    const routeTranslationsConfig = _assert(config.get('routeTranslations'), Map, 'routeTranslationsConfig');
    const routeTranslations = new _limosa.RoutesTranslations(routeTranslationsConfig);
    const builder = new _limosa.RouterBuilder(routeTranslations, config.get('availableLanguages'));
    routerBuilder(builder);
    const router = app.router = builder.router;

    app.context.urlGenerator = function () {
      // eslint-disable-next-line prefer-rest-params
      return router.urlGenerator(this.language, ...arguments);
    };

    app.context.redirectTo = function (to, params) {
      _assert(to, _tcombForked2.default.String, 'to');

      _assert(params, _tcombForked2.default.maybe(_tcombForked2.default.Object), 'params');

      // eslint-disable-next-line prefer-rest-params
      return this.redirect(router.urlGenerator(this.language, to, params));
    };

    app.controllers = controllers;

    app.registerBrowserContextTransformer((initialBrowserContext, ctx) => initialBrowserContext.route = ctx.route);

    /**
     *
     * @param {string} controllerName
     * @param {string} [actionName]
     * @returns {*}
     */
    app.context.callAction = function (controllerName, actionName) {
      _assert(controllerName, _tcombForked2.default.String, 'controllerName');

      _assert(actionName, _tcombForked2.default.maybe(_tcombForked2.default.String), 'actionName');

      const route = this.route;

      if (!actionName) {
        actionName = controllerName;
        controllerName = route.controller;
      }

      const controller = controllers.get(controllerName);
      if (!controller) {
        this.status = 404;
        throw new Error(`Controller not found: ${ controllerName }`);
      }

      const action = controller[actionName];
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
      let route = router.find(ctx.path, ctx.language);

      if (!route) {
        ctx.status = 404;
        throw new Error(`Route not found: ${ ctx.path }`);
      }

      ctx.route = route;

      return ctx.callAction(route.controller, route.action);
    };
  };
}

function _assert(x, type, name) {
  function message() {
    return 'Invalid value ' + _tcombForked2.default.stringify(x) + ' supplied to ' + name + ' (expected a ' + _tcombForked2.default.getTypeName(type) + ')';
  }

  if (_tcombForked2.default.isType(type)) {
    if (!type.is(x)) {
      type(x, [name + ': ' + _tcombForked2.default.getTypeName(type)]);

      _tcombForked2.default.fail(message());
    }
  } else if (!(x instanceof type)) {
    _tcombForked2.default.fail(message());
  }

  return x;
}
//# sourceMappingURL=index.js.map