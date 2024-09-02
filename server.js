const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Dossier contenant les fichiers audio
const audioDirectory = path.join(__dirname, 'audio');

// Fonction pour obtenir un fichier aléatoire du dossier audio
function getRandomAudioFile() {
    const files = fs.readdirSync(audioDirectory).filter(file => file.endsWith('.mp3'));
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(audioDirectory, randomFile);
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
    } else if (req.url === '/stream') {
        const audioFile = getRandomAudioFile();
        const stream = fs.createReadStream(audioFile);

        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
        stream.pipe(res);

        // Lorsque le fichier audio est terminé, on peut en envoyer un autre
        stream.on('end', () => {
            const nextAudioFile = getRandomAudioFile();
            const nextStream = fs.createReadStream(nextAudioFile);
            nextStream.pipe(res);
        });

    } else {
        res.writeHead(404);
        res.end('404 Not Found');
    }
});

// WebSocket pour gérer la diffusion audio si nécessaire (non utilisé ici)
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Nouvelle connexion WebSocket');
});

server.listen(8000, () => {
    console.log('Serveur en écoute sur le port 8000');
});
