# 🤖 Make - Integración Completa Paso a Paso

## ¿Qué es Make?

**Make** (anteriormente Integromat) es una plataforma de automatización que permite conectar diferentes servicios sin escribir código.

### Lo que haremos con Make:

1. **Recibir datos** del formulario de compra
2. **Guardar en Notion** automáticamente
3. **Enviar confirmación por email** 
4. **Enviar confirmación por WhatsApp**
5. **Actualizar estadísticas**
6. **Registrar en Google Sheets** (opcional)
7. **Crear tareas en Todoist** (opcional)

---

## 📋 PASO 1: Crear Cuenta en Make

### 1.1 Ir a Make
```
https://www.make.com
```

### 1.2 Haz clic en "Sign up"
- Email: tu@email.com
- Contraseña: segura
- Nombre: tu nombre

### 1.3 Verificar email
- Make te enviará un email
- Haz clic en el link

**¡LISTO! Tienes cuenta en Make** ✅

---

## 🏗️ PASO 2: Crear el Escenario (Flujo)

### 2.1 Dentro de Make
```
Haz clic en "Scenarios" (en el menú)
```

### 2.2 Crea un nuevo escenario
```
Click en "Create a new scenario"
```

### 2.3 Nombra el escenario
```
Nombre: "Un Latido por Thiago - Reservas"
```

### 2.4 Presiona Enter

**¡LISTO! Tienes un escenario vacío** ✅

---

## 🔌 PASO 3: Agregar Módulo de Webhook (Entrada)

### 3.1 Buscar módulo Webhook
1. Haz clic en el área vacía del escenario
2. Escribe: "Webhooks"
3. Selecciona: "Webhooks" → "Custom webhook"

### 3.2 Configurar Webhook
1. Haz clic en "Create a webhook"
2. Nombre: "Cena Thiago Compra"
3. Haz clic en "Save"

### 3.3 Copiar URL del Webhook
1. Verás una URL como: `https://hook.make.com/...`
2. **CÓPIALA** - la usaremos para configurar el sitio

**¡IMPORTANTE! Guarda esta URL** 📌

---

## 💾 PASO 4: Agregar Módulo de Notion (Guardar datos)

### 4.1 Conectar Notion en Make
1. Haz clic en el "+" para agregar módulo
2. Busca: "Notion"
3. Selecciona: "Notion" → "Create a database item"

### 4.2 Autorizar Notion
1. Haz clic en "Add"
2. Selecciona: "Create a new connection"
3. Haz clic en "Create a new connection"
4. Autoriza a Make acceso a tu Notion
5. Haz clic en "Continue"

### 4.3 Configurar la conexión a Notion
1. **Base de datos:** Selecciona "Un Latido por Thiago - Compras de Boletos"
2. **Propiedades:**
   - ID → Webhook data → id (arrastra el campo)
   - Nombre → Webhook data → fullName
   - Email → Webhook data → email
   - Teléfono → Webhook data → phone
   - Cantidad de Boletos → Webhook data → quantity
   - Total → Webhook data → total
   - Método de Pago → Webhook data → paymentMethod
   - Observaciones → Webhook data → observations
   - Fecha → Webhook data → timestamp
   - Estado → "Pendiente de Confirmación" (texto fijo)

### 4.4 Guardar
Presiona Ctrl+S

**¡LISTO! Make guarda en Notion** ✅

---

## 📧 PASO 5: Agregar Módulo de Email (Confirmación)

### 5.1 Agregar módulo Gmail
1. Haz clic en el "+" 
2. Busca: "Gmail"
3. Selecciona: "Gmail" → "Send an email"

### 5.2 Autorizar Gmail
1. Haz clic en "Add"
2. Selecciona "Create a new connection"
3. Autoriza tu Gmail
4. Haz clic en "Continue"

### 5.3 Configurar el email
```
From: tu@email.com
To: Webhook data → email
Subject: ✅ Compra confirmada - Un Latido por Thiago
Body: (ver ejemplo abajo)
```

### Ejemplo de Body del Email:

```
Hola {{fullName}},

¡Gracias por comprar {{quantity}} boleto(s) para "Un Latido por Thiago"!

DETALLES DE TU COMPRA:
━━━━━━━━━━━━━━━━━━━━━━━━━
ID: {{id}}
Boletos: {{quantity}}
Total: ${{total}}
Método de pago: {{paymentMethod}}
Fecha: {{timestamp}}

PRÓXIMOS PASOS:

Si elegiste Mercado Pago:
→ Haz clic aquí: https://mpago.la/32gk8zg
→ Completa el pago
→ Recibirás confirmación

Si elegiste Transferencia:
→ Realiza transferencia a:
  Banco: BBVA
  Cuenta: 151 170 8950
  Titular: Mario Alejandro Soto López
→ Envía comprobante por WhatsApp: +52-9841-2357-470

Si elegiste Efectivo:
→ Nos contactaremos para coordinar

TU BOLETO SE ENVIARÁ POR WHATSAPP UNA VEZ CONFIRMADO EL PAGO.

¡Cada boleto vendido es un paso más cercano a la cirugía de Thiago! 💙

Preguntas: mrsolutionsts@gmail.com
WhatsApp: +52-9841-2357-470
```

### 4.4 Guardar
Presiona Ctrl+S

**¡LISTO! Make envía emails** ✅

---

## 📱 PASO 6: Agregar Módulo de WhatsApp (Confirmación)

### 6.1 Agregar módulo Twilio
1. Haz clic en el "+" 
2. Busca: "Twilio"
3. Selecciona: "Twilio" → "Send a message"

