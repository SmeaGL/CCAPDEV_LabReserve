$(document).ready(function () {
  async function fetchAndDisplayBookings() {
    try {
      const response = await fetch("/api/getRoomSeatDateTime");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const bookings = await response.json();

      const tableBody = $(".lab-reservations tbody");
      tableBody.empty(); // Clear existing rows

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

      // Add event listeners for edit and cancel buttons
    } catch (error) {
      console.error("Error fetching bookings:", error);
      $(".lab-reservations tbody").html(
        '<tr><td colspan="5">Error fetching bookings. Please try again later.</td></tr>'
      );
    }
  }

  // Initial fetch and display of bookings
  fetchAndDisplayBookings();
});
