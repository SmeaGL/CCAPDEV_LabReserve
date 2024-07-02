document.addEventListener("DOMContentLoaded", function () {
  function handleEditClick(event) {
    window.location.href = "/reserveSlot";
  }

  function handleCancelClick(event) {
    const userConfirmed = confirm("Are you sure you want to cancel?");
    if (userConfirmed) {
      alert("Reservation cancelled successfully.");
    }
  }

  const editButtons = document.querySelectorAll(".edit_button");
  editButtons.forEach((button) => {
    button.addEventListener("click", handleEditClick);
  });

  const cancelButtons = document.querySelectorAll(".cancel_button");
  cancelButtons.forEach((button) => {
    button.addEventListener("click", handleCancelClick);
  });
});
