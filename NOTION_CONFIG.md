# 🗄️ Configuración de Notion como Base de Datos

## ¿Por qué Notion?

Notion permite:
- ✅ Ver todas las compras en una tabla profesional
- ✅ Filtrar y ordenar datos
- ✅ Acceder desde cualquier dispositivo
- ✅ Crear automáticamente formularios
- ✅ Compartir con otros usuarios
- ✅ Hacer búsquedas avanzadas
- ✅ Exportar a CSV/PDF

---

## 📋 Paso 1: Crear Base de Datos en Notion

### 1.1 Ir a Notion
- Abre https://www.notion.so
- Inicia sesión (crea cuenta si no la tienes)

### 1.2 Crear Nuevo Database
- Haz clic en "Add a page"
- Selecciona "Database"
- Elige "Table"
- Nombre: **"Un Latido por Thiago - Compras de Boletos"**

### 1.3 Configurar Columnas

Elimina las columnas por defecto y crea estas:

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| **ID** | Title | ID único del boleto (TICKET-...) |
| **Nombre** | Text | Nombre completo del cliente |
| **Email** | Email | Email del cliente |
| **Teléfono** | Phone Number | Teléfono/WhatsApp |
| **Cantidad de Boletos** | Number | Cantidad de boletos comprados |
| **Total** | Number | Monto total pagado |
| **Método de Pago** | Select | Opciones: Mercado Pago, Transferencia Bancaria, Efectivo |
| **Observaciones** | Text | Notas especiales del cliente |
| **Fecha** | Date | Fecha de la compra |
| **Estado** | Select | Opciones: Pendiente de Confirmación, Pagado, Confirmado |

---

## 🔑 Paso 2: Obtener Credenciales

### 2.1 Crear Integración en Notion

1. Ve a https://www.notion.so/my-integrations
2. Haz clic en **"Create new integration"**
3. Nombre: **"Cena Thiago Bot"**
4. Asociado a: Selecciona tu workspace
5. Haz clic en **"Submit"**

### 2.2 Copiar API Key

1. En la integración creada, verás un botón "Show"
2. Copia el **Internal Integration Token**
3. Guárdalo en un lugar seguro (lo usaremos después)

**Ejemplo de API Key:**
```
secret_AbCdEfGhIjKlMnOpQrStUvWxYz123456
```

### 2.3 Obtener Database ID

1. Abre tu base de datos en Notion
2. En la URL del navegador, verás algo como:
   ```
   https://www.notion.so/AbCdEfGh1234567890123456789?v=AbCdEfGh
   ```
3. La parte **`AbCdEfGh1234567890123456`** es tu Database ID

**Nota:** Algunos dicen que es el código largo antes del `?v=`

---

## 🔐 Paso 3: Conectar Integración a la Base de Datos

1. Abre tu base de datos
2. Haz clic en **"Share"** (arriba a la derecha)
3. Haz clic en **"Invite"** 
4. Busca tu integración (**"Cena Thiago Bot"**)
5. Selecciónala y haz clic en **"Invite"**

**¡IMPORTANTE!** Sin este paso, la integración no tendrá acceso.

---

## 💻 Paso 4: Configurar en tu Sitio Web

### 4.1 Abrir Consola del Navegador

1. Abre tu sitio web: https://mario06a007-ship-it.github.io/cena-thiago/
2. Presiona **F12** (o Ctrl+Shift+I)
3. Ve a la pestaña **"Console"**

### 4.2 Ejecutar Configuración

Copia y pega esto en la consola (reemplaza con tus datos):

```javascript
configureNotion('secret_AbCdEfGhIjKlMnOpQrStUvWxYz123456', 'AbCdEfGh1234567890123456')
```

**Dónde:**
- Primer parámetro = tu API Key (Internal Integration Token)
- Segundo parámetro = tu Database ID

### 4.3 Verificar Configuración

Después de ejecutar, verás un mensaje como:
```
✅ Notion configurado correctamente
```

La página se recargará automáticamente.

---

## ✅ Paso 5: Verificar que Funciona

### 5.1 En tu Sitio Web

