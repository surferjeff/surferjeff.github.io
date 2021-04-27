fn main() {
    let mut url = Url {
        protocol: "http".into(),
        host_name: "www.google.com".into(),
        port: Some(80),
        path: String::new()
    };
    println!("{:?}", url);
    url.incr_port();
    println!("{:?}", url);
}

#[derive(Eq, PartialEq, Ord, PartialOrd, Clone, Hash, Default, Debug)]
struct Url {
    protocol: String,
    host_name: String,
    port: Option<u16>,
    path: String
}

impl Url {
    fn incr_port(&mut self) {
        if let Some(port_number) = &mut self.port {
            *port_number += 1;
        }
    }
}