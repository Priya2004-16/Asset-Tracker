// ------------------- CHECK IF EMAIL EXISTS -------------------
async function emailExists(email) {
  try {
    const res = await fetch(`/api/users/check-email/${email}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.exists;
  } catch (err) {
    console.error("Email check failed:", err);
    return false;
  }
}

// ------------------- CREATE USER -------------------
async function generateAndStore() {
  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const labInput = document.getElementById("lab").value.trim();

  if (!fullname) return alert("Please enter full name.");
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return alert("Invalid email address.");
  if (!labInput) return alert("Please enter lab number.");

  const lab = parseInt(labInput, 10);
  if (isNaN(lab) || lab <= 0) return alert("Lab must be a positive number.");

  if (await emailExists(email)) {
    return alert("❌ Email already exists!");
  }

  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullname, email, lab })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to create user");
    return;
  }

  document.getElementById("fname").textContent = data.user.fullname;
  document.getElementById("uname").textContent = data.user.email;
  document.getElementById("pwd").textContent = data.user.password;
  document.getElementById("userlab").textContent = data.user.lab;
  document.getElementById("output").style.display = "flex";

  showStoredUsers();
}

// ------------------- SHOW ALL USERS -------------------
async function showStoredUsers() {
  const res = await fetch("/api/users");
  const users = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  users.forEach((u, index) => {
    list.innerHTML += `
      <tr>
        <td>${u.fullname}</td>
        <td>${u.email}</td>
        <td>${u.password}</td>
        <td>${u.lab}</td>
        <td>
          <button class="edit-btn"
            onclick="editUser('${u._id}', ${index}, '${u.fullname}', '${u.email}', ${u.lab})">
            Edit
          </button>
          <button class="delete-btn" onclick="deleteUser('${u._id}')">Delete</button>
        </td>
      </tr>`;
  });
}

// ------------------- ENABLE EDIT MODE -------------------
function editUser(id, index, fullname, email, lab) {
  const row = document.getElementById("list").rows[index];

  row.cells[0].innerHTML = `<input id="editFullname${id}" value="${fullname}" />`;
  row.cells[1].innerHTML = `<input id="editEmail${id}" value="${email}" />`;
  row.cells[3].innerHTML = `<input type="number" id="editLab${id}" min="1" value="${lab}" />`;

  row.cells[4].innerHTML = `
    <button class="save-btn" onclick="saveUser('${id}')">Save</button>
    <button class="cancel-btn" onclick="showStoredUsers()">Cancel</button>`;
}

// ------------------- SAVE UPDATED USER -------------------
async function saveUser(id) {
  const fullname = document.getElementById(`editFullname${id}`).value.trim();
  const email = document.getElementById(`editEmail${id}`).value.trim();
  const labInput = document.getElementById(`editLab${id}`).value.trim();

  if (!fullname) return alert("Full name cannot be empty.");
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return alert("Invalid email.");
  if (!labInput) return alert("Lab is required.");

  const lab = parseInt(labInput, 10);
  if (isNaN(lab) || lab <= 0) return alert("Lab must be a positive number.");

  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullname, email, lab })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.message);

  showStoredUsers();
}

// ------------------- DELETE USER -------------------
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  await fetch(`/api/users/${id}`, { method: "DELETE" });
  showStoredUsers();
}

// ------------------- LOAD USERS ON PAGE LOAD -------------------
window.onload = showStoredUsers;
