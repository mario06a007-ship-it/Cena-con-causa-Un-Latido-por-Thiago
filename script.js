// ========================================
// CONFIGURACIÓN - Un Latido por Thiago
// ========================================

const CONFIG = {
    // Precios
    ticketPrice: 900,   // se conserva como respaldo; el precio real sale de ZONAS

    // Precios por zona. 'normal' hasta el 20 de octubre, 'tardio' del 21 al 23.
    zonas: {
        oro:    { nombre: 'Oro',    normal: 1100, tardio: 1250, lugares: 50 },
        plata:  { nombre: 'Plata',  normal: 1050, tardio: 1150, lugares: 30 },
        bronce: { nombre: 'Bronce', normal:  900, tardio: 1000, lugares: 30 }
    },
    ultimoDiaPrecioNormal: '2026-10-20',
    currency: 'MXN',
    
    // Contacto
    whatsapp1: '+527711000973',
    whatsapp2: '+529848079958',
    email: 'karladm24@icloud.com',
    
    // Notion Database ID
    notionDatabaseId: '3cce989b21c380d38a0ce680ecd9976a',
    
    // Make Webhook - ✅ CONFIGURADO
    makeWebhookUrl: 'https://hook.us2.make.com/52ld0gg2as6i3l36bxsvn2jjt1vpqpe6',
    
    // Evento
    eventDate: '23 de octubre de 2026, 7:00 PM',
    eventName: 'Un Latido por Thiago',
    
    // Métodos de pago
    mercadoPagoLink: 'https://mpago.la/32gk8zg',
    bankTransfer: {
        bank: 'BBVA',
        account: '151 170 8950',
        clabe: '012 694 0151117089507',
        swift: 'BCRMXMMMPY'
    }
};

// ========================================
// ESTADO GLOBAL
// ========================================

let purchaseData = {
    localPurchases: [],
    totalTicketsSold: 0,
    totalRaised: 0
};

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎭 Un Latido por Thiago - Inicializando...');
    
    // Cargar datos almacenados
    loadLocalData();
    
    // Configurar event listeners
    setupFormListeners();
    
    // Actualizar totales
    updateStats();
    
    // Mensaje de estado
    console.log('✅ Sistema iniciado correctamente');
    updateStatusMessage();
});

// ========================================
// FORM LISTENERS
// ========================================

function setupFormListeners() {
    const form = document.getElementById('purchaseForm');
    const quantitySelect = document.getElementById('quantity');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    if (quantitySelect) {
        quantitySelect.addEventListener('change', function() {
            if (typeof evaluarPromo === 'function') { evaluarPromo(); } else { updateTotal(); }
        });
    }
}

// ========================================
// CÁLCULO DE TOTALES
// ========================================

function updateTotal() {
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const totalAmount = document.getElementById('totalAmount');
    const detalle = document.getElementById('promoDetalle');

    if (!quantity) {
        totalAmount.textContent = '$0.00';
        if (detalle) detalle.style.display = 'none';
        return;
    }

    const t = (typeof calcularTotales === 'function')
        ? calcularTotales(quantity)
        : { bruto: quantity * precioPorPersona(), descuento: 0, neto: quantity * precioPorPersona() };

    totalAmount.textContent = `$${t.neto.toLocaleString('es-MX')} ${CONFIG.currency}`;

    if (detalle) detalle.style.display = 'none';
}

// ========================================
// MANEJO DEL FORMULARIO
// ========================================

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }
    
    // Obtener datos
    const formData = getFormData();
    
    console.log('📝 Datos del formulario:', formData);
    
    // Guardar localmente
    savePurchaseLocally(formData);
    
    // Enviar a Make (si está configurado)
    if (CONFIG.makeWebhookUrl) {
        await sendToMake(formData);
        
        // Enviar a Notion directamente
        if (CONFIG.notionToken) {
            await sendToNotion(formData);
        }
    }
    
    // Guardar en localStorage
    agregarReservaLocal(formData);
    
    // Mostrar confirmación
    showConfirmation(formData);
    
    // Limpiar formulario
    resetForm();
    
    // Actualizar estadísticas
    updateStats();
}

// ========================================
// VALIDACIÓN DE FORMULARIO
// ========================================

