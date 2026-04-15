document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  axios
    .get(`${API_URL}/user/check`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
      window.location.href = "login.html";
    });
});
