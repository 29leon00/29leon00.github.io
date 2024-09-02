const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const audioFolder = path.join(__dirname, 'audio');

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

        // Liste des fichiers audio
        fs.readdir(audioFolder, (err, files) => {
            if (err) {
                res.writeHead(500);
                res.end('Erreur de lecture du dossier');
                return;
            }

            // Lire chaque fichier et les diffuser
            let index = 0;

            function streamFile() {
                if (index >= files.length) {
                    index = 0; // Recommencer à partir du début
                }
                const file = path.join(audioFolder, files[index]);
                const fileStream = fs.createReadStream(file);

                fileStream.on('data', chunk => {
                    res.write(chunk);
                });

                fileStream.on('end', () => {
                    index++;
                    setImmediate(streamFile); // Lire le fichier suivant
                });

                fileStream.on('error', () => {
                    res.writeHead(500);
                    res.end('Erreur de lecture du fichier');
                });
            }

            streamFile();
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
