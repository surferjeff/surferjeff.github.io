use std::io::{self, Read, Seek, SeekFrom};
use std::fs::File;


fn main() {
    println!("Hello, world!");
}

fn dump(f: &mut File) -> io::Result<()>
{
    let offset = f.seek(SeekFrom::Current(0))?;
    let mut __try = || -> Result<_, _> {
        let mut buffer = vec![0u8; 100];
        f.read_exact(&mut buffer)?;
        f.read_exact(&mut buffer)?;
        f.read_exact(&mut buffer)?;
        Ok(())
    };
    let result = __try();
    f.seek(SeekFrom::Start(offset))?;
    result
}