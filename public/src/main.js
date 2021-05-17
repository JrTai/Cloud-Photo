// eslint-disable-next-line no-unused-vars
function uploadPhoto () {
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
      data: form,
      processData: false,
      contentType: false,
      success: function (msg) {
        alert(msg);
        // create order div then append
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
      }
    });
  });
}
