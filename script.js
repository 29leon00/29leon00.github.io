// script.js

const video = document.getElementById('video');
const cameraSelect = document.getElementById('cameraSelect');
const imageUpload = document.getElementById('imageUpload');
const capturedImage = document.getElementById('capturedImage');
const captureButton = document.getElementById('captureButton');
const uploadedImage = document.getElementById('uploadedImage');

let currentStream;

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
            detectCarOnImage(uploadedImage);
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

    detectCarOnImage(capturedImage);
});

// Charger le modèle COCO-SSD
let model;
cocoSsd.load().then(loadedModel => {
    model = loadedModel;
    document.getElementById('status').textContent = "Modèle chargé, recherche de voiture...";
    detectCarOnVideo();
});

// Fonction de détection de voiture sur la vidéo
function detectCarOnVideo() {
    model.detect(video).then(predictions => {
        let foundCar = false;
        predictions.forEach(prediction => {
            if (prediction.class === 'car') {
                foundCar = true;
                document.getElementById('status').textContent = "Voiture détectée 🚗 !";
                document.body.style.backgroundColor = "#ff7043"; // Signal visuel
            }
        });
        if (!foundCar) {
            document.getElementById('status').textContent = "Pas de voiture détectée.";
            document.body.style.backgroundColor = "#e0f7fa"; // Couleur de fond par défaut
        }
        requestAnimationFrame(detectCarOnVideo);
    });
}

// Fonction de détection de voiture sur l'image importée ou capturée
function detectCarOnImage(image) {
    model.detect(image).then(predictions => {
        let foundCar = false;
        predictions.forEach(prediction => {
            if (prediction.class === 'car') {
                foundCar = true;
                document.getElementById('status').textContent = "Voiture détectée 🚗 sur l'image !";
                document.body.style.backgroundColor = "#ff7043"; // Signal visuel
            }
        });
        if (!foundCar) {
            document.getElementById('status').textContent = "Pas de voiture détectée sur l'image.";
            document.body.style.backgroundColor = "#e0f7fa"; // Couleur de fond par défaut
        }
    });
}
