function getKPIs() {
  var hoy         = new Date();
  var mes         = hoy.getMonth() + 1;
  var anio        = hoy.getFullYear();
  var mesPrev     = mes === 1 ? 12 : mes - 1;
  var anioPrev    = mes === 1 ? anio - 1 : anio;

  var ventasMes      = getVentas({ mes: String(mes),     anio: String(anio) });
  var ventasAnt      = getVentas({ mes: String(mesPrev), anio: String(anioPrev) });

  var totalMes       = ventasMes.reduce(function(a, v) { return a + v.total; }, 0);
  var totalAnt       = ventasAnt.reduce(function(a, v) { return a + v.total; }, 0);
  var gananciasMes   = ventasMes.reduce(function(a, v) { return a + v.gananciaReal; }, 0);

  var movCaja        = getCaja({});
  var saldoCaja      = movCaja.length > 0 ? movCaja[movCaja.length - 1].saldoAcumulado : 0;

  var productos      = getProductos({ soloActivos: 'true' });
  var stockCritico   = productos.filter(function(p) { return p.stock <= p.stockMinimo && p.stockMinimo > 0; }).length;

  var cuotas         = getCuotas({});
  var cuotasVencidas = cuotas.filter(function(c) { return c.estado === 'vencida'; }).length;
  var cuotasPend     = cuotas.filter(function(c) { return c.estado === 'pendiente' || c.estado === 'parcial'; }).length;

  return {
    ventasMes:             totalMes,
    ventasMesAnterior:     totalAnt,
    gananciasMes:          gananciasMes,
    saldoCaja:             saldoCaja,
    productosStockCritico: stockCritico,
    cuotasVencidas:        cuotasVencidas,
    cuotasPendientesMes:   cuotasPend,
    topProductos:          [],
  };
}
