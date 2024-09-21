let watchID = null;

// Fonction pour démarrer les capteurs
function startSensors() {
    startCompass();
    startGeolocation();
}

// Boussole : Activer la détection de l'orientation
function startCompass() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
            if (event.alpha !== null) {
                let compassArrow = document.getElementById('compass-arrow');
                // Rotation selon l'alpha (direction)
                let rotation = 360 - event.alpha; // Inverser la rotation pour faire correspondre à la boussole
                compassArrow.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
            }
        });
    } else {
        alert('Votre appareil ne supporte pas les capteurs d\'orientation.');
    }
}

// Géolocalisation : Activer la détection de la vitesse
function startGeolocation() {
    if ('geolocation' in navigator) {
        watchID = navigator.geolocation.watchPosition(updateSpeed, handleError, {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 27000
        });
    } else {
        alert('Géolocalisation non supportée.');
    }
}

// Mettre à jour la vitesse affichée
function updateSpeed(position) {
    const speedInMetersPerSecond = position.coords.speed || 0;
    const speedInKmh = (speedInMetersPerSecond * 3.6).toFixed(2);  // Convertir m/s en km/h
    const speedInKnots = (speedInMetersPerSecond * 1.943844).toFixed(2);  // Convertir m/s en nœuds

    document.getElementById('speed-kmh').innerText = speedInKmh;
    document.getElementById('speed-knots').innerText = speedInKnots;
}

// Gérer les erreurs de géolocalisation
function handleError(error) {
    console.error('Erreur de géolocalisation : ', error.message);
    alert('Impossible de récupérer la vitesse.');
}
