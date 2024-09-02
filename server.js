const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Chemin du dossier contenant les fichiers audio
const AUDIO_DIR = path.join(__dirname, 'audio');

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
    } else if (req.url.startsWith('/stream/')) {
        const fileName = path.basename(req.url);
        const filePath = path.join(AUDIO_DIR, fileName);

        // Vérifie si le fichier demandé existe
        fs.access(filePath, fs.constants.R_OK, (err) => {
            if (err) {
                res.writeHead(404);
                res.end('Fichier non trouvé');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
            fs.createReadStream(filePath).pipe(res);
        });
    } else if (req.url === '/audio') {
        fs.readdir(AUDIO_DIR, (err, files) => {
            if (err) {
                res.writeHead(500);
                res.end('Erreur serveur');
                return;
            }
            // Filtre pour ne conserver que les fichiers mp3
            const audioFiles = files.filter(file => path.extname(file) === '.mp3');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(audioFiles));
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
