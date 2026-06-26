function getClientes(params) {
  var sheet   = getSheet('CLIENTES');
  var data    = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0].map(function(h) { return String(h).trim(); });
  var rows    = data.slice(1).filter(function(r) { return r[0]; });

  return rows.map(function(r) {
    var o = rowToObj(headers, r);
    return {
      id:                   String(o['ID']          || ''),
      nombre:               String(o['Nombre']      || ''),
      email:                String(o['Email']       || ''),
      telefono:             String(o['Teléfono']    || o['Telefono'] || ''),
      direccion:            String(o['Dirección']   || o['Direccion'] || ''),
      fechaAlta:            o['Fecha Alta'] instanceof Date ? o['Fecha Alta'].toISOString() : '',
      totalCompras:         Number(o['Total Compras'])    || 0,
      cantidadCompras:      Number(o['Cantidad Compras']) || 0,
      ultimaCompra:         o['Última Compra'] instanceof Date ? o['Última Compra'].toISOString() : '',
      saldoCuentaCorriente: Number(o['Saldo CC'] || o['Cuenta Corriente']) || 0,
      notas:                String(o['Notas']     || ''),
    };
  });
}

function addCliente(body) {
  var sheet = getSheet('CLIENTES');
  var id    = generateId('CLI');

  sheet.appendRow([
    id, body.nombre, body.email || '', body.telefono || '',
    body.direccion || '', new Date(),
    0, 0, '', 0, body.notas || ''
  ]);

  return { id: id };
}
