'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouterBuilder = undefined;

var _limosa = require('limosa');

Object.defineProperty(exports, 'RouterBuilder', {
  enumerable: true,
  get: function () {
    return _limosa.RouterBuilder;
  }
});
exports.default = alpLimosa;

var _flowRuntime = require('flow-runtime');

var _flowRuntime2 = _interopRequireDefault(_flowRuntime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function alpLimosa(routerBuilder, controllers) {
  let _routerBuilderType = _flowRuntime2.default.function();

  let _controllersType = _flowRuntime2.default.ref('Map');

  _flowRuntime2.default.param('routerBuilder', _routerBuilderType).assert(routerBuilder);

  _flowRuntime2.default.param('controllers', _controllersType).assert(controllers);

  return app => {
    const config = app.config;
    const routeTranslationsConfig = _flowRuntime2.default.ref('Map').assert(config.get('routeTranslations'));
    const routeTranslations = new _limosa.RoutesTranslations(routeTranslationsConfig);
    const builder = new _limosa.RouterBuilder(routeTranslations, config.get('availableLanguages'));
    routerBuilder(builder);
    const router = builder.router;

    app.router = router;

    app.context.urlGenerator = function (...args) {
      return router.urlGenerator(this.language, ...args);
    };

    app.context.redirectTo = function (to, params) {
      let _toType = _flowRuntime2.default.string();

      let _paramsType = _flowRuntime2.default.nullable(_flowRuntime2.default.object());

      _flowRuntime2.default.param('to', _toType).assert(to);

      _flowRuntime2.default.param('params', _paramsType).assert(params);

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
      let _controllerNameType = _flowRuntime2.default.string();

      let _actionNameType = _flowRuntime2.default.nullable(_flowRuntime2.default.string());

      _flowRuntime2.default.param('controllerName', _controllerNameType).assert(controllerName);

      _flowRuntime2.default.param('actionName', _actionNameType).assert(actionName);

      const route = this.route;

      if (!actionName) {
        actionName = _actionNameType.assert(controllerName);
        controllerName = _controllerNameType.assert(route.controller);
      }

      const controller = controllers.get(controllerName);
      if (!controller) {
        this.status = 404;
        throw new Error(`Controller not found: ${controllerName}`);
      }

      const action = controller[actionName];
      if (!action /* || !action.isAction*/) {
          this.status = 404;
          throw new Error(`Action not found: ${route.controller}.${route.action}`);
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
        throw new Error(`Route not found: ${ctx.path}`);
      }

      ctx.route = route;

      return ctx.callAction(route.controller, route.action);
    };
  };
}
//# sourceMappingURL=index.js.map