<?php
include_once "base_datos.php";

date_default_timezone_set("America/Caracas"); // Zona horaria correcta

function registrarMiembro($miembro) {
    $cedula = $miembro->cedula;
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
    if ($resultado) return $cedula;
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
    if (!isset($pago->cedula) || !isset($pago->idMembresia) || !isset($pago->idUsuario) || !isset($pago->pago)) {
        return ["error" => "Datos incompletos para registrar el pago."];
    }

    $monto = floatval(str_replace(',', '.', $pago->pago));
    $fechaActual = date("Y-m-d H:i:s");

    $sentencia = "INSERT INTO pagos (cedula, idMembresia, idUsuario, fecha, monto) VALUES (?,?,?,?,?)";
    $parametros = [$pago->cedula, $pago->idMembresia, $pago->idUsuario, $fechaActual, $monto];

    $pagoRegistrado = insertar($sentencia, $parametros);

    if ($pagoRegistrado) {
        return actualizarMembresia($pago->cedula, $pago->idMembresia, $pago->duracion, $pago->fecha);
    } else {
        return ["error" => "No se pudo registrar el pago."];
    }
}

function actualizarMembresia($cedula, $idMembresia, $duracion, $fechaInicio = null) {
    $query = "SELECT estado, fechaFin FROM miembros WHERE cedula = ?";
    $datos = selectPrepare($query, [$cedula])[0];

    $estado = $datos->estado;
    $fechaFinActual = $datos->fechaFin;

    if ($estado === 'ACTIVO' && !empty($fechaFinActual)) {
        // Sumar duración a fechaFin actual
        $nuevaFechaFin = date("Y-m-d H:i:s", strtotime("$fechaFinActual +$duracion days"));
        $sentencia = "UPDATE miembros SET idMembresia = ?, fechaFin = ? WHERE cedula = ?";
        $parametros = [$idMembresia, $nuevaFechaFin, $cedula];
    } else {
        // VENCIDO o sin fechaFin, usar fecha de inicio nueva
        if (empty($fechaInicio)) {
            $fechaInicioCompleta = date("Y-m-d H:i:s");
        } else {
            $fechaInicioCompleta = (strlen($fechaInicio) <= 10)
                ? date("Y-m-d H:i:s", strtotime($fechaInicio . ' ' . date("H:i:s")))
                : date("Y-m-d H:i:s", strtotime($fechaInicio));
        }

        $nuevaFechaFin = date("Y-m-d H:i:s", strtotime("$fechaInicioCompleta +$duracion days"));
        $sentencia = "UPDATE miembros SET idMembresia = ?, estado = ?, fechaInicio = ?, fechaFin = ? WHERE cedula = ?";
        $parametros = [$idMembresia, 'ACTIVO', $fechaInicioCompleta, $nuevaFechaFin, $cedula];
    }

    return actualizar($sentencia, $parametros);
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
