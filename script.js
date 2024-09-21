// Fonction pour activer les capteurs
function startSensors() {
    // Activer le capteur de mouvement si disponible
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            document.getElementById('accel-x').innerText = event.acceleration.x ? event.acceleration.x.toFixed(2) : '0';
            document.getElementById('accel-y').innerText = event.acceleration.y ? event.acceleration.y.toFixed(2) : '0';
            document.getElementById('accel-z').innerText = event.acceleration.z ? event.acceleration.z.toFixed(2) : '0';
        });
    } else {
        alert('Capteurs de mouvement non supportés.');
    }

    // Activer le capteur d'orientation si disponible
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
            document.getElementById('alpha').innerText = event.alpha ? event.alpha.toFixed(2) : '0';
            document.getElementById('beta').innerText = event.beta ? event.beta.toFixed(2) : '0';
            document.getElementById('gamma').innerText = event.gamma ? event.gamma.toFixed(2) : '0';
        });
    } else {
        alert('Capteurs d\'orientation non supportés.');
    }
}
