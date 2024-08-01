$(document).ready(function () {
  async function fetchUserProfile() {
    try {
      const response = await fetch("/api/userProfile");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const userData = await response.json();

      if (userData.profilePicture) {
        $(".user-profile img").attr("src", userData.profilePicture);
      } else {
        $(".user-profile img").attr("src", "images/avatar.png");
      }
      $(".user-name").text(userData.name);
      $(".user-email").text(userData.email);
      $(".user-description").text(userData.description);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  async function fetchAndDisplayBookings() {
    try {
      // Fetch the current user profile
      const currentUserProfile = await getUserProfile();
      const { username, email, userType } = currentUserProfile;
      const isFaculty = userType === "faculty";

      const $table = $("table.lab_reservations");
      $table.attr("data-all", isFaculty ? "true" : "false");

      if (isFaculty) {
        $table
          .find(
            "thead tr th:contains('Booker Email'), thead tr th:contains('Booker Name')"
          )
          .remove();
        $table.find("thead tr").prepend(`
        <th class="wide-column">Booker Email</th>
        <th class="wide-column">Booker Name</th>
      `);
      }

      // Fetch bookings data based on allBookings flag
      const response = await fetch(`/api/getRoomSeatDateTime?all=${isFaculty}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const bookings = await response.json();

      const tableBody = $(".lab_reservations tbody");
      tableBody.empty(); // Clear existing rows

      if (bookings.length === 0) {
        const noReservationsRow = `<tr> <td colspan="8" style="text-align: center;">You don't have any reservations</td></tr>`;
        tableBody.append(noReservationsRow);
      } else {
        bookings.forEach((booking) => {
          const bookingDate = new Date(booking.date);
          const bookingTime = booking.timeSlot.split(" - ")[1];
          const [hours, minutes] = bookingTime.split(":").map(Number);

          bookingDate.setHours(hours, minutes);
          const currentDate = new Date();
          const isPastBooking = bookingDate < currentDate;

          // Check if the booking is currently ongoing
          const startTime = booking.timeSlot.split(" - ")[0];
          const [startHours, startMinutes] = startTime.split(":").map(Number);
          const bookingStartDate = new Date(booking.date);
          bookingStartDate.setHours(startHours, startMinutes);

          const isOngoingBooking =
            bookingStartDate <= currentDate && bookingDate >= currentDate;

          const row = `
          <tr>
            ${isFaculty ? `<td>${booking.bookerEmail}</td>` : ""}
            ${isFaculty ? `<td>${booking.bookerName}</td>` : ""}
            <td>${booking.laboratoryNumber}</td>
            <td>${booking.seatNumber}</td>
            <td>${bookingDate.toISOString().split("T")[0]}</td>
            <td>${booking.timeSlot}</td>
            <td>${booking.requestTime}</td>
            <td class="button-cell">
              ${
                isPastBooking
                  ? `<p class="reserveComplete">Reservation Completed!</p>`
                  : isOngoingBooking
                  ? `<p class="reserveComplete">In Progress</p>`
                  : `<button class="edit_button" 
                        data-id="${booking._id}"
                        data-seat-number="${booking.seatNumber}"
                        data-lab-number="${booking.laboratoryNumber}"
                        data-booking-date="${
                          bookingDate.toISOString().split("T")[0]
                        }"
                        data-timeslot="${booking.timeSlot}"
                        data-booker-email="${booking.bookerEmail || ""}"
                        data-booker-name="${
                          booking.bookerName || ""
                        }">Edit</button>

                <button class="cancel_button"
                        data-seat-number="${booking.seatNumber}"
                        data-lab-number="${booking.laboratoryNumber}"
                        data-booking-date="${
                          bookingDate.toISOString().split("T")[0]
                        }"
                        data-timeslot="${booking.timeSlot}"
                        data-booker-email="${booking.bookerEmail || ""}"
                        data-booker-name="${
                          booking.bookerName || ""
                        }">Cancel</button>
                `
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
      $(".lab_reservations tbody").html(
        '<tr><td colspan="8" style="text-align: center;">Error fetching bookings. Please try again later.</td></tr>'
      );
    }
  }

  function addButtonEventListeners() {
    async function handleEditClick(event) {
      const button = event.currentTarget;

      // Retrieve data attributes from the button
      const seatNumber = button.getAttribute("data-seat-number");
      const labNumber = button.getAttribute("data-lab-number");
      const bookingDate = button.getAttribute("data-booking-date");
      const timeslot = button.getAttribute("data-timeslot");
      const bookerEmail = button.getAttribute("data-booker-email");
      const bookerName = button.getAttribute("data-booker-name");

      const reservationData = {
        seatNumber,
        labNumber,
        bookingDate,
        timeslot,
        bookerEmail, // Include bookerEmail if needed
        bookerName,
      };

      const queryString = new URLSearchParams(reservationData).toString();

      window.location.href = `/replaceBooking?${queryString}`;
    }
    async function handleCancelClick(event) {
      const userConfirmed = confirm("Are you sure you want to cancel?");
      if (userConfirmed) {
        const button = event.currentTarget;

        // Retrieve data attributes from the button
        const seatNumber = button.getAttribute("data-seat-number");
        const labNumber = button.getAttribute("data-lab-number");
        const bookingDate = button.getAttribute("data-booking-date");
        const timeslot = button.getAttribute("data-timeslot");
        const bookerEmail = button.getAttribute("data-booker-email");

        try {
          const queryString = `?seatNumber=${seatNumber}&labNumber=${labNumber}&bookingDate=${bookingDate}&timeslot=${timeslot}&bookerEmail=${bookerEmail}`;
          const response = await fetch("/api/cancelbooking" + queryString, {
            method: "POST",
          });

          if (response.ok) {
            // Refresh bookings list
            fetchUserProfile();
            fetchAndDisplayBookings();
          } else {
            throw new Error("Failed to cancel booking");
          }
        } catch (error) {
          console.error("Error cancelling booking:", error);
          alert("Failed to cancel booking. Please try again later.");
        }
      }
    }

    const editButtons = document.querySelectorAll(".edit_button");
    const cancelButtons = document.querySelectorAll(".cancel_button");

    editButtons.forEach((button) => {
      button.addEventListener("click", handleEditClick);
    });

    cancelButtons.forEach((button) => {
      button.addEventListener("click", handleCancelClick);
    });
  }

  async function getUserProfile() {
    try {
      const emailResponse = await fetch("/api/currentUserEmail");

      if (!emailResponse.ok) {
        throw new Error(`HTTP error! Status: ${emailResponse.status}`);
      }

      const emailData = await emailResponse.json();
      const email = emailData.email;

      if (!email) {
        throw new Error("No email found for the current user.");
      }

      const userProfileResponse = await fetch(
        `/api/userProfileOther?email=${encodeURIComponent(email)}`
      );

      if (!userProfileResponse.ok) {
        throw new Error(`HTTP error! Status: ${userProfileResponse.status}`);
      }

      const userData = await userProfileResponse.json();
      return userData;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("Error fetching user profile. Please try again.");
    }
  }

  // Initial fetch and display of bookings
  fetchUserProfile();
  fetchAndDisplayBookings();
});
