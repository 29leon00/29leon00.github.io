<?php
// Liste des comptes stockés directement dans le fichier PHP
$accounts = [
    '29leon00' => [
        'password' => 'Mahe25892589',
        'balance' => 0
    ],
    'exampleUser' => [
        'password' => 'examplePass',
        'balance' => 100
    ]
];

// Créer une fonction pour sauvegarder les comptes dans le fichier PHP
function saveAccounts($accounts) {
    $accountsString = var_export($accounts, true);
    $phpCode = "<?php\n\$accounts = $accountsString;\n?>";
    file_put_contents(__FILE__, $phpCode);
}

// Authentification et gestion du solde
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Connexion
    if (isset($data['action']) && $data['action'] === 'login') {
        $username = $data['username'];
        $password = $data['password'];

        if (isset($accounts[$username]) && $accounts[$username]['password'] === $password) {
            echo json_encode(['balance' => $accounts[$username]['balance']]);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Nom d\'utilisateur ou mot de passe incorrect.']);
        }
        exit;
    }

    // Mise à jour du solde
    if (isset($data['action']) && $data['action'] === 'update') {
        $username = $data['username'];
        $balance = $data['balance'];

        if (isset($accounts[$username])) {
            $accounts[$username]['balance'] = $balance;
            saveAccounts($accounts);  // Sauvegarder les modifications
            echo json_encode(['message' => 'Solde mis à jour.']);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Utilisateur non trouvé.']);
        }
        exit;
    }

    // Création de compte
    if (isset($data['action']) && $data['action'] === 'create') {
        $username = $data['username'];
        $password = $data['password'];

        if (isset($accounts[$username])) {
            http_response_code(400);
            echo json_encode(['message' => 'Le nom d\'utilisateur existe déjà.']);
        } else {
            $accounts[$username] = [
                'password' => $password,
                'balance' => 0
            ];
            saveAccounts($accounts);  // Sauvegarder le nouveau compte
            echo json_encode(['message' => 'Compte créé avec succès.']);
        }
        exit;
    }
}
?>
