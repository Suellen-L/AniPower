
<?php
// config/database.php - Configuração do Banco de Dados
class Database {
    private $host = "localhost";
    private $db_name = "anime";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}


// ========================================
// animes.php - API para Animes

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getAnimes($db);
        break;
    case 'POST':
        createAnime($db);
        break;
    case 'PUT':
        updateAnime($db);
        break;
    case 'DELETE':
        deleteAnime($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getAnimes($db) {
    $query = "SELECT * FROM animes ORDER BY season, title";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $animes = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $animes[] = $row;
    }
    
    echo json_encode($animes);
}

function createAnime($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->title) && !empty($data->season)) {
        $query = "INSERT INTO animes SET title=:title, episodes=:episodes, year=:year, season=:season, emoji=:emoji";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":episodes", $data->episodes);
        $stmt->bindParam(":year", $data->year);
        $stmt->bindParam(":season", $data->season);
        $stmt->bindParam(":emoji", $data->emoji);
        
        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Anime criado com sucesso."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Não foi possível criar o anime."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Dados incompletos."));
    }
}

function updateAnime($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        $query = "UPDATE animes SET title=:title, episodes=:episodes, year=:year, season=:season, emoji=:emoji WHERE id=:id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":episodes", $data->episodes);
        $stmt->bindParam(":year", $data->year);
        $stmt->bindParam(":season", $data->season);
        $stmt->bindParam(":emoji", $data->emoji);
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "Anime atualizado com sucesso."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Não foi possível atualizar o anime."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "ID não fornecido."));
    }
}

function deleteAnime($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        $query = "DELETE FROM animes WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "Anime deletado com sucesso."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Não foi possível deletar o anime."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "ID não fornecido."));
    }
}
?>
// ========================================
// mangas.php - API para Mangás
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getMangas($db);
        break;
    case 'POST':
        createManga($db);
        break;
    case 'PUT':
        updateManga($db);
        break;
    case 'DELETE':
        deleteManga($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getMangas($db) {
    $query = "SELECT * FROM mangas ORDER BY category, title";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $mangas = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $mangas[] = $row;
    }
    
    echo json_encode($mangas);
}

function createManga($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->title) && !empty($data->category)) {
        $query = "INSERT INTO mangas SET title=:title, chapters=:chapters, status=:status, category=:category, emoji=:emoji";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":chapters", $data->chapters);
        $stmt->bindParam(":status", $data->status);
        $stmt->bindParam(":category", $data->category);
        $stmt->bindParam(":emoji", $data->emoji);
        
        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Mangá criado com sucesso."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Não foi possível criar o mangá."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Dados incompletos."));
    }
}

function updateManga($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        $query = "UPDATE mangas SET title=:title, chapters=:chapters, status=:status, category=:category, emoji=:emoji WHERE id=:id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":chapters", $data->chapters);
        $stmt->bindParam(":status", $data->status);
        $stmt->bindParam(":category", $data->category);
        $stmt->bindParam(":emoji", $data->emoji);
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "Mangá atualizado com sucesso."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Não foi possível atualizar o mangá."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "ID não fornecido."));
    }
}

function deleteManga($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        $query = "DELETE FROM mangas WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "Mangá deletado com sucesso."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Não foi possível deletar o mangá."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "ID não fornecido."));
    }
}

// ========================================
// search_history.php - API para Histórico de Pesquisa
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getSearchHistory($db);
        break;
    case 'POST':
        createSearchHistory($db);
        break;
    case 'DELETE':
        clearSearchHistory($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getSearchHistory($db) {
    $query = "SELECT * FROM search_history ORDER BY search_date DESC LIMIT 20";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $history = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $history[] = $row;
    }
    
    echo json_encode($history);
}

