public class Url {
    String protocol;
    String hostName;
    Integer port;
    String path;

    public Url(String protocol, String hostName, Integer port, String path) {
        this.protocol = protocol;
        this.hostName = hostName;
        this.port = port;
        this.path = path;
    }

    // How do I implement clone(), equals(), compare(), and hash, and printing a
    // a debug string that looks something like this:
    // Url { protocol: "http", host_name: "www.google.com", port: 80, path: "" }
    public static void main(String[] args) {
        var url = new Url("http", "www.google.com", 80, null);
        System.out.println(url);
    }
}
