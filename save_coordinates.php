<?php
// Vérifier que les données sont présentes
if (isset($_POST['latitude']) && isset($_POST['longitude'])) {
    $latitude = $_POST['latitude'];
    $longitude = $_POST['longitude'];

    // Créer une ligne de données
    $data = "Latitude: $latitude, Longitude: $longitude\n";

    // Ajouter les données au fichier
    $file = 'coordinates.txt';
    if (file_put_contents($file, $data, FILE_APPEND)) {
        http_response_code(200);
        echo "Coordonnées enregistrées avec succès.";
    } else {
        http_response_code(500);
        echo "Erreur lors de l'enregistrement.";
    }
} else {
    http_response_code(400);
    echo "Données manquantes.";
}
?>
