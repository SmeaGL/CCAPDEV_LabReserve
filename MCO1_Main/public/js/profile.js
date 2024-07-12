$(document).ready(function () {
  async function fetchUserProfile() {
    try {
      const response = await fetch("/api/userProfile");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const userData = await response.json();

      // Update user information in the HTML
      $(".user-name").text(userData.name);
      $(".user-email").text(userData.email);
      $(".user-description").text(userData.description);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Handle errors here
    }
  }

  async function fetchAndDisplayBookings() {
    try {
      const response = await fetch("/api/getRoomSeatDateTime");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const bookings = await response.json();

      const tableBody = $(".lab-reservations tbody");
      tableBody.empty(); // Clear existing rows

      if (bookings.length === 0) {
        const noReservationsRow = `<tr> <td colspan="5" style="text-align: center;">You don't have any reservations</td></tr>`;
        tableBody.append(noReservationsRow);
      } else {
        bookings.forEach((booking) => {
          const row = `
          <tr>
            <td>${booking.laboratoryNumber}</td>
            <td>${booking.seatNumber}</td>
            <td>${new Date(booking.date).toISOString().split("T")[0]}</td>
            <td>${booking.timeSlot}</td>
           
          </tr>
        `;
          tableBody.append(row);
        });
      }

      // Add event listeners for edit and cancel buttons
      addButtonEventListeners();
    } catch (error) {
      console.error("Error fetching bookings:", error);
      $(".lab-reservations tbody").html(
        '<tr><td colspan="5">Error fetching bookings. Please try again later.</td></tr>'
      );
    }
  }

  function addButtonEventListeners() {
    function handleEditClick(event) {
      window.location.href = "/reserveSlot";
    }

    function handleCancelClick(event) {
      const userConfirmed = confirm("Are you sure you want to cancel?");
      if (userConfirmed) {
        alert("Reservation cancelled successfully.");
        // Here you would typically send a request to the server to actually cancel the reservation
        // After successful cancellation, you might want to refresh the bookings list
        fetchAndDisplayBookings();
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
  }

  // Initial fetch and display of bookings
  fetchUserProfile();
  fetchAndDisplayBookings();

  async function fecthAndDisplayPublicProfile() {
    const response = await fetch("/api/publicProfile");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const allProfile = await response.json();

    const tableBody = $(".public-profile tbody");
    tableBody.empty(); // Clear existing rows

    if (allProfile.length === 0) {
      const noProfilesRow = `<tr> <td colspan="5" style="text-align: center;">No Profiles Available</td></tr>`;
      tableBody.append(noProfilesRow);
    } else {
      allProfile.forEach((profile) => {
        const row = `
        <tr>
          <td>${profile.username}</td>
          <td>${profile.email}</td>
        </tr>`;
        tableBody.append(row);
      });
    }
  }
});
