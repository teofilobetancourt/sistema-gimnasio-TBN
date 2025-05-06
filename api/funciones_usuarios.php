<?php
include_once "base_datos.php";
define ("PASS_DEFECTO", "GimHunter123");

function registrarUsuario($usuario){
    $usuario->password = password_hash(PASS_DEFECTO, PASSWORD_DEFAULT);
    $sentencia = "INSERT INTO usuarios (usuario, nombre, telefono, password, rol) VALUES (?,?,?,?,?)";
    $parametros = [
        $usuario->usuario,
        $usuario->nombre,
        $usuario->telefono,
        $usuario->password,
        $usuario->rol
    ];
    return insertar($sentencia, $parametros);
}

function obtenerUsuarios(){
    $sentencia = "SELECT id, usuario, nombre, telefono, rol FROM usuarios";
    return selectQuery($sentencia);
}

function eliminarUsuario($id){
    $sentencia = "DELETE FROM usuarios WHERE id = ?";
    return eliminar($sentencia, $id);
}

function obtenerUsuarioPorId($id){
    $sentencia = "SELECT id, usuario, nombre, telefono, rol FROM usuarios WHERE id = ?";
    $parametros = [$id];
    return selectPrepare($sentencia, $parametros)[0];
}

function editarUsuario($usuario){
    $sentencia = "UPDATE usuarios SET usuario = ?, nombre = ?, telefono = ?, rol = ? WHERE id = ?";
    $parametros = [$usuario->usuario, $usuario->nombre, $usuario->telefono, $usuario->rol, $usuario->id];
    return editar($sentencia, $parametros);
}

function iniciarSesion($usuario){

    $sentencia = "SELECT id, usuario, nombre, password, rol FROM usuarios WHERE usuario = ?";
    $parametros  = [$usuario->usuario];

    $respuesta = selectPrepare($sentencia, $parametros);
    if (!$respuesta || count($respuesta) === 0) {
        return ["resultado" => false, "mensaje" => "Usuario no encontrado"];
    }

    $resultado = $respuesta[0];

    if (password_verify($usuario->password, $resultado->password)) {
        $usuarioLogeado = [
            "idUsuario" => $resultado->id,
            "nombreUsuario" => $resultado->nombre,
            "usuario" => $resultado->usuario,
            "rol" => $resultado->rol
        ];

        $verificaPass = verificarPassword(PASS_DEFECTO, $resultado->id);
        if ($verificaPass) {
            return ["resultado" => "cambia", "datos" => $usuarioLogeado];
        }

        return ["resultado" => true, "datos" => $usuarioLogeado];
    } else {
        return ["resultado" => false, "mensaje" => "Contraseña incorrecta"];
    }
}

function verificarPassword($password, $id){
    $sentencia = "SELECT password FROM usuarios  WHERE id = ?";
    $parametros = [$id];
    $respuesta = selectPrepare($sentencia, $parametros);
    if (!$respuesta || count($respuesta) === 0) return false;
    $usuario = $respuesta[0];

    $passwordVerifica = password_verify($password, $usuario->password);
    return $passwordVerifica ? true : false;
}

function cambiarPassword($password, $id){
    $nuevaPassword = password_hash($password, PASSWORD_DEFAULT);
    $sentencia = "UPDATE usuarios SET password = ? WHERE id = ?";
    $parametros = [$nuevaPassword, $id];
    return editar($sentencia, $parametros);
}

function obtenerTotalVisitas($idUsuario){
    $resultado = selectPrepare("SELECT COUNT(*) AS total FROM visitas WHERE idUsuario = ?", [$idUsuario]);
    if (!$resultado || count($resultado) === 0) return 0;
    return $resultado[0]->total;
}

function obtenerVisitasHoy($idUsuario){
    $resultado = selectPrepare("SELECT COUNT(*) AS total FROM visitas WHERE DATE(fecha) = CURDATE() AND idUsuario = ?", [$idUsuario]);
    if (!$resultado || count($resultado) === 0) return 0;
    return $resultado[0]->total;
}

function obtenerVisitasSemana($idUsuario){
    $resultado = selectPrepare("SELECT COUNT(*) AS total FROM visitas WHERE YEARWEEK(fecha)=YEARWEEK(CURDATE()) AND idUsuario = ?", [$idUsuario]);
    if (!$resultado || count($resultado) === 0) return 0;
    return $resultado[0]->total;
}

function obtenerVisitasMes($idUsuario){
    $resultado = selectPrepare("SELECT COUNT(*) AS total FROM visitas WHERE  MONTH(fecha) = MONTH(CURRENT_DATE())
        AND YEAR(fecha) = YEAR(CURRENT_DATE()) AND idUsuario = ?", [$idUsuario]);
    if (!$resultado || count($resultado) === 0) return 0;
    return $resultado[0]->total;
}

function obtenerTotalPagos($idUsuario){
    $resultado = selectPrepare("SELECT SUM(monto) AS total FROM pagos WHERE idUsuario = ?", [$idUsuario]);
    if (!$resultado || count($resultado) === 0) return 0;
    return $resultado[0]->total;
}
    
function obtenerPagosHoy($idUsuario){
    $resultado = selectPrepare("SELECT IFNULL(SUM(monto),0) AS total FROM pagos WHERE DATE(fecha) = CURDATE() AND idUsuario = ?", [$idUsuario]);
    if (!$resultado || count($resultado) === 0) return 0;
    return $resultado[0]->total;
}
    
function obtenerPagosSemana($idUsuario){
    $resultado = selectPrepare("SELECT IFNULL(SUM(monto), 0) AS total FROM pagos WHERE YEARWEEK(fecha)=YEARWEEK(CURDATE()) AND idUsuario = ?", [$idUsuario]);
    if (!$resultado || count($resultado) === 0) return 0;
    return $resultado[0]->total;
}
    
function obtenerPagosMes($idUsuario){
    $resultado = selectPrepare("SELECT SUM(monto) AS total FROM pagos WHERE  MONTH(fecha) = MONTH(CURRENT_DATE())
        AND YEAR(fecha) = YEAR(CURRENT_DATE()) AND idUsuario = ?", [$idUsuario]);
    if (!$resultado || count($resultado) === 0) return 0;
    return $resultado[0]->total;
}