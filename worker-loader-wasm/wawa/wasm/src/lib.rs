use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Hoagie {
    pub weight: u32
}

#[wasm_bindgen]
impl Hoagie {
    #[wasm_bindgen(constructor)]
    pub fn new(weight: u32) -> Hoagie {
        Hoagie { weight }
    }
}

