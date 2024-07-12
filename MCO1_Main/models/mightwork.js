async function insertData(
  dateString,
  labNumber,
  timeSlotString,
  seatNumber,
  status,
  bookingInfo = null
) {
  try {
    // 1. Find or create the Date
    let date = await DateModel.findOne({ date: new Date(dateString) });
    if (!date) {
      date = await DateModel.create({ date: new Date(dateString) });
    }

    // 2. Find or create the LaboratoryNumber
    let lab = await LaboratoryNumber.findOne({
      laboratoryNumber: labNumber,
      date: date._id,
    });
    if (!lab) {
      lab = await LaboratoryNumber.create({
        laboratoryNumber: labNumber,
        date: date._id,
      });
      date.laboratories.push(lab._id);
      await date.save();
    }

    // 3. Find or create the TimeSlot
    let timeSlot = await TimeSlot.findOne({
      timeSlot: timeSlotString,
      laboratory: lab._id,
    });
    if (!timeSlot) {
      timeSlot = await TimeSlot.create({
        timeSlot: timeSlotString,
        laboratory: lab._id,
      });
      lab.timeSlots.push(timeSlot._id);
      await lab.save();
    }

    // 4. Create or update the SeatStatus
    let seatStatus = await SeatStatus.findOne({
      seatNumber,
      timeSlot: timeSlot._id,
    });
    if (!seatStatus) {
      seatStatus = await SeatStatus.create({
        seatNumber,
        status,
        timeSlot: timeSlot._id,
        info: bookingInfo,
      });
      timeSlot.seatStatuses.push(seatStatus._id);
      await timeSlot.save();
    } else {
      seatStatus.status = status;
      seatStatus.info = bookingInfo;
      await seatStatus.save();
    }

    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}
