const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const crate = path.resolve(__dirname, "rust");

module.exports = {
    configureWebpack: {
        plugins: [
            new WasmPackPlugin({
                crateDirectory: crate,
                outName: "wasm",
            })
        ]
    }
}