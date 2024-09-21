// Vérifier si les capteurs de mouvement sont supportés
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (event) => {
        document.getElementById('accel-x').innerText = event.acceleration.x.toFixed(2);
        document.getElementById('accel-y').innerText = event.acceleration.y.toFixed(2);
        document.getElementById('accel-z').innerText = event.acceleration.z.toFixed(2);
    });
} else {
    document.getElementById('motion-data').innerText = 'Capteurs de mouvement non supportés par votre appareil.';
}

// Vérifier si les capteurs d'orientation sont supportés
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
        document.getElementById('alpha').innerText = event.alpha.toFixed(2);
        document.getElementById('beta').innerText = event.beta.toFixed(2);
        document.getElementById('gamma').innerText = event.gamma.toFixed(2);
    });
} else {
    document.getElementById('orientation-data').innerText = 'Capteurs d\'orientation non supportés par votre appareil.';
}
