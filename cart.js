let cart = JSON.parse(localStorage.getItem('ventasSilvaCart')) || [];

function addToCart(name, price, id) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1, id: id });
    }

    updateButton(name, price, id);
    saveAndRefresh();
}

// UNIFICADA: Esta función ahora sirve para el carrito y para los botones de la tienda
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(name);
    } else {
        // Buscamos los datos para actualizar el botón de la tienda si existe
        updateButton(item.name, item.price, item.id);
        saveAndRefresh();
    }
}

function updateButton(name, price, id) {
    const container = document.getElementById(`btn-container-${id}`);
    if (!container) return;

    const item = cart.find(i => i.name === name);
    const quantity = item ? item.quantity : 0;

    if (quantity > 0) {
        container.innerHTML = `
            <div class="d-flex align-items-center justify-content-between border rounded-pill p-1 bg-light">
                <button class="btn btn-sm btn-dark rounded-circle" onclick="updateQuantity('${name}', -1)" style="width:30px; height:30px;">-</button>
                <span class="fw-bold mx-2">${quantity}</span>
                <button class="btn btn-sm btn-dark rounded-circle" onclick="updateQuantity('${name}', 1)" style="width:30px; height:30px;">+</button>
            </div>
        `;
    }
}

function resetButton(name, price, id) {
    const container = document.getElementById(`btn-container-${id}`);
    if (container) {
        container.innerHTML = `<button class="btn btn-add w-100" onclick="addToCart('${name}', ${price}, '${id}')">+ Añadir</button>`;
    }
}

function saveAndRefresh() {
    localStorage.setItem('ventasSilvaCart', JSON.stringify(cart));
    renderCart();

    const countLabel = document.getElementById('cart-count');
    const cartBtn = countLabel ? countLabel.parentElement : null;

    if (countLabel) {
        countLabel.classList.remove('cart-pop');
        if (cartBtn) cartBtn.classList.remove('cart-icon-shake');

        setTimeout(() => {
            countLabel.classList.add('cart-pop');
            if (cartBtn) cartBtn.classList.add('cart-icon-shake');
        }, 10);
    }
}

function renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const totalLabel = document.getElementById('cart-total');
    const countLabel = document.getElementById('cart-count');
    
    if (!itemsContainer || !totalLabel) return;

    itemsContainer.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        // --- LOGICA DE LIMPIEZA TOTAL ---
        // Si el carrito está vacío, buscamos todos los botones que tengan controles +/-
        // y los regresamos al botón original de "+ Añadir"
        document.querySelectorAll('[id^="btn-container-"]').forEach(container => {
            const id = container.id.replace('btn-container-', '');
            // Buscamos si hay algún dato en el botón (usualmente guardado en atributos data)
            // o simplemente forzamos el reset. 
            // Para un reset perfecto, podrías recargar la página o usar:
            // container.innerHTML = `<button class="btn btn-add w-100" onclick="location.reload()">+ Añadir</button>`;
            // Pero lo más limpio es dejar que syncButtons lo maneje o forzar el estado vacío:
        });

        itemsContainer.innerHTML = `
            <div class="text-center my-5 animate__animated animate__fadeIn">
                <div class="fs-1 opacity-25">🛒</div>
                <p class="text-muted mt-2">Tu carrito está vacío</p>
            </div>`;
            
        // Si tienes una función que inicializa los botones de la tienda, llámala aquí
        // Por ejemplo, si usas una lista estática, podrías iterarla.
    } else {
        cart.forEach((item) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            totalItems += item.quantity;

            itemsContainer.innerHTML += `
                <div class="cart-item shadow-sm border-0 mb-3 p-3 animate__animated animate__fadeInRight" 
                     style="background: white; border-radius: 15px;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div style="flex: 1; text-align: left;">
                            <h6 class="mb-1 fw-bold text-dark">${item.name}</h6>
                            <div class="d-flex align-items-center gap-2">
                                <div class="btn-group btn-group-sm border rounded-pill overflow-hidden bg-light">
                                    <button class="btn btn-light border-0 px-2" onclick="updateQuantity('${item.name}', -1)">−</button>
                                    <span class="px-2 fw-bold d-flex align-items-center">${item.quantity}</span>
                                    <button class="btn btn-light border-0 px-2" onclick="updateQuantity('${item.name}', 1)">+</button>
                                </div>
                                <small class="text-muted">$${item.price.toFixed(2)} c/u</small>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="fw-bold text-success fs-5 mb-1">$${subtotal.toFixed(2)}</div>
                            <button class="btn btn-sm text-danger p-0 border-0 bg-transparent" 
                                    onclick="removeFromCart('${item.name}')"
                                    style="font-size: 0.75rem; text-decoration: underline;">
                                🗑️ Quitar
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    }

    // Actualizamos los totales globales
    if (countLabel) countLabel.innerText = totalItems;
    totalLabel.innerText = `$${total.toFixed(2)}`;
    
    // IMPORTANTE: Esta función debe estar lista para manejar el estado "0"
    syncButtonsWithCart();
}

function syncButtonsWithCart() {
    cart.forEach(item => {
        if (item.id) {
            updateButton(item.name, item.price, item.id);
        }
    });
}

function removeFromCart(name) {
    const itemToRemove = cart.find(item => item.name === name);
    if (itemToRemove) {
        resetButton(itemToRemove.name, itemToRemove.price, itemToRemove.id);
        cart = cart.filter(item => item.name !== name);
    }
    saveAndRefresh();
}

function clearCart() {
    Swal.fire({
        title: '¿VACIAR PEDIDO?',
        text: "Se eliminarán todos los productos de tu lista.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1a1a1a',
        cancelButtonColor: '#d33',
        confirmButtonText: 'SÍ, VACIAR',
        cancelButtonText: 'VOLVER',
        allowOutsideClick: false 
    }).then((result) => {
        if (result.isConfirmed) {
            try {
                // 1. Vaciamos la variable actual
                cart = []; 

                // 2. IMPORTANTE: Usamos la llave correcta 'ventasSilvaCart'
                localStorage.setItem('ventasSilvaCart', JSON.stringify([]));

                // 3. Resetear visualmente TODOS los botones de la tienda
                // Esto hará que vuelvan a decir "+ Añadir" en lugar de mostrar +/-
                const buttons = document.querySelectorAll('[id^="btn-container-"]');
                buttons.forEach(container => {
                    const id = container.id.replace('btn-container-', '');
                    // Intentamos recuperar datos básicos para reconstruir el botón original
                    // Nota: Si no tienes los datos aquí, el syncButtonsWithCart del render lo hará
                });

                // 4. Actualizamos la interfaz
                renderCart();

                Swal.fire({
                    title: '¡Vaciado!',
                    text: 'Tu carrito está limpio.',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false
                });

            } catch (error) {
                console.error("Error al vaciar:", error);
            }
        }
    });
}

function toggleCart() {
    const cartPanel = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (cartPanel) {
        cartPanel.classList.toggle('active');
        if (overlay) {
            overlay.style.display = cartPanel.classList.contains('active') ? 'block' : 'none';
        }
    }
}

function sendWhatsApp() {
    if (cart.length === 0) return alert("Tu carrito está vacío");
    let msg = "Hola Ventas Silva! Mi pedido es:%0A%0A";
    cart.forEach(item => msg += `• ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})%0A`);
    msg += `%0A*Total: ${document.getElementById('cart-total').innerText}*`;
    window.open(`https://wa.me/523122318704?text=${msg}`);
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});