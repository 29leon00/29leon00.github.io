const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Erreur serveur');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url === '/stream') {
        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });

        // Diffusion du flux audio
        audioListeners.push(res);

        req.on('close', () => {
            audioListeners = audioListeners.filter(listener => listener !== res);
        });
    } else {
        res.writeHead(404);
        res.end('404 Not Found');
    }
});

// WebSocket pour gérer la diffusion audio
const wss = new WebSocket.Server({ server });
let audioListeners = [];

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        audioListeners.forEach(listener => {
            listener.write(Buffer.from(message));
        });
    });

    ws.on('close', () => {
        console.log('Connexion WebSocket fermée');
    });
});

server.listen(8000, () => {
    console.log('Serveur en écoute sur le port 8000');
});
