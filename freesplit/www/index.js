var Elm = require('./Main.elm').Elm;

var app = Elm.Main.init({
  node: document.getElementById('main')
});

import * as wasm from "freesplit";

wasm.greet("jeff");
