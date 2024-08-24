// script.js

const video = document.getElementById('video');
const cameraSelect = document.getElementById('cameraSelect');
const imageUpload = document.getElementById('imageUpload');
const capturedImage = document.getElementById('capturedImage');
const captureButton = document.getElementById('captureButton');
const uploadedImage = document.getElementById('uploadedImage');
const objectSelect = document.getElementById('objectSelect');

let currentStream;
let objectToDetect = 'car'; // Par défaut, détecte les voitures

// Fonction pour accéder à la caméra sélectionnée
function startCamera(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: {
            deviceId: deviceId ? { exact: deviceId } : undefined
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        currentStream = stream;
        video.srcObject = stream;
        video.style.display = 'block';
        capturedImage.style.display = 'none';
        uploadedImage.style.display = 'none';
    }).catch(err => {
        console.error("Erreur d'accès à la caméra:", err);
    });
}

// Lister les caméras disponibles
navigator.mediaDevices.enumerateDevices().then(devices => {
    devices.forEach(device => {
        if (device.kind === 'videoinput') {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.length + 1}`;
            cameraSelect.appendChild(option);
        }
    });

    if (cameraSelect.length > 0) {
        startCamera(cameraSelect.value);
    }
});

// Changer de caméra lorsque l'utilisateur en sélectionne une autre
cameraSelect.onchange = () => {
    startCamera(cameraSelect.value);
};

// Gérer l'importation d'images
imageUpload.addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            uploadedImage.src = e.target.result;
            video.style.display = 'none';
            capturedImage.style.display = 'none';
            uploadedImage.style.display = 'block';
            detectObjectOnImage(uploadedImage);
        };
        reader.readAsDataURL(file);
    }
});

// Capturer une image à partir du flux vidéo
captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedImage.src = canvas.toDataURL('image/png');
    video.style.display = 'none';
    capturedImage.style.display = 'block';
    uploadedImage.style.display = 'none';

    detectObjectOnImage(capturedImage);
});

// Charger le modèle COCO-SSD de manière asynchrone
let model;
async function loadModel() {
    document.getElementById('status').textContent = "Chargement du modèle...";
    model = await cocoSsd.load({ base: 'lite_mobilenet_v2' }); // Utilisation du modèle léger
    document.getElementById('status').textContent = "Modèle chargé, prêt à détecter...";
    detectObjectOnVideo();
}

// Appeler le chargement du modèle dès que possible
loadModel();

// Fonction de détection de l'objet sur la vidéo
function detectObjectOnVideo() {
    if (model) {
        model.detect(video).then(predictions => {
            let foundObject = false;
            predictions.forEach(prediction => {
                if (prediction.class.toLowerCase() === objectSelect.value) {
                    foundObject = true;
                    document.getElementById('status').textContent = `${objectSelect.value.charAt(0).toUpperCase() + objectSelect.value.slice(1)} détecté(e) !`;
                    document.body.style.backgroundColor = "#ff7043"; // Signal visuel
                }
            });
            if (!foundObject) {
                document.getElementById('status').textContent = `Pas de ${objectSelect.value} détecté(e).`;
                document.body.style.backgroundColor = "#e0f7fa"; // Couleur de fond par défaut
            }
            requestAnimationFrame(detectObjectOnVideo);
        });
    }
}

// Fonction de détection de l'objet sur l'image importée ou capturée
function detectObjectOnImage(image) {
    if (model) {
        model.detect(image).then(predictions => {
            let foundObject = false;
            predictions.forEach(prediction => {
                if (prediction.class.toLowerCase() === objectSelect.value) {
                    foundObject = true;
                    document.getElementById('status').textContent = `${objectSelect.value.charAt(0).toUpperCase() + objectSelect.value.slice(1)} détecté(e) sur l'image !`;
                    document.body.style.backgroundColor = "#ff7043"; // Signal visuel
                }
            });
            if (!foundObject) {
                document.getElementById('status').textContent = `Pas de ${objectSelect.value} détecté(e) sur l'image.`;
                document.body.style.backgroundColor = "#e0f7fa"; // Couleur de fond par défaut
            }
        });
    }
}
