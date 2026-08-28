# 💙 Un Latido por Thiago - Sistema de Venta de Boletos

Sistema web profesional para la venta de boletos de la cena benéfica "Un Latido por Thiago" con recaudación de fondos para la cirugía de corazón del pequeño Thiago Soto.

## 📋 Información del Evento

- **Nombre:** Un Latido por Thiago
- **Fecha:** 16 de octubre de 2026
- **Precio:** $1,200 por boleto
- **Lugar:** Playa del Carmen, Quintana Roo
- **Propósito:** Recaudación de fondos para cirugía de corazón

## 🎯 Características

✅ Formulario de compra responsive  
✅ Cálculo automático de totales  
✅ Múltiples métodos de pago (Mercado Pago, Transferencia, Efectivo)  
✅ Almacenamiento de datos en localStorage  
✅ Estadísticas en tiempo real  
✅ Confirmación automática por modal  
✅ Diseño profesional y moderno  
✅ Compatible con dispositivos móviles  

## 💳 Métodos de Pago Disponibles

### 1. Mercado Pago
- Acceso directo a: https://mpago.la/32gk8zg
- Acepta tarjetas de crédito, débito y billetera digital

### 2. Transferencia Bancaria
- **Banco:** BBVA
- **Titular:** Mario Alejandro Soto López
- **Cuenta:** 151 170 8950
- **CLABE:** 012 694 0151117089507
- **SWIFT:** BCRMXMMMPY
- *Importante: Enviar comprobante por WhatsApp*

### 3. Efectivo
- Coordinación presencial en Playa del Carmen
- Contactar por WhatsApp: +52-9841-2357-470

## 🚀 Cómo Usar

### Para Clientes
1. Ingresa el formulario con tus datos
2. Selecciona cantidad de boletos
3. Elige método de pago
4. Haz clic en "Procesar Compra"
5. Sigue las instrucciones según tu método de pago
6. Recibirás confirmación vía email y WhatsApp

### Para Administradores
Abre la consola del navegador (F12) y ejecuta:

```javascript
getCenas()
```

Esto mostrará una tabla de todas las compras registradas.

Para exportar datos:
```javascript
exportData()
```

## 📦 Estructura del Proyecto

```
cena-thiago/
├── index.html      # Página principal
├── style.css       # Estilos
├── script.js       # Lógica de la aplicación
├── sw.js          # Service Worker (PWA)
├── README.md      # Este archivo
└── .gitignore     # Archivos a ignorar
```

## 💾 Almacenamiento de Datos

Los datos de las compras se guardan en `localStorage` del navegador. Para cada compra se registra:

- ID único (TICKET-timestamp-código)
- Nombre completo
- Email
- Teléfono
- Cantidad de boletos
- Método de pago
- Observaciones especiales
- Timestamp (fecha y hora)
- Total pagado

## 🔐 Información de Seguridad

- Los datos se guardan localmente en el navegador
- No se transmite información sensible del cliente
- Los detalles bancarios se muestran solo después de seleccionar transferencia
- Se recomienda mantener los datos respaldados

## 📊 Estadísticas

El sitio muestra en tiempo real:
- Cantidad total de boletos vendidos
- Monto total recaudado
- Porcentaje destinado a la causa (100%)

## 📱 Contacto

- **WhatsApp:** +52-9841-2357-470
- **Email:** mrsolutionsts@gmail.com
- **Teléfono:** (52) 9841-2357-470

## 📄 Licencia

Proyecto desarrollado con propósito benéfico para "Un Latido por Thiago"

---

**💙 Cada boleto vendido es un paso más cerca de salvar vidas**
