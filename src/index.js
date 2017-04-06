import { RouterBuilder, RoutesTranslations } from 'limosa';

export { RouterBuilder } from 'limosa';

type AppType = any;
type ActionType = (ctx: Object) => void | Promise<void>;
type ControllerType = { [string]: ActionType };
type ControllersType = Map<string, ControllerType>;
type RouterBuilderType = (builder: RouterBuilder) => void;
type ReturnType = (app: AppType) => (ctx: Object) => Promise<void>;
type RouteTranslationsConfigType = Map<string, Map<string, string>>;

export default function alpLimosa(
  routerBuilder: RouterBuilderType,
  controllers: ControllersType
): ReturnType {
  return (app: AppType) => {
    const config = app.config;
    const routeTranslationsConfig: RouteTranslationsConfigType = config.get('routeTranslations');
    const routeTranslations = new RoutesTranslations(routeTranslationsConfig);
    const builder = new RouterBuilder(routeTranslations, config.get('availableLanguages'));
    routerBuilder(builder);
    const router = builder.router;

    app.router = router;

    app.context.urlGenerator = function (...args: Array<string | number>): string {
      return router.urlGenerator(this.language, ...args);
    };

    app.context.redirectTo = function (to: string, params: ?{ [string]: string | number }): any {
      return this.redirect(router.urlGenerator(this.language, to, params));
    };

    app.controllers = controllers;

    if (!BROWSER) {
      app.registerBrowserContextTransformer((initialBrowserContext, ctx) => (
        initialBrowserContext.route = ctx.route
      ));
    }

    /**
     *
     * @param {string} controllerName
     * @param {string} [actionName]
     * @returns {*}
     */
    app.context.callAction = function (controllerName: string, actionName: ?string): Promise<void> {
      const route = this.route;

      if (!actionName) {
        actionName = controllerName;
        controllerName = route.controller;
      }

      const controller = controllers.get(controllerName);
      if (!controller) {
        this.status = 404;
        throw new Error(`Controller not found: ${controllerName}`);
      }

      const action = controller[actionName];
      if (!action/* || !action.isAction*/) {
        this.status = 404;
        throw new Error(`Action not found: ${route.controller}.${route.action}`);
      }

      try {
        return Promise.resolve(controller[actionName].call(null, this));
      } catch (err) {
        return Promise.reject(err);
      }
    };

    return (ctx: Object) => {
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
