function getProductos(params) {
  var sheet   = getSheet('PRODUCTOS');
  var data    = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var rows    = data.slice(1).filter(function(r) { return r[0]; });

  var productos = rows.map(function(r) {
    var o = rowToObj(headers, r);
    return {
      sku:               String(o['SKU']),
      nombre:            String(o['Nombre']),
      descripcion:       String(o['Descripción'] || ''),
      categoria:         String(o['Categoría']   || ''),
      precioCompra:      Number(o['Precio Compra'])        || 0,
      precioVentaSinIva: Number(o['Precio Venta s/IVA'])  || 0,
      precioVentaConIva: Number(o['Precio Venta c/IVA'])  || 0,
      margen:            Number(o['Margen %'])             || 0,
      stock:             Number(o['Stock'])                || 0,
      stockMinimo:       Number(o['Stock Mínimo'])         || 0,
      proveedor:         String(o['Proveedor']             || ''),
      activo:            o['Activo'] !== false && o['Activo'] !== 'NO',
    };
  });

  if (params && params.soloActivos === 'true') {
    productos = productos.filter(function(p) { return p.activo; });
  }

  return productos;
}

function addProducto(body) {
  var sheet  = getSheet('PRODUCTOS');
  var config = getConfig();
  var iva    = 1 + (config.iva / 100);

  var sku          = 'SKU-' + String(sheet.getLastRow()).padStart(4, '0');
  var precioConIva = body.precioVentaSinIva * iva;
  var margen       = body.precioCompra > 0
    ? ((body.precioVentaSinIva - body.precioCompra) / body.precioCompra) * 100
    : 0;

  sheet.appendRow([
    sku, body.nombre, body.descripcion || '', body.categoria || '',
    body.precioCompra, body.precioVentaSinIva, precioConIva,
    margen.toFixed(2) + '%', body.stockMinimo || 0, body.proveedor || '', 'SI'
  ]);

  return { sku: sku };
}
