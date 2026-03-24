<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Prueba de Base de Datos</h1>";

try {
    $host = "localhost";
    $db   = "sistema_gimnasio";
    $user = "root";
    $pass = "";
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass);
    
    echo "<h2 style='color:green'>¡CONEXIÓN EXITOSA!</h2>";
    echo "La base de datos '$db' responde correctamente.";
    
} catch (PDOException $e) {
    echo "<h2 style='color:red'>ERROR DE CONEXIÓN</h2>";
    echo "<b>Mensaje:</b> " . $e->getMessage() . "<br>";
    echo "<br><b>Solución:</b><br>";
    echo "1. Asegúrate de que MySQL esté en verde en XAMPP.<br>";
    echo "2. Revisa que la base de datos '$db' exista en phpMyAdmin.";
}
?>
