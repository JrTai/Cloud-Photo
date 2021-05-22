authentication();
photos();

document.addEventListener("click", function (event) {
  const targetElement = event.target;
  console.log(targetElement);
  console.log(targetElement.tagName);
  console.log(targetElement.classList);
  if (targetElement.tagName === "A") {
    console.log("click A");
    if (
      targetElement.classList.contains("nav-link") &&
      !targetElement.classList.contains("storage") &&
      !targetElement.hasAttribute("aria-current")
    ) {
      targetElement.setAttribute("class", "nav-link active");
      const prevSelectSideBar = document.querySelector("[aria-current=\"page\"]");
      prevSelectSideBar.setAttribute("class", "nav-link link-dark");
      prevSelectSideBar.removeAttribute("aria-current");
      targetElement.setAttribute("aria-current", "page");
    }
  } else if (targetElement.tagName === "IMG") {
    console.log("click IMG");
  }
});

function photos () {
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/photos",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    processData: false,
    contentType: false,
    success: function (photos, status) {
      try {
        let photoDate = photos[0].upload_date;
        const date = `<br /><br /><br /><br />
                    <br />
                    <p class="photo-date">${photoDate}</p>
                    <br />`;
        const photoZone = document.querySelector(".col-lg-10");
        photoZone.insertAdjacentHTML("beforeend", date);
        for (const photo of photos) {
          const eachPhotoDate = photo.upload_date;
          if (eachPhotoDate !== photoDate) {
            photoDate = eachPhotoDate;
            const photoZone = document.querySelector(".col-lg-10");
            const date = `<br />
                        <br />
                        <p class="photo-date">${photoDate}</p>
                        <br />`;
            photoZone.insertAdjacentHTML("beforeend", date);
          }
          const img = `<img
                        src="${photo.url}"
                        class="d-inline-block align-text-top photo"
                     />`;
          photoZone.insertAdjacentHTML("beforeend", img);
        }
      } catch (error) {
        console.error(`Show user photos error: ${error}`);
      }
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

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
    success: function (data) {
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
