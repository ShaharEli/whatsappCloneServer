const { Router } = require("express");
const withTryCatch = require("../../utils/withTryCatch.util");
const { searchContacts } = require("../../controllers/contacts");

require("dotenv").config();

const contactsRouter = Router();

contactsRouter.post("/search-contacts", (req, res) =>
  withTryCatch(req, res, searchContacts)
);
module.exports = contactsRouter;
