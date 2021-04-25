interface ImmutablePoint { readonly x: number; readonly y: number; }

class Point {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    x: number;
    y: number;
}

function bar(p: Point): number {
    return 2;
}

function foo() {
    const p = new Point(1, 2);
    let x = bar(p);
    // What's the value of p now?
    x += 1;
}