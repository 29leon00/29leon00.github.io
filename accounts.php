<?php
$filename = 'accounts.json';

// Récupérer les données des comptes
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($filename)) {
        echo file_get_contents($filename);
    } else {
        echo json_encode([]);
    }
}

// Créer ou mettre à jour un compte
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $accounts = [];

    if (file_exists($filename)) {
        $accounts = json_decode(file_get_contents($filename), true);
    }

    // Vérifier si c'est une création de compte
    if (isset($data['action']) && $data['action'] === 'create') {
        if (isset($accounts[$data['username']])) {
            http_response_code(400);
            echo json_encode(['message' => 'Le nom d\'utilisateur existe déjà.']);
            exit;
        }
        $accounts[$data['username']] = [
            'password' => $data['password'],
            'balance' => 0
        ];
        file_put_contents($filename, json_encode($accounts));
        echo json_encode(['message' => 'Compte créé avec succès.']);
        exit;
    }

    // Authentifier l'utilisateur
    if (isset($data['action']) && $data['action'] === 'login') {
        if (isset($accounts[$data['username']]) && $accounts[$data['username']]['password'] === $data['password']) {
            echo json_encode(['balance' => $accounts[$data['username']]['balance']]);
            exit;
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Nom d\'utilisateur ou mot de passe incorrect.']);
            exit;
        }
    }

    // Mettre à jour le solde
    if (isset($data['action']) && $data['action'] === 'update') {
        if (isset($accounts[$data['username']])) {
            $accounts[$data['username']]['balance'] = $data['balance'];
            file_put_contents($filename, json_encode($accounts));
            echo json_encode(['message' => 'Solde mis à jour.']);
            exit;
        }
    }
}
?>
