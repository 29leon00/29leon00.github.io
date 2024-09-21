let watchID = null;

// Fonction pour démarrer les capteurs
function startSensors() {
    startCompass();
    startGeolocation();
}

// Boussole : Activer la détection de l'orientation
function startCompass() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Demander la permission pour les appareils iOS
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation, true);
                } else {
                    alert('Permission refusée pour accéder aux capteurs de mouvement.');
                }
            })
            .catch(console.error);
    } else {
        // Pour les navigateurs qui n'ont pas besoin de permission
        window.addEventListener('deviceorientation', handleOrientation, true);
    }
}

// Gestion de l'orientation pour la boussole
function handleOrientation(event) {
    if (event.alpha !== null) {
        let compassArrow = document.getElementById('compass-arrow');
        // Nous utilisons 360 - alpha pour orienter correctement la boussole
        let rotation = 360 - event.alpha; 
        compassArrow.style.transform = `rotate(${rotation}deg)`;
    } else {
        alert('Orientation non supportée.');
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
