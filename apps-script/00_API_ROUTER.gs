// ============================================================
// ROUTER PRINCIPAL
// Publicar como: Implementar > Web App
//   - Ejecutar como: Yo
//   - Acceso: Cualquier persona
// ============================================================

var API_KEY = 'cambia_esta_clave_por_una_segura'; // igual a VITE_API_KEY en .env.local

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var params = e.parameter || {};

    if (params.apiKey !== API_KEY) {
      return jsonResponse({ ok: false, error: 'No autorizado' });
    }

    var action = params.action;
    if (!action) {
      return jsonResponse({ ok: false, error: 'Falta parámetro action' });
    }

    var body = {};
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    var result;
    switch (action) {
      case 'getConfig':     result = getConfig();              break;
      case 'getKPIs':       result = getKPIs();                break;
      case 'getProductos':  result = getProductos(params);     break;
      case 'addProducto':   result = addProducto(body);        break;
      case 'getVentas':     result = getVentas(params);        break;
      case 'addVenta':      result = addVenta(body);           break;
      case 'getCaja':       result = getCaja(params);          break;
      case 'addMovCaja':    result = addMovimientoCaja(body);  break;
      case 'getInventario': result = getInventario(params);    break;
      case 'addMovStock':   result = addMovimientoStock(body); break;
      case 'getClientes':   result = getClientes(params);      break;
      case 'addCliente':    result = addCliente(body);         break;
      case 'getCuotas':     result = getCuotas(params);        break;
      case 'pagarCuota':    result = pagarCuota(body);         break;
      default:
        return jsonResponse({ ok: false, error: 'Acción desconocida: ' + action });
    }

    return jsonResponse({ ok: true, data: result });

  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return jsonResponse({ ok: false, error: err.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Hoja no encontrada: ' + name);
  return sheet;
}

function rowToObj(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) { obj[h] = row[i]; });
  return obj;
}

function generateId(prefix) {
  var date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  var rand = Math.floor(Math.random() * 9000) + 1000;
  return prefix + '-' + date + '-' + rand;
}
