<?php
include_once "base_datos.php";

// === FUNCIONES DE VISITAS (SE MANTIENEN) ===
function obtenerTotalVisitas(){
    $sentencia  = "SELECT COUNT(*) AS total FROM visitas";
    return selectQuery($sentencia)[0]->total;
}
function obtenerVisitasHoy(){
    $sentencia = "SELECT COUNT(*) AS total FROM visitas WHERE DATE(fecha) = CURDATE()";
    return selectQuery($sentencia)[0]->total;
}
function obtenerVisitasSemana(){
    $sentencia = "SELECT COUNT(*) AS total FROM visitas WHERE YEARWEEK(fecha)=YEARWEEK(CURDATE())";
    return selectQuery($sentencia)[0]->total;
}
function obtenerVisitasMes(){
    $sentencia = "SELECT COUNT(*) AS total FROM visitas WHERE  MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE())";
    return selectQuery($sentencia)[0]->total;
}
function obtenerVisitasHora(){
    $sentencia = "SELECT CONCAT(DATE_FORMAT(fecha,'%H'), 'hrs') AS hora, COUNT(*) AS numeroVisitas FROM visitas GROUP BY DATE_FORMAT(fecha,'%H') ORDER BY hora ASC";
    return selectQuery($sentencia);
}
function obtenerVisitasDiasSemana() {
    $sentencia = "SELECT DAYNAME(fecha) AS dia, DAYOFWEEK(fecha) AS numeroDia, COUNT(*) AS numeroVisitas FROM visitas WHERE YEARWEEK(fecha)=YEARWEEK(CURDATE()) GROUP BY dia ORDER BY fecha ASC";
    return selectQuery($sentencia);
}
function obtenerVisitasPorDiaMes(){
    $sentencia = "SELECT DAY(fecha) AS dia, COUNT(*) AS numeroVisitas FROM visitas WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE()) GROUP BY dia ORDER BY dia ASC";
    return selectQuery($sentencia);
}

// === FUNCIONES DE PAGOS (SE MANTIENEN) ===
function obtenerTotalPagos(){
    $sentencia  = "SELECT SUM(monto) AS total FROM pagos";
    return selectQuery($sentencia)[0]->total;
}
function obtenerPagosHoy(){
    $sentencia = "SELECT IFNULL(SUM(monto),0) AS total FROM pagos WHERE DATE(fecha) = CURDATE()";
    return selectQuery($sentencia)[0]->total;
}
function obtenerPagosSemana(){
    $sentencia = "SELECT IFNULL(SUM(monto), 0) AS total FROM pagos WHERE YEARWEEK(fecha)=YEARWEEK(CURDATE())";
    return selectQuery($sentencia)[0]->total;
}
function obtenerPagosMes(){
    $sentencia = "SELECT IFNULL(SUM(monto),0) AS total FROM pagos WHERE  MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE())";
    return selectQuery($sentencia)[0]->total;
}
function obtenerPagosDiasSemana() {
    $sentencia = "SELECT DAYNAME(fecha) AS dia, DAYOFWEEK(fecha) AS numeroDia, SUM(monto) AS total FROM pagos WHERE YEARWEEK(fecha)=YEARWEEK(CURDATE()) GROUP BY dia ORDER BY fecha ASC";
    return selectQuery($sentencia);
}
function obtenerPagosPorDiaMes(){
    $sentencia = "SELECT DAY(fecha) AS dia, SUM(monto) AS total FROM pagos WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE()) GROUP BY dia ORDER BY dia ASC";
    return selectQuery($sentencia);
}
function obtenerPagosPorMeses(){
    $sentencia = "SELECT MONTH(fecha) AS mes, IFNULL(SUM(monto),0) AS total FROM pagos WHERE YEAR(fecha) = YEAR(CURRENT_DATE()) GROUP BY MONTH(fecha) ORDER BY mes ASC";
    return selectQuery($sentencia);
}

// === NUEVAS FUNCIONES DE MEMBRESÍAS DESDE LA TABLA "miembros" ===
// === FUNCIONES DE MEMBRESÍAS ===

function obtenerMembresiasHoy() {
    $sql = "SELECT COUNT(*) AS total FROM miembros WHERE DATE(fechaInicio) = CURDATE()";
    return selectQuery($sql)[0]->total;
}

function obtenerMembresiasSemana() {
    $sql = "SELECT COUNT(*) AS total FROM miembros WHERE YEARWEEK(fechaInicio) = YEARWEEK(CURDATE())";
    return selectQuery($sql)[0]->total;
}

function obtenerMembresiasMes() {
    $sql = "SELECT COUNT(*) AS total FROM miembros WHERE MONTH(fechaInicio) = MONTH(CURRENT_DATE()) AND YEAR(fechaInicio) = YEAR(CURRENT_DATE())";
    return selectQuery($sql)[0]->total;
}

function obtenerTotalMembresias() {
    $sql = "SELECT COUNT(*) AS total FROM miembros";
    return selectQuery($sql)[0]->total;
}

function obtenerMembresiasVencidas() {
    $sql = "SELECT DATE(fechaFin) AS fecha, COUNT(*) AS total FROM miembros WHERE estado = 'VENCIDO' GROUP BY fecha ORDER BY fecha ASC";
    return selectQuery($sql);
}

function obtenerMembresiasPorVencer() {
    $sql = "SELECT DATE(fechaFin) AS fecha, COUNT(*) AS total
            FROM miembros
            WHERE estado = 'ACTIVO' AND fechaFin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
            GROUP BY fecha ORDER BY fecha ASC";
    return selectQuery($sql);
}

function obtenerMembresiasActivas() {
    $sql = "SELECT DATE(fechaInicio) AS fecha, COUNT(*) AS total FROM miembros WHERE estado = 'ACTIVO' GROUP BY fecha ORDER BY fecha ASC";
    return selectQuery($sql);
}

function obtenerMiembrosVencidos() {
    $sentencia = "SELECT nombre, cedula FROM miembros WHERE estado = 'VENCIDO'";
    return select($sentencia);
}

function obtenerMiembrosPorVencer() {
    $sentencia = "SELECT nombre, cedula FROM miembros WHERE estado = 'ACTIVO' AND DATEDIFF(fechaFin, CURDATE()) <= 3 AND DATEDIFF(fechaFin, CURDATE()) >= 0";
    return select($sentencia);
}

function obtenerMiembrosActivos() {
    $sentencia = "SELECT nombre, cedula FROM miembros WHERE estado = 'ACTIVO'";
    return select($sentencia);
}



function obtenerPagosTotal() {
    $sql = "SELECT COUNT(*) AS cantidad FROM pagos";
    return select($sql)[0]['cantidad'];
}