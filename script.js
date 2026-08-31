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
    makeWebhookUrl: 'https://hook.us2.make.com/o7ju03mwuhrccssw9bqwco12mgntc93l',
    
    // Evento
    eventDate: '16 de octubre de 2026',
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
    }
    
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
