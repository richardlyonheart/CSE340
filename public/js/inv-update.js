const form = document.querySelector("#edit-form")
    form.addEventListener("change", function () {
      const updateBtn = document.getElementById("submitButtonForEdit")
      updateBtn.removeAttribute("disabled")
    })