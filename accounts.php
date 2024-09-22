<?php
header('Content-Type: application/json');

// Emplacement du fichier de données des comptes
$file_path = 'accounts.json';

// Charger les comptes depuis le fichier JSON
if (file_exists($file_path)) {
    $accounts = json_decode(file_get_contents($file_path), true);
} else {
    $accounts = [];
}

// Vérifier le type de requête
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];

    // Créer un compte
    if ($action == 'create') {
        $username = $_POST['username'];
        $password = $_POST['password'];

        // Vérifier si le compte existe déjà
        if (isset($accounts[$username])) {
            echo json_encode(['error' => 'Le compte existe déjà.']);
        } else {
            // Créer un nouveau compte
            $accounts[$username] = [
                'password' => $password,
                'balance' => 0
            ];
            file_put_contents($file_path, json_encode($accounts));
            echo json_encode(['success' => 'Compte créé avec succès.']);
        }
    }

    // Connexion
    elseif ($action == 'login') {
        $username = $_POST['username'];
        $password = $_POST['password'];

        // Vérifier si le compte existe et si le mot de passe est correct
        if (isset($accounts[$username]) && $accounts[$username]['password'] == $password) {
            echo json_encode(['success' => 'Connexion réussie.', 'balance' => $accounts[$username]['balance']]);
        } else {
            echo json_encode(['error' => 'Identifiant ou mot de passe incorrect.']);
        }
    }

    // Mettre à jour le solde
    elseif ($action == 'update_balance') {
        $username = $_POST['username'];
        $balance = $_POST['balance'];

        // Vérifier si le compte existe
        if (isset($accounts[$username])) {
            $accounts[$username]['balance'] = $balance;
            file_put_contents($file_path, json_encode($accounts));
            echo json_encode(['success' => 'Solde mis à jour.']);
        } else {
            echo json_encode(['error' => 'Compte non trouvé.']);
        }
    }
} else {
    echo json_encode(['error' => 'Requête non supportée.']);
}
?>
