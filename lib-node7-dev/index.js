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

const AppType = _flowRuntime2.default.type('AppType', _flowRuntime2.default.any());

const ActionType = _flowRuntime2.default.type('ActionType', _flowRuntime2.default.function(_flowRuntime2.default.param('ctx', _flowRuntime2.default.object()), _flowRuntime2.default.return(_flowRuntime2.default.union(_flowRuntime2.default.void(), _flowRuntime2.default.ref('Promise', _flowRuntime2.default.void())))));

const ControllerType = _flowRuntime2.default.type('ControllerType', _flowRuntime2.default.object(_flowRuntime2.default.indexer('key', _flowRuntime2.default.string(), ActionType)));

const ControllersType = _flowRuntime2.default.type('ControllersType', _flowRuntime2.default.ref('Map', _flowRuntime2.default.string(), ControllerType));

const RouterBuilderType = _flowRuntime2.default.type('RouterBuilderType', _flowRuntime2.default.function(_flowRuntime2.default.param('builder', _flowRuntime2.default.ref(_limosa.RouterBuilder)), _flowRuntime2.default.return(_flowRuntime2.default.void())));

const ReturnType = _flowRuntime2.default.type('ReturnType', _flowRuntime2.default.function(_flowRuntime2.default.param('app', AppType), _flowRuntime2.default.return(_flowRuntime2.default.function(_flowRuntime2.default.param('ctx', _flowRuntime2.default.object()), _flowRuntime2.default.return(_flowRuntime2.default.ref('Promise', _flowRuntime2.default.void()))))));

const RouteTranslationsConfigType = _flowRuntime2.default.type('RouteTranslationsConfigType', _flowRuntime2.default.ref('Map', _flowRuntime2.default.string(), _flowRuntime2.default.ref('Map', _flowRuntime2.default.string(), _flowRuntime2.default.string())));

const UrlGeneratorParamsType = _flowRuntime2.default.type('UrlGeneratorParamsType', _flowRuntime2.default.object(_flowRuntime2.default.property('extension', _flowRuntime2.default.nullable(_flowRuntime2.default.string())), _flowRuntime2.default.property('queryString', _flowRuntime2.default.nullable(_flowRuntime2.default.string())), _flowRuntime2.default.property('hash', _flowRuntime2.default.nullable(_flowRuntime2.default.string())), _flowRuntime2.default.indexer('key', _flowRuntime2.default.string(), _flowRuntime2.default.union(_flowRuntime2.default.string(), _flowRuntime2.default.number()))));

function alpLimosa(routerBuilder, controllers) {
  const _returnType = _flowRuntime2.default.return(ReturnType);

  _flowRuntime2.default.param('routerBuilder', RouterBuilderType).assert(routerBuilder);

  _flowRuntime2.default.param('controllers', ControllersType).assert(controllers);

  return _returnType.assert(app => {
    _flowRuntime2.default.param('app', AppType).assert(app);

    const config = app.config;
    const routeTranslationsConfig = RouteTranslationsConfigType.assert(config.get('routeTranslations'));
    const routeTranslations = new _limosa.RoutesTranslations(routeTranslationsConfig);
    const builder = new _limosa.RouterBuilder(routeTranslations, config.get('availableLanguages'));
    routerBuilder(builder);
    const router = builder.router;

    app.router = router;

    app.context.urlGenerator = function (routeKey, params) {
      let _routeKeyType = _flowRuntime2.default.string();

      let _paramsType = _flowRuntime2.default.nullable(UrlGeneratorParamsType);

      const _returnType2 = _flowRuntime2.default.return(_flowRuntime2.default.string());

      _flowRuntime2.default.param('routeKey', _routeKeyType).assert(routeKey);

      _flowRuntime2.default.param('params', _paramsType).assert(params);

      return _returnType2.assert(router.urlGenerator(this.language, routeKey, params));
    };

    app.context.redirectTo = function (to, params) {
      let _toType = _flowRuntime2.default.string();

      let _paramsType2 = _flowRuntime2.default.nullable(UrlGeneratorParamsType);

      const _returnType3 = _flowRuntime2.default.return(_flowRuntime2.default.any());

      _flowRuntime2.default.param('to', _toType).assert(to);

      _flowRuntime2.default.param('params', _paramsType2).assert(params);

      return _returnType3.assert(this.redirect(router.urlGenerator(this.language, to, params)));
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

      const _returnType4 = _flowRuntime2.default.return(_flowRuntime2.default.void());

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
        return Promise.resolve(controller[actionName].call(null, this)).then(_arg => _returnType4.assert(_arg));
      } catch (err) {
        return Promise.reject(err).then(_arg2 => _returnType4.assert(_arg2));
      }
    };

    return ctx => {
      let _ctxType = _flowRuntime2.default.object();

      _flowRuntime2.default.param('ctx', _ctxType).assert(ctx);

      let route = router.find(ctx.path, ctx.language);

      if (!route) {
        ctx.status = 404;
        throw new Error(`Route not found: ${ctx.path}`);
      }

      ctx.route = route;

      return ctx.callAction(route.controller, route.action);
    };
  });
}
//# sourceMappingURL=index.js.map