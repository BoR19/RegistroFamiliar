let miembros = [];
let editIndex = null;

// Usuario y contraseña por defecto
const USUARIO_DEFAULT = "admin";
const CONTRASENA_DEFAULT = "1234";

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === USUARIO_DEFAULT && password === CONTRASENA_DEFAULT) {
    localStorage.setItem('user', username);
    showApp();
  } else {
    alert("Usuario o contraseña incorrectos");
  }
}

function logout() {
  localStorage.removeItem('user');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function getFamilyStats(miembros) {
  return {
    adultos: miembros.filter(m => m.edad >= 18).length,
    niños: miembros.filter(m => m.edad < 18).length,
    mujeres: miembros.filter(m => ['madre', 'hija', 'abuela', 'tía', 'sobrina', 'otro'].includes(m.parentesco.toLowerCase())).length,
    hombres: miembros.filter(m => ['padre', 'hijo', 'abuelo', 'tío', 'sobrino'].includes(m.parentesco.toLowerCase())).length
  };
}

function showApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Cargar datos desde localStorage
  const stored = localStorage.getItem('miembros');
  miembros = stored ? JSON.parse(stored) : [];

  document.getElementById('app').innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">Registro Familiar</h1>
      <button onclick="logout()" class="bg-red-500 text-white px-4 py-2 rounded">Cerrar Sesión</button>
    </div>

    <div class="mb-4 flex justify-between">
      <button onclick="openForm()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Agregar Miembro</button>
      <input oninput="search(this.value)" placeholder="Buscar por nombre o documento" class="border p-2 rounded w-1/2">
    </div>

    <div id="cards" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"></div>
    
    <div id="list" class="space-y-2"></div>

    <div class="mt-6">
      <button onclick="exportToPDF()" class="bg-purple-500 text-white px-4 py-2 rounded">Exportar PDF</button>
    </div>

    <div id="formModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4" id="formTitle">Nuevo Miembro</h2>
        <form id="memberForm" class="space-y-4">
          <input id="nombre" placeholder="Nombre y Apellido" required class="w-full border p-2 rounded">
          <input id="documento" placeholder="Documento" required class="w-full border p-2 rounded">
          <input id="telefono" placeholder="Teléfono" required class="w-full border p-2 rounded">
          <input id="fechaNac" type="date" onchange="calculateAge()" required class="w-full border p-2 rounded">
          <input id="edad" placeholder="Edad" readonly class="w-full border p-2 rounded bg-gray-100">
          <select id="parentesco" required class="w-full border p-2 rounded">
            <option value="">Selecciona parentesco</option>
            ${['Padre','Madre','Hijo','Hija','Abuelo','Abuela','Tío','Tía','Sobrino','Sobrina','Otro'].map(p => `<option>${p}</option>`).join('')}
          </select>
          <div class="flex justify-end space-x-2 mt-4">
            <button type="button" onclick="closeForm()" class="px-4 py-2 bg-gray-400 rounded">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  renderList();
  updateCards();

  document.getElementById('memberForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const member = {
      nombre: document.getElementById('nombre').value,
      documento: document.getElementById('documento').value,
      telefono: document.getElementById('telefono').value,
      fechaNac: document.getElementById('fechaNac').value,
      edad: document.getElementById('edad').value,
      parentesco: document.getElementById('parentesco').value
    };

    if (editIndex !== null) {
      miembros[editIndex] = member;
      editIndex = null;
    } else {
      miembros.push(member);
    }

    localStorage.setItem('miembros', JSON.stringify(miembros));

    closeForm();
    renderList();
    updateCards();
  });
}

function openForm(member = null, index = null) {
  editIndex = index;
  if (member) {
    document.getElementById('nombre').value = member.nombre;
    document.getElementById('documento').value = member.documento;
    document.getElementById('telefono').value = member.telefono;
    document.getElementById('fechaNac').value = member.fechaNac;
    document.getElementById('edad').value = member.edad;
    document.getElementById('parentesco').value = member.parentesco;
    document.getElementById('formTitle').textContent = "Editar Miembro";
  } else {
    document.getElementById('memberForm').reset();
    document.getElementById('edad').value = '';
    document.getElementById('formTitle').textContent = "Nuevo Miembro";
  }
  document.getElementById('formModal').classList.remove('hidden');
}

function closeForm() {
  document.getElementById('formModal').classList.add('hidden');
}

