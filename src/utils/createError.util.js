const createError = (msg, status) => {
  throw { customMessage: msg, status };
};

module.exports = createError;
