const ctx: Worker = self as any;

// Post data to parent thread
ctx.postMessage('Hi.');

// Respond to message from parent thread
ctx.addEventListener('message', (event) => console.log(event.data));