fn main() {
    println!("Hello, world!");
}

pub struct StringStack {
    numbers: Vec<String>,
}

impl StringStack {
    pub fn new() -> StringStack {
        StringStack { numbers: Vec::new() }
    }

    pub fn empty(&self) -> bool {
        self.numbers.is_empty()
    }

    pub fn push(&mut self, s: String) {
        self.numbers.push(s)
    }

    pub fn pop(&mut self) -> Option<String> {
        self.numbers.pop()
    }

    pub fn peek(&self) -> Option<String> {
        self.numbers.last().cloned()
    }
}