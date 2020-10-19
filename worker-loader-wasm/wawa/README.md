# wawa

This sample demonstrates an error I'm seeing in webpack.

`npm run serve` fails with this strange error:
```
% npm run serve

> wawa@0.1.0 serve /Users/jeff/gitrepos/surferjeff.github.io/worker-loader-wasm/wawa
> vue-cli-service serve

`resolve/lib/core` is deprecated; please use `is-core-module` directly
 INFO  Starting development server...
Starting type checking service...
Using 1 worker with 2048MB memory limit
98% after emitting CopyPlugin

 ERROR  Failed to compile with 0 error
```

But it's actually serving the app at port 8080.  When I visit it,
I see this error in the console:

```
TypeError: wasmExports is undefined worker.worker.js:1538:1
    wasm http://localhost:8080/js/worker.worker.js:1538
    __webpack_require__ http://localhost:8080/js/worker.worker.js:20
    <anonymous> webpack-internal:///./wasm/pkg/wawasm.js:2
    js http://localhost:8080/js/worker.worker.js:1504
    __webpack_require__ http://localhost:8080/js/worker.worker.js:20
    <anonymous> webpack-internal:///./node_modules/cache-loader/dist/cjs.js?!./node_modules/babel-loader/lib/index.js!./node_modules/ts-loader/index.js?!./node_modules/eslint-loader/index.js?!./src/worker.ts:2
    ts http://localhost:8080/js/worker.worker.js:124
    __webpack_require__ http://localhost:8080/js/worker.worker.js:20
    <anonymous> http://localhost:8080/js/worker.worker.js:87
    <anonymous> http://localhost:8080/js/worker.worker.js:90
```

I run this app with the vue command line utility, which invokes webpack
on a generated file.  I copied the generated file to [generated.webpack.config.js](.generated.webpack.config.js) so non-vue
users can easily inspect it.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```