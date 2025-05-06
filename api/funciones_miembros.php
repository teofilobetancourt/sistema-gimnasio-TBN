<?php
include_once "base_datos.php";

function registrarMiembro($miembro) {
    $cedula = $miembro->cedula; // ✅ ahora usamos la cédula ingresada
    $imagen = ($miembro->imagen) ? obtenerImagen($miembro->imagen) : './imagenes/usuario.png';

    $sentencia = "INSERT INTO miembros (cedula, nombre, telefono, direccion, edad,
    sufreEnfermedad, tieneSeguro, enfermedad, institucion,
    nombreContacto, telefonoContacto, imagen, fechaRegistro)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

    $parametros = [
        $cedula,
        $miembro->nombre,
        $miembro->telefono,
        $miembro->direccion,
        $miembro->edad,
        $miembro->sufreEnfermedad,
        $miembro->tieneSeguro,
        $miembro->enfermedad,
        $miembro->institucion,
        $miembro->nombreContacto,
        $miembro->telefonoContacto,
        $imagen,
        date("Y-m-d H:i:s")
    ];

    $resultado = insertar($sentencia, $parametros);
    if ($resultado) return $cedula; // ✅ devolvemos la cédula registrada
}

function obtenerMiembros() {
    $sentencia = "SELECT miembros.*, membresias.nombre AS membresia 
    FROM miembros
    LEFT JOIN membresias ON membresias.id = miembros.idMembresia";
    $miembros = selectQuery($sentencia);
    return verificarMembresia($miembros);
}

function obtenerMiembroNombreCedula($busqueda) {
    $sentencia = "SELECT miembros.*, membresias.nombre AS membresia, membresias.id AS idMembresia
    FROM miembros
    LEFT JOIN membresias ON membresias.id = miembros.idMembresia
    WHERE (miembros.nombre LIKE ? OR miembros.cedula LIKE ?)";
    $parametros = ["%$busqueda%", "%$busqueda%"];
    return selectPrepare($sentencia, $parametros);
}

function registrarPago($pago) {
    if (!isset($pago->cedula) || !isset($pago->idMembresia) || !isset($pago->idUsuario) || !isset($pago->fecha) || !isset($pago->pago)) {
        return ["error" => "Datos incompletos para registrar el pago."];
    }

    $monto = floatval(str_replace(',', '.', $pago->pago));

    $sentencia = "INSERT INTO pagos (cedula, idMembresia, idUsuario, fecha, monto) VALUES (?,?,?,?,?)";
    $parametros = [$pago->cedula, $pago->idMembresia, $pago->idUsuario, $pago->fecha, $monto];

    $pagoRegistrado = insertar($sentencia, $parametros);

    if ($pagoRegistrado) {
        return actualizarMembresia($pago->cedula, $pago->idMembresia, $pago->duracion);
    } else {
        return ["error" => "No se pudo registrar el pago."];
    }
}

function actualizarMembresia($cedula, $idMembresia, $duracion) {
    $sentencia = "UPDATE miembros SET idMembresia = ?, estado = ?, fechaInicio = ?, fechaFin = DATE_ADD(fechaInicio, INTERVAL ? DAY) WHERE cedula = ?";
    $parametros = [$idMembresia, 'ACTIVO', date("Y-m-d H:i:s"), $duracion, $cedula];
    return editar($sentencia, $parametros);
}

function verificarMembresia($miembros) {
    foreach ($miembros as $miembro) {
        if (!empty($miembro->fechaFin) && $miembro->fechaFin < date("Y-m-d H:i:s")) {
            marcarMembresiaVencida($miembro->id);
        }
    }
    return $miembros;
}

function marcarMembresiaVencida($id) {
    $sentencia = "UPDATE miembros SET estado = ? WHERE id = ?";
    $parametros = ['VENCIDO', $id];
    editar($sentencia, $parametros);
}

function obtenerPorId($id) {
    $sentencia = "SELECT * FROM miembros WHERE id = ?";
    $parametros = [$id];
    return selectPrepare($sentencia, $parametros)[0];
}

function eliminarMiembro($id) {
    $sentencia = "DELETE FROM miembros WHERE id = ?";
    return eliminar($sentencia, $id);
}

function editarMiembro($miembro) {
    $miembro->imagen = ($miembro->imagenCambia) ? obtenerImagen($miembro->imagen) : $miembro->imagen;

    $sentencia = "UPDATE miembros SET nombre = ?, telefono = ?, direccion = ?, edad = ?,
    sufreEnfermedad = ?, tieneSeguro = ?, enfermedad = ?, institucion = ?,
    nombreContacto = ?, telefonoContacto = ?, imagen = ? WHERE id = ?";

    $parametros = [
        $miembro->nombre,
        $miembro->telefono,
        $miembro->direccion,
        $miembro->edad,
        $miembro->sufreEnfermedad,
        $miembro->tieneSeguro,
        $miembro->enfermedad,
        $miembro->institucion,
        $miembro->nombreContacto,
        $miembro->telefonoContacto,
        $miembro->imagen,
        $miembro->id
    ];

    return editar($sentencia, $parametros);
}

function obtenerImagenPorCedula($cedula) {
    $sentencia = "SELECT imagen FROM miembros WHERE cedula = ?";
    return selectPrepare($sentencia, [$cedula])[0];
}
