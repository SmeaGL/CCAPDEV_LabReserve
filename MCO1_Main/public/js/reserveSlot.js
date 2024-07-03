$(document).ready(function () {
  initializeCalendarAndReservations();
});

function initializeCalendarAndReservations() {
  // Calendar Variables
  const datetextElements = $(".date_text");
  const daytextElement = $(".day_text");
  const dateElements = $(".date");
  const btnElements = $(".calendar_heading .fas");
  const monthyearElements = $(".month_year");

  let labs = ["G301", "G302", "G303A", "G303B"];

  let dateMonthObject = [
    {
      days: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
  ];

  let dateObject = new Date();
  let dayName = dateMonthObject[0].days[dateObject.getDay()];
  let month = dateObject.getMonth();
  let year = dateObject.getFullYear();
  let date = dateObject.getDate();

  datetextElements.html(
    `${dateMonthObject[0].months[month]}, ${date}, ${year}`
  );

  const displayCalendar = () => {
    let firstDayOfMonth = new Date(year, month, 1).getDay();
    let lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    let lastDateOfLastMonth = new Date(year, month, 0).getDate();
    let days = "";

    // Previous month's last days
    for (let i = firstDayOfMonth; i > 0; i--) {
      days += `<li class="dummy">${lastDateOfLastMonth - i + 1}</li>`;
    }

    // Current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      let checkToday =
        i === dateObject.getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear()
          ? "active"
          : "";
      days += `<li class="${checkToday}">${i}</li>`;
    }

    // Next month's first days
    let totalDaysDisplayed = firstDayOfMonth + lastDateOfMonth;
    for (let i = totalDaysDisplayed; i < 35; i++) {
      days += `<li class="dummy">${i - totalDaysDisplayed + 1}</li>`;
    }

    dateElements.html(days);
    monthyearElements.html(`${dateMonthObject[0].months[month]} ${year}`);

    // Event listeners to each day
    dateElements
      .find("li")
      .not(".dummy")
      .on("click", function () {
        dateElements.find("li").removeClass("active");

        $(this).addClass("active");

        date = parseInt($(this).text());
        dayName = dateMonthObject[0].days[new Date(year, month, date).getDay()];
        datetextElements.html(
          `${dateMonthObject[0].months[month]}, ${date}, ${year}`
        );

        if (
          date === dateObject.getDate() &&
          month === new Date().getMonth() &&
          year === new Date().getFullYear()
        ) {
          daytextElement.show();
        } else {
          daytextElement.hide();
        }

        const selectedLabNumber = selectedLab.val();
        displayTimeslotReservation(
          selectedLabNumber,
          `${dateMonthObject[0].months[month]}, ${date}, ${year}`,
          timeslotStatusObject
        );
      });
  };

  displayCalendar();

  btnElements.each(function () {
    $(this).on("click", function () {
      if (this.id === "previous") {
        month -= 1;
        if (month < 0) {
          month = 11;
          year -= 1;
        }
      } else if (this.id === "next") {
        month += 1;
        if (month > 11) {
          month = 0;
          year += 1;
        }
      }

      displayCalendar();
    });
  });

  // Reservation Variables
  let timeSlotObject = [
    { timeSlot: "07:30 - 09:00" },
    { timeSlot: "09:15 - 10:45" },
    { timeSlot: "11:00 - 12:30" },
    { timeSlot: "12:45 - 14:15" },
    { timeSlot: "14:30 - 16:00" },
    { timeSlot: "16:15 - 17:45" },
    { timeSlot: "18:00 - 19:30" },
    { timeSlot: "19:45 - 21:15" },
  ];

  let timeslotStatusObject = [
    {
      status: "Available",
      slotsLeft: 10,
      timeSlot: "07:30 - 09:15",
      info: null,
    },
    {
      status: "Booked",
      slotsLeft: 0,
      timeSlot: "09:15 - 11:00",
      info: null,
    },
    {
      status: "Available",
      slotsLeft: 10,
      timeSlot: "11:00 - 12:45",
      info: null,
    },
    {
      status: "Available",
      slotsLeft: 6,
      timeSlot: "12:45 - 14:30",
      info: null,
    },
    {
      status: "Booked",
      slotsLeft: 10,
      timeSlot: "14:30 - 16:15",
      info: null,
    },
    {
      status: "Available",
      slotsLeft: 10,
      timeSlot: "16:15 - 18:00",
      info: null,
    },
    {
      status: "Available",
      slotsLeft: 10,
      timeSlot: "18:00 - 19:45",
      info: null,
    },
    {
      status: "Available",
      slotsLeft: 10,
      timeSlot: "19:45 - 21:15",
      info: null,
    },
  ];

  let seatNumberObject = [
    {
      seatNumber: "A1",
      status: "Available",
      info: null,
    },
    {
      seatNumber: "A2",
      status: "Booked",
      info: {
        bookerName: "Shawn",
        bookingDate: "2024-05-30",
        requestTime: "2024-05-29 08:00",
      },
      laboratory: "G301",
    },
    {
      seatNumber: "A3",
      status: "Available",
      info: null,
    },
    {
      seatNumber: "A4",
      status: "Available",
      info: null,
    },
    {
      seatNumber: "A5",
      status: "Booked",
      info: {
        bookerName: "Aljirah",
        bookingDate: "2024-06-01",
        requestTime: "2024-05-30 09:00",
      },
      laboratory: "G301",
    },
    {
      seatNumber: "A6",
      status: "Available",
      info: null,
    },
    {
      seatNumber: "A7",
      status: "Available",
      info: null,
    },
    {
      seatNumber: "A8",
      status: "Available",
      info: null,
    },
    {
      seatNumber: "A9",
      status: "Booked",
      info: {
        bookerName: "Andrei",
        bookingDate: "2024-05-30",
        requestTime: "2024-05-29 08:00",
      },
      laboratory: "G301",
    },
    {
      seatNumber: "A10",
      status: "Booked",
      info: {
        bookerName: "Mark",
        bookingDate: "2024-05-30",
        requestTime: "2024-05-29 08:00",
      },
      laboratory: "G301",
    },
  ];

  const selectedLab = $("#selectedLab");
  let selectedTimeslot = null;

  const displayTimeslotReservation = (
    labNumber,
    date,
    timeslotStatusObject
  ) => {
    const timeSlotDiv = $(".time_slot");
    timeSlotDiv.empty();

    $("<h3>")
      .html(`Laboratory Number: <span class="info">${labNumber}</span>`)
      .appendTo(timeSlotDiv);

    $("<h3>")
      .html(`Date: <span class="info">${date}</span>`)
      .appendTo(timeSlotDiv);

    timeslotStatusObject.forEach((slot) => {
      const p = $("<div>").addClass("timeslot-container");

      if (slot.slotsLeft > 0) {
        p.html(
          `${slot.timeSlot} <span id="slotsLeft">${slot.slotsLeft} slots left</span>`
        );
      } else {
        p.html(`${slot.timeSlot} <span id="fullyBooked">Fully Booked</span>`);
      }

      p.on("click", function () {
        selectedTimeslot = slot.timeSlot;
        displaySeatNumberReservation(selectedTimeslot, date);
      });

      timeSlotDiv.append(p);
    });
  };

  const displaySeatNumberReservation = (timeslot, date) => {
    const seatNumberDiv = $(".seat_number");
    seatNumberDiv.empty();

    $("<h3>")
      .html(`Time Slot: <span class="info">${timeslot}</span>`)
      .appendTo(seatNumberDiv);

    $("<h3>").html(`Seat Number`).appendTo(seatNumberDiv);

    seatNumberObject.forEach((seat) => {
      let status = seat.status;

      const seatContainer = $("<div>").addClass("seat-container");

      const seatInfo = $("<p>")
        .html(`${seat.seatNumber}`)
        .addClass("seat-info");
      seatContainer.append(seatInfo); // Append seatInfo to seatContainer

      const statusButton = $("<button>").html(status).addClass("status-button");

      if (status === "Available") {
        statusButton.addClass("available");
        statusButton.on("click", function () {
          const labNumber = selectedLab.val();
          confirmBooking(timeslot, seat, labNumber);
        });
      } else {
        statusButton.addClass("booked");
        const { bookerName, bookingDate, requestTime } = seat.info;
        statusButton.on("click", function () {
          displayBookingInfo(seat, bookerName, bookingDate, requestTime);
        });
      }

      seatContainer.append(statusButton); // Append statusButton to seatContainer
      seatNumberDiv.append(seatContainer); // Append seatContainer to seatNumberDiv
    });
  };

  function confirmBooking(timeslot, seat, labNumber) {
    const bookerName = "Your Name";
    const bookingDate = new Date().toLocaleDateString();
    const requestTime = new Date().toLocaleTimeString();

    const overlay = $("#myOverlay");
    const bookingInfo = $("#bookingInfo");
    bookingInfo.html(`
     <span class="bookingLine">Laboratory: <span class="bookingInfoValue">${labNumber}</span></span><br>
      <span class="bookingLine">Seat Number: <span class="bookingInfoValue">${seat.seatNumber}</span></span><br>
      <span class="bookingLine">Time Slot: <span class="bookingInfoValue">${timeslot}</span></span><br>
      <span class="bookingLine">Request Time: <span class="bookingInfoValue">${requestTime}</span></span><br>
      <span class="bookingLine">Booking Date: <span class="bookingInfoValue">${bookingDate}</span></span><br>
      <button id="cancelButton">Cancel</button>
      <button id="confirmButton">Confirm Booking</button>
    `);

    overlay.show();

    $("#confirmButton").on("click", function () {
      overlay.hide();
      alert("Booking confirmed!");
    });

    $("#cancelButton").on("click", function () {
      overlay.hide();
    });
  }

  function displayBookingInfo(slot, bookerName, bookingDate, requestTime) {
    const overlay = $("#myOverlay");
    const bookingInfo = $("#bookingInfo");
    bookingInfo.html(`
      <span class="bookingLine">Booker : <span class="bookingInfoValue">${bookerName}</span></span><br>
      <span class="bookingLine">Seat Number : <span class="bookingInfoValue">${slot.seatNumber}</span></span><br>
      <span class="bookingLine">Laboratory : <span class="bookingInfoValue">${slot.laboratory}</span></span><br>
      <span class="bookingLine">Request Time : <span class="bookingInfoValue">${requestTime}</span></span><br>
      <span class="bookingLine">Booking Date : <span class="bookingInfoValue">${bookingDate}</span></span>
    `);
    overlay.show();
  }

  // Event listener for changes in the selected lab
  selectedLab.on("change", function () {
    displayTimeslotReservation(
      selectedLab.val(),
      `${dateMonthObject[0].months[month]}, ${date}, ${year}`,
      timeslotStatusObject
    );
  });

  // Initial display
  displayTimeslotReservation(
    selectedLab.val(),
    `${dateMonthObject[0].months[month]}, ${date}, ${year}`,
    timeslotStatusObject
  );

  // Get the default timeslot string
  const defaultTimeslot = timeSlotObject.find(
    (slot) => slot.timeSlot === "07:30 - 09:00"
  ).timeSlot;

  displaySeatNumberReservation(
    defaultTimeslot,
    `${dateMonthObject[0].months[month]}, ${date}, ${year}`
  );

  const overlay = $("#myOverlay");
  const span = $(".close");
  span.on("click", function () {
    overlay.hide();
  });

  $(window).on("click", function (event) {
    if (event.target === overlay[0]) {
      overlay.hide();
    }
  });
}
