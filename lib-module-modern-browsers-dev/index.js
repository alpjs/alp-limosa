import { RouterBuilder, RoutesTranslations } from 'limosa';

import t from 'flow-runtime';
export { RouterBuilder } from 'limosa';

const AppType = t.type('AppType', t.any());
const ActionType = t.type('ActionType', t.function(t.param('ctx', t.object()), t.return(t.union(t.void(), t.ref('Promise', t.void())))));
const ControllerType = t.type('ControllerType', t.object(t.indexer('key', t.string(), ActionType)));
const ControllersType = t.type('ControllersType', t.ref('Map', t.string(), ControllerType));
const RouterBuilderType = t.type('RouterBuilderType', t.function(t.param('builder', t.ref(RouterBuilder)), t.return(t.void())));
const ReturnType = t.type('ReturnType', t.function(t.param('app', AppType), t.return(t.function(t.param('ctx', t.object()), t.return(t.ref('Promise', t.void()))))));
const RouteTranslationsConfigType = t.type('RouteTranslationsConfigType', t.ref('Map', t.string(), t.ref('Map', t.string(), t.string())));
const UrlGeneratorParamsType = t.type('UrlGeneratorParamsType', t.object(t.property('extension', t.nullable(t.string())), t.property('queryString', t.nullable(t.string())), t.property('hash', t.nullable(t.string())), t.indexer('key', t.string(), t.union(t.string(), t.number()))));


export default function alpLimosa(routerBuilder, controllers) {
  const _returnType = t.return(ReturnType);

  t.param('routerBuilder', RouterBuilderType).assert(routerBuilder);
  t.param('controllers', ControllersType).assert(controllers);

  return _returnType.assert(function (app) {
    t.param('app', AppType).assert(app);

    const config = app.config;
    const routeTranslationsConfig = RouteTranslationsConfigType.assert(config.get('routeTranslations'));
    const routeTranslations = new RoutesTranslations(routeTranslationsConfig);
    const builder = new RouterBuilder(routeTranslations, config.get('availableLanguages'));
    routerBuilder(builder);
    const router = builder.router;

    app.router = router;

    app.context.urlGenerator = function (routeKey, params) {
      let _routeKeyType = t.string();

      let _paramsType = t.nullable(UrlGeneratorParamsType);

      const _returnType2 = t.return(t.string());

      t.param('routeKey', _routeKeyType).assert(routeKey);
      t.param('params', _paramsType).assert(params);

      return _returnType2.assert(router.urlGenerator(this.language, routeKey, params));
    };

    app.context.redirectTo = function (to, params) {
      let _toType = t.string();

      let _paramsType2 = t.nullable(UrlGeneratorParamsType);

      const _returnType3 = t.return(t.any());

      t.param('to', _toType).assert(to);
      t.param('params', _paramsType2).assert(params);

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
      let _controllerNameType = t.string();

      let _actionNameType = t.nullable(t.string());

      const _returnType4 = t.return(t.void());

      t.param('controllerName', _controllerNameType).assert(controllerName);
      t.param('actionName', _actionNameType).assert(actionName);

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
      let _ctxType = t.object();

      t.param('ctx', _ctxType).assert(ctx);

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