function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const quantity = document.getElementById('quantity').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    return fullName && email && phone && quantity && paymentMethod;
}

// ========================================
// OBTENER DATOS DEL FORMULARIO
// ========================================

function getFormData() {
    return {
        id: 'THIAGO-' + Date.now(),
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        quantity: parseInt(document.getElementById('quantity').value),
        paymentMethod: document.getElementById('paymentMethod').value,
        observations: document.getElementById('observations').value.trim(),
        total: calcularTotales(parseInt(document.getElementById('quantity').value) || 0).neto,
        totalOriginal: (parseInt(document.getElementById('quantity').value) || 0) * precioPorPersona(),
        zona: CONFIG.zonas[zonaElegida()].nombre,
        precioUnitario: precioPorPersona(),
        descuento: calcularTotales(parseInt(document.getElementById('quantity').value) || 0).descuento,
        promoCodigo: vendedor || '',
        vendedorNombre: (vendedor || 'Venta directa').indexOf('Otro') === 0 ? 'Otro' : (vendedor || 'Venta directa'),
        vendedorDetalle: vendedor || 'Venta directa',
        promoTipo: 'Sin codigo',
        promoOtorga: '',
        date: new Date().toISOString(),
        dateFormatted: new Date().toLocaleDateString('es-MX'),
        status: 'Pendiente'
    };
}

// ========================================
// GUARDAR LOCALMENTE
// ========================================

function savePurchaseLocally(data) {
    purchaseData.localPurchases.push(data);
    purchaseData.totalTicketsSold += data.quantity;
    purchaseData.totalRaised += data.total;
    
    // Guardar en localStorage
    localStorage.setItem('cenaThiagoPurchases', JSON.stringify(purchaseData));
    
    console.log('💾 Datos guardados localmente');
}

// ========================================
// CARGAR DATOS LOCALES
// ========================================

function loadLocalData() {
    const stored = localStorage.getItem('cenaThibagoPurchases');
    if (stored) {
        try {
            purchaseData = JSON.parse(stored);
            console.log('✅ Datos cargados:', purchaseData);
        } catch (e) {
            console.error('Error al cargar datos:', e);
        }
    }
}

// ========================================
// ENVIAR A MAKE (webhook)
// ========================================

async function sendToMake(data) {
    if (!CONFIG.makeWebhookUrl) {
        console.warn('⚠️ Make webhook no configurado');
        return;
    }
    
    try {
        const payload = {
            ...data,
            eventName: CONFIG.eventName,
            eventDate: CONFIG.eventDate,
            currency: CONFIG.currency
        };
        
        console.log('📤 Enviando a Make:', payload);
        
        const response = await fetch(CONFIG.makeWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('✅ Datos enviados a Make correctamente');
        } else {
            console.error('❌ Error al enviar a Make:', response.status);
        }
    } catch (error) {
        console.error('❌ Error en Make:', error);
    }
}

// ========================================
// ENVIAR A NOTION (Directo)
// ========================================

