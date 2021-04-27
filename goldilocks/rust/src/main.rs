fn main() {
    let mut url = Url {
        protocol: "http".into(),
        host_name: "www.google.com".into(),
        port: None,
        path: String::new()
    };
    url.incr_port();
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