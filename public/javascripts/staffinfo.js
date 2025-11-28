// 🔹 Load all staff from backend (MongoDB)
async function loadStaff() {
  try {
    const res = await fetch("/api/staffs");
    if (!res.ok) throw new Error("Failed to load staff");

    const users = await res.json();
    const tbody = document.querySelector("#staffTable tbody");
    tbody.innerHTML = "";

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No staff found</td></tr>`;
      return;
    }

    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <a href="#" onclick="showAssets('${u._id}', '${u.fullname.replace(/'/g, "\\'")}')">
            ${u.fullname}
          </a>
        </td>
        <td>${u.email}</td>
        <td>${u.password}</td>
        <td>${u.lab || "Not Assigned"}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editUser('${u._id}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteUser('${u._id}', '${u.fullname.replace(/'/g, "\\'")}')">Delete</button>
          <button class="action-btn reset-btn" onclick="resetPassword('${u._id}', '${u.fullname.replace(/'/g, "\\'")}')">Reset Password</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("🔥 loadStaff error:", err);
    alert("Error loading staff.");
  }
}


// 🔹 Show assets for given user
async function showAssets(userId, fullName) {
  try {
    const res = await fetch(`/api/assets/${userId}`);
    if (!res.ok) throw new Error("Failed to load assets");
    const assets = await res.json();

    document.getElementById("assetUserName").textContent = fullName;
    const list = document.getElementById("assetList");
    list.innerHTML = "";

    if (assets.length === 0) {
      list.innerHTML = "<li>No assets assigned</li>";
    } else {
      assets.forEach(assetId => {
        const li = document.createElement("li");
        li.textContent = assetId;
        li.style.cursor = "pointer";
        li.onclick = () => showAssetDetails(assetId);
        list.appendChild(li);
      });
    }

    document.getElementById("userAssets").style.display = "block";
    document.getElementById("assetDetails").style.display = "none";

  } catch (err) {
    console.error(err);
    alert("Error loading assets for this staff.");
  }
}


// 🔹 Show full lifecycle history for an asset
async function showAssetDetails(assetId) {
  try {
    const res = await fetch(`/api/asset/${encodeURIComponent(assetId)}`);
    if (!res.ok) throw new Error("Failed to load asset history");
    const history = await res.json();

    document.getElementById("assetIdTitle").textContent = assetId;
    const tbody = document.querySelector("#assetHistoryTable tbody");
    tbody.innerHTML = "";

    if (history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No transactions found.</td></tr>`;
    } else {
      history.forEach(tx => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${tx.action}</td>
          <td>${tx.lab || "-"}</td>
          <td>${tx.dept || "-"}</td>
          <td>${tx.user?.fullname || "N/A"}</td>
          <td>${tx.timestamp ? new Date(tx.timestamp).toLocaleString() : ""}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    document.getElementById("assetDetails").style.display = "block";

  } catch (err) {
    console.error(err);
    alert("Error loading asset details.");
  }
}


// 🔹 Edit Staff (Name, Email, Lab)
async function editUser(userId) {
  try {
    const res = await fetch(`/api/staff/${userId}`);
    const user = await res.json();

    const newName = prompt("Edit Full Name:", user.fullname);
    const newEmail = prompt("Edit Email:", user.email);
    const newLab = prompt("Edit Lab Number:", user.lab);

    if (!newName || !newEmail) return alert("Fullname & Email required!");

    const updateRes = await fetch(`/api/staff/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname: newName, email: newEmail, lab: Number(newLab) })
    });

    if (!updateRes.ok) throw new Error("Update failed");

    alert("Updated successfully!");
    loadStaff();

  } catch (err) {
    console.error(err);
    alert("Error updating staff");
  }
}


// 🔹 Reset Password
async function resetPassword(userId, fullName) {
  const newPwd = prompt("Enter new password for " + fullName + ":");
  if (!newPwd) return;

  try {
    const res = await fetch(`/api/staff/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPwd })
    });

    if (!res.ok) throw new Error("Reset failed");
    alert("Password Reset!");
  } catch (err) {
    console.error(err);
    alert("Error resetting password");
  }
}


// Initial load
loadStaff();
