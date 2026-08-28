// Configuración
const CONFIG = {
    eventName: 'Un Latido por Thiago',
    ticketPrice: 1200,
    eventDate: '16 de octubre de 2026',
    mercadoPagoLink: 'https://mpago.la/32gk8zg',
    bankDetails: {
        bank: 'BBVA',
        holder: 'Mario Alejandro Soto López',
        account: '151 170 8950',
        clabe: '012 694 0151117089507',
        swift: 'BCRMXMMMPY'
    },
    contact: {
        whatsapp: '+5298412357470',
        email: 'mrsolutionsts@gmail.com',
        phone: '(52) 9841-2357-470'
    }
};

// Variables globales
let ticketsSold = 0;
let totalRaised = 0;
const purchases = [];

// Elemento del formulario
const form = document.getElementById('purchaseForm');
const quantitySelect = document.getElementById('quantity');
const paymentMethodSelect = document.getElementById('paymentMethod');

// Elementos de la interfaz
const ticketCountSpan = document.getElementById('ticketCount');
const subtotalSpan = document.getElementById('subtotal');
const totalPriceSpan = document.getElementById('totalPrice');
const totalTicketsSpan = document.getElementById('totalTickets');
const totalRaisedSpan = document.getElementById('totalRaised');

// Modales
const confirmationModal = document.getElementById('confirmationModal');
const paymentModal = document.getElementById('paymentModal');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadPurchasesFromStorage();
    updateStats();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Actualizar resumen cuando cambia cantidad
    quantitySelect.addEventListener('change', updateOrderSummary);
    
    // Envío del formulario
    form.addEventListener('submit', handleFormSubmit);
    
    // Cerrar modales
    document.querySelector('.close-btn').addEventListener('click', closeModal);
}

// Actualizar resumen de la orden
function updateOrderSummary() {
    const quantity = parseInt(quantitySelect.value) || 0;
    const subtotal = quantity * CONFIG.ticketPrice;
    
    ticketCountSpan.textContent = quantity;
    subtotalSpan.textContent = formatCurrency(subtotal);
    totalPriceSpan.textContent = formatCurrency(subtotal);
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = {
        id: generateId(),
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        quantity: parseInt(document.getElementById('quantity').value),
        paymentMethod: document.getElementById('paymentMethod').value,
        observations: document.getElementById('observations').value.trim(),
        timestamp: new Date().toISOString(),
        total: parseInt(document.getElementById('quantity').value) * CONFIG.ticketPrice
    };
    
    // Validar datos
    if (!validateForm(formData)) {
        return;
    }
    
    // Guardar compra
    savePurchase(formData);
    
    // Mostrar confirmación según método de pago
    showConfirmation(formData);
    
    // Limpiar formulario
    form.reset();
    updateOrderSummary();
}

// Validar formulario
function validateForm(data) {
    if (!data.fullName || data.fullName.length < 3) {
        alert('Por favor ingresa un nombre válido');
        return false;
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        alert('Por favor ingresa un email válido');
        return false;
    }
    
    if (!data.phone || data.phone.length < 10) {
        alert('Por favor ingresa un teléfono válido');
        return false;
    }
    
    if (data.quantity < 1) {
        alert('Por favor selecciona al menos 1 boleto');
        return false;
    }
    
    if (!data.paymentMethod) {
        alert('Por favor selecciona un método de pago');
        return false;
    }
    
    return true;
}

// Validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Guardar compra en localStorage
function savePurchase(purchase) {
    purchases.push(purchase);
    localStorage.setItem('purchases', JSON.stringify(purchases));
    
    // Actualizar estadísticas
    ticketsSold += purchase.quantity;
    totalRaised += purchase.total;
    updateStats();
}

// Cargar compras del almacenamiento
function loadPurchasesFromStorage() {
    const stored = localStorage.getItem('purchases');
    if (stored) {
        try {
            const purchasesArray = JSON.parse(stored);
            purchases.push(...purchasesArray);
            
            // Recalcular totales
            ticketsSold = purchases.reduce((sum, p) => sum + p.quantity, 0);
            totalRaised = purchases.reduce((sum, p) => sum + p.total, 0);
        } catch (e) {
            console.error('Error al cargar compras:', e);
        }
    }
}

