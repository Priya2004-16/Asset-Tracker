function Login() {
  console.log("Login button clicked!");
  const email = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value.trim();
  const msg = document.getElementById("loginMsg");

  if (!email || !password) {
    msg.className = "message error-message";
    msg.textContent = "❌ Please enter both email and password";
    return;
  }

  fetch("http://localhost:3000/api/userlogin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json().then(data => ({ status: res.ok, data })))
    .then(result => {
      if (result.status) {
        // ⭐ SAVE USER DETAILS IN BROWSER
        localStorage.setItem("loggedUser", JSON.stringify(result.data.user));

        msg.className = "message success-message";
        msg.textContent = "✅ Login successful! Redirecting...";

        // ⭐ REDIRECT TO ASSET PAGE
        setTimeout(() => {
          window.location.href = "/assetinfo";
        }, 1000);
      } else {
        msg.className = "message error-message";
        msg.textContent = result.data.message || "❌ Login failed!";
      }
    })
    .catch(error => {
      console.error("Login error:", error);
      msg.className = "message error-message";
      msg.textContent = "❌ Server error!";
    });
}
