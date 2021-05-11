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

    // Incrementally create a vector of references with known size.
    let mut v = Vec::with_capacity(2);
    v.push(&x);
    v.push(&y);

    // Convert a vector of references into an array of references.
    // Drops any excess capacity.
    let a = v.into_boxed_slice();
}