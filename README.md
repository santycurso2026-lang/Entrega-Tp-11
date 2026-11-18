# Trabajo Práctico 11 - Reemplazo completo de reservas desde la web (`tp-11-salas-web-completa-mongodb`)

Aplicación web y API REST desarrollada con Node.js, Express, MongoDB Atlas, Mongoose y EJS para la gestión de reservas de salas. En esta entrega se incorpora la edición por **reemplazo completo** desde una interfaz web (`GET` y `POST /reservas/:id/editar`), reutilizando la lógica de servicio de `PUT /api/reservas/:id` y conservando las funcionalidades de creación, listado y consulta heredadas.

---

## 🛠️ Tecnologías Utilizadas

* **Node.js** (v24.14.0)
* **Express** (Framework web y enrutamiento)
* **MongoDB Atlas & Mongoose** (Persistencia en base de datos NoSQL y validación de esquemas)
* **EJS & express-ejs-layouts** (Motor de plantillas para vistas HTML)
* **Morgan** (Logger de peticiones HTTP)
* **ESLint & Prettier** (Control de calidad y formateo de código)

---

## 📂 Estructura del Proyecto

```text
tp-11-salas-web-completa-mongodb/
├── scripts/
│   └── comprobar-conexion.js       # Script de verificación de conexión a MongoDB
├── src/
│   ├── controladores/
│   │   └── reservas.js             # Lógica de controladores web y API
│   ├── rutas/
│   │   └── reservas.js             # Definición de rutas web (/reservas) y API (/api/reservas)
│   └── index.js                    # Punto de entrada y configuración del servidor
├── views/
│   └── reservas/
│       └── editar.ejs              # Formulario web de edición por reemplazo completo
├── public/                         # Recursos estáticos (CSS, JS, imágenes)
├── .env.example                    # Plantilla de variables de entorno (sin secretos)
├── package.json                    # Dependencias y scripts
└── README.md                       # Documentación del proyecto

Instalación y Ejecución Local
Clonar el repositorio:
git clone [https://github.com/xxx-usuario/tp-11-salas-web-completa-mongodb.git](https://github.com/tu-usuario/tp-11-salas-web-completa-mongodb.git)
cd tp-11-salas-web-completa-mongodb

Instalar dependencias:
Bash
npm ci

3. **Configurar las variables de entorno:**
* Copiar el archivo de ejemplo y cámbiale el nombre a `.env` (asegúrar de no subir credenciales reales al repositorio).
PORT=3000
NODE_ENV=development
MONGODB_USERNAME="xxxxxxxxxxx"
MONGODB_PASSWORD="xxxxxxxxxxx"
MONGODB_URI=mongodb+srv://xxxxxxxxxx_db_user:xxxxx@cluster0.m1noo6i.mongodb.net/reservas_sala_u11?retryWrites=true&w=majority

* Configuración de conexión a **MongoDB Atlas Free** utilizando la base de datos `reservas_salas_u11` y la colección `reservas`.


4. **Comprobar la conexión a la base de datos:**
```bash
node --env-file=.env scripts/comprobar-conexion.js

```


5. **Iniciar la aplicación:**
```bash
node --env-file=.env src/index.js

```


*La aplicación estará disponible en `http://localhost:3000`.*

---

## 🔒 2. Variables de Entorno (`.env.example`)

El proyecto requiere las siguientes variables definidas en el archivo `.env`:

* `PORT`: Puerto en el que corre la aplicación (ej. `3000`).
* `MONGODB_URI`: Cadena de conexión a MongoDB Atlas Free (`reservas_salas_u11`).



---

## 📋 3. Campos del Sistema

El modelo de reservas gestiona los siguientes **7 campos obligatorios** (validados tanto en la interfaz web como en las rutas de API):

1. **estudiante**: Nombre del estudiante (texto obligatorio).
2. **email**: Correo electrónico (debe incluir el símbolo `@`).


3. **sala**: Ubicación de la sala (`Sala Norte`, `Sala Sur` o `Sala Este`).


4. **fecha**: Fecha de la reserva (formato `YYYY-MM-DD`).


5. **turno**: Franja horaria (`Mañana`, `Tarde` o `Noche`).


6. **personas**: Cantidad de asistentes (número entero de `1` a `6`).


7. **estado**: Situación actual de la reserva (`pendiente` o `confirmada`).



---

## 🛣️ 4. Rutas y Endpoints

### Interfaz Web (Vistas EJS)

* **`GET /reservas/:id/editar`**: Busca el documento por ID y precarga los 7 campos editables en el formulario web.


* **`POST /reservas/:id/editar`**: Recibe los datos del formulario, valida las restricciones, ejecuta el reemplazo completo mediante el servicio y redirige.



### API REST

* **`PUT /api/reservas/:id`**: Realiza el reemplazo completo de la reserva vía JSON (comparte lógica y servicio con el controlador web).



---

## 🔄 5. Destino de la Redirección (Código 303)

* Al guardar un reemplazo de forma exitosa tanto desde la web como por API, el sistema emite una respuesta con código **`303 See Other`**, redirigiendo al usuario al detalle de la reserva o al listado general (`/reservas`).



---

## 🧪 6. Pruebas Reproducibles

* **Edición Web:** Abrir el listado en `http://localhost:3000/reservas`, hacer clic en editar una reserva, modificar el número de personas o el estado, y guardar para verificar la redirección `303`.


* **Manejo de Errores (400):** Enviar un formulario con datos inválidos (ej. `personas = 0`) para comprobar que el sistema responde con un HTML `400` y **conserva intactos los valores** que el usuario había ingresado en pantalla, sin alterar la base de datos.


* **Pruebas en Postman:**
* Realizar un `PUT /api/reservas/ID_REAL` con JSON completo para verificar código `200` y actualización en la web.


* Enviar un `PUT` incompleto o inválido para verificar la respuesta `400` sin modificar el documento.


---

## ✅ 7. Verificación de Código

Antes de realizar la entrega, se ejecutó la validación de sintaxis y estilo exigida por la cátedra:

```bash
npm run check

```

---

Desarrollado como parte del trayecto de aprendizaje en desarrollo backend.

---

