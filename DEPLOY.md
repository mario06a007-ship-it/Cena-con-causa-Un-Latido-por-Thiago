# 🚀 Guía de Despliegue en GitHub Pages

## Paso 1: Crear el Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Inicia sesión con tu cuenta (mario06a007-ship-it)
3. Haz clic en el botón **"+"** → **"New repository"**
4. Nombre del repo: `cena-thiago`
5. Descripción: "Sistema de venta de boletos para la cena benéfica Un Latido por Thiago"
6. Selecciona **"Public"**
7. NO inicialices con README (ya lo tenemos)
8. Haz clic en **"Create repository"**

## Paso 2: Conectar tu Repositorio Local

En la terminal, desde el directorio `/home/claude/cena-thiago`, ejecuta:

```bash
git remote add origin https://github.com/mario06a007-ship-it/cena-thiago.git
git branch -M main
git push -u origin main
```

## Paso 3: Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub: https://github.com/mario06a007-ship-it/cena-thiago
2. Haz clic en **Settings** (⚙️)
3. En el menú lateral, haz clic en **"Pages"**
4. En "Build and deployment":
   - Source: Selecciona **"Deploy from a branch"**
   - Branch: Selecciona **"main"** y **"/root"**
5. Haz clic en **"Save"**
6. Espera 1-2 minutos mientras se despliega

## Paso 4: Verificar el Despliegue

Tu sitio estará disponible en:
```
https://mario06a007-ship-it.github.io/cena-thiago/
```

GitHub te mostrará un mensaje confirmando que el sitio está en vivo.

## Paso 5: Configuración de Dominio (Opcional)

Si quieres un dominio personalizado:
1. Ve a Settings → Pages
2. En "Custom domain", ingresa tu dominio
3. Configura los records DNS en tu proveedor de dominio

## Mantener Actualizado el Sitio

Cada vez que hagas cambios en el código:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

El sitio se actualizará automáticamente en unos minutos.

## Solucionar Problemas

### El sitio no aparece después de 2 minutos
1. Recarga la página
2. Limpia el caché (Ctrl+Shift+R)
3. Verifica que el branch esté configurado en Settings → Pages

### Los estilos no cargan
1. Verifica que todos los archivos CSS estén en el repositorio
2. Asegúrate que los paths sean relativos (no absolutos)

### El formulario no guarda datos
Los datos se guardan en localStorage del navegador. Esto es normal. Para agregar una base de datos real:
1. Usa Firebase Realtime Database
2. Usa AWS Amplify
3. Usa una API backend custom

## Variables de Entorno (Si es necesario)

Crea un archivo `.env` en la raíz del proyecto:

```
MERCADO_PAGO_LINK=https://mpago.la/32gk8zg
BANK_ACCOUNT=151170895
WHATSAPP=5298412357470
```

Luego en `script.js` reemplaza los valores hardcodeados.

---

💙 Tu sitio está listo para recaudar fondos para Thiago