function calculateAge() {
  const birthDate = new Date(document.getElementById('fechaNac').value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  document.getElementById('edad').value = age;
}

function renderList() {
  const list = document.getElementById('list');
  list.innerHTML = miembros.map((m, i) => `
    <div class="bg-white p-4 rounded shadow flex justify-between items-center">
      <div>
        <strong>${m.nombre}</strong><br>
        Documento: ${m.documento} | Teléfono: ${m.telefono} | Edad: ${m.edad} | Parentesco: ${m.parentesco}
      </div>
      <div class="space-x-2">
        <button onclick="openForm(miembros[${i}], ${i})" class="text-blue-500">Editar</button>
        <button onclick="deleteMember(${i})" class="text-red-500">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function deleteMember(index) {
  if (confirm("¿Seguro que quieres eliminar este miembro?")) {
    miembros.splice(index, 1);
    localStorage.setItem('miembros', JSON.stringify(miembros));
    renderList();
    updateCards();
  }
}

function search(query) {
  const filtered = miembros.filter(m =>
    m.nombre.toLowerCase().includes(query.toLowerCase()) ||
    m.documento.includes(query)
  );
  const list = document.getElementById('list');
  list.innerHTML = filtered.map((m) => `
    <div class="bg-white p-4 rounded shadow">
      <strong>${m.nombre}</strong><br>
      Documento: ${m.documento} | Teléfono: ${m.telefono} | Edad: ${m.edad} | Parentesco: ${m.parentesco}
    </div>
  `).join('');
}

function updateCards() {
  const stats = getFamilyStats(miembros);
  const cards = document.getElementById('cards');
  cards.innerHTML = `
    <div class="bg-blue-100 p-4 rounded text-center">
      <h3 class="font-bold">Adultos</h3><p class="text-2xl">${stats.adultos}</p>
    </div>
    <div class="bg-yellow-100 p-4 rounded text-center">
      <h3 class="font-bold">Niños</h3><p class="text-2xl">${stats.niños}</p>
    </div>
    <div class="bg-pink-100 p-4 rounded text-center">
      <h3 class="font-bold">Mujeres</h3><p class="text-2xl">${stats.mujeres}</p>
    </div>
    <div class="bg-cyan-100 p-4 rounded text-center">
      <h3 class="font-bold">Hombres</h3><p class="text-2xl">${stats.hombres}</p>
    </div>
  `;
}

async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const preview = document.createElement('div');
  preview.style.padding = '20px';
  preview.style.background = 'white';
  preview.style.fontFamily = 'Arial';
  preview.style.maxWidth = '800px';
  preview.style.margin = 'auto';

  const stats = getFamilyStats(miembros);

  preview.innerHTML = `
    <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; text-align: center;">Registro Familiar</h2>

    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 20px;">
      <div style="flex: 1; margin: 5px; background: #e6f7ff; padding: 10px; border-radius: 5px; text-align: center;">
        <strong>Adultos</strong><br><span style="font-size: 20px;">${stats.adultos}</span>
      </div>
      <div style="flex: 1; margin: 5px; background: #fffbe6; padding: 10px; border-radius: 5px; text-align: center;">
        <strong>Niños</strong><br><span style="font-size: 20px;">${stats.niños}</span>
      </div>
      <div style="flex: 1; margin: 5px; background: #ffe6f0; padding: 10px; border-radius: 5px; text-align: center;">
        <strong>Mujeres</strong><br><span style="font-size: 20px;">${stats.mujeres}</span>
      </div>
      <div style="flex: 1; margin: 5px; background: #e6f9ff; padding: 10px; border-radius: 5px; text-align: center;">
        <strong>Hombres</strong><br><span style="font-size: 20px;">${stats.hombres}</span>
      </div>
    </div>

    <h3 style="margin-top: 20px; font-size: 18px; font-weight: bold;">Miembros Registrados</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Nombre</th>
          <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Documento</th>
          <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Teléfono</th>
          <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Fecha Nac.</th>
          <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Edad</th>
          <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Parentesco</th>
        </tr>
      </thead>
      <tbody>
        ${miembros.map(m => `
          <tr>
            <td style="border: 1px solid #ccc; padding: 6px;">${m.nombre}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${m.documento}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${m.telefono}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${m.fechaNac}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${m.edad}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${m.parentesco}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.body.appendChild(preview);

  const canvas = await html2canvas(preview, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdfWidth = doc.internal.pageSize.getWidth();
  const imgProps = doc.getImageProperties(imgData);
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  document.body.removeChild(preview);

  doc.save("registro_familiar.pdf");

  // Limpiar lista y mostrar mensaje
  miembros = [];
  localStorage.removeItem('miembros');
  renderList();
  updateCards();
  alert("¡Ahora puedes ingresar un nuevo grupo familiar!");
}

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('user')) showApp();
});