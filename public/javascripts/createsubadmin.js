async function generateAndStore() {
  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!fullname || !email) return alert("All fields required.");

  // check email exists in DB
  const exists = await fetch(`http://localhost:3000/api/subadmin/exists/${email}`)
                        .then(r => r.json());
  if (exists.exists) return alert("❌ Email already exists");

  // Save new subadmin in DB
  const res = await fetch("http://localhost:3000/api/subadmin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullname, email })
  });

  const data = await res.json();
  if (res.status !== 200) return alert(data.message);

  document.getElementById("outFullname").textContent = data.fullname;
  document.getElementById("uname").textContent = data.username;
  document.getElementById("pwd").textContent = data.password;

  document.getElementById("output").style.display = "flex";

  showStoredSubAdmins();
}

async function showStoredSubAdmins() {
  const list = await fetch("http://localhost:3000/api/subadmin")
                      .then(r => r.json());

  const table = document.getElementById("list");
  const userListSection = document.getElementById("userList");

  table.innerHTML = "";

  list.forEach((sa, i) => {
    table.innerHTML += `
      <tr>
        <td>${sa.fullname}</td>
        <td>${sa.username}</td>
        <td>${sa.password}</td>
        <td>
          <button onclick="editSubAdmin('${sa._id}', ${i})">Edit</button>
          <button onclick="deleteSubAdmin('${sa._id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  if (list.length > 0) userListSection.style.display = "block";
}

async function deleteSubAdmin(id) {
  if (!confirm("Delete this SubAdmin?")) return;
  await fetch(`http://localhost:3000/api/subadmin/${id}`, { method: "DELETE" });
  showStoredSubAdmins();
}

async function editSubAdmin(id, index) {
  const row = document.getElementById("list").rows[index];

  const fullname = row.cells[0].innerText;
  const email = row.cells[1].innerText;

  row.cells[0].innerHTML = `<input id="editFullname" value="${fullname}">`;
  row.cells[1].innerHTML = `<input id="editEmail" value="${email}">`;
  row.cells[3].innerHTML = `
    <button onclick="saveSubAdmin('${id}')">Save</button>
    <button onclick="showStoredSubAdmins()">Cancel</button>
  `;
}

async function saveSubAdmin(id) {
  const newFullname = document.getElementById("editFullname").value;
  const newEmail = document.getElementById("editEmail").value;

  const res = await fetch(`http://localhost:3000/api/subadmin/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullname: newFullname, email: newEmail })
  });

  await res.json();
  showStoredSubAdmins();
}

window.onload = showStoredSubAdmins;
