window.handleCredentialResponse = function (response) {
  console.log("GOOGLE RESPONSE:", response);

  const user = parseJwt(response.credential);

  axios
    .post(`${API_URL}/user/create`, {
      username: user.name,
      email: user.email,
    })
    .then((res) => {
      console.log(res);
      localStorage.setItem("googleUser", JSON.stringify(user));
      localStorage.setItem("token", res.data.token);
      window.location.href = 'index.html';
    })
    .catch((err) => {
      console.log(err);
    });
};

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  checkExistingUser();

  function checkExistingUser() {
    const user = localStorage.getItem("googleUser");
    const currentPage =
      window.location.pathname.split("/").pop() || "login.html";

    if (user && currentPage === "login.html") {
      window.location.href = "index.html";
      return;
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const surname = document.getElementById("surname").value.trim();
      const name = document.getElementById("name").value.trim();

      if (!name || !surname) {
        alert("Enter name and surname");
        return;
      }

      // localStorage.removeItem('googleUser');

      localStorage.setItem("userName", name);
      localStorage.setItem("userSurname", surname);

      // window.location.href = "index.html";
    });
  }
});
