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

#[cfg(test)]
pub mod tests {
    use std::io::Write;

    use super::*;

    #[test]
    pub fn test_peek_file() {
        let mut f = tempfile::tempfile().unwrap();
        f.write_all(b"Hello World").unwrap();
        f.seek(SeekFrom::Start(0)).unwrap();

        // Peek the first 5 bytes.
        let mut buf = [0u8; 5];
        peek_file(&mut f, &mut buf).unwrap();
        assert_eq!(b"Hello", &buf);

        // The previous call to peek_file should not have advanced the file pointer.
        peek_file(&mut f, &mut buf).unwrap();
        assert_eq!(b"Hello", &buf);

        // Try an read that's too big and will fail.
        let mut big_buf = [0u8; 100];
        assert!(peek_file(&mut f, &mut big_buf).is_err());

        // But the file pointer should still be at the beginning of the file.
        peek_file(&mut f, &mut buf).unwrap();
        assert_eq!(b"Hello", &buf);
    }
}