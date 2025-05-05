<?php
include_once "encabezado.php";

try {
    $payload = json_decode(file_get_contents("php://input"));
    if (!$payload) {
        throw new Exception("No se recibieron datos válidos.");
    }

    include_once "funciones_miembros.php";

    $metodo = $payload->metodo ?? null;
    if (!$metodo) {
        throw new Exception("No se especificó ningún método.");
    }

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
            $duracion = intval($payload->duracion); // duración en días

            $query = "SELECT fechaFin FROM miembros WHERE cedula = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("s", $cedula);
            $stmt->execute();
            $result = $stmt->get_result();
            $miembro = $result->fetch_assoc();

            if ($miembro) {
                $fechaFin = $miembro['fechaFin'];
                $fechaFinSoloFecha = substr($fechaFin, 0, 10); // cortar hora
                $hoy = new DateTime(); // hoy completo con hora
                $fechaFinDate = DateTime::createFromFormat("Y-m-d", $fechaFinSoloFecha);

                $log = "FECHA HOY: " . $hoy->format("Y-m-d") . "\n";
                $log .= "FECHA FIN ACTUAL: " . $fechaFinSoloFecha . "\n";
                $log .= "DURACIÓN RECIBIDA: $duracion días\n";

                if ($fechaFinDate && $fechaFinDate >= new DateTime($hoy->format("Y-m-d"))) {
                    // Si todavía está activo, se suma sobre la fecha de fin
                    $nuevaFechaFinObj = clone $fechaFinDate;
                    $nuevaFechaFinObj->modify("+$duracion days");
                    $nuevaFechaFin = $nuevaFechaFinObj->format("Y-m-d H:i:s");
                    $nuevaFechaInicio = $miembro['fechaFin'];
                    $log .= "➡ SUMANDO SOBRE FECHA FIN ACTUAL => $nuevaFechaFin\n";
                } else {
                    // Si ya está vencido, reiniciar desde hoy
                    $nuevaFechaInicio = $hoy->format("Y-m-d H:i:s");
                    $nuevaFechaFinObj = clone $hoy;
                    $nuevaFechaFinObj->modify("+$duracion days");
                    $nuevaFechaFin = $nuevaFechaFinObj->format("Y-m-d H:i:s");
                    $log .= "🔁 REINICIANDO DESDE HOY => $nuevaFechaFin\n";
                }

                // Actualizar BD
                $queryUpdate = "UPDATE miembros SET fechaInicio = ?, fechaFin = ?, estado = 'ACTIVO' WHERE cedula = ?";
                $stmtUpdate = $conn->prepare($queryUpdate);
                $stmtUpdate->bind_param("sss", $nuevaFechaInicio, $nuevaFechaFin, $cedula);
                $stmtUpdate->execute();

                error_log($log); // mostrar en error.log

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
?>
