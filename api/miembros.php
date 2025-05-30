<?php
// 🔐 CORS antes de cualquier salida
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// 🔁 Si es una petición de tipo OPTIONS (preflight), responder OK y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once "base_datos.php";
include_once "encabezado.php";

try {
    $payload = json_decode(file_get_contents("php://input"));

    if (isset($payload->accion) && $payload->accion === "obtenerMiembro") {
        $nombre = $payload->nombre ?? '';
        $cedula = $payload->cedula ?? '';

        if (!$nombre || !$cedula) {
            throw new Exception("Nombre o cédula faltante.");
        }

        $conn = conectarBaseDatos(); // ✅ Usamos PDO

        $query = "SELECT nombre, cedula, edad, telefono, direccion, institucion,
                 idMembresia AS membresia, estado, fechaInicio, fechaFin
          FROM miembros
          WHERE nombre = ? AND cedula = ?
          LIMIT 1";


        $stmt = $conn->prepare($query);
        $stmt->execute([$nombre, $cedula]);
        $miembro = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode($miembro ?: []);
        exit;
    }

    if (!$payload) {
        throw new Exception("No se recibieron datos válidos.");
    }

    include_once "funciones_miembros.php";

    $metodo = $payload->metodo ?? null;
    if (!$metodo) {
        throw new Exception("No se especificó ningún método.");
    }

    $conn = conectarBaseDatos(); // Conexión PDO usada en métodos siguientes

    switch ($metodo) {
        case "registrar":
            echo json_encode(registrarMiembro($payload->miembro));
            break;

        case "get":
            echo json_encode(obtenerMiembros());
            break;

        case "eliminar":
            echo json_encode(eliminarMiembro($payload->id));
            break;

        case "editar":
            echo json_encode(editarMiembro($payload->miembro));
            break;

        case "pagar":
            try {
                $resultado = registrarPago($payload->pago);
                echo json_encode(["exito" => true, "resultado" => $resultado]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["error" => "Error en registrarPago: " . $e->getMessage()]);
            }
            break;

        case "renovar":
            $cedula = $payload->cedula;
            $duracion = intval($payload->duracion);

            $query = "SELECT fechaFin FROM miembros WHERE cedula = ?";
            $stmt = $conn->prepare($query);
            $stmt->execute([$cedula]);
            $miembro = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($miembro) {
                $fechaFin = $miembro['fechaFin'];
                $fechaFinSoloFecha = substr($fechaFin, 0, 10);
                $hoy = new DateTime();
                $fechaFinDate = DateTime::createFromFormat("Y-m-d", $fechaFinSoloFecha);

                if ($fechaFinDate && $fechaFinDate >= new DateTime($hoy->format("Y-m-d"))) {
                    $nuevaFechaFinObj = clone $fechaFinDate;
                    $nuevaFechaFinObj->modify("+$duracion days");
                    $nuevaFechaFin = $nuevaFechaFinObj->format("Y-m-d H:i:s");
                    $nuevaFechaInicio = $miembro['fechaFin'];
                } else {
                    $nuevaFechaInicio = $hoy->format("Y-m-d H:i:s");
                    $nuevaFechaFinObj = clone $hoy;
                    $nuevaFechaFinObj->modify("+$duracion days");
                    $nuevaFechaFin = $nuevaFechaFinObj->format("Y-m-d H:i:s");
                }

                $queryUpdate = "UPDATE miembros SET fechaInicio = ?, fechaFin = ?, estado = 'ACTIVO' WHERE cedula = ?";
                $stmtUpdate = $conn->prepare($queryUpdate);
                $stmtUpdate->execute([$nuevaFechaInicio, $nuevaFechaFin, $cedula]);

                echo json_encode([
                    "exito" => true,
                    "fechaAnterior" => $fechaFinSoloFecha,
                    "duracion" => $duracion,
                    "nuevaFechaFin" => $nuevaFechaFin
                ]);
            } else {
                echo json_encode(["exito" => false, "mensaje" => "Miembro no encontrado"]);
            }
            break;

        case "obtener_nombre_cedula":
            echo json_encode(obtenerMiembroNombreCedula($payload->busqueda));
            break;

        case "obtener_imagen":
            echo json_encode(obtenerImagenPorCedula($payload->cedula));
            break;

        case "obtener_id":
            echo json_encode(obtenerPorId($payload->id));
            break;

        default:
            throw new Exception("Método no válido.");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["error" => $e->getMessage()]);
}
