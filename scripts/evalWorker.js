const { parentPort, workerData } = require('worker_threads');

let output = [];
let mainInterval = null;

// Intercepta console.log
console.log = (...args) => {
    const message = args.join(' ');
    output.push(message);
    parentPort.postMessage({
        type: 'update',
        output: [...output] // Envia uma cópia do array
    });
};

// Sobrescreve setInterval
const originalSetInterval = global.setInterval;
global.setInterval = function(fn, delay, ...args) {
    if (mainInterval) return;
    
    const wrappedFn = (...args) => {
        try {
            fn(...args);
        } catch (error) {
            cleanup();
            parentPort.postMessage({
                type: 'error',
                error: error.message,
                output: [...output]
            });
        }
    };

    mainInterval = originalSetInterval(wrappedFn, delay, ...args);
    return mainInterval;
};

function cleanup() {
    if (mainInterval) {
        clearInterval(mainInterval);
        mainInterval = null;
    }
}

// Captura erros não tratados
process.on('uncaughtException', (error) => {
    cleanup();
    parentPort.postMessage({
        type: 'error',
        error: error.message,
        output: [...output]
    });
});

// Executa o código
try {
    eval(workerData);
    
    // Envia mensagem inicial
    parentPort.postMessage({
        type: 'start',
        output: [...output]
    });
} catch (error) {
    cleanup();
    parentPort.postMessage({
        type: 'error',
        error: error.message,
        output: [...output]
    });
}