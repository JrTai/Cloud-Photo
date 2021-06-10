const photoNumberPerLoad = 30;
let notReachEnd = true;
let loadIndex = 0;
const photoUploadFormSet = new Set();
authentication();
photos();

// scroll to bottom to call photos
// will need to call shared albums, my albums, face albums, photo exhibition, trash
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
      } else if (
        sideBarSection.innerHTML.split(">")[1].trim() === "Shared Album"
      ) {
        albums(true);
        // eslint-disable-next-line no-undef
        notReachEnd = false;
      } else if (sideBarSection.innerHTML.split(">")[1].trim() === "My Album") {
        albums(false);
        // eslint-disable-next-line no-undef
        notReachEnd = false;
      } else if (sideBarSection.innerHTML.split(">")[1].trim() === "Face Album") {
        faces();
        // eslint-disable-next-line no-undef
        notReachEnd = false;
      } else if (sideBarSection.innerHTML.split(">")[1].trim() === "Trash") {
        trash();
        // eslint-disable-next-line no-undef
        notReachEnd = false;
      }
    }
    if (bottom - position > 50) {
      // eslint-disable-next-line no-undef
      notReachEnd = true;
    }
  });
});

document.addEventListener("click", function (event) {
  const plusElement = document.querySelector("#plus");
  const minusElement = document.querySelector("#minus");
  const deleteElement = document.querySelector("#delete");
  const recoveryElement = document.querySelector("#recovery");
  const publicElement = document.querySelector("#public");
  const sideBarSection = document.querySelector(".active");
  const targetElement = event.target;
  if (targetElement.classList.contains("zoom")) {
    // prevent open href link at first click
    event.preventDefault();
    // show popup img at second click
    // eslint-disable-next-line no-undef
    $(".image-link").magnificPopup({ type: "image" });
  }

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
      cleanScreen();
      photos();
    } else if (
      targetElement.innerHTML.split(">")[1].trim() === "Shared Album"
    ) {
      cleanScreen();
      albums(true);
    } else if (targetElement.innerHTML.split(">")[1].trim() === "My Album") {
      cleanScreen();
      albums(false);
    } else if (targetElement.innerHTML.split(">")[1].trim() === "Face Album") {
      cleanScreen();
      faces();
    } else if (targetElement.innerHTML.split(">")[1].trim() === "Exhibition") {
      cleanScreen();
      exhibition();
    } else if (targetElement.innerHTML.split(">")[1].trim() === "Trash") {
      cleanScreen();
      trash();
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
      if (
        section === "Photos" ||
        section === "Shared Album" ||
        section === "My Album"
      ) {
        minusElement.setAttribute("style", "cursor: pointer;");
      }
      if (section === "Photos") {
        plusElement.setAttribute("style", "cursor: pointer;");
        publicElement.setAttribute("style", "cursor: pointer;");
      }
      if (section === "Trash") {
        deleteElement.setAttribute("style", "cursor: pointer;");
        recoveryElement.setAttribute("style", "cursor: pointer;");
      }
    } else {
      minusElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
      plusElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
      deleteElement.setAttribute(
        "style",
        "cursor: pointer; visibility: Hidden"
      );
      recoveryElement.setAttribute(
        "style",
        "cursor: pointer; visibility: Hidden"
      );
      publicElement.setAttribute(
        "style",
        "cursor: pointer; visibility: Hidden"
      );
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
  } else if (targetElement.classList.contains("face")) {
    cleanScreen();
    getFacePhotos(parseInt(targetElement.alt));
  } else if (targetElement.classList.contains("owner")) {
    const section = sideBarSection.innerHTML.split(">")[1].trim();
    const albumName = targetElement.parentElement.innerHTML
      .split("<")[0]
      .trim();
    if (section === "Shared Album") {
      // eslint-disable-next-line no-undef
      swal({
        title: "What Do You Want For This Album? ",
        icon: "warning",
        buttons: {
          A: {
            text: "Add User",
            value: "Add User"
          },
          B: {
            text: "Set As My Album",
            value: "Set As My Album"
          },
          C: {
            text: "Remove Album",
            value: "Remove Album"
          }
        },
        dangerMode: false
      }).then((value) => {
        if (value === "Add User") {
          // eslint-disable-next-line no-undef
          swal("Please Enter Full User Email", {
            content: "input"
          }).then((value) => {
            if (value !== "" && value !== null) {
              // check user exist
              checkUserExist(albumName, value);
            }
          });
        } else if (value === "Set As My Album") {
          // eslint-disable-next-line no-undef
          swal({
            title: "Set Album as My Album?",
            icon: "warning",
            buttons: true,
            dangerMode: true
          }).then((value) => {
            if (value) {
              // start set album as my album
              setAlbumShared(albumName, false);
            }
          });
        } else if (value === "Remove Album") {
          // eslint-disable-next-line no-undef
          swal({
            title: "Remove Album?",
            icon: "warning",
            buttons: true,
            dangerMode: true
          }).then((value) => {
            if (value) {
              // start remove this album
              deleteAlbum(albumName);
            }
          });
        }
      });
    } else if (section === "My Album") {
      // eslint-disable-next-line no-undef
      swal({
        title: "What Do You Want For This Album? ",
        icon: "warning",
        buttons: {
          A: {
            text: "Set As Shared Album",
            value: "Set As Shared Album"
          },
          B: {
            text: "Remove Album",
            value: "Remove Album"
          }
        },
        dangerMode: false
      }).then((value) => {
        if (value === "Set As Shared Album") {
          // eslint-disable-next-line no-undef
          swal({
            title: "Set Album as Shared Album?",
            icon: "warning",
            buttons: true,
            dangerMode: true
          }).then((value) => {
            if (value) {
              // start set album as shared album
              setAlbumShared(albumName, true);
            }
          });
        } else if (value === "Remove Album") {
          // eslint-disable-next-line no-undef
          swal({
            title: "Remove Album?",
            icon: "warning",
            buttons: true,
            dangerMode: true
          }).then((value) => {
            if (value) {
              // start remove this album
              deleteAlbum(albumName);
            }
          });
        }
      });
    }
  }
});

