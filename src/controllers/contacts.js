const User = require("../db/schemas/user");
const Logger = require("../logger/logger");
const createError = require("../utils/createError.util");

const searchContacts = async (req, res) => {
  const { contacts } = req.body;
  if (!contacts || !Array.isArray(contacts)) createError("invalid data", 400);
  const foundContacts = [];
  for (const contact of contacts) {
    const contactName = Object.keys(contact)[0];
    const numbersArr = contact[contactName];
    for (let phone of numbersArr) {
      try {
        let user = await User.findOne({ phone });
        if (!!user) {
          user = user.toJSON();
          delete user.password;
          foundContacts.push(user);
        }
      } catch (err) {}
    }
  }
  res.json({ foundContacts });
};

module.exports = {
  searchContacts,
};
