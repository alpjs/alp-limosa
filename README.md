# alp-limosa

```js
import Koa from 'koa';
import config from 'auk-config';
import language from 'auk-language';
import router from 'auk-limosa';
import routerBuilder from './routerBuilder';

const controllers = new Map();
// controllers.set('site', SiteController);

const app = new Koa();
config(__dirname + '/config')(app);
language(app);
const handler = router(routerBuilder, controllers)(app);

// app.use(serve(__dirname + '../public/')); // static files
app.use(handler);
```
