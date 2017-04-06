import { RouterBuilder, RoutesTranslations } from 'limosa';

import t from 'flow-runtime';
export { RouterBuilder } from 'limosa';

var AppType = t.type('AppType', t.any());
var ActionType = t.type('ActionType', t.function(t.param('ctx', t.object()), t.return(t.union(t.void(), t.ref('Promise', t.void())))));
var ControllerType = t.type('ControllerType', t.object(t.indexer('key', t.string(), ActionType)));
var ControllersType = t.type('ControllersType', t.ref('Map', t.string(), ControllerType));
var RouterBuilderType = t.type('RouterBuilderType', t.function(t.param('builder', t.ref(RouterBuilder)), t.return(t.void())));
var ReturnType = t.type('ReturnType', t.function(t.param('app', AppType), t.return(t.function(t.param('ctx', t.object()), t.return(t.ref('Promise', t.void()))))));
var RouteTranslationsConfigType = t.type('RouteTranslationsConfigType', t.ref('Map', t.string(), t.ref('Map', t.string(), t.string())));


export default function alpLimosa(routerBuilder, controllers) {
  var _returnType = t.return(ReturnType);

  t.param('routerBuilder', RouterBuilderType).assert(routerBuilder);
  t.param('controllers', ControllersType).assert(controllers);

  return _returnType.assert(function (app) {
    t.param('app', AppType).assert(app);

    var config = app.config;
    var routeTranslationsConfig = RouteTranslationsConfigType.assert(config.get('routeTranslations'));
    var routeTranslations = new RoutesTranslations(routeTranslationsConfig);
    var builder = new RouterBuilder(routeTranslations, config.get('availableLanguages'));
    routerBuilder(builder);
    var router = builder.router;

    app.router = router;

    app.context.urlGenerator = function () {
      var _argsType = t.array(t.union(t.string(), t.number()));

      var _returnType2 = t.return(t.string());

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      t.rest('args', _argsType).assert(args);

      return _returnType2.assert(router.urlGenerator.apply(router, [this.language].concat(args)));
    };

    app.context.redirectTo = function (to, params) {
      var _toType = t.string();

      var _paramsType = t.nullable(t.object(t.indexer('key', t.string(), t.union(t.string(), t.number()))));

      var _returnType3 = t.return(t.any());

      t.param('to', _toType).assert(to);
      t.param('params', _paramsType).assert(params);

      return _returnType3.assert(this.redirect(router.urlGenerator(this.language, to, params)));
    };

    app.controllers = controllers;

    /**
     *
     * @param {string} controllerName
     * @param {string} [actionName]
     * @returns {*}
     */
    app.context.callAction = function (controllerName, actionName) {
      var _controllerNameType = t.string();

      var _actionNameType = t.nullable(t.string());

      var _returnType4 = t.return(t.void());

      t.param('controllerName', _controllerNameType).assert(controllerName);
      t.param('actionName', _actionNameType).assert(actionName);

      var route = this.route;

      if (!actionName) {
        actionName = _actionNameType.assert(controllerName);
        controllerName = _controllerNameType.assert(route.controller);
      }

      var controller = controllers.get(controllerName);
      if (!controller) {
        this.status = 404;
        throw new Error('Controller not found: ' + controllerName);
      }

      var action = controller[actionName];
      if (!action /* || !action.isAction*/) {
          this.status = 404;
          throw new Error('Action not found: ' + route.controller + '.' + route.action);
        }

      try {
        return Promise.resolve(controller[actionName].call(null, this)).then(function (_arg) {
          return _returnType4.assert(_arg);
        });
      } catch (err) {
        return Promise.reject(err).then(function (_arg2) {
          return _returnType4.assert(_arg2);
        });
      }
    };

    return function (ctx) {
      var _ctxType = t.object();

      t.param('ctx', _ctxType).assert(ctx);

      var route = router.find(ctx.path, ctx.language);

      if (!route) {
        ctx.status = 404;
        throw new Error('Route not found: ' + ctx.path);
      }

      ctx.route = route;

      return ctx.callAction(route.controller, route.action);
    };
  });
}
//# sourceMappingURL=index.js.map