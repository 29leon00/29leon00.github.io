let videoStream = null;
let currentStream = null;
let isBackCamera = true;

// Fonction principale pour démarrer la caméra et la détection d'objets
async function startDetection() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Accéder à la webcam
    await switchCamera();

    // Charger le modèle COCO-SSD
    const model = await cocoSsd.load();

    // Démarrer la détection en continu
    video.onloadeddata = () => {
        detectFrame(video, model, context);
    };

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

// Fonction pour détecter les objets à chaque frame
async function detectFrame(video, model, context) {
    // Détecter les objets
    const predictions = await model.detect(video);

    // Effacer le canvas pour la prochaine frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner la vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Parcourir les prédictions et dessiner les cercles et les labels
    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.max(width, height) / 2;

        // Définir le style de dessin
        context.strokeStyle = '#00FF00';
        context.lineWidth = 3;
        context.fillStyle = '#00FF00';
        context.font = '18px Arial';

        // Dessiner le cercle
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.stroke();

        // Dessiner le label
        context.fillText(prediction.class, x, y > 20 ? y - 10 : 10);
    });

    // Reprendre la détection pour la prochaine frame
    requestAnimationFrame(() => detectFrame(video, model, context));
}

// Lancer la détection quand la page est chargée
window.onload = () => {
    startDetection();
};
