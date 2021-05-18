// eslint-disable-next-line no-undef
$(document).on("submit", "form", function (event) {
  event.preventDefault();
  const userData = {
    email: document.querySelector("#login").value,
    password: document.querySelector("#password").value
  };
  console.log(userData);

  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/signinup",
    data: userData,
    success: function (r) {
      console.log("result:", r);
      window.localStorage.setItem("access_token", r.data.access_token);
      window.location.href = "/main.html";
    },
    error: function (e) {
      console.log("some error:", e);
    }
  });
});