function createSearchHistory($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->query)) {
        // Verificar se a pesquisa já existe
        $checkQuery = "SELECT id FROM search_history WHERE query = :query";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":query", $data->query);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            $query = "INSERT INTO search_history SET query=:query, search_date=:search_date";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":query", $data->query);
            $stmt->bindParam(":search_date", $data->search_date);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Pesquisa salva com sucesso."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Não foi possível salvar a pesquisa."));
            }
        } else {
            // Atualizar data da pesquisa existente
            $updateQuery = "UPDATE search_history SET search_date=:search_date WHERE query=:query";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(":query", $data->query);
            $updateStmt->bindParam(":search_date", $data->search_date);
            $updateStmt->execute();
            
            echo json_encode(array("message" => "Pesquisa atualizada."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Query não fornecida."));
    }
}

function clearSearchHistory($db) {
    $query = "DELETE FROM search_history";
    $stmt = $db->prepare($query);
    
    if($stmt->execute()) {
        echo json_encode(array("message" => "Histórico limpo com sucesso."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Não foi possível limpar o histórico."));
    }
}

// ========================================
// database.sql - Script para criar o banco de dados
/*
CREATE DATABASE anime_app;
USE anime_app;

-- Tabela de Animes
CREATE TABLE animes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    episodes INT DEFAULT 0,
    year INT DEFAULT 2024,
    season ENUM('verao', 'outono', 'inverno', 'primavera') NOT NULL,
    emoji VARCHAR(10) DEFAULT '📺',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Mangás
CREATE TABLE mangas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    chapters INT DEFAULT 0,
    status ENUM('Ongoing', 'Completed', 'Hiatus') DEFAULT 'Ongoing',
    category ENUM('acao', 'romance', 'aventura', 'slice_of_life') NOT NULL,
    emoji VARCHAR(10) DEFAULT '📖',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Pesquisa
CREATE TABLE search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query VARCHAR(255) NOT NULL UNIQUE,
    search_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados iniciais para Animes
INSERT INTO animes (title, episodes, year, season, emoji) VALUES
('Attack on Titan', 24, 2024, 'verao', '🏛️'),
('Demon Slayer', 12, 2024, 'verao', '⚔️'),
('My Hero Academia', 25, 2024, 'verao', '🦸'),
('Jujutsu Kaisen', 24, 2024, 'verao', '👹'),
('Chainsaw Man', 12, 2024, 'outono', '🔗'),
('Spy x Family', 12, 2024, 'outono', '🕵️'),
('Mob Psycho 100', 12, 2024, 'outono', '👻'),
('Blue Lock', 24, 2024, 'outono', '⚽'),
('Tokyo Revengers', 24, 2024, 'inverno', '🏍️'),
('Horimiya', 13, 2024, 'inverno', '💕'),
('Dr. Stone', 11, 2024, 'inverno', '🧪'),
('The Promised Neverland', 11, 2024, 'inverno', '🏠'),
('Kaguya-sama', 12, 2024, 'primavera', '🎭'),
('One Punch Man', 12, 2024, 'primavera', '👊'),
('Overlord', 13, 2024, 'primavera', '💀'),
('Re:Zero', 25, 2024, 'primavera', '🔄');

-- Dados iniciais para Mangás
INSERT INTO mangas (title, chapters, status, category, emoji) VALUES
('One Piece', 1090, 'Ongoing', 'acao', '🏴‍☠️'),
('Naruto', 700, 'Completed', 'acao', '🍥'),
('Dragon Ball', 519, 'Completed', 'acao', '🐉'),
('Bleach', 686, 'Completed', 'acao', '⚔️'),
('Kaguya-sama wa Kokurasetai', 281, 'Completed', 'romance', '💕'),
('Rent-a-Girlfriend', 300, 'Ongoing', 'romance', '📱'),
('Toradora!', 87, 'Completed', 'romance', '🐅'),
('Nisekoi', 229, 'Completed', 'romance', '🔑'),
('Hunter x Hunter', 400, 'Hiatus', 'aventura', '🎯'),
('Fairy Tail', 545, 'Completed', 'aventura', '🧚'),
('Seven Deadly Sins', 346, 'Completed', 'aventura', '🗡️'),
('Black Clover', 370, 'Ongoing', 'aventura', '🍀'),
('Yotsuba&!', 110, 'Ongoing', 'slice_of_life', '🌸'),
('Azumanga Daioh', 69, 'Completed', 'slice_of_life', '🏫'),
('K-On!', 57, 'Completed', 'slice_of_life', '🎸'),
('Lucky Star', 83, 'Completed', 'slice_of_life', '⭐');
*/