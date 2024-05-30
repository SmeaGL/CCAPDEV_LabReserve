// Calendar Variables
const datetextElements = $(".date_text");
const daytextElement = $(".day_text");
const dateElements = $(".date");
const btnElements = $(".calendar_heading .fas");
const monthyearElements = $(".month_year");

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
  `${dateMonthObject[0].months[month]}, ${date}, ${year} (${dayName})`
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
        `${dateMonthObject[0].months[month]}, ${date}, ${year} (${dayName})`
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
      displayReservationSlots(
        selectedLabNumber,
        `${dateMonthObject[0].months[month]}, ${date}, ${year}`
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

let statusObject = [
  { status: "Available", info: null },
  {
    status: "Booked",
    info: {
      bookerName: "Shawn Mark Ang",
      bookingDate: "2024-05-30",
      requestTime: "2024-05-29 08:00",
    },
    seatNumber: "A2",
    laboratory: "Lab 2",
  },
  { status: "Available", info: null },
  { status: "Available", info: null },
  {
    status: "Booked",
    info: {
      bookerName: "Aljirah Cute",
      bookingDate: "2024-06-01",
      requestTime: "2024-05-30 09:00",
    },
    seatNumber: "A5",
    laboratory: "Lab 1",
  },
  { status: "Available", info: null },
  { status: "Available", info: null },
  { status: "Available", info: null },
];

const selectedLab = $("#selectedLab");

const displayReservationSlots = (labNumber, date) => {
  const timeSlotDiv = $(".time_slot");
  timeSlotDiv.empty();

  $("<h3>")
    .html(`Laboratory: <span class="info">${labNumber}</span>`)
    .appendTo(timeSlotDiv);

  $("<h3>")
    .html(`Date: <span class="info">${date}</span>`)
    .appendTo(timeSlotDiv);

  timeSlotObject.forEach((slot, index) => {
    let status = statusObject[index].status;

    const p = $("<p>");

    if (status === "Available") {
      p.html(`${slot.timeSlot}  <span id="available">${status}</span>`);
    } else {
      const bookerName = statusObject[index].info.bookerName;
      const bookingDate = statusObject[index].info.bookingDate;
      const requestTime = statusObject[index].info.requestTime;
      p.html(`${slot.timeSlot}  <span id="booked">${status}</span>`);
      p.on("click", function () {
        displayBookingInfo(
          statusObject[index],
          bookerName,
          bookingDate,
          requestTime
        );
      });
    }

    timeSlotDiv.append(p);
  });
};

// Event listener for changes in the selected lab
selectedLab.on("change", function () {
  displayReservationSlots(
    selectedLab.val(),
    `${dateMonthObject[0].months[month]}, ${date}, ${year}`
  );
});

// Initial display
displayReservationSlots(
  selectedLab.val(),
  `${dateMonthObject[0].months[month]}, ${date}, ${year}`
);

// Booking Information
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
