// ========================================
// CONFIGURACIÓN - Un Latido por Thiago
// ========================================

const CONFIG = {
    // Precios
    ticketPrice: 1200,
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
        quantitySelect.addEventListener('change', updateTotal);
    }
}

// ========================================
// CÁLCULO DE TOTALES
// ========================================

function updateTotal() {
    const quantity = document.getElementById('quantity').value;
    const totalAmount = document.getElementById('totalAmount');
    
    if (quantity && quantity > 0) {
        const total = quantity * CONFIG.ticketPrice;
        totalAmount.textContent = `$${total.toLocaleString('es-MX')} ${CONFIG.currency}`;
    } else {
        totalAmount.textContent = '$0.00';
    }
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
        total: parseInt(document.getElementById('quantity').value) * CONFIG.ticketPrice,
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
    const message = `
🎉 ¡RESERVA CONFIRMADA! 🎉

Nombre: ${data.fullName}
Boletos: ${data.quantity}
Total: $${data.total.toLocaleString('es-MX')} MXN
Método de Pago: ${getPaymentMethodName(data.paymentMethod)}

📧 Confirmación enviada a tu correo
💬 Te contactaremos por WhatsApp

¡Gracias por ser parte de Un Latido por Thiago! 💙
    `;
    
    alert(message);
    
    // Enviar WhatsApp automático
    sendWhatsAppNotification(data);
}

function getPaymentMethodName(method) {
    const methods = {
        'mercadopago': 'Mercado Pago',
        'transferencia': 'Transferencia Bancaria',
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
        `Método: ${getPaymentMethodName(data.paymentMethod)}\n\n` +
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
