function getConfig() {
  var sheet = getSheet('CONFIG');
  return {
    nombreNegocio:   sheet.getRange('B4').getValue(),
    email:           sheet.getRange('B8').getValue(),
    iva:             Number(sheet.getRange('B17').getValue()),
    colorPrimario:   sheet.getRange('B48').getValue() || '#6366f1',
    colorSecundario: sheet.getRange('B49').getValue() || '#f59e0b',
    comisiones: {
      efectivo:        Number(sheet.getRange('B36').getValue()),
      debito:          Number(sheet.getRange('B37').getValue()),
      credito1:        Number(sheet.getRange('B38').getValue()),
      credito3:        Number(sheet.getRange('B39').getValue()),
      credito6:        Number(sheet.getRange('B40').getValue()),
      mercadoPago:     Number(sheet.getRange('B41').getValue()),
      transferencia:   Number(sheet.getRange('B42').getValue()),
      cuentaCorriente: Number(sheet.getRange('B43').getValue()),
    }
  };
}
