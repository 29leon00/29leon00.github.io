let currentStream = null;
let isBackCamera = true;
let model = null;
let videoReady = false;

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
        resizeCanvas();
        detectFrame(video, context); // Lancer la détection
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

async function detectFrame(video, context) {
    if (model && videoReady) {
        const predictions = await model.detect(video);

        // Nettoyer le canvas avant de dessiner
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

    // Appel récursif après 22 ms pour viser 45 fps
    setTimeout(() => {
        detectFrame(video, context);
    }, 22); // 22 ms pour approximer 45 fps
}

window.onload = () => {
    startDetection();
};
