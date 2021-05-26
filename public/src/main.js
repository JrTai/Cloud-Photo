// eslint-disable-next-line no-undef
photoNumberPerLoad = 20;
// eslint-disable-next-line no-undef
notReachEnd = true;
// eslint-disable-next-line no-undef
loadIndex = 0;
authentication();
photos();

// scroll to bottom to call photos
// will need to call shared albums, my albums, photo diary, photo exhibition, trash
// eslint-disable-next-line no-undef
$(document).ready(function () {
  // eslint-disable-next-line no-undef
  $(window).scroll(function () {
    // eslint-disable-next-line no-undef
    const position = $(window).scrollTop();
    // eslint-disable-next-line no-undef
    const bottom = $(document).height() - $(window).height();
    // big problem: position wouldn't really reach the bottom, will has tiny difference, from 13 to 4
    // since there's a ragne, will trigger multiple times functions
    // eslint-disable-next-line no-undef
    if (bottom - position < 20 && notReachEnd) {
      // console.log("reach bottom");
      const sideBarSection = document.querySelector(".active");
      if (sideBarSection.innerHTML.split(">")[1].trim() === "Photos") {
        photos();
        // eslint-disable-next-line no-undef
        notReachEnd = false;
      }
    }
    if (bottom - position > 200) {
      // eslint-disable-next-line no-undef
      notReachEnd = true;
    }
  });
});

document.addEventListener("click", function (event) {
  const plusElement = document.querySelector("#plus");
  const minusElement = document.querySelector("#minus");
  const sideBarSection = document.querySelector(".active");
  const targetElement = event.target;
  if (targetElement.tagName === "A") {
    // console.log("click A");
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

    // different sideBarSection will need to clean screen, then call each section function
    if (targetElement.innerHTML.split(">")[1].trim() === "Photos") {
      cleanScreen(plusElement, minusElement);
      photos();
    } else if (
      targetElement.innerHTML.split(">")[1].trim() === "Shared Album"
    ) {
      cleanScreen(plusElement, minusElement);
      albums(true);
    } else if (targetElement.innerHTML.split(">")[1].trim() === "My Album") {
      cleanScreen(plusElement, minusElement);
      albums(false);
    } else if (targetElement.innerHTML.split(">")[1].trim() === "Photo Diary") {
      cleanScreen(plusElement, minusElement);
    } else if (targetElement.innerHTML.split(">")[1].trim() === "Exhibition") {
      cleanScreen(plusElement, minusElement);
    } else if (targetElement.innerHTML.split(">")[1].trim() === "Trash") {
      cleanScreen(plusElement, minusElement);
    }
  } else if (
    targetElement.tagName === "IMG" &&
    targetElement.classList.contains("photo")
  ) {
    // console.log("click IMG");
    if (targetElement.classList.contains("selected")) {
      targetElement.setAttribute(
        "class",
        "d-inline-block align-text-top photo"
      );
    } else {
      targetElement.setAttribute(
        "class",
        "d-inline-block align-text-top photo selected"
      );
    }

    const selectedElements = document.querySelectorAll(".selected");
    const section = sideBarSection.innerHTML.split(">")[1].trim();
    if (selectedElements.length) {
      // minus button show
      if (
        section === "Photos" ||
        section === "Shared Album" ||
        section === "My Album"
      ) {
        minusElement.setAttribute("style", "cursor: pointer;");
      }
      // plus button show
      if (section === "Photos") {
        plusElement.setAttribute("style", "cursor: pointer;");
      }
    } else {
      minusElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
      plusElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
    }
  } else if (targetElement.id === "circle") {
    // eslint-disable-next-line no-undef
    swal({
      title: "Do you really want to log out?",
      icon: "warning",
      buttons: true,
      dangerMode: false
    }).then((value) => {
      if (value) {
        localStorage.clear();
        window.location.href = "/index.html";
      }
    });
  }
});

