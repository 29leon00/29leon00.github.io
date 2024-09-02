const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const audioDir = path.join(__dirname, 'audio'); // Dossier où sont stockés les fichiers audio

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
    } else if (req.url === '/random-audio') {
        // Lire les fichiers du dossier
        fs.readdir(audioDir, (err, files) => {
            if (err) {
                res.writeHead(500);
                res.end('Erreur serveur');
            } else {
                // Filtrer pour obtenir uniquement les fichiers audio
                const audioFiles = files.filter(file => file.endsWith('.mp3'));

                // Choisir un fichier aléatoire
                const randomFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
                const filePath = path.join(audioDir, randomFile);

                // Lire le fichier audio et l'envoyer en réponse
                res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
                fs.createReadStream(filePath).pipe(res);
            }
        });
    } else if (req.url.startsWith('/stream')) {
        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });

        // Diffusion du flux audio
        audioListeners.push(res);

        req.on('close', () => {
            audioListeners = audioListeners.filter(listener => listener !== res);
        });
    } else if (req.url === '/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const { email, password } = JSON.parse(body);

            // Vérification des identifiants
            if (email === "mahe.ailliot@gmail.com" && password === "Mahe25892589") {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false }));
            }
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
