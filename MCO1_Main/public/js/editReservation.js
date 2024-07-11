$(document).ready(function () {
  async function fetchAndDisplayBookings() {
    try {
      const response = await fetch("/api/getRoomSeatDateTime");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const bookings = await response.json();

      const tableBody = $(".lab_reservations tbody");
      tableBody.empty(); // Clear existing rows

      const currentDate = new Date();

      if (bookings.length === 0) {
        const noReservationsRow = `<tr> <td colspan="5" style="text-align: center;">You don't have any reservations</td></tr>`;
        tableBody.append(noReservationsRow);
      } else {
        bookings.forEach((booking) => {
          const bookingDate = new Date(booking.date);
          const bookingTime = new Date(booking.timeSlot);

          // Check if the booking date and time are in the past
          const isPastBooking =
            bookingDate < currentDate ||
            (bookingDate.getTime() === currentDate.getTime() &&
              bookingTime < currentDate);

          const row = `
        <tr>
          <td>${booking.laboratoryNumber}</td>
          <td>${booking.seatNumber}</td>
          <td>${bookingDate.toISOString().split("T")[0]}</td>
          <td>${booking.timeSlot}</td>
          <td class="button-cell">
            ${
              isPastBooking
                ? `<p class="reserveComplete">Reservation Completed!</p>`
                : `<button class="edit_button" data-id="${booking._id}">Edit</button>`
            }
            ${
              isPastBooking
                ? ""
                : `<button class="cancel_button" data-id="${booking._id}">Cancel</button>`
            }
          </td>
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
  fetchAndDisplayBookings();
});