function albums (shared) {
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  const data = { loadIndex: loadIndex, shared: shared };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/albums",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (albums, status) {
      if (albums.length) {
        try {
          const albumZone = document.querySelector(".col-lg-10");
          let albumName;
          if (albumZone.innerHTML === "") {
            albumName = albums[0].name;
            const name = `<br /><br /><br /><br />
                      <br />
                      <p class="album-name">${albumName}</p>
                      <br />`;
            albumZone.insertAdjacentHTML("beforeend", name);
          } else {
            const albumNameZones = document.querySelectorAll(".album-name");
            albumName = albumNameZones[albumNameZones.length - 1].innerHTML;
          }
          for (const album of albums) {
            const eachAlbumName = album.name;
            if (eachAlbumName !== albumName) {
              albumName = eachAlbumName;
              const albumZone = document.querySelector(".col-lg-10");
              const name = `<br />
                          <br />
                          <p class="photo-date">${albumName}</p>
                          <br />`;
              albumZone.insertAdjacentHTML("beforeend", name);
            }
            const img = `<img
                          src="${album.url}"
                          class="d-inline-block align-text-top photo"
                       />`;
            albumZone.insertAdjacentHTML("beforeend", img);
          }
          // eslint-disable-next-line no-undef
          loadIndex += photoNumberPerLoad;
        } catch (error) {
          console.error(`Show user photos error: ${error}`);
        }
      }
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

// eslint-disable-next-line no-unused-vars
function deletePhotos () {
  const sideBarSection = document.querySelector(".active");
  const section = sideBarSection.innerHTML.split(">")[1].trim();
  if (section === "Photos") {
    // eslint-disable-next-line no-undef
    swal({
      title: "Do You Want To Delete Photos? ",
      icon: "warning",
      buttons: {
        A: {
          text: "Delete Photo To Trash",
          value: "Delete Photo To Trash"
        }
      },
      dangerMode: false
    }).then((value) => {
      if (value === "Delete Photo To Trash") {
        deletePhotoToTrash(true);
      }
    });
  } else {
    // eslint-disable-next-line no-undef
    swal({
      title: "Do You Want To Delete Photos? ",
      icon: "warning",
      buttons: {
        A: {
          text: "Delete Photo To Trash",
          value: "Delete Photo To Trash"
        },
        B: {
          text: "Remove Photo From Album",
          value: "Remove Photo From Album"
        }
      },
      dangerMode: false
    }).then((value) => {
      if (value === "Delete Photo To Trash") {
        deletePhotoToTrash(true);
      } else if (value === "Remove Photo From Album") {
        deletePhotoToTrash(false);
      }
    });
  }
}

function deletePhotoToTrash (deleteToTrash) {
  const localStorage = window.localStorage;
  const selectedPhotos = document.querySelectorAll(".selected");
  const photosURL = [];
  for (const photo of selectedPhotos) {
    photosURL.push(photo.src);
  }

  const data = { deleteToTrash: deleteToTrash, photos: photosURL };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/delete/photos",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (msg) {
      // eslint-disable-next-line no-undef
      swal(msg, "Please click the button!", "success");
      deselectAllPhoto();
      const plusElement = document.querySelector("#plus");
      const minusElement = document.querySelector("#minus");
      const sideBarSection = document.querySelector(".active");
      const section = sideBarSection.innerHTML.split(">")[1].trim();
      if (section === "Photos") {
        cleanScreen(plusElement, minusElement);
        photos();
      } else if (section === "Shared Album") {
        cleanScreen(plusElement, minusElement);
        albums(true);
      } else if (section === "My Album") {
        cleanScreen(plusElement, minusElement);
        albums(false);
      }
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

// eslint-disable-next-line no-unused-vars
function addAlbum () {
  // eslint-disable-next-line no-undef
  swal({
    title: "Where Do You Want To Add Photos? ",
    icon: "warning",
    buttons: {
      A: {
        text: "Shared Album",
        value: "Shared Album"
      },
      B: {
        text: "My Album",
        value: "My Album"
      },
      C: {
        text: "Existing Album",
        value: "Existing Album"
      }
    },
    dangerMode: false
  }).then((value) => {
    if (value === "Shared Album") {
      // eslint-disable-next-line no-undef
      swal("Give Shared Album a Name", {
        content: "input"
      }).then((value) => {
        if (value !== "" && value !== null) {
          // eslint-disable-next-line no-undef
          swal(`Crerating "${value}" Shared Album...`);
          createAlbum(`${value}`, true);
        }
      });
    } else if (value === "My Album") {
      // eslint-disable-next-line no-undef
      swal("Give My Album a Name", {
        content: "input"
      }).then((value) => {
        if (value !== "" && value !== null) {
          // eslint-disable-next-line no-undef
          swal(`Crerating "${value}" My Album...`);
          createAlbum(`${value}`, false);
        }
      });
    } else if (value === "Existing Album") {
      // eslint-disable-next-line no-undef
      swal("Give A Existing Album Name", {
        content: "input"
      }).then((value) => {
        if (value !== "" && value !== null) {
          // eslint-disable-next-line no-undef
          swal(`Adding Photos to "${value}" Album...`);
          // then call ajax to things
          addPhotoToAlbum(`${value}`);
        }
      });
    }
  });
}

function addPhotoToAlbum (albumName) {
  const localStorage = window.localStorage;
  const selectedPhotos = document.querySelectorAll(".selected");
  const photos = [];
  for (const photo of selectedPhotos) {
    photos.push(photo.src);
  }

  const data = { albumName: albumName, photos: photos };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/photos/exist/album",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (result) {
      if (result.created) {
        // eslint-disable-next-line no-undef
        swal(result.msg, "Please click the button!", "success");
        deselectAllPhoto();
      } else {
        // eslint-disable-next-line no-undef
        swal(result.msg, "Please click the button!", "error");
      }
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

function createAlbum (albumName, shared) {
  const localStorage = window.localStorage;
  const selectedPhotos = document.querySelectorAll(".selected");
  const photos = [];
  for (const photo of selectedPhotos) {
    photos.push(photo.src);
  }

  const data = { albumName: albumName, shared: shared, photos: photos };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/new/album",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (result) {
      if (result.created) {
        // eslint-disable-next-line no-undef
        swal(result.msg, "Please click the button!", "success");
        deselectAllPhoto();
      } else {
        // eslint-disable-next-line no-undef
        swal(result.msg, "Please click the button!", "error");
      }
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

function deselectAllPhoto () {
  const selectedPhotos = document.querySelectorAll(".selected");
  for (const photo of selectedPhotos) {
    photo.setAttribute("class", "d-inline-block align-text-top photo");
  }
}

function cleanScreen (plusElement, minusElement) {
  const photoZone = document.querySelector(".col-lg-10");
  photoZone.innerHTML = "";
  plusElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
  minusElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
  // eslint-disable-next-line no-undef
  loadIndex = 0;
}

function photos () {
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  const data = { loadIndex: loadIndex };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/photos",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (photos, status) {
      if (photos.length) {
        try {
          const photoZone = document.querySelector(".col-lg-10");
          let photoDate;
          if (photoZone.innerHTML === "") {
            photoDate = photos[0].upload_date;
            const date = `<br /><br /><br /><br />
                      <br />
                      <p class="photo-date">${photoDate}</p>
                      <br />`;

            photoZone.insertAdjacentHTML("beforeend", date);
          } else {
            const dateZones = document.querySelectorAll(".photo-date");
            photoDate = dateZones[dateZones.length - 1].innerHTML;
          }
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
          // eslint-disable-next-line no-undef
          loadIndex += photoNumberPerLoad;
        } catch (error) {
          console.error(`Show user photos error: ${error}`);
        }
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
    swal("Uploading Photos to Your Cloud Stroage...");
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
        // eslint-disable-next-line no-undef
        swal(msg, "Please click the button!", "success");
        const header = document.querySelector("header");
        const plusElement = document.querySelector("#plus");
        const input = `<input
                        type="file"
                        id="imgupload"
                        style="display: none"
                        name="photos"
                        multiple="multiple"
                        accept="image/*"
                       />`;
        header.insertAdjacentHTML("beforeend", input);
        cleanScreen(plusElement);
        photos();
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
