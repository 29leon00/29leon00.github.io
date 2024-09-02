const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const audioDir = path.join(__dirname, 'audio');

// Fonction pour choisir un fichier audio aléatoire
function getRandomAudioFile(callback) {
    fs.readdir(audioDir, (err, files) => {
        if (err) {
            callback(err, null);
            return;
        }

        // Filtrer pour ne garder que les fichiers audio (par exemple .mp3)
        const audioFiles = files.filter(file => file.endsWith('.mp3'));

        if (audioFiles.length === 0) {
            callback(new Error('Aucun fichier audio trouvé'), null);
            return;
        }

        // Sélectionner un fichier aléatoire
        const randomFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
        callback(null, path.join(audioDir, randomFile));
    });
}

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
        getRandomAudioFile((err, filePath) => {
            if (err) {
                res.writeHead(500);
                res.end('Erreur serveur: ' + err.message);
                return;
            }

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Erreur lors de la lecture du fichier audio');
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
                res.end(data);
            });
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
