// Clear any old subadmin session on page load
window.onload = () => {
  localStorage.removeItem("loggedInSubAdmin");
};

async function Login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (!email || !password) {
    errorMsg.textContent = "❌ Please enter email and password.";
    return;
  }

  try {
    // Send login details to backend
    const res = await fetch("http://localhost:3000/api/subadmin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password })
    });

    const data = await res.json();

    if (res.status === 200) {
      // Store only a simple session flag
      localStorage.setItem("loggedInSubAdmin", email);

      window.location.href = "/subadmin";
    } else {
      errorMsg.textContent = "❌ Invalid username or password.";
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "❌ Server error. Try again later.";
  }
}
