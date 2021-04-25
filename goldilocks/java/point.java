class Point {
    public int x;
    public int y;
}

class X {
    static void main() {
        var p = new Point();
        foo(p);
        // What's the value of p?
    }
}

class NumberStack {
    ArrayList<float> list = new ArrayList<float>;
    
    public boolean empty();
    public float peek() throws EmptyStackException;
    public float pop() throws EmptyStackException;
    public void push(float);
}