// Mostrar confirmación
function showConfirmation(purchase) {
    const paymentMethod = purchase.paymentMethod;
    const modal = confirmationModal;
    
    // Mensaje principal
    const confirmationMessage = document.getElementById('confirmationMessage');
    confirmationMessage.textContent = `¡Gracias ${purchase.fullName}! Tu compra ha sido registrada.`;
    
    // Detalles de la compra
    const confirmationDetails = document.getElementById('confirmationDetails');
    confirmationDetails.innerHTML = `
        <p><strong>Boletos:</strong> ${purchase.quantity}</p>
        <p><strong>Total:</strong> ${formatCurrency(purchase.total)}</p>
        <p><strong>Email:</strong> ${purchase.email}</p>
        <p><strong>Teléfono:</strong> ${purchase.phone}</p>
    `;
    
    // Pasos siguientes según método de pago
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    
    if (paymentMethod === 'mercadopago') {
        step1.textContent = 'Haz clic en el botón de Mercado Pago para completar tu pago';
        step2.textContent = 'Recibirás confirmación de pago en tu correo';
        step3.textContent = 'Tu boleto/s se enviarán vía WhatsApp antes del 16 de octubre';
        
        // Agregar botón de Mercado Pago
        confirmationDetails.innerHTML += `
            <div style="margin-top: 20px; text-align: center;">
                <a href="${CONFIG.mercadoPagoLink}" target="_blank" class="btn-primary" style="display: inline-block; width: auto; text-decoration: none;">
                    💳 Ir a Mercado Pago →
                </a>
            </div>
        `;
    } else if (paymentMethod === 'transferencia') {
        step1.textContent = 'Realiza una transferencia a la cuenta bancaria indicada';
        step2.textContent = 'Envía comprobante de transferencia por WhatsApp';
        step3.textContent = 'Tu boleto/s se enviarán una vez confirmemos el pago';
        
        // Agregar detalles bancarios
        confirmationDetails.innerHTML += `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p><strong>Banco:</strong> ${CONFIG.bankDetails.bank}</p>
                <p><strong>Titular:</strong> ${CONFIG.bankDetails.holder}</p>
                <p><strong>Cuenta:</strong> ${CONFIG.bankDetails.account}</p>
                <p><strong>CLABE:</strong> ${CONFIG.bankDetails.clabe}</p>
                <p><strong>SWIFT:</strong> ${CONFIG.bankDetails.swift}</p>
                <p style="margin-top: 15px; text-align: center;">
                    📱 Envía comprobante a: 
                    <a href="https://wa.me/${CONFIG.contact.whatsapp.replace('+', '')}" target="_blank" style="color: #d4145a; text-decoration: none; font-weight: bold;">
                        WhatsApp
                    </a>
                </p>
            </div>
        `;
    } else if (paymentMethod === 'efectivo') {
        step1.textContent = 'Contacta para coordinar el pago en efectivo';
        step2.textContent = 'Nos reunimos en Playa del Carmen para entregar tus boletos';
        step3.textContent = 'Recibirás confirmación de la cita por WhatsApp';
        
        confirmationDetails.innerHTML += `
            <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin-top: 15px; text-align: center;">
                <p>📱 Contacta por WhatsApp:</p>
                <a href="https://wa.me/${CONFIG.contact.whatsapp.replace('+', '')}" target="_blank" class="btn-primary" style="display: inline-block; width: auto; text-decoration: none; margin-top: 10px;">
                    Enviar WhatsApp →
                </a>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
    
    // Enviar email de confirmación (simulado)
    sendConfirmationEmail(purchase);
}

// Cerrar modal de confirmación
function closeModal() {
    confirmationModal.classList.add('hidden');
}

function closePaymentModal() {
    paymentModal.classList.add('hidden');
}

// Enviar email de confirmación (simulado - en producción usar un servicio real)
function sendConfirmationEmail(purchase) {
    // Aquí se conectaría con un servicio de email
    // Por ahora solo registramos en consola
    console.log('Enviando confirmación a:', purchase.email);
    console.log('Detalles de compra:', purchase);
    
    // En producción, esto sería:
    // fetch('/api/send-email', {
    //     method: 'POST',
    //     body: JSON.stringify(purchase)
    // })
}

// Actualizar estadísticas
function updateStats() {
    totalTicketsSpan.textContent = ticketsSold;
    totalRaisedSpan.textContent = formatCurrency(totalRaised);
}

// Utilidades
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

function generateId() {
    return 'TICKET-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Exportar datos (para administración)
function exportData() {
    const dataStr = JSON.stringify(purchases, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compras-cena-thiago-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Función para ver en consola (admin)
window.getCenas = function() {
    console.table(purchases);
    console.log('Total boletos:', ticketsSold);
    console.log('Total recaudado:', formatCurrency(totalRaised));
};

// Instalar como PWA (opcional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
        // Service worker no disponible
    });
}