// eslint-disable-next-line no-unused-vars
function searchByDate () {
  const input = document.querySelector(".form-control");
  console.log(input.value);
}

function getFacePhotos (faceId) {
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  const data = { loadIndex: loadIndex, faceId: faceId };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/face/photos",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (photos, status) {
      const faceZone = document.querySelector(".col-lg-10");
      const backImg = `<br /><br /><br /><br />
                       <img
                        src="./images/back.png"
                        class="back"
                        onclick="backToFaces()"
                        style="cursor: pointer"
                       /><br />
                       <hr>`;
      faceZone.insertAdjacentHTML("beforeend", backImg);
      if (photos.length) {
        try {
          for (const photo of photos) {
            const img = `<div class="d-inline-block align-text-top img-container">
                         <img
                          src="${photo.url}"
                          class="d-inline-block align-text-top photo"
                         />
                         <div class="middle">
                            <a class="image-link" href="${photo.url}">
                            <img
                            src="./images/zoom.png"
                            class="d-inline-block align-text-top zoom"
                            style="cursor: pointer"
                            />
                            </a>
                         </div>
                         </div>`;
            faceZone.insertAdjacentHTML("beforeend", img);
          }
          // eslint-disable-next-line no-undef
          loadIndex += photoNumberPerLoad;
        } catch (error) {
          console.error(`Show user faces error: ${error}`);
        }
      }
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

// eslint-disable-next-line no-unused-vars
function backToFaces () {
  cleanScreen();
  faces();
}

function faces () {
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  const data = { loadIndex: loadIndex };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/faces",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (faces, status) {
      if (faces.length) {
        if (loadIndex !== 0) {
          try {
            const faceZone = document.querySelector(".col-lg-10");
            for (const face of faces) {
              const img = `<img
                            alt="${face.face_id}"
                            src="${face.face_url}"
                            class="d-inline-block align-text-top face"
                         />`;
              faceZone.insertAdjacentHTML("beforeend", img);
            }
            // eslint-disable-next-line no-undef
            loadIndex += photoNumberPerLoad;
          } catch (error) {
            console.error(`Show user faces error: ${error}`);
          }
        } else {
          try {
            const faceZone = document.querySelector(".col-lg-10");
            faceZone.insertAdjacentHTML("beforeend", "<br /><br /><br /><br />");
            for (const face of faces) {
              const img = `<img
                            alt="${face.face_id}"
                            src="${face.face_url}"
                            class="d-inline-block align-text-top face"
                         />`;
              faceZone.insertAdjacentHTML("beforeend", img);
            }
            // eslint-disable-next-line no-undef
            loadIndex += photoNumberPerLoad;
          } catch (error) {
            console.error(`Show user faces error: ${error}`);
          }
        }
      }
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

function exhibition () {
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  const data = { loadIndex: loadIndex };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/exhibition",
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
            const img = `<div class="d-inline-block align-text-top img-container">
                          <img
                            src="${photo.url}"
                            class="d-inline-block align-text-top photo"
                          />
                         <div class="middle">
                          <a class="image-link" href="${photo.url}">
                           <img
                            src="./images/zoom.png"
                            class="d-inline-block align-text-top zoom"
                            style="cursor: pointer"
                           />
                          </a>
                         </div>
                         </div>`;
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

// eslint-disable-next-line no-unused-vars
function exhibitionButton () {
  // eslint-disable-next-line no-undef
  swal({
    title: "Set Selected Photos To Exhitbition?",
    icon: "warning",
    buttons: true,
    dangerMode: false
  }).then((value) => {
    if (value) {
      addPhotoPublic();
    }
  });
}

// eslint-disable-next-line no-unused-vars
function addPhotoPublic () {
  const localStorage = window.localStorage;
  const selectedPhotos = document.querySelectorAll(".selected");
  const photosURL = [];
  for (const photo of selectedPhotos) {
    photosURL.push(photo.src);
  }

  const data = { photos: photosURL };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/photos/set/exhibition",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (result) {
      // eslint-disable-next-line no-undef
      swal(result.msg, "Please click the button!", "success");
      deselectAllPhoto();
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

// eslint-disable-next-line no-unused-vars
function trashButton (recovery) {
  if (recovery) {
    // eslint-disable-next-line no-undef
    swal({
      title: "Recover Selected Photos From Trash?",
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then((value) => {
      if (value) {
        recoveryPhotos(recovery);
      }
    });
  } else {
    // eslint-disable-next-line no-undef
    swal({
      title: "Permanently Delete Selected Photos?",
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then((value) => {
      if (value) {
        recoveryPhotos(recovery);
      }
    });
  }
}

// eslint-disable-next-line no-unused-vars
function recoveryPhotos (recovery) {
  const localStorage = window.localStorage;
  const selectedPhotos = document.querySelectorAll(".selected");
  const photosURL = [];
  for (const photo of selectedPhotos) {
    photosURL.push(photo.src);
  }

  const data = {
    recoveryPhotos: recovery,
    photos: photosURL,
    deletedPhotos: !recovery
  };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/trash/set/photos",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (result) {
      // eslint-disable-next-line no-undef
      swal(result.msg, "Please click the button!", "success");
      deselectAllPhoto();
      cleanScreen();
      trash();
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

function deleteAlbum (albumName) {
  const localStorage = window.localStorage;
  const data = { albumName: albumName };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/delete/album",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (result) {
      // eslint-disable-next-line no-undef
      swal(result.msg, "Please click the button!", "success");
      const sideBarSection = document.querySelector(".active");
      const section = sideBarSection.innerHTML.split(">")[1].trim();
      cleanScreen();
      if (section === "Shared Album") {
        albums(true);
      } else {
        albums(false);
      }
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

function setAlbumShared (albumName, shared) {
  const localStorage = window.localStorage;
  const data = { albumName: albumName, shared: shared };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/set/album",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (result) {
      // eslint-disable-next-line no-undef
      swal(result.msg, "Please click the button!", "success");
      const sideBarSection = document.querySelector(".active");
      const section = sideBarSection.innerHTML.split(">")[1].trim();
      cleanScreen();
      if (section === "Shared Album") {
        albums(true);
      } else {
        albums(false);
      }
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

function checkUserExist (albumName, userEmail) {
  const localStorage = window.localStorage;
  const data = { userEmail: userEmail };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/exist",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (result) {
      if (result.hasUser) {
        // eslint-disable-next-line no-undef
        swal(result.msg);
        // then add user to this album
        addUserToAlbum(albumName, userEmail, result.userId);
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

function addUserToAlbum (albumName, userEmail, userId) {
  const localStorage = window.localStorage;
  const data = { albumName: albumName, userEmail: userEmail, userId: userId };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/exist/album",
    headers: {
      Authorization: "Bearer " + localStorage.access_token
    },
    data: JSON.stringify(data),
    processData: false,
    contentType: "application/json",
    success: function (result) {
      // eslint-disable-next-line no-undef
      swal(result.msg, "Please click the button!", "success");
    },
    error: function (xhr, desc, err) {
      console.log(err);
    }
  });
}

function trash () {
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  const data = { loadIndex: loadIndex };
  // eslint-disable-next-line no-undef
  $.ajax({
    type: "POST",
    url: "/api/1.0/user/trash",
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
            const img = `<div class="d-inline-block align-text-top img-container">
                          <img
                           src="${photo.url}"
                           class="d-inline-block align-text-top photo"
                          />
                         <div class="middle">
                          <a class="image-link" href="${photo.url}">
                          <img
                           src="./images/zoom.png"
                           class="d-inline-block align-text-top zoom"
                           style="cursor: pointer"
                          />
                          </a>
                         </div>
                         </div>`;
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
            let name;
            if (albums[0].user_id === albums[0].album_owner_user_id) {
              name = `<br /><br /><br /><br />
                      <br />
                      <p class="album-name">${albumName} 
                        <img
                          src="./images/owner.png"
                          alt="owner"
                          width="20"
                          height="20"
                          class="d-inline-block align-text-top owner"
                          style="cursor: pointer"
                        />
                      </p>
                      <br />
                        `;
            } else {
              name = `<br /><br /><br /><br />
                      <br />
                      <p class="album-name">${albumName}</p>
                      <br />
                        `;
            }
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
              let name;
              if (album.user_id === album.album_owner_user_id) {
                name = `<br />
                        <br />
                        <p class="photo-date">${albumName}
                          <img
                            src="./images/owner.png"
                            alt="owner"
                            width="20"
                            height="20"
                            class="d-inline-block align-text-top owner"
                            style="cursor: pointer"
                          />
                        </p>
                        <br />`;
              } else {
                name = `<br />
                        <br />
                        <p class="photo-date">${albumName}
                        </p>
                        <br />`;
              }
              albumZone.insertAdjacentHTML("beforeend", name);
            }
            const img = `<div class="d-inline-block align-text-top img-container">
                         <img
                          src="${album.url}"
                          class="d-inline-block align-text-top photo"
                         />
                         <div class="middle">
                            <a class="image-link" href="${album.url}">
                            <img
                            src="./images/zoom.png"
                            class="d-inline-block align-text-top zoom"
                            style="cursor: pointer"
                            />
                            </a>
                         </div>
                         </div>`;
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
    success: function (result) {
      if (result.deleted) {
        // eslint-disable-next-line no-undef
        swal(result.msg, "Please click the button!", "success");
        deselectAllPhoto();
        const sideBarSection = document.querySelector(".active");
        const section = sideBarSection.innerHTML.split(">")[1].trim();
        if (section === "Photos") {
          cleanScreen();
          photos();
        } else if (section === "Shared Album") {
          cleanScreen();
          albums(true);
        } else if (section === "My Album") {
          cleanScreen();
          albums(false);
        }
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

function cleanScreen () {
  const plusElement = document.querySelector("#plus");
  const minusElement = document.querySelector("#minus");
  const deleteElement = document.querySelector("#delete");
  const recoveryElement = document.querySelector("#recovery");
  const publicElement = document.querySelector("#public");
  const photoZone = document.querySelector(".col-lg-10");
  photoZone.innerHTML = "";
  plusElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
  minusElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
  deleteElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
  recoveryElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
  publicElement.setAttribute("style", "cursor: pointer; visibility: Hidden");
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
            const img = `<div class="d-inline-block align-text-top img-container">
                         <img
                          src="${photo.url}"
                          class="d-inline-block align-text-top photo"
                         />
                         <div class="middle">
                            <a class="image-link" href="${photo.url}">
                            <img
                            src="./images/zoom.png"
                            class="d-inline-block align-text-top zoom"
                            style="cursor: pointer"
                            />
                            </a>
                         </div>
                         </div>`;
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

const uploadButton = document.getElementById("upload");
uploadButton.addEventListener("click", (e) => {
  e.preventDefault();
  uploadPhoto();
}, true);
// uploadButton.addEventListener("click", uploadPhoto(event), true);

// eslint-disable-next-line no-unused-vars
function uploadPhoto () {
  // event.preventDefault();
  // eslint-disable-next-line no-undef
  swal("Each photo size need to less than 2 MB");
  const localStorage = window.localStorage;
  // eslint-disable-next-line no-undef
  $("#imgupload").trigger("click");
  const uploadFiles = document.querySelector("#imgupload");
  uploadFiles.addEventListener("change", (e) => {
    const form = new FormData();
    for (let i = 0; i < e.target.files.length; i += 1) {
      console.log(e.target.files[i]);
      if (photoUploadFormSet.has(e.target.files[i].name)) {
        continue;
      } else {
        form.append("photos", e.target.files[i]);
        photoUploadFormSet.add(e.target.files[i].name);
      }
    }
    // clear photo fils store in input element
    const input = document.querySelector("#imgupload");
    if (input) {
      input.parentNode.removeChild(input);
    }
    // stop call ajax if form has no file
    if (form.getAll("photos").length === 0) {
      console.log("break");
    } else {
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
          // clear photo upload set for next upload
          photoUploadFormSet.clear();
          // eslint-disable-next-line no-undef
          swal(msg, "Please click the button!", "success");
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
          const sideBarSection = document.querySelector(".active");
          const section = sideBarSection.innerHTML.split(">")[1].trim();
          if (section === "Photos") {
          // only refresh page if section is photos
            cleanScreen();
            photos();
          }
        },
        error: function (e) {
          // eslint-disable-next-line no-undef
          swal("Photo size is too large", "Please choose photo size under 2 MB!", "error");
          photoUploadFormSet.clear();
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
    }
  });
}
