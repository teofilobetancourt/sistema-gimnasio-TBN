<?php
include_once "base_datos.php";

function obtenerPagos($filtros){
    $fechaInicio = (isset($filtros->fechaInicio)) ? $filtros->fechaInicio : FECHA_HOY;
    $fechaFin = (isset($filtros->fechaFin)) ? $filtros->fechaFin : FECHA_HOY;

    $sentencia = "SELECT pagos.fecha, pagos.monto, miembros.nombre, miembros.imagen, miembros.cedula, usuarios.usuario,
    IFNULL(membresias.nombre, 'VISITA REGULAR') AS membresia 
    FROM pagos
    LEFT JOIN membresias ON membresias.id = pagos.idMembresia
    LEFT JOIN miembros ON miembros.cedula = pagos.cedula
    LEFT JOIN usuarios ON usuarios.id = pagos.idUsuario
    WHERE DATE(pagos.fecha) >= ? AND DATE(pagos.fecha) <= ? ";
    $parametros = [$fechaInicio, $fechaFin];

    return selectPrepare($sentencia, $parametros);
}

function obtenerTotalesPago($filtros){
    $fechaInicio = (isset($filtros->fechaInicio)) ? $filtros->fechaInicio : FECHA_HOY;
    $fechaFin = (isset($filtros->fechaFin)) ? $filtros->fechaFin : FECHA_HOY;

    $sentencia = "SELECT IFNULL(SUM(monto),0) AS totalPagos FROM pagos WHERE DATE(fecha) >= ? AND DATE(fecha) <= ?";
    $parametros = [$fechaInicio, $fechaFin];
    return selectPrepare($sentencia, $parametros)[0]->totalPagos;
}

function obtenerTotalesMembresia($filtros){
    $fechaInicio = (isset($filtros->fechaInicio)) ? $filtros->fechaInicio : FECHA_HOY;
    $fechaFin = (isset($filtros->fechaFin)) ? $filtros->fechaFin : FECHA_HOY;

    $sentencia  = "SELECT SUM(pagos.monto) AS total, IFNULL(membresias.nombre, 'Visitas regular') AS nombre FROM pagos
    LEFT  JOIN membresias ON membresias.id = pagos.idMembresia
    WHERE DATE(pagos.fecha) >= ? AND DATE(pagos.fecha) <= ? 
    GROUP BY pagos.idMembresia
    ORDER BY total DESC";
    $parametros = [$fechaInicio, $fechaFin];
    return selectPrepare($sentencia, $parametros);
}

function obtenerTotalesPorUsuario($filtros){
    $fechaInicio = (isset($filtros->fechaInicio)) ? $filtros->fechaInicio : FECHA_HOY;
    $fechaFin = (isset($filtros->fechaFin)) ? $filtros->fechaFin : FECHA_HOY;

    $sentencia  = "SELECT SUM(pagos.monto) AS total, usuarios.usuario AS nombre FROM pagos
    INNER JOIN usuarios ON usuarios.id = pagos.idUsuario
    WHERE DATE(pagos.fecha) >= ? AND DATE(pagos.fecha) <= ? 
    GROUP BY pagos.idUsuario
    ORDER BY total DESC";
    $parametros = [$fechaInicio, $fechaFin];
    return selectPrepare($sentencia, $parametros);
}

function obtenerTotalesPorMiembro($filtros){
    $fechaInicio = (isset($filtros->fechaInicio)) ? $filtros->fechaInicio : FECHA_HOY;
    $fechaFin = (isset($filtros->fechaFin)) ? $filtros->fechaFin : FECHA_HOY;

    $sentencia  = "SELECT SUM(pagos.monto) AS total, miembros.nombre, miembros.cedula, miembros.imagen FROM pagos
    INNER JOIN miembros ON miembros.cedula = pagos.cedula
    WHERE DATE(pagos.fecha) >= ? AND DATE(pagos.fecha) <= ? 
    GROUP BY pagos.cedula
    ORDER BY total DESC
    LIMIT 5";
    $parametros = [$fechaInicio, $fechaFin];
    return selectPrepare($sentencia, $parametros);
}

function actualizarFechasMembresiaYGuardarRenovacion($cedula, $duracionDias) {
    global $conexion;

    $stmt = $conexion->prepare("SELECT fechaInicio, fechaFin FROM miembros WHERE cedula = ?");
    $stmt->bind_param("s", $cedula);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($fila = $resultado->fetch_assoc()) {
        $fechaFinActual = $fila['fechaFin']; // incluye hora
        $fechaHoy = date('Y-m-d H:i:s');
        $fechaRenovacion = date('Y-m-d H:i:s');

        // Comparar como timestamps
        if (strtotime($fechaFinActual) >= strtotime($fechaHoy)) {
            // SUMA sobre la fechaFin actual
            $nuevaFechaInicio = $fechaFinActual;
            $nuevaFechaFin = date('Y-m-d H:i:s', strtotime($fechaFinActual . " +$duracionDias days"));
        } else {
            // REINICIA desde hoy
            $nuevaFechaInicio = $fechaRenovacion;
            $nuevaFechaFin = date('Y-m-d H:i:s', strtotime("+$duracionDias days"));
        }

        // ✅ Actualiza en la tabla miembros
        $update = $conexion->prepare("UPDATE miembros SET fechaInicio = ?, fechaFin = ?, estado = 'ACTIVO' WHERE cedula = ?");
        $update->bind_param("sss", $nuevaFechaInicio, $nuevaFechaFin, $cedula);
        $update->execute();

        // ✅ Registra renovación
        $stmtRenovacion = $conexion->prepare("INSERT INTO renovaciones (cedula, fechaRenovacion, fechaInicioNueva, fechaFinNueva) VALUES (?, ?, ?, ?)");
        $stmtRenovacion->bind_param("ssss", $cedula, $fechaRenovacion, $nuevaFechaInicio, $nuevaFechaFin);
        $stmtRenovacion->execute();

        return [
            "exito" => true,
            "fechaAnterior" => $fechaFinActual,
            "duracion" => $duracionDias,
            "nuevaFechaFin" => $nuevaFechaFin
        ];
    }

    return [ "exito" => false, "mensaje" => "Miembro no encontrado" ];
}


function registrarPago($pago) {
    global $conexion;

    $cedula = $pago->cedula;
    $monto = $pago->pago;
    $idMembresia = $pago->idMembresia;
    $fechaPago = date('Y-m-d H:i:s');
    $duracion = isset($pago->duracion) ? intval($pago->duracion) : 30;
    $idUsuario = isset($pago->idUsuario) ? intval($pago->idUsuario) : null;

    // Registrar en pagos
    $stmtPago = $conexion->prepare("INSERT INTO pagos (cedula, monto, idMembresia, fecha, idUsuario) VALUES (?, ?, ?, ?, ?)");
    $stmtPago->bind_param("sdssi", $cedula, $monto, $idMembresia, $fechaPago, $idUsuario);
    $stmtPago->execute();

    // Actualizar fechas de membresía y registrar renovación
    return actualizarFechasMembresiaYGuardarRenovacion($cedula, $duracion);
}
