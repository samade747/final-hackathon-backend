import Holiday from "../models/Holiday.js";

// add
export const add = async (req, res) => {
  try {
    console.log(req.body, "====> req.body");
    const { name, date } = req.body;

    // missing feilds
    if (!name || !date) {
      return res.status(400).send({ status: false, message: "Missing Fields" });
    }

    // check the date is already exists
    const checkDate = await Holiday.findOne({ Date: new Date(date) });
    if (checkDate) {
      return res
        .status(409)
        .send({ status: false, message: "Holiday already exists" });
    }

    // create an object
    const newHoliday = new Holiday({
      Name: name,
      Date: new Date(date),
    });

    // save
    const holiday = await newHoliday.save();

    // response send
    res.status(201).send({
      status: true,
      message: "Holiday added successfully",
      data: holiday,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};

// update
export const update = async (req, res) => {
  try {
    const { name, date } = req.body;
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res
        .status(404)
        .send({ status: false, message: "Holiday not found" });
    }

    // check the date is already exists
    if (date) {
      const checkDate = await Holiday.findOne({
        Date: new Date(date),
        _id: { $ne: req.params.id },
      });
      if (checkDate) {
        return res
          .status(409)
          .send({ status: false, message: "Holiday already exists" });
      }
    }

    // update
    holiday.Name = name || holiday.Name;
    holiday.Date = new Date(date) || holiday.Date;

    // save
    const updatedHoliday = await holiday.save();

    // response send
    res.status(200).send({
      status: true,
      message: "Holiday updated successfully",
      data: updatedHoliday,
    });
  } catch (error) {
    console.log(error);
  }
};

// delete
export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res
        .status(404)
        .send({ status: false, message: "Holiday not found" });
    }
    await Holiday.findByIdAndDelete(req.params.id);
    res.status(200).send({
      status: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};

// get all holidays
export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.status(200).send({
      status: true,
      message: "Holidays fetched successfully",
      data: holidays,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};

// get holiday
export const getHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res
        .status(404)
        .send({ status: false, message: "Holiday not found" });
    }
    res.status(200).send({
      status: true,
      message: "Holiday fetched successfully",
      data: holiday,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};
