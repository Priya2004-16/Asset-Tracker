// Redirect directly to admin.html after login
  const urlParams = new URLSearchParams(window.location.search);
  const redirectPage = urlParams.get("redirect") || "/admin";

 async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.success) {
    window.location.href = redirectPage;
  } else {
    document.getElementById("error").textContent = data.message;
  }
}

function forgotPassword() {
  window.location.href = "/admin/reset-password";
}
