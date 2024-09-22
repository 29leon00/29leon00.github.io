let watchID = null;

// Fonction pour démarrer les capteurs
function startSensors() {
    startCompass();
    startGeolocation();
    startBubbleLevel();
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
    const speedInKmh = (speedInMetersPerSecond * 3.6).toFixed(2);
    const speedInKnots = (speedInMetersPerSecond * 1.943844).toFixed(2);

    document.getElementById('speed-kmh').innerText = speedInKmh;
    document.getElementById('speed-knots').innerText = speedInKnots;
}

// Gérer les erreurs de géolocalisation
function handleError(error) {
    console.error('Erreur de géolocalisation : ', error.message);
    alert('Impossible de récupérer la vitesse.');
}

// Niveau à Bulle : Activer la détection de l'inclinaison
function startBubbleLevel() {
    window.addEventListener('devicemotion', handleMotion, true);
}

// Gestion de l'inclinaison pour le niveau à bulle
function handleMotion(event) {
    let bubble = document.getElementById('bubble');
    let accX = event.accelerationIncludingGravity.x;
    let accY = event.accelerationIncludingGravity.y;

    // Déplacer la bulle en fonction des valeurs d'accélération
    let maxOffset = 60; // Limite de déplacement de la bulle
    let bubbleX = Math.min(Math.max(-accX * 20, -maxOffset), maxOffset);
    let bubbleY = Math.min(Math.max(accY * 20, -maxOffset), maxOffset);

    bubble.style.left = `calc(50% + ${bubbleX}px - 20px)`;
    bubble.style.top = `calc(50% + ${bubbleY}px - 20px)`;
}
