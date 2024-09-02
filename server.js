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
    } else {
        res.writeHead(404);
        res.end('404 Not Found');
    }
});

// WebSocket pour gérer la diffusion audio
const wss = new WebSocket.Server({ server });
let broadcaster = null;
let listeners = [];

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        if (!broadcaster) {
            // Si c'est le premier utilisateur qui envoie de l'audio, on le considère comme le diffuseur
            broadcaster = ws;
        }

        if (ws === broadcaster) {
            // Envoyer l'audio aux auditeurs
            listeners.forEach(listener => {
                if (listener.readyState === WebSocket.OPEN) {
                    listener.send(message);
                }
            });
        }
    });

    ws.on('close', () => {
        if (ws === broadcaster) {
            // Si le diffuseur se déconnecte, réinitialiser le diffuseur
            broadcaster = null;
        } else {
            // Sinon, supprimer l'auditeur de la liste
            listeners = listeners.filter(listener => listener !== ws);
        }
    });

    // Ajouter le client en tant qu'auditeur s'il n'est pas diffuseur
    if (ws !== broadcaster) {
        listeners.push(ws);
    }
});

server.listen(8000, () => {
    console.log('Serveur en écoute sur le port 8000');
});
