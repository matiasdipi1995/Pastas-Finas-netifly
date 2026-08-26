/* ==========================================================================
   LÓGICA GLOBAL DEL CARRITO DE COMPRAS Y PEDIDOS - DELICIAS CASERAS
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. MAPEADO DE ELEMENTOS DEL DOM (NODOS)
// --------------------------------------------------------------------------
// Selectores compartidos entre la interfaz principal (index.html) y ventas.html
const botonesAgregar = document.querySelectorAll(".añadir-tarjeta");
const cartBtn = document.querySelector(".cart-btn");
const cartDropdown = document.getElementById("cart-dropdown");
const cartContent = document.getElementById("cart-content");
const cartNumber = document.querySelector(".cart-num");
const cartItemsOutput = document.getElementById("cart-items-output");
const cartTotalDisplay = document.getElementById("cart-total-display");

// --------------------------------------------------------------------------
// 2. ESTADO INICIAL DEL CARRITO (PERSISTENCIA CON LOCALSTORAGE)
// --------------------------------------------------------------------------
// Intentamos recuperar el carrito guardado en el navegador. 
// Como localStorage solo guarda texto, usamos JSON.parse para convertirlo de nuevo en un Array.
let carrito = JSON.parse(localStorage.getItem("mi_carrito")) || [];

// --------------------------------------------------------------------------
// 3. EVENTOS DE INTERACCIÓN USER INTERFACE (UI)
// --------------------------------------------------------------------------

// Desplegar/Ocultar el menú lateral o flotante del carrito
if (cartBtn) {
    cartBtn.addEventListener("click", () => {
        cartDropdown.classList.toggle("active");
    });
}

// Escuchador dinámico para capturar el clic en "Añadir al carrito"
botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", () => {
        // Buscamos la tarjeta contenedora del producto más cercana
        const card = boton.closest(".producto-card");
        const nombre = card.querySelector("h3").textContent;
        const precioTexto = card.querySelector(".precio").textContent;
        // Limpiamos el texto del precio eliminando signos usando expresiones regulares
        const precio = parseInt(precioTexto.replace(/[^0-9]/g, ""));

        // Agregamos el objeto nuevo al final del listado en memoria
        carrito.push({ nombre, precio });

        // Guardamos los cambios inmediatamente en el localStorage
        localStorage.setItem("mi_carrito", JSON.stringify(carrito));

        // Refrescamos la interfaz visual
        actualizarCarrito();
    });
});


const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");

if (btnVaciarCarrito) {
    btnVaciarCarrito.addEventListener("click", () => {

        if (carrito.length === 0) {
            alert("El carrito ya está vacío.");
            return;
        }

        const confirmar = confirm(
            "¿Estás seguro de que quieres vaciar todo el carrito?"
        );

        if (confirmar) {
            carrito = [];
            localStorage.removeItem("mi_carrito");

            actualizarCarrito();

            alert("🗑️ Carrito vaciado correctamente.");
        }
    });
}
// --------------------------------------------------------------------------
// 4. SISTEMA DE RENDERIZADO Y ACTUALIZACIÓN DINÁMICA
// --------------------------------------------------------------------------
function actualizarCarrito() {
    // Sincronizamos el numerito flotante del botón del carrito con el tamaño del array
    if (cartNumber) {
        cartNumber.textContent = carrito.length;
    }
    
    // Limpiamos los contenedores antes de reescribirlos para evitar duplicados
    if (cartContent) cartContent.innerHTML = "";
    if (cartItemsOutput) cartItemsOutput.innerHTML = "";

    // CONTROL DE CARRITO VACÍO: Si no hay elementos, mostramos avisos amigables
    if (carrito.length === 0) {
        if (cartContent) {
            cartContent.innerHTML = `
                <p class="empty-cart">Tu carrito está vacío</p>
                <a href="index.html#productos" class="go-shopping">Ir a comprar</a>
            `;
        }

        if (cartItemsOutput) {
            cartItemsOutput.innerHTML = `<li class="empty-cart">No seleccionaste ningún producto.</li>`;
        }

        if (cartTotalDisplay) {
            cartTotalDisplay.textContent = "$0";
        }
        return; // Interrumpimos la ejecución porque no hay nada que calcular
    }

    // CONTROL DE CARRITO CON ELEMENTOS: Recorremos el arreglo e inyectamos el HTML
    let total = 0;

    carrito.forEach((producto, index) => {
        total += producto.precio;

        // Renderizado para el desplegable flotante (index.html)
        // Agregamos un botón de borrado individual pasándole su índice (index)
        if (cartContent) {
            cartContent.innerHTML += `
                <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <span>${producto.nombre}</span> - 
                        <span style="font-weight: bold;">$${producto.precio.toLocaleString()}</span>
                    </div>
                    <button type="button" class="btn-remove-item" onclick="eliminarItemCarrito(${index})" style="background:none; border:none; color:#C94C4C; cursor:pointer; font-size:1rem;">🗑️</button>
                </div>
            `;
        }

        // Renderizado para el sumario/resumen del formulario de pago (ventas.html)
        // También incluye el botón de borrado individual reutilizando el mismo index
        if (cartItemsOutput) {
            cartItemsOutput.innerHTML += `
                <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span>• ${producto.nombre} - $${producto.precio.toLocaleString()}</span>
                    <button type="button" class="btn-remove-item" onclick="eliminarItemCarrito(${index})" style="background:none; border:none; color:#C94C4C; cursor:pointer; font-size:0.9rem; margin-left: 10px;">Quitar ❌</button>
                </li>
            `;
        }
    });

    // Actualizamos el costo acumulado total en las pantallas que lo requieran
    if (cartTotalDisplay) {
        cartTotalDisplay.textContent = `$${total.toLocaleString()}`;
    }
}

// --------------------------------------------------------------------------
// 5. FUNCIÓN CRUCIAL: ELIMINAR UN ITEM ESPECÍFICO DEL CARRITO
// --------------------------------------------------------------------------
// Exponemos la función de manera global (window.) para que los botones dinámicos 
// con el atributo "onclick" puedan llamarla desde cualquier vista (index.html o ventas.html)
window.eliminarItemCarrito = function(index) {
    // Removemos exactamente 1 elemento ubicado en la posición 'index'
    carrito.splice(index, 1);
    
    // Impactamos el cambio en la memoria local para mantener sincronizadas las pestañas
    localStorage.setItem("mi_carrito", JSON.stringify(carrito));
    
    // Redibujamos la interfaz de inmediato
    actualizarCarrito();
};

// --------------------------------------------------------------------------
// 6. FORMULARIO DE COMPRA Y ENVÍO AUTOMATIZADO A WHATSAPP
// --------------------------------------------------------------------------
const formularioCompra = document.querySelector("#compra form");

if (formularioCompra) {
    formularioCompra.addEventListener("submit", (e) => {
        e.preventDefault(); // Bloqueamos la recarga automática del navegador

        // Capturamos los campos completados por el cliente
        const nombreClient = document.getElementById("customer-name").value;
        const telefonoClient = document.getElementById("customer-phone").value;
        const direccionClient = document.getElementById("customer-address").value;
        const notesElement = document.getElementById("customer-notes");
        const notasClient = notesElement ? (notesElement.value || "Ninguna") : "Ninguna";

        // Estructuración del mensaje estético usando negritas con asteriscos (*) para WhatsApp
        let mensaje = `*NUEVO PEDIDO - DELICIAS CASERAS*\n\n`;
        mensaje += `*Datos de Entrega:*\n`;
        mensaje += `👤 *Nombre:* ${nombreClient}\n`;
        mensaje += `📞 *Teléfono:* ${telefonoClient}\n`;
        mensaje += `📍 *Dirección:* ${direccionClient}\n`;
        mensaje += `📝 *Notas:* ${notasClient}\n\n`;
        mensaje += `----------------------------------\n`;
        mensaje += `🛒 *Detalle del Pedido:*\n`;

        let total = 0;
        carrito.forEach((producto) => {
            mensaje += `• ${producto.nombre} - $${producto.precio.toLocaleString()}\n`;
            total += producto.precio;
        });

        mensaje += `----------------------------------\n`;
        mensaje += `💰 *TOTAL GENERAL:* $${total.toLocaleString()}\n\n`;
        mensaje += `¡Muchas gracias! Espero mi pedido.`;

        // Configuración del destino del WhatsApp del local (Monteros, Tucumán)
        const numeroTelefono = "5493863564018"; 

        // Codificación segura del texto para insertarlo en parámetros URL
        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;

        // Limpieza absoluta de la memoria local tras enviar el pedido
        carrito = [];
        localStorage.removeItem("mi_carrito");

        // Abrimos la interfaz de chat en pestaña externa
        window.open(urlWhatsApp, "_blank");

        // Redirección de retorno limpio a la página de inicio
        window.location.href = "index.html";
    });
}

// --------------------------------------------------------------------------
// 7. CANCELACIÓN TOTAL DE LA OPERACIÓN
// --------------------------------------------------------------------------
const botonCancelar = document.getElementById("btn-cancelar");

if (botonCancelar) {
    botonCancelar.addEventListener("click", () => {
        // Vaciamos el estado y borramos el registro local
        carrito = [];
        localStorage.removeItem("mi_carrito");
        
        // Actualizamos la vista y notificamos
        actualizarCarrito();
        alert("Compra cancelada. El carrito se ha vaciado.");
    });
}

// --------------------------------------------------------------------------
// INITIALIZATION
// --------------------------------------------------------------------------
// Ejecución inmediata al cargar el archivo para dibujar el estado actual
actualizarCarrito();