1. Llena el formulario de compra
2. Haz clic en "Procesar Compra"
3. Deberías ver el modal de confirmación

### 5.2 En Notion

1. Abre tu base de datos en Notion
2. Recarga la página (Ctrl+R)
3. **Deberías ver la compra registrada** en la tabla

### 5.3 En la Consola

Ejecuta en F12:
```javascript
getCenas()
```

Verás una tabla con todas las compras.

---

## 🔄 Sincronizar Datos

Si en algún momento necesitas sincronizar (actualizar los datos desde Notion):

```javascript
syncNotion()
```

Esto cargará todas las compras de Notion nuevamente.

---

## 🚨 Troubleshooting

### "Error 401" o "Error de autenticación"
- Verifica que copiaste correctamente el API Key
- Asegúrate que la integración está invitada a la base de datos

### "Error 404" o "Database not found"
- Verifica que copiaste correctamente el Database ID
- Asegúrate que el ID sea el correcto (sin espacios ni caracteres extra)

### "Las compras no aparecen en Notion"
- Recarga la página de Notion (Ctrl+R)
- Verifica que la integración tiene permisos de escritura
- Revisa que los nombres de las columnas coincidan exactamente

### "No hay permiso para insertar"
- Ve a tu base de datos en Notion
- Click en "Share"
- Verifica que "Cena Thiago Bot" tenga acceso
- Cambia permisos a "Can edit"

---

## 📊 Vista de Notion

Una vez configurado, tu base de datos en Notion se verá así:

```
ID | Nombre | Email | Teléfono | Boletos | Total | Método | Fecha | Estado
---|--------|-------|----------|---------|-------|--------|-------|-------
TICKET-1 | Juan | j@email | 52-984... | 2 | $2,400 | Mercado Pago | 2026-08-28 | Pagado
TICKET-2 | María | m@email | 52-984... | 1 | $1,200 | Transferencia | 2026-08-28 | Pendiente
... | ... | ... | ... | ... | ... | ... | ... | ...
```

---

## 🎯 Características Avanzadas en Notion

### Crear un Filtro
- Click en "Filter"
- Filtra por: Estado = "Pagado"
- Verás solo las compras confirmadas

### Crear Vistas Personalizadas
- Crea vista "Pagos Pendientes"
- Filtra: Estado = "Pendiente de Confirmación"
- Crea vista "Estadísticas"
- Agrega datos calculados (suma de totales, etc)

### Exportar a CSV
- Selecciona todas las filas
- Click en "Export"
- Elige formato CSV o PDF
- Descarga

### Crear Calendario
- Click en "Add a view"
- Selecciona "Calendar"
- Usa la columna "Fecha" como base
- Verás todas las compras en calendario

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- **Nunca** compartas tu API Key públicamente
- **Nunca** la subas a GitHub públicamente
- Guárdala en un lugar seguro
- Si sospechas que fue expuesta, regenera en Notion

---

## ❌ Deshabilitar Notion

Si en algún momento quieres dejar de usar Notion:

```javascript
localStorage.removeItem('notionApiKey');
localStorage.removeItem('notionDatabaseId');
location.reload();
```

Los datos seguirán guardándose en localStorage, pero no en Notion.

---

## 📚 Documentación Oficial

- Notion API: https://developers.notion.com
- Notion Integrations: https://www.notion.so/my-integrations
- Notion Help: https://www.notion.so/help

---

## ✅ Checklist de Configuración

- [ ] Crear cuenta Notion (si no la tiene)
- [ ] Crear base de datos "Un Latido por Thiago"
- [ ] Configurar todas las columnas
- [ ] Crear integración en Notion
- [ ] Copiar API Key
- [ ] Obtener Database ID
- [ ] Invitar integración a la base de datos
- [ ] Abrir consola del navegador (F12)
- [ ] Ejecutar configureNotion()
- [ ] Verificar que la página se recargue
- [ ] Hacer compra de prueba
- [ ] Verificar que aparezca en Notion
- [ ] Ejecutar getCenas() para ver tabla

---

**¡Listo! Ahora todos los datos se guardan en Notion automáticamente** 📊

Podrás ver, filtrar, ordenar y exportar todas las compras directamente en Notion.