async function sendToNotion(data) {
    if (!CONFIG.notionToken || !CONFIG.notionDatabaseId) {
        console.warn('⚠️ Notion no configurado');
        return;
    }
    
    try {
        const payload = {
            parent: {
                database_id: CONFIG.notionDatabaseId
            },
            properties: {
                "Nombre": {
                    title: [{ text: { content: data.fullName || "Sin nombre" } }]
                },
                "Email": {
                    email: data.email || ""
                },
                "Teléfono": {
                    phone_number: data.phone || ""
                },
                "Cantidad Boletos": {
                    number: parseInt(data.quantity) || 0
                },
                "Total": {
                    number: parseInt(data.total) || 0
                },
                "Método de Pago": {
                    select: { name: data.paymentMethod || "No especificado" }
                },
                "Observaciones": {
                    rich_text: [{ text: { content: data.observations || "" } }]
                },
                "Fecha": {
                    date: { start: data.date || new Date().toISOString().split('T')[0] }
                },
                "Estado": {
                    select: { name: "Pagado" }
                },
                "ID": {
                    rich_text: [{ text: { content: data.id || "" } }]
                }
            }
        };
        
        console.log('📤 Enviando a Notion:', payload);
        
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + CONFIG.notionToken,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('✅ Datos guardados en Notion correctamente');
            return true;
        } else {
            const error = await response.json();
            console.error('❌ Error al guardar en Notion:', response.status, error.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en Notion:', error.message);
        return false;
    }
}

// ========================================
// CONFIRMACIÓN
// ========================================

function showConfirmation(data) {
    const digital = (data.paymentMethod === 'tarjeta' || data.paymentMethod === 'mercadopago');

    if (digital && data.total > 0) {
        mostrarPantallaPago(data);
    } else {
        alert(`
🎉 ¡RESERVA CONFIRMADA! 🎉

Nombre: ${data.fullName}
Boletos: ${data.quantity}
Total: $${data.total.toLocaleString('es-MX')} MXN
Método de Pago: ${getPaymentMethodName(data.paymentMethod)}
Folio: ${data.id}

💬 Te contactaremos por WhatsApp

¡Gracias por ser parte de Un Latido por Thiago! 💙
        `);
    }

    sendWhatsAppNotification(data);
}

// Pantalla que evita que tecleen mal el monto en Mercado Pago
function mostrarPantallaPago(data) {
    const monto = data.total;
    const capa = document.createElement('div');
    capa.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:99999;'
        + 'display:flex;align-items:center;justify-content:center;padding:18px;overflow-y:auto;';

    capa.innerHTML = `
      <div style="background:#1a1a2e;border:2px solid #ffd700;border-radius:16px;max-width:440px;
                  width:100%;padding:26px 22px;color:#fff;text-align:center;font-family:inherit;">
        <h2 style="color:#ffd700;margin:0 0 6px;font-size:1.35em;">Reserva registrada</h2>
        <p style="margin:0 0 4px;opacity:.85;">${data.fullName} · ${data.quantity} boleto(s)</p>
        <p style="margin:0 0 18px;opacity:.6;font-size:.85em;">Folio ${data.id}</p>

        <div style="background:rgba(255,215,0,.1);border:1px dashed #ffd700;border-radius:12px;padding:16px;">
          <p style="margin:0 0 6px;font-size:.9em;">En Mercado Pago escribe exactamente:</p>
          <p style="margin:0;font-size:2.5em;font-weight:bold;color:#ffd700;line-height:1;">
            $${monto.toLocaleString('es-MX')}
          </p>
          <button id="copiarMonto" style="margin-top:12px;padding:9px 20px;border:none;border-radius:20px;
                  background:#ffd700;color:#16162a;font-weight:bold;cursor:pointer;">
            Copiar monto
          </button>
        </div>

        <p style="margin:16px 0 4px;font-size:.85em;opacity:.75;">
          Si escribes otra cantidad, tu pago no coincidirá con tu reserva
          y tendremos que contactarte para corregirlo.
        </p>

        <a href="${CONFIG.mercadoPagoLink}" target="_blank" rel="noopener"
           style="display:block;margin-top:16px;padding:15px;border-radius:30px;text-decoration:none;
                  background:linear-gradient(90deg,#e9a63c,#ffd700);color:#16162a;font-weight:bold;font-size:1.05em;">
          Ir a pagar $${monto.toLocaleString('es-MX')}
        </a>

        <button id="cerrarPago" style="margin-top:14px;background:none;border:none;color:#bbb;
                text-decoration:underline;cursor:pointer;font-size:.9em;">
          Pagar después
        </button>
      </div>`;

    document.body.appendChild(capa);

    capa.querySelector('#copiarMonto').onclick = function() {
        const b = this;
        navigator.clipboard.writeText(String(monto)).then(function() {
            b.textContent = 'Monto copiado';
            setTimeout(function(){ b.textContent = 'Copiar monto'; }, 2200);
        }).catch(function() {
            b.textContent = String(monto);
        });
    };
    capa.querySelector('#cerrarPago').onclick = function() { capa.remove(); };
}

function getPaymentMethodName(method) {
    const methods = {
        'tarjeta': 'Tarjeta de crédito o débito',
        'mercadopago': 'Mercado Pago',
        'transferencia': 'Transferencia bancaria',
        'deposito': 'Depósito bancario',
        'efectivo': 'Efectivo'
    };
    return methods[method] || method;
}

function sendWhatsAppNotification(data) {
    const message = encodeURIComponent(
        `Hola! 👋 Confirmo mi reserva para Un Latido por Thiago\n\n` +
        `Nombre: ${data.fullName}\n` +
        `Boletos: ${data.quantity}\n` +
        `Total: $${data.total.toLocaleString('es-MX')} MXN\n` +
        `Método: ${getPaymentMethodName(data.paymentMethod)}\n` +
        `Folio: ${data.id}\n\n` +
        `¡Gracias por apoyar la causa de Thiago! 💙`
    );
    
    const whatsappLink = `https://wa.me/${CONFIG.whatsapp1.replace(/\D/g, '').slice(-10)}?text=${message}`;
    console.log('📱 Link WhatsApp generado:', whatsappLink);
}

// ========================================
// ACTUALIZAR ESTADÍSTICAS
// ========================================

function updateStats() {
    const ticketsDisplay = document.getElementById('ticketsSoldDisplay');
    const totalDisplay = document.getElementById('totalRaisedDisplay');
    
    if (ticketsDisplay) {
        ticketsDisplay.textContent = purchaseData.totalTicketsSold;
    }
    
    if (totalDisplay) {
        totalDisplay.textContent = `$${purchaseData.totalRaised.toLocaleString('es-MX')}`;
    }
    
    console.log('📊 Estadísticas actualizadas');
}

// ========================================
// LIMPIAR FORMULARIO
// ========================================

function resetForm() {
    const form = document.getElementById('purchaseForm');
    if (form) {
        form.reset();
        updateTotal();
    }
}

// ========================================
// MENSAJE DE ESTADO
// ========================================

function updateStatusMessage() {
    const statusElement = document.getElementById('notionStatus');
    if (statusElement) {
        if (CONFIG.makeWebhookUrl) {
            statusElement.textContent = '✅ Make configurado - Datos se guardan en Notion automáticamente';
            statusElement.style.color = '#28a745';
        } else {
            statusElement.textContent = '📊 Datos guardados localmente - Configura Make webhook para Notion';
            statusElement.style.color = '#ffc107';
        }
    }
}

// ========================================
// FUNCIONES ADMIN (F12 - CONSOLA)
// ========================================

window.systemStatus = function() {
    console.clear();
    console.log('=== ESTADO DEL SISTEMA - Un Latido por Thiago ===\n');
    
    console.log('✅ Configuración:');
    console.log('   - Precio: $' + CONFIG.ticketPrice + ' ' + CONFIG.currency);
    console.log('   - Evento: ' + CONFIG.eventName);
    console.log('   - Fecha: ' + CONFIG.eventDate);
    console.log('   - Email: ' + CONFIG.email);
    console.log('   - WhatsApp 1: ' + CONFIG.whatsapp1);
    console.log('   - WhatsApp 2: ' + CONFIG.whatsapp2);
    
    console.log('\n📊 Estadísticas:');
    console.log('   - Boletos vendidos: ' + purchaseData.totalTicketsSold);
    console.log('   - Total recaudado: $' + purchaseData.totalRaised.toLocaleString('es-MX'));
    console.log('   - Número de reservas: ' + purchaseData.localPurchases.length);
    
    console.log('\n🔗 Métodos de Pago:');
    console.log('   - Mercado Pago: ' + CONFIG.mercadoPagoLink);
    console.log('   - Banco: ' + CONFIG.bankTransfer.bank);
    console.log('   - Cuenta: ' + CONFIG.bankTransfer.account);
    
    console.log('\n⚙️ Integración:');
    console.log('   - Make Webhook: ' + (CONFIG.makeWebhookUrl ? '✅ Configurado' : '❌ No configurado'));
    console.log('   - Notion Database: ' + CONFIG.notionDatabaseId);
    
    console.log('\n💾 Datos Locales:');
    console.log(purchaseData);
};

window.getCenas = function() {
    console.clear();
    console.log('=== LISTADO DE RESERVAS - Un Latido por Thiago ===\n');
    if (purchaseData.localPurchases.length === 0) {
        console.log('No hay reservas aún');
        return;
    }
    
    purchaseData.localPurchases.forEach((purchase, index) => {
        console.log(`\n📝 Reserva #${index + 1}:`);
        console.log(`   ID: ${purchase.id}`);
        console.log(`   Nombre: ${purchase.fullName}`);
        console.log(`   Email: ${purchase.email}`);
        console.log(`   Teléfono: ${purchase.phone}`);
        console.log(`   Boletos: ${purchase.quantity}`);
        console.log(`   Total: $${purchase.total.toLocaleString('es-MX')}`);
        console.log(`   Pago: ${getPaymentMethodName(purchase.paymentMethod)}`);
        console.log(`   Fecha: ${purchase.dateFormatted}`);
        console.log(`   Status: ${purchase.status}`);
        if (purchase.observations) {
            console.log(`   Notas: ${purchase.observations}`);
        }
    });
};

window.exportData = function() {
    const dataStr = JSON.stringify(purchaseData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cena-thiago-reservas-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    console.log('✅ Datos exportados');
};

window.configureMake = function(webhookUrl) {
    CONFIG.makeWebhookUrl = webhookUrl;
    localStorage.setItem('cenaThiagoMakeUrl', webhookUrl);
    console.log('✅ Make webhook configurado:', webhookUrl);
    updateStatusMessage();
};

// ========================================
// CARGAR CONFIGURACIÓN GUARDADA
// ========================================

const savedMakeUrl = localStorage.getItem('cenaThiagoMakeUrl');
if (savedMakeUrl) {
    CONFIG.makeWebhookUrl = savedMakeUrl;
}

console.log('🎭 Un Latido por Thiago - Sistema listo');
console.log('💡 Escribe systemStatus() en la consola para ver el estado');


// ========================================
// CONFIGURAR NOTION TOKEN (SEGURO)
// ========================================

// Función para configurar token de Notion
function setNotionToken(token) {
    localStorage.setItem('notionToken', token);
    window.CONFIG = window.CONFIG || {};
    window.CONFIG.notionToken = token;
    console.log('✅ Token de Notion configurado correctamente');
    console.log('✅ Ahora las reservas se guardarán en Notion');
    return true;
}

// Función para verificar estado
function checkNotionStatus() {
    const token = localStorage.getItem('notionToken');
    if (token) {
        console.log('✅ Notion está configurado');
        console.log('✅ Token: ' + token.substring(0, 20) + '...');
    } else {
        console.log('❌ Notion NO está configurado');
    }
}

// Función para ver estado del sistema
function systemStatus() {
    console.log('=== ESTADO DEL SISTEMA ===');
    const token = localStorage.getItem('notionToken');
    console.log('Notion Token: ' + (token ? '✅ Configurado' : '❌ No configurado'));
    console.log('Make Webhook: ✅ Configurado');
    console.log('Local Storage: ✅ Funciona');
    if (token) {
        console.log('✅ Sistema 100% Operativo');
    } else {
        console.log('⚠️ Falta configurar Notion Token');
    }
}


// ========================================
// SISTEMA DE DASHBOARD CON LOCALSTORAGE
// ========================================

// Cargar reservas del localStorage
function cargarReservas() {
    const reservas = localStorage.getItem('reservasCena');
    return reservas ? JSON.parse(reservas) : [];
}

// Guardar reservas en localStorage
function guardarReservasLocal(reservas) {
    localStorage.setItem('reservasCena', JSON.stringify(reservas));
    actualizarDashboard();
}

// Agregar reserva al localStorage
function agregarReservaLocal(datos) {
    const reservas = cargarReservas();
    const nuevaReserva = {
        ...datos,
        timestamp: new Date().toISOString(),
        id: 'RES-' + Date.now()
    };
    reservas.push(nuevaReserva);
    guardarReservasLocal(reservas);
    
    // Crear boletos con QR automáticamente
    const boletos = crearBoletosDesdeReserva(nuevaReserva);
    guardarBoletosEnLocal(boletos);
    
    console.log('✅ Reserva guardada localmente');
    console.log('✅ ' + boletos.length + ' boletos con QR creados');
}

// Actualizar dashboard
function actualizarDashboard() {
    const reservas = cargarReservas();
    
    // Calcular totales
    const totalReservas = reservas.length;
    const totalBoletos = reservas.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
    const totalRecaudado = reservas.reduce((sum, r) => sum + (parseInt(r.total) || 0), 0);
    
    // Actualizar números (solo si el dashboard existe en la página)
    const elR = document.getElementById('totalReservas');
    const elB = document.getElementById('totalBoletos');
    const elT = document.getElementById('totalRecaudado');
    const tbody = document.getElementById('reservasTableBody');
    if (!elR || !elB || !elT || !tbody) { return; }
    elR.textContent = totalReservas;
    elB.textContent = totalBoletos;
    elT.textContent = '$' + totalRecaudado.toLocaleString('es-MX');
    tbody.innerHTML = '';
    
    reservas.forEach(r => {
        const fecha = new Date(r.timestamp).toLocaleDateString('es-MX');
        const row = tbody.insertRow();
        row.innerHTML = `
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.fullName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.email}</td>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">${r.quantity}</td>
            <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">$${r.total}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${fecha}</td>
        `;
    });
    
    // Mostrar dashboard si hay reservas
    const dashboard = document.getElementById('dashboardSection');
    if (dashboard) {
        dashboard.style.display = totalReservas > 0 ? 'block' : 'none';
    }
}

// Exportar a CSV
function exportarCSV() {
    const reservas = cargarReservas();
    
    if (reservas.length === 0) {
        alert('No hay reservas para exportar');
        return;
    }
    
    let csv = 'ID,Nombre,Email,Teléfono,Boletos,Total,Método de Pago,Fecha\n';
    
    reservas.forEach(r => {
        const fecha = new Date(r.timestamp).toLocaleDateString('es-MX');
        csv += `${r.id},"${r.fullName}","${r.email}","${r.phone}",${r.quantity},${r.total},"${r.paymentMethod}","${fecha}"\n`;
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservas-cena-thiago-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    
    console.log('✅ CSV exportado');
}

// Limpiar datos
function limpiarDatos() {
    if (confirm('¿Estás seguro de que quieres eliminar TODAS las reservas? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('reservasCena');
        actualizarDashboard();
        console.log('✅ Datos limpios');
        alert('Todas las reservas han sido eliminadas');
    }
}

// Actualizar dashboard cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarDashboard();
});

// ========================================
// SISTEMA DE BOLETOS CON QR TOKENIZADO
// ========================================

// Generar token único para cada boleto
function generarTokenUnico() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return 'TKN-' + timestamp + '-' + random;
}

// Crear boletos con tokens para una reserva
function crearBoletosDesdeReserva(reserva) {
    const boletos = [];
    const cantidad = parseInt(reserva.quantity) || 1;
    
    for (let i = 1; i <= cantidad; i++) {
        boletos.push({
            id: reserva.id + '-' + i,
            token: generarTokenUnico(),
            nombre: reserva.fullName,
            email: reserva.email,
            boleto_numero: i,
            reserva_id: reserva.id,
            estado: 'Pagado',
            acceso_evento: false,
            fecha_acceso: null,
            fecha_creacion: new Date().toISOString()
        });
    }
    
    return boletos;
}

// Guardar boletos en localStorage
function guardarBoletosEnLocal(boletos) {
    try {
        const existentes = localStorage.getItem('boletosEventoCena');
        const todos = existentes ? JSON.parse(existentes) : [];
        todos.push(...boletos);
        localStorage.setItem('boletosEventoCena', JSON.stringify(todos));
        console.log('✅ ' + boletos.length + ' boletos guardados');
        return true;
    } catch(e) {
        console.error('Error guardando boletos:', e);
        return false;
    }
}

// Cargar boletos
function cargarBoletosDelEvento() {
    try {
        const boletos = localStorage.getItem('boletosEventoCena');
        return boletos ? JSON.parse(boletos) : [];
    } catch(e) {
        console.error('Error cargando boletos:', e);
        return [];
    }
}

// Verificar token en el evento
function verificarTokenEnEvento(token) {
    const boletos = cargarBoletosDelEvento();
    const boleto = boletos.find(b => b.token === token);
    
    if (!boleto) {
        return { valido: false, mensaje: 'Token no encontrado' };
    }
    
    if (boleto.acceso_evento) {
        return { valido: false, mensaje: 'Este boleto ya fue usado', boleto: boleto };
    }
    
    return { valido: true, mensaje: 'Acceso PERMITIDO', boleto: boleto };
}

// Marcar boleto como usado en el evento
function registrarAccesoAlEvento(token) {
    try {
        const boletos = cargarBoletosDelEvento();
        const boleto = boletos.find(b => b.token === token);
        
        if (boleto) {
            boleto.acceso_evento = true;
            boleto.fecha_acceso = new Date().toISOString();
            localStorage.setItem('boletosEventoCena', JSON.stringify(boletos));
            console.log('✅ Acceso registrado para:', boleto.nombre);
            return true;
        }
        return false;
    } catch(e) {
        console.error('Error registrando acceso:', e);
        return false;
    }
}

// Ver todos los boletos generados
function verTodosLosBoletos() {
    const boletos = cargarBoletosDelEvento();
    console.log('📋 Total de boletos: ' + boletos.length);
    console.table(boletos);
    return boletos;
}

// Exportar boletos a JSON
function exportarBoletosAJSON() {
    const boletos = cargarBoletosDelEvento();
    
    if (boletos.length === 0) {
        alert('No hay boletos para exportar');
        return;
    }
    
    const json = JSON.stringify(boletos, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'boletos-qr-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    
    console.log('✅ Boletos exportados a JSON');
}

console.log('✅ Sistema de QR Tokenizado cargado correctamente');


// ========================================
// CODIGOS PROMOCIONALES
// ========================================
// Los codigos no se guardan en claro: solo su huella.
// Aunque alguien lea este archivo, no puede deducir el codigo.
// La cortesia siempre queda sujeta a tu aprobacion en Notion.




// Estado del codigo aplicado en este momento
let promoActivo = null;
let vendedor = '';

function evaluarPromo() {
    const sel   = document.getElementById('promoCode');
    const otro  = document.getElementById('vendedorOtro');
    const msg   = document.getElementById('promoMsg');
    if (!sel) { updateTotal(); return; }

    const elegido = sel.value;

    // "Otra persona" abre un campo para escribir el nombre
    if (otro) otro.style.display = (elegido === 'Otro') ? 'block' : 'none';

    if (elegido === 'Otro') {
        const nom = (otro && otro.value.trim()) ? otro.value.trim() : '';
        vendedor = nom ? ('Otro: ' + nom) : 'Otro';
    } else {
        vendedor = elegido;
    }

    if (msg) {
        if (elegido && elegido !== 'Venta directa' && elegido !== '') {
            msg.style.display = 'block';
            msg.style.color = '#7ee08a';
            msg.textContent = 'Gracias. Le acreditaremos esta venta.';
        } else {
            msg.style.display = 'none';
        }
    }
    updateTotal();
}

function zonaElegida() {
    const el = document.getElementById('zona');
    const v = el ? el.value : 'bronce';
    return CONFIG.zonas[v] ? v : 'bronce';
}

function esPrecioTardio() {
    const corte = new Date(CONFIG.ultimoDiaPrecioNormal + 'T23:59:59-05:00');
    return new Date() > corte;
}

function precioPorPersona() {
    const z = CONFIG.zonas[zonaElegida()];
    return esPrecioTardio() ? z.tardio : z.normal;
}


function calcularTotales(cantidad) {
    // Sin descuentos en la compra. Las recompensas se otorgan a quien vende,
    // fuera de este formulario, segun el protocolo del evento.
    const unitario = precioPorPersona();
    const bruto = cantidad * unitario;
    return { bruto: bruto, descuento: 0, neto: bruto, motivo: null, unitario: unitario };
}


document.addEventListener('DOMContentLoaded', function() {
    const campoPromo = document.getElementById('promoCode');
    if (campoPromo) {
        campoPromo.addEventListener('input', evaluarPromo);
        campoPromo.addEventListener('blur', evaluarPromo);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const z = document.getElementById('zona');
    if (z) z.addEventListener('change', function() {
        if (typeof evaluarPromo === 'function') evaluarPromo(); else updateTotal();
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const o = document.getElementById('vendedorOtro');
    if (o) o.addEventListener('input', evaluarPromo);
});
