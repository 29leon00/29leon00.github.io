// script.js
//test

const video = document.getElementById('video');
const cameraSelect = document.getElementById('cameraSelect');
const imageUpload = document.getElementById('imageUpload');
const capturedImage = document.getElementById('capturedImage');
const captureButton = document.getElementById('captureButton');
const uploadedImage = document.getElementById('uploadedImage');
const objectToDetect = document.getElementById('objectToDetect');

let currentStream;
let objectToDetectValue = 'car'; // Valeur par défaut

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

// Mettre à jour l'objet à détecter lorsque l'utilisateur le change
objectToDetect.addEventListener('input', () => {
    objectToDetectValue = objectToDetect.value.toLowerCase(); // Met à jour la valeur avec l'entrée utilisateur
    document.getElementById('status').textContent = `Recherche de ${objectToDetectValue}...`;
});

// Charger le modèle COCO-SSD
let model;
cocoSsd.load().then(loadedModel => {
    model = loadedModel;
    document.getElementById('status').textContent = `Modèle chargé, recherche de ${objectToDetectValue}...`;
    detectObjectOnVideo();
});

// Fonction de détection d'objet sur la vidéo
function detectObjectOnVideo() {
    model.detect(video).then(predictions => {
        let foundObject = false;
        predictions.forEach(prediction => {
            if (prediction.class === objectToDetectValue) {
                foundObject = true;
                document.getElementById('status').textContent = `${objectToDetectValue.charAt(0).toUpperCase() + objectToDetectValue.slice(1)} détecté !`;
                document.body.style.backgroundColor = "#ff7043"; // Signal visuel
            }
        });
        if (!foundObject) {
            document.getElementById('status').textContent = `Pas de ${objectToDetectValue} détecté.`;
            document.body.style.backgroundColor = "#e0f7fa"; // Couleur de fond par défaut
        }
        requestAnimationFrame(detectObjectOnVideo);
    });
}

// Fonction de détection d'objet sur l'image importée ou capturée
function detectObjectOnImage(image) {
    model.detect(image).then(predictions => {
        let foundObject = false;
        predictions.forEach(prediction => {
            if (prediction.class === objectToDetectValue) {
                foundObject = true;
                document.getElementById('status').textContent = `${objectToDetectValue.charAt(0).toUpperCase() + objectToDetectValue.slice(1)} détecté sur l'image !`;
                document.body.style.backgroundColor = "#ff7043"; // Signal visuel
            }
        });
        if (!foundObject) {
            document.getElementById('status').textContent = `Pas de ${objectToDetectValue} détecté sur l'image.`;
            document.body.style.backgroundColor = "#e0f7fa"; // Couleur de fond par défaut
        }
    });
}
