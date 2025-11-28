// --------------------------------------------------
// Enforce Logged-in User Identity
// --------------------------------------------------
function enforceCurrentUser() {
  const savedUser = localStorage.getItem("loggedUser");

  if (!savedUser) {
    alert("⚠ Please login first");
    window.location.href = "/userlogin"; // ✔ Correct login page
    return;
  }

  const user = JSON.parse(savedUser);

  // Auto-fill and lock user field
  const userSelect = document.getElementById("user");
  userSelect.innerHTML = `<option value="${user._id}">${user.fullname}</option>`;
  userSelect.disabled = true;
  document.getElementById("userIdHidden").value = user._id;

  // Auto-fill and lock lab field
  const assignedLab = `Lab ${user.lab}`;
  const labSelect = document.getElementById("labs");
  labSelect.innerHTML = `<option value="${assignedLab}">${assignedLab}</option>`;
  labSelect.disabled = true;

  console.log("User:", user.fullname, " | Lab:", assignedLab);
}

// --------------------------------------------------
// Load only Department dropdown
// --------------------------------------------------
async function loadDepartments() {
  try {
    const res = await fetch('/api/transactions/meta');
    const json = await res.json();
    if (!json.ok) throw new Error("Meta load failed");

    const deptSelect = document.getElementById('dept');
    deptSelect.innerHTML = '';
    json.branches.forEach(branch => {
      deptSelect.innerHTML += `<option value="${branch}">${branch}</option>`;
    });
  } catch (err) {
    console.error("Error loading departments:", err);
  }
}

// --------------------------------------------------
// Submit Transaction securely
// --------------------------------------------------
async function addTransaction() {
  const assetId = document.getElementById("assetId").value.trim();
  const lab = document.getElementById("labs").value;
  const dept = document.getElementById("dept").value;
  const action = document.getElementById("action").value;
  const userId = document.getElementById("userIdHidden").value;

  if (!assetId || !dept || !action || !userId) {
    alert("❗ Please fill all details");
    return;
  }

  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId, lab, dept, action, userId })
    });

    const json = await res.json();
    if (!res.ok) return alert("⚠ " + (json.error || "Save failed"));

    alert("✅ Transaction saved!");
    loadLedger();

  } catch (err) {
    alert("⚠ Server error");
  }
}

// --------------------------------------------------
// Load Ledger for Assigned Lab Only
// --------------------------------------------------
async function loadLedger() {
  try {
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    const assignedLab = `Lab ${user.lab}`;

    const res = await fetch(`/api/transactions?lab=${assignedLab}`);
    const json = await res.json();
    
    renderLedger(json.transactions);
  } catch (err) {
    console.error("Error loading ledger:", err);
  }
}

// --------------------------------------------------
// Render Ledger
// --------------------------------------------------
function renderLedger(transactions) {
  const container = document.getElementById("ledgerContainer");
  container.innerHTML = "";

  if (!transactions || transactions.length === 0) {
    container.textContent = "No asset records available.";
    return;
  }

  transactions.forEach(tx => {
    const blockDiv = document.createElement("div");
    blockDiv.className = "block";

    const qrCanvas = document.createElement("canvas");
    qrCanvas.className = "qrCanvas";

    const qrData = {
      assetId: tx.assetId,
      action: tx.action,
      lab: tx.lab,
      dept: tx.dept,
      user: tx.user?.fullname,
      timestamp: tx.timestamp,
      currentHash: tx.currentHash
    };

    new QRious({
      element: qrCanvas,
      value: JSON.stringify(qrData),
      size: 160
    });

    // Download QR Code button
    const downloadBtn = document.createElement("a");
    downloadBtn.textContent = "📥 Download QR";
    downloadBtn.href = qrCanvas.toDataURL("image/png");
    downloadBtn.download = `${tx.assetId}_QR.png`;
    downloadBtn.classList.add("download-btn");

    blockDiv.innerHTML = `
      <strong>Asset ID:</strong> ${tx.assetId}<br>
      <strong>Action:</strong> ${tx.action}<br>
      <strong>User:</strong> ${tx.user?.fullname}<br>
      <strong>Timestamp:</strong> ${new Date(tx.timestamp).toLocaleString()}<br>
      <strong>Lab Name:</strong> ${tx.lab}<br>
      <strong>Department:</strong> ${tx.dept}<br>
      <strong>Previous Hash:</strong> ${tx.previousHash}<br>
      <strong>Current Hash:</strong> ${tx.currentHash}<br><br>
    `;

    blockDiv.appendChild(qrCanvas);
    blockDiv.appendChild(document.createElement("br"));
    blockDiv.appendChild(downloadBtn);

    container.appendChild(blockDiv);
  });
}



// --------------------------------------------------
// Init Page
// --------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  enforceCurrentUser();
  loadDepartments();
  loadLedger();

   const submitBtn = document.querySelector('button[onclick="addTransaction()"]');
  if (submitBtn) submitBtn.onclick = addTransaction;

  const verifyBtn = document.querySelector('button[onclick="verifyLedger()"]');
  if (verifyBtn) {
    verifyBtn.onclick = async () => {
      const res = await fetch('/api/transactions/verify', { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        alert(json.verified ? "✅ Ledger integrity OK" : "⚠ Ledger verification failed");
      } else {
        alert("Verify error");
      }
    };
  }
});


function downloadLedger() {
  window.location.href = "/api/transactions/export/csv";
}
