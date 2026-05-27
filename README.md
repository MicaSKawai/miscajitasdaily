# 🎮 MisCajitasDaily — CS2 Drop Tracker

Tracker de drops semanales de CS2 para múltiples cuentas de Steam.

---

## 🚀 Cómo subir esto a GitHub Pages (paso a paso)

### PASO 1 — Crear proyecto en Firebase

1. Andá a **https://firebase.google.com** e iniciá sesión con tu Gmail
2. Click en **"Ir a la consola"**
3. Click en **"Agregar proyecto"**
4. Nombre: `miscajitasdaily` → continuar → desactivar Google Analytics → **Crear proyecto**
5. Una vez creado, en el menú izquierdo click en **Firestore Database**
6. Click **"Crear base de datos"**
7. Elegí **"Iniciar en modo de prueba"** → Siguiente → Elegí una ubicación (cualquiera) → **Listo**
8. Ahora en el menú izquierdo, click en el **ícono de engranaje** → **"Configuración del proyecto"**
9. Bajá hasta **"Tus apps"** → click en el ícono **`</>`** (Web)
10. Poné un apodo: `miscajitasdaily-web` → **Registrar app**
11. Te va a mostrar un objeto `firebaseConfig` con tus credenciales. **Copialo.**

---

### PASO 2 — Pegar las credenciales en el código

Abrí el archivo `app.js` y reemplazá esta sección:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

Con los valores reales que te dio Firebase. Se ve algo así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbCdEf123...",
  authDomain: "miscajitasdaily.firebaseapp.com",
  projectId: "miscajitasdaily",
  storageBucket: "miscajitasdaily.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

### PASO 3 — Crear el repositorio en GitHub

1. Andá a **https://github.com/new**
2. Nombre del repositorio: `miscajitasdaily`
3. Dejalo **Public** (necesario para GitHub Pages gratis)
4. Click **"Create repository"**

---

### PASO 4 — Subir los archivos

Tenés dos opciones:

#### Opción A — Desde la web (más fácil)
1. En tu repo de GitHub, click en **"uploading an existing file"**
2. Arrastrá los 4 archivos: `index.html`, `style.css`, `app.js`, `drops-data.js`
3. Click **"Commit changes"**

#### Opción B — Con Git (si lo tenés instalado)
```bash
git init
git add .
git commit -m "Initial commit - MisCajitasDaily"
git branch -M main
git remote add origin https://github.com/TUUSUARIO/miscajitasdaily.git
git push -u origin main
```

---

### PASO 5 — Activar GitHub Pages

1. En tu repo → **Settings** (arriba a la derecha)
2. En el menú izquierdo → **Pages**
3. Bajo "Branch" → seleccioná **main** → carpeta **/ (root)**
4. Click **Save**
5. Esperá 1-2 minutos y tu sitio estará en:
   **`https://TUUSUARIO.github.io/miscajitasdaily`**

---

### PASO 6 — Configurar reglas de Firestore (importante)

Para que la página pueda leer y escribir, en Firebase:
1. Firestore Database → **Reglas**
2. Reemplazá el contenido con:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publicar**

> ⚠️ Esto está bien para uso personal. Si querés más seguridad en el futuro, se puede agregar autenticación.

---

## 📁 Archivos del proyecto

| Archivo | Descripción |
|---|---|
| `index.html` | Estructura HTML de la página |
| `style.css` | Todos los estilos (tema CS2) |
| `app.js` | Lógica de la app + conexión Firebase |
| `drops-data.js` | Base de datos de cajas y armas de CS2 |

---

## 🔧 Personalización

### Cambiar nombres de cuentas
En `index.html` buscá los `<select>` con las opciones `Cuenta 1` a `Cuenta 5` y cambiá los textos.

### Actualizar precios de drops
En la web: click en el precio de cualquier item para editarlo.
En el código: editá `drops-data.js`.

### Agregar nuevas cajas/armas
En `drops-data.js`, agregá un nuevo objeto al array `cajas` o `armas`.

---

## ✅ Todo gratis, 24/7

- **Hosting**: GitHub Pages — Gratis
- **Base de datos**: Firebase Firestore — Gratis (hasta 1GB y 50k lecturas/día)
- **Dominio**: `tuusuario.github.io/miscajitasdaily` — Gratis
