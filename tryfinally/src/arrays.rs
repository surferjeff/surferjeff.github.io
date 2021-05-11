fn demo() {
    let x = 1;
    let y = 2;

    // Create an array of instances.
    let a = [x, y];

    // Create a fully formed array of references.
    let a = [&x, &y];

    // Create a vector of references.
    let v = vec![&x, &y];

    // Incrementally create a vector of references.
    let mut v = Vec::new();
    v.push(&x);
    v.push(&y);

    // Incrementally create a vector of references with predictable size.
    let mut v = Vec::with_capacity(2);
    v.push(&x);
    v.push(&y);

    // Convert a vector of references into an array of references.
    // Drops any excess capacity.
    let a = v.into_boxed_slice();

    // Create an array with a scattering of references.
    let mut scattered = [None; 10];
    scattered[2] = Some(&x);
    scattered[5] = Some(&y);
    scattered[6] = Some(&y);

    // Allocate the elements of the array on the heap instead of in-place in the array.
    // After https://github.com/rust-lang/rust/issues/49147 is fixed, I'll be able to
    // simply write `let mut heap = [None; 10];`
    let mut heap = <[_; 10]>::default();
    heap[2] = Some(Box::new(7));
    heap[5] = Some(Box::new(3));
}