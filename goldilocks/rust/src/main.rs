use std::collections::{BTreeSet, HashSet};
use serde::{Serialize, Deserialize};

fn main() -> serde_json::error::Result<()> {
    let url = Url::default();
    let mut url = Url {
        protocol: "http".into(),
        host_name: "www.google.com".into(),
        port: Some(80),
        path: String::new()
    };

    for _ in 0..10 {
        let response = fetch(&mut url)?;
        println!("{}", response);
        url.incr_port();
    }

    let url2 = url.clone();
    let url3 = url.clone();
    let url4 = url.clone();
    let mut sorted_urls = BTreeSet::new();
    sorted_urls.insert(url3);
    let mut urls = HashSet::new();
    urls.insert(url4);
    println!("{:?}", url);
    url.incr_port();
    println!("{}", url);
    println!("url == url2? {}", url == url2);
    println!("url > url2? {}", url > url2);

    let text = serde_json::to_string(&url)?;
    let url2: Url = serde_json::from_str(&text)?;

    println!("Hi {}, my favorite number is {}.", "Jeff", 42);



    Ok(())
}

fn fetch(url: &Url) -> Result<String, serde_json::Error> {
    Ok(String::default())
}

#[derive(Eq, PartialEq, Ord, PartialOrd, Clone, Hash, Default, Debug, Serialize, Deserialize)]
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