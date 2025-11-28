async function resetPass() {
  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;
  const newPassword = document.getElementById("newpass").value;

  const response = await fetch("/admin/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword })
  });

  const data = await response.json();

  if (response.ok) {
    alert("Password reset successful!");
    window.location.href = "admin-login.html";
  } else {
    document.getElementById("msg").textContent = data.message;
  }
}