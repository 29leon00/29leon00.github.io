let videoStream = null;
let currentStream = null;
let isBackCamera = true;

// Fonction principale pour démarrer la caméra et la détection d'objets
async function startDetection() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Ajuster la taille de la vidéo et du canvas à la taille de l'écran
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Accéder à la webcam
    await switchCamera();

    // Charger le modèle COCO-SSD
    const model = await cocoSsd.load();

    // Démarrer la détection à intervalles réguliers
    setInterval(() => {
        detectFrame(video, model, context);
    }, 100); // Réduit la fréquence à 10 FPS pour de meilleures performances

    // Gestion du bouton de changement de caméra
    document.getElementById('switchCamera').addEventListener('click', async () => {
        isBackCamera = !isBackCamera;
        await switchCamera();
    });
}

// Fonction pour changer de caméra
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

// Fonction pour ajuster la taille du canvas en fonction de l'écran
function resizeCanvas() {
    const canvas = document.getElementById('canvas');
    const video = document.getElementById('webcam');
    const container = document.querySelector('.container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    video.width = container.clientWidth;
    video.height = container.clientHeight;
}

// Fonction pour dessiner les contours rectangulaires autour des objets détectés
function drawBoundingBox(prediction, context) {
    const [x, y, width, height] = prediction.bbox;

    context.strokeStyle = '#00FF00';
    context.lineWidth = 3;
    context.strokeRect(x, y, width, height);
}

// Fonction pour détecter les objets à chaque frame
async function detectFrame(video, model, context) {
    // Détecter les objets
    const predictions = await model.detect(video);

    // Effacer le canvas pour la prochaine frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner la vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Parcourir les prédictions et dessiner les contours
    predictions.forEach(prediction => {
        drawBoundingBox(prediction, context);

        // Dessiner le label de l'objet
        const [x, y] = prediction.bbox;
        context.fillStyle = '#00FF00';
        context.font = '18px Arial';
        context.fillText(prediction.class, x, y > 20 ? y - 10 : 10);
    });
}

// Lancer la détection quand la page est chargée
window.onload = () => {
    startDetection();
};