### 6.2 Autorizar Twilio
1. Necesitarás una cuenta de Twilio (https://www.twilio.com)
2. Obtén tu Account SID y Auth Token
3. Autoriza en Make

### 6.3 Configurar el WhatsApp
```
To (número): Webhook data → phone (con formato +52...)
From (tu número): Tu número de Twilio
Message: (ver ejemplo abajo)
```

### Ejemplo de Mensaje:

```
¡Hola {{fullName}}! 👋

Gracias por comprar {{quantity}} boleto(s) para "Un Latido por Thiago" 💙

🎟️ ID de tu compra: {{id}}
💰 Total: ${{total}}
📅 Evento: 16 de octubre de 2026

Próximo paso: Completa el pago según tu método elegido.

Tu boleto se enviará por WhatsApp una vez confirmado el pago.

¡Cada boleto vendido es un paso más hacia la cirugía de Thiago! 💪

Preguntas: +52-9841-2357-470
```

**¡LISTO! Make envía WhatsApp** ✅

---

## ✅ PASO 7: Probar el Flujo

### 7.1 En Make
1. Haz clic en el botón "Run once"
2. Espera a que complete
3. Verifica que se ejecutó correctamente

### 7.2 En tu Sitio Web
1. Abre tu sitio: https://mario06a007-ship-it.github.io/cena-thiago/
2. Llena el formulario
3. Haz clic en "Procesar Compra"

### 7.3 Verificar
- ✅ ¿Aparece la compra en Notion?
- ✅ ¿Llega el email?
- ✅ ¿Llega el WhatsApp?

Si todo funciona, **¡FELICIDADES!** 🎉

---

## 🔗 PASO 8: Conectar Sitio Web a Make

### 8.1 Copiar URL del Webhook
```
En Make → Click en el módulo Webhook
Verás la URL: https://hook.make.com/...
CÓPIALA
```

### 8.2 Configurar en tu Sitio
```javascript
// Abre tu sitio web
// Presiona F12 (consola)
// Ejecuta:

configureMake("https://hook.make.com/...")

// Reemplaza con tu URL real
// Presiona Enter
```

### 8.3 Verificar
Deberías ver:
```
✅ Make configurado correctamente
```

**¡LISTO! Todo conectado** ✅

---

## 🎯 Verificación Final

### Checklist
- [ ] Crear cuenta en Make
- [ ] Crear escenario
- [ ] Agregar Webhook (copiar URL)
- [ ] Agregar módulo Notion
- [ ] Agregar módulo Gmail
- [ ] Agregar módulo Twilio (opcional)
- [ ] Probar flujo en Make
- [ ] Probar desde sitio web
- [ ] Ejecutar `configureMake("webhook-url")` en consola
- [ ] Hacer compra de prueba
- [ ] Verificar: Notion + Email + WhatsApp

**Si todo funciona: ¡LANZAMIENTO!** 🚀

---

## 🆘 Troubleshooting

### "El webhook no funciona"
```
Solución:
1. Asegúrate de haber copiado la URL completa
2. Verifica que empiece con https://
3. En Make, recarga la página
4. Prueba de nuevo
```

### "Los datos no llegan a Notion"
```
Solución:
1. Verifica que los campos coincidan exactamente
2. Chequea que la base de datos sea la correcta
3. Revisa que Make tenga permiso de Notion
4. En Make, mira los logs de ejecución
```

### "No llega el email"
```
Solución:
1. Verifica que el email sea correcto
2. Asegúrate que Gmail está autorizado en Make
3. Chequea la carpeta de SPAM
4. Revisa los logs de ejecución en Make
```

### "No llega el WhatsApp"
```
Solución:
1. Verifica que Twilio está configurado
2. Asegúrate que el número es correcto (+52...)
3. Chequea que tu número de Twilio está activo
4. Revisa los logs en Make
```

---

## 🚀 Bonus: Crear Alertas

### En Make, puedes agregar:
1. **Slack** - Notificación cuando hay compra
2. **Google Sheets** - Llenar hoja de cálculo
3. **Todoist** - Crear tarea para seguimiento
4. **Discord** - Notificación en servidor

**Simplemente agrega módulos igual que hiciste con email**

---

## 📊 Monitoreo

Desde Make puedes:
- Ver todas las ejecuciones del escenario
- Revisar logs detallados
- Editar y mejorar el flujo
- Agregar más integraciones

---

## ✨ Funcionalidades Avanzadas

### Condicionales
Puedes agregar lógica como:
- "Si es Mercado Pago, hacer X"
- "Si es Transferencia, hacer Y"
- "Si hay observaciones especiales, notificar a admin"

### Búsquedas
Puedes buscar datos antes de guardar:
- Verificar si el email ya existe
- Comprobar stock de boletos
- Validar información

### Formateo
Puedes formatear datos:
- Cambiar formato de teléfono
- Validar emails
- Convertir monedas

---

## 💡 Tips

✅ Prueba siempre el flujo antes de lanzar  
✅ Revisa los logs si algo falla  
✅ Mantén URLs seguras en variables  
✅ Documenta cada módulo  
✅ Haz backups de tu escenario  

---

## 📚 Documentación

- Make: https://www.make.com/en/integrations
- Notion API: https://developers.notion.com
- Gmail API: https://developers.google.com/gmail/api
- Twilio API: https://www.twilio.com/docs

---

## 🎉 ¡LISTO!

Tu sistema está **100% automatizado** con Make:
- ✅ Datos en Notion
- ✅ Emails de confirmación
- ✅ WhatsApp automático
- ✅ Sin hacer nada manual

**Disfruta tu tiempo mientras Make hace el trabajo** 🤖

---

**Creado para: Un Latido por Thiago**  
**Cada compra es un paso más hacia la cirugía de Thiago** 💙
