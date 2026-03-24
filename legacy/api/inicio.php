<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

include_once "encabezado.php";
include_once "funciones_inicio.php";

$payload = json_decode(file_get_contents("php://input"));
if (!$payload) {
    http_response_code(500);
    exit;
}

if (isset($payload->metodo) && $payload->metodo === "obtener") {
    echo json_encode([
        // Visitas actuales (con datos de membresías)
        "datosVisitas" => [
            "visitasHoy" => obtenerMembresiasHoy(),
            "visitasSemana" => obtenerMembresiasSemana(),
            "visitasMes" => obtenerMembresiasMes(),
            "totalVisitas" => obtenerTotalMembresias(),
        ],

        // Pagos
        "datosPagos" => [
            "totalPagos" => obtenerTotalPagos(),
            "pagosHoy" => obtenerPagosHoy(),
            "pagosSemana" => obtenerPagosSemana(),
            "pagosMes" => obtenerPagosMes(),
        ],

        // Métricas de membresías
        "membresiasHoy" => obtenerMembresiasHoy(),
        "membresiasSemana" => obtenerMembresiasSemana(),
        "membresiasMes" => obtenerMembresiasMes(),
        "membresiasTotales" => obtenerTotalMembresias(),

        "membresiasVencidas" => obtenerMembresiasVencidas(),
        "membresiasPorVencer" => obtenerMembresiasPorVencer(),
        "membresiasActivas" => obtenerMembresiasActivas(),

        // Miembros por estado (nombres para la vista)
        "miembrosVencidos" => obtenerMiembrosVencidos(),
        "miembrosPorVencer" => obtenerMiembrosPorVencer(),
        "miembrosActivos" => obtenerMiembrosActivos(),

        // Gráficas de pagos
        "pagosSemana" => obtenerPagosDiasSemana(),
        "pagosMes" => obtenerPagosPorDiaMes(),
        "pagosMeses" => obtenerPagosPorMeses(),
    ]);
    exit;
}

echo json_encode(["error" => "Parámetro no válido"]);
