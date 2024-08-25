let currentStream = null;
let isBackCamera = true;
let model = null;
let videoReady = false; // Nouveau flag pour s'assurer que la vidéo est prête

async function startDetection() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Charger le modèle COCO-SSD
    model = await cocoSsd.load();
    console.log("Modèle COCO-SSD chargé");

    // Attendre que la vidéo soit prête
    video.addEventListener('loadeddata', () => {
        videoReady = true;
        resizeCanvas(); // Redimensionner le canvas
        startVideoRendering(); // Commencer l'affichage de la vidéo
        startObjectDetection(); // Commencer la détection des objets
    });

    // Gestion du bouton de changement de caméra
    document.getElementById('switchCamera').addEventListener('click', async () => {
        isBackCamera = !isBackCamera;
        await switchCamera();
    });

    await switchCamera();
}

async function switchCamera() {
    const video = document.getElementById('webcam');
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: {
                facingMode: isBackCamera ? 'environment' : 'user'
            }
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
    } catch (error) {
        console.error("Erreur lors de l'accès à la caméra : ", error);
    }
}

function resizeCanvas() {
    const canvas = document.getElementById('canvas');
    const video = document.getElementById('webcam');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

function startVideoRendering() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    function renderFrame() {
        // Dessiner la vidéo sur le canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(renderFrame);
    }

    // Démarrer la boucle de rendu vidéo
    requestAnimationFrame(renderFrame);
}

function startObjectDetection() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    async function detectObjects() {
        if (model && videoReady) { // Assurez-vous que le modèle et la vidéo sont prêts
            const predictions = await model.detect(video);

            // Nettoyer les anciens rectangles de détection
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Dessiner la vidéo sur le canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Dessiner les prédictions
            predictions.forEach(prediction => {
                const [x, y, width, height] = prediction.bbox;
                context.strokeStyle = '#00FF00';
                context.lineWidth = 2;
                context.strokeRect(x, y, width, height);

                context.fillStyle = '#00FF00';
                context.font = '16px Arial';
                context.fillText(prediction.class, x, y > 10 ? y - 5 : 10);
            });
        }

        // Répéter la détection des objets toutes les 500 ms
        setTimeout(detectObjects, 500);
    }

    detectObjects();
}

window.onload = () => {
    startDetection();
};
