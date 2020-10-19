import("@/../wasm/pkg").then(wasm => {

    const ctx: Worker = self as any;

    // Post data to parent thread
    ctx.postMessage('Hi.');

    // Respond to message from parent thread
    ctx.addEventListener('message', (event) => {
        // Echo the message back.
        ctx.postMessage("Worker received a message.");
    });

    const hoagie = new wasm.Hoagie(42);

});