// Guardar sesión en localStorage
function saveSession(name) {
    localStorage.setItem('userName', name);
    window.location.href = 'chat.html';
}

// Registro
async function registerUser() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    if (res.ok) {
        alert('Registrado correctamente. Inicia sesión.');
        window.location.href = 'login.html';
    } else {
        const data = await res.json();
        alert(data.message);
    }
}

// Login
async function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const data = await res.json();
        saveSession(data.name);
    } else {
        const data = await res.json();
        alert(data.message);
    }
}
