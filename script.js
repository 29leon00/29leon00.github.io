// script.js

const video = document.getElementById('video');
const cameraSelect = document.getElementById('cameraSelect');
const imageUpload = document.getElementById('imageUpload');
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
            uploadedImage.style.display = 'block';
            detectCatOnImage(uploadedImage);
        };
        reader.readAsDataURL(file);
    }
});

// Charger le modèle COCO-SSD
let model;
cocoSsd.load().then(loadedModel => {
    model = loadedModel;
    document.getElementById('status').textContent = "Modèle chargé, recherche de chat...";
    detectCatOnVideo();
});

// Fonction de détection de chat sur la vidéo
function detectCatOnVideo() {
    model.detect(video).then(predictions => {
        let foundCat = false;
        predictions.forEach(prediction => {
            if (prediction.class === 'cat') {
                foundCat = true;
                document.getElementById('status').textContent = "Chat détecté 🐱 !";
                document.body.style.backgroundColor = "#ff7043"; // Signal visuel
            }
        });
        if (!foundCat) {
            document.getElementById('status').textContent = "Pas de chat détecté.";
            document.body.style.backgroundColor = "#e0f7fa"; // Couleur de fond par défaut
        }
        requestAnimationFrame(detectCatOnVideo);
    });
}

// Fonction de détection de chat sur l'image importée
function detectCatOnImage(image) {
    model.detect(image).then(predictions => {
        let foundCat = false;
        predictions.forEach(prediction => {
            if (prediction.class === 'cat') {
                foundCat = true;
                document.getElementById('status').textContent = "Chat détecté 🐱 sur l'image !";
                document.body.style.backgroundColor = "#ff7043"; // Signal visuel
            }
        });
        if (!foundCat) {
            document.getElementById('status').textContent = "Pas de chat détecté sur l'image.";
            document.body.style.backgroundColor = "#e0f7fa"; // Couleur de fond par défaut
        }
    });
}
