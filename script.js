let videoStream = null;
let currentStream = null;
let isBackCamera = true;
let model = null;

async function startDetection() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Ajuster la taille du canvas pour qu'il corresponde à la taille de la vidéo
    video.addEventListener('loadeddata', () => {
        resizeCanvas();
    });

    // Charger le modèle COCO-SSD
    model = await cocoSsd.load();

    // Démarrer la détection en continu
    detectFrame(video, model, context);

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
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: isBackCamera ? 'environment' : 'user'
            }
        });
        video.srcObject = videoStream;
        currentStream = videoStream;
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

async function detectFrame(video, model, context) {
    const predictions = await model.detect(video);

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner la vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        context.strokeStyle = '#00FF00';
        context.lineWidth = 4;
        context.strokeRect(x, y, width, height);

        context.fillStyle = '#00FF00';
        context.font = '16px Arial';
        context.fillText(prediction.class, x, y > 10 ? y - 5 : 10);
    });

    // Utiliser requestAnimationFrame pour une détection fluide
    requestAnimationFrame(() => detectFrame(video, model, context));
}

window.onload = () => {
    startDetection();
};
