authentication();

function authentication () {
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/authentication",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    processData: false,
    contentType: false,
    success: function (data, status) {
      // console.log(data);
      updateUserInfo(data);
    },
    error: function (xhr, desc, err) {
      console.log(err);
      window.location.href = "/index.html";
    }
  });
}

function updateUserInfo (data) {
  const userCode = data.email[0].toUpperCase();
  const userCircle = document.querySelector("#circle");
  userCircle.innerHTML = userCode;
  const userBar = document.querySelector("#file");
  userBar.value = data.storage;
  userBar.innerHTML = data.storage.toFixed(0) + "%";
  const userStorage = document.querySelector("#storage");
  userStorage.innerHTML = `<img 
                             style="visibility: Hidden"
                             src="./images/cloud.png" 
                             alt="cloud" width="16" 
                             height="16" 
                             class="bi me-2"/>
                             Used ${data.storage.toFixed(0)}% of 2GB`;
}

// eslint-disable-next-line no-unused-vars
function uploadPhoto () {
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  $("#imgupload").trigger("click");
  const uploadFiles = document.querySelector("#imgupload");
  uploadFiles.addEventListener("change", (e) => {
    const form = new FormData();
    for (let i = 0; i < e.target.files.length; i += 1) {
      console.log(e.target.files[i]);
      form.append("photos", e.target.files[i]);
    }

    const input = document.querySelector("#imgupload");
    if (input) {
      input.parentNode.removeChild(input);
    }

    // eslint-disable-next-line no-undef
    $.ajax({
      type: "POST",
      url: "/api/1.0/upload/photo",
      headers: {
        Authorization: "Bearer " + localStorage.access_token
      },
      data: form,
      processData: false,
      contentType: false,
      success: function (msg) {
        alert(msg);
        const header = document.querySelector("header");
        const input = `<input
                        type="file"
                        id="imgupload"
                        style="display: none"
                        name="photos"
                        multiple="multiple"
                        accept="image/*"
                       />`;
        header.insertAdjacentHTML("beforeend", input);
      },
      error: function (e) {
        console.log("some error:", e);
        const header = document.querySelector("header");
        const input = `<input
                        type="file"
                        id="imgupload"
                        style="display: none"
                        name="photos"
                        multiple="multiple"
                        accept="image/*"
                       />`;
        header.insertAdjacentHTML("beforeend", input);
      }
    });
  });
}
