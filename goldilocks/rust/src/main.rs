fn main() {
    println!("Hello, world!");
}

pub struct NumberStack {
    numbers: Vec<u32>,
}

impl NumberStack {
    pub fn new() -> NumberStack {
        NumberStack { numbers: Vec::new() }
    }

    pub fn empty(&self) -> bool {
        self.numbers.is_empty()
    }

    pub fn push(&mut self, n: u32) {
        self.numbers.push(n)
    }

    pub fn pop(&mut self) -> Option<u32> {
        self.numbers.pop()
    }

    pub fn peek(&self) -> Option<u32> {
        self.numbers.last().copied()
    }
}