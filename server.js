const http = require('http');
const fs = require('fs');
const path = require('path');

// Dossier où sont stockés les fichiers audio
const audioDir = path.join(__dirname, 'audio');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        // Envoyer la page HTML principale
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
        // Récupérer tous les fichiers audio du dossier
        fs.readdir(audioDir, (err, files) => {
            if (err) {
                res.writeHead(500);
                res.end('Erreur serveur lors de la lecture du dossier audio');
                return;
            }

            // Filtrer les fichiers pour ne garder que les fichiers audio
            const audioFiles = files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav'));

            if (audioFiles.length === 0) {
                res.writeHead(404);
                res.end('Aucun fichier audio trouvé');
                return;
            }

            // Choisir un fichier aléatoirement
            const randomFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
            const filePath = path.join(audioDir, randomFile);

            // Diffuser le fichier choisi
            res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
        });
    } else {
        res.writeHead(404);
        res.end('404 Not Found');
    }
});

server.listen(8000, () => {
    console.log('Serveur en écoute sur le port 8000');
});
