fn main() {
    println!("Hello, world!");
}

struct Url {
    protocol: String,
    host_name: String,
    port: Option<u16>,
    path: String
}

impl Url {
    fn incr_port(&mut self) {
        if let Some(mut port_number) = self.port {
            port_number += 1;
        }
    }
}

struct ComponentSymbols {}
trait PropertySymbol {}

// fn IsParameter(symbols: &ComponentSymbols, property: &dyn PropertySymbol) -> bool {
//     property.attributes.any(|a| {a.class == symbols.parameter})
// }

