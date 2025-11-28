// ---------------------------
// SELECT ALL BRANCHES
// ---------------------------

const selectAll = document.getElementById("selectAll");
const branchCheckboxes = document.querySelectorAll(".branch");

selectAll.addEventListener("change", () => {
  branchCheckboxes.forEach(ch => ch.checked = selectAll.checked);
  updatePreview();
});

branchCheckboxes.forEach(ch => {
  ch.addEventListener("change", () => {
    // If any box unchecked -> uncheck selectAll
    if (![...branchCheckboxes].every(b => b.checked)) {
      selectAll.checked = false;
    }
    updatePreview();
  });
});


// ---------------------------
// SYSTEM COUNT PREVIEW
// ---------------------------

const labsInput = document.getElementById("labs");
const systemsInput = document.getElementById("systems");
const systemCountDiv = document.getElementById("systemCount");

function updateSystemCount() {
  const labs = Number(labsInput.value);
  const systems = Number(systemsInput.value);

  if (labs > 0 && systems > 0) {
    const total = labs * systems;
    systemCountDiv.textContent = `Total Systems: ${total}`;
  } else {
    systemCountDiv.textContent = "";
  }
}

labsInput.addEventListener("input", updateSystemCount);
systemsInput.addEventListener("input", updateSystemCount);


// ---------------------------
// LIVE PREVIEW SECTION
// ---------------------------

const previewContent = document.getElementById("previewContent");

function updatePreview() {
  const collegeName = document.getElementById("collegeName").value;
  const email = document.getElementById("email").value;
  const city = document.getElementById("city").value;
  const district = document.getElementById("district").value;
  const state = document.getElementById("state").value;
  const pincode = document.getElementById("pincode").value;

  const labs = labsInput.value;
  const systems = systemsInput.value;

  const branches = [...branchCheckboxes]
    .filter(b => b.checked)
    .map(b => b.value);

  previewContent.innerHTML = `
    <p><strong>College:</strong> ${collegeName || "-"}</p>
    <p><strong>Email:</strong> ${email || "-"}</p>
    <p><strong>City:</strong> ${city || "-"}</p>
    <p><strong>District:</strong> ${district || "-"}</p>
    <p><strong>State:</strong> ${state || "-"}</p>
    <p><strong>Pincode:</strong> ${pincode || "-"}</p>

    <p><strong>Branches:</strong> ${branches.length ? branches.join(", ") : "-"}</p>
    
    <p><strong>Labs:</strong> ${labs || "-"}</p>
    <p><strong>Systems per Lab:</strong> ${systems || "-"}</p>
    <p><strong>Total Systems:</strong> ${(labs && systems) ? labs * systems : "-"}</p>
  `;
}

document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", updatePreview);
});

updatePreview();
