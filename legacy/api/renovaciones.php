<?php
include_once "base_datos.php";

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"));
$metodo = $input->metodo ?? '';

switch ($metodo) {
  case 'obtenerRenovaciones':
    echo json_encode(obtenerHistorialRenovaciones($input->cedula));
    break;
}

function obtenerHistorialRenovaciones($cedula) {
  global $conexion;
  $stmt = $conexion->prepare("SELECT id, fechaRenovacion, fechaInicioNueva, fechaFinNueva FROM renovaciones WHERE cedula = ? ORDER BY fechaRenovacion DESC");
  $stmt->bind_param("s", $cedula);
  $stmt->execute();
  $result = $stmt->get_result();
  $renovaciones = [];
  while ($row = $result->fetch_assoc()) {
    $renovaciones[] = $row;
  }
  return $renovaciones;
}
