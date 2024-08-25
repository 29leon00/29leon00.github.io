let videoStream = null;
let currentStream = null;
let isBackCamera = true;
let model = null;

async function startDetection() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Charger le modèle COCO-SSD avant de commencer
    model = await cocoSsd.load();
    console.log("Modèle chargé");

    // Redimensionner le canvas une fois la vidéo prête
    video.addEventListener('loadeddata', () => {
        resizeCanvas();
        detectFrame(video, context); // Commencer la détection une fois que la vidéo est prête
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

async function detectFrame(video, context) {
    if (!model) {
        console.error("Le modèle n'est pas chargé");
        return;
    }

    const predictions = await model.detect(video);

    // Nettoyer le canvas pour la prochaine frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner la vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Parcourir les prédictions et dessiner les boîtes et labels
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
    requestAnimationFrame(() => detectFrame(video, context));
}

window.onload = () => {
    startDetection();
};
