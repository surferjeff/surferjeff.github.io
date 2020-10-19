import * as wasm from './wawasm_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
/**
*/
export class Hoagie {

    static __wrap(ptr) {
        const obj = Object.create(Hoagie.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_hoagie_free(ptr);
    }
    /**
    * @returns {number}
    */
    get weight() {
        var ret = wasm.__wbg_get_hoagie_weight(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set weight(arg0) {
        wasm.__wbg_set_hoagie_weight(this.ptr, arg0);
    }
    /**
    * @param {number} weight
    */
    constructor(weight) {
        var ret = wasm.hoagie_new(weight);
        return Hoagie.__wrap(ret);
    }
}

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

