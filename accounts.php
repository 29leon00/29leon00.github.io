<?php
$filename = 'accounts.txt';

// Lire les comptes du fichier
function readAccounts() {
    global $filename;
    if (!file_exists($filename)) {
        return [];
    }
    $content = file_get_contents($filename);
    return json_decode($content, true) ?? [];
}

// Sauvegarder les comptes dans le fichier
function saveAccounts($accounts) {
    global $filename;
    file_put_contents($filename, json_encode($accounts));
}

// Gérer les requêtes POST pour les actions sur les comptes
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $accounts = readAccounts();

    // Création de compte
    if (isset($data['action']) && $data['action'] === 'create') {
        if (isset($accounts[$data['username']])) {
            http_response_code(400);
            echo json_encode(['message' => 'Le nom d\'utilisateur existe déjà.']);
        } else {
            $accounts[$data['username']] = [
                'password' => $data['password'],
                'balance' => 0
            ];
            saveAccounts($accounts);
            echo json_encode(['message' => 'Compte créé avec succès.']);
        }
        exit;
    }

    // Connexion
    if (isset($data['action']) && $data['action'] === 'login') {
        if (isset($accounts[$data['username']]) && $accounts[$data['username']]['password'] === $data['password']) {
            echo json_encode(['balance' => $accounts[$data['username']]['balance']]);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Nom d\'utilisateur ou mot de passe incorrect.']);
        }
        exit;
    }

    // Mise à jour du solde
    if (isset($data['action']) && $data['action'] === 'update') {
        if (isset($accounts[$data['username']])) {
            $accounts[$data['username']]['balance'] = $data['balance'];
            saveAccounts($accounts);
            echo json_encode(['message' => 'Solde mis à jour.']);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Utilisateur non trouvé.']);
        }
        exit;
    }
}
?>
