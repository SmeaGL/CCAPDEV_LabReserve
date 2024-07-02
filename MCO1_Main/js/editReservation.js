document.addEventListener("DOMContentLoaded", function () {
  // Function to handle the Edit button click
  function handleEditClick(event) {
    window.location.href = "reserveSlot.html";
  }

  // Function to handle the Cancel button click
  function handleCancelClick(event) {
    const userConfirmed = confirm("Are you sure you want to cancel?");
    if (userConfirmed) {
      // Proceed with cancellation (e.g., make an AJAX call to cancel the reservation)
      alert("Reservation cancelled successfully.");
    }
  }

  // Attach event listeners to the Edit buttons
  const editButtons = document.querySelectorAll(".edit_button");
  editButtons.forEach((button) => {
    button.addEventListener("click", handleEditClick);
  });

  // Attach event listeners to the Cancel buttons
  const cancelButtons = document.querySelectorAll(".cancel_button");
  cancelButtons.forEach((button) => {
    button.addEventListener("click", handleCancelClick);
  });
});
