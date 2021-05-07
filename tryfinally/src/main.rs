use std::io::{self, Read, Seek, SeekFrom};
use std::fs::File;


fn main() {
    println!("Hello, world!");
}

fn peek_file(f: &mut File, buffer: &mut [u8]) -> io::Result<()>
{
    let offset = f.seek(SeekFrom::Current(0))?;
    let mut __try = || -> Result<_, _> {
        f.read_exact(buffer)
    };
    let result = __try();
    f.seek(SeekFrom::Start(offset))?;
    result
}