const err = (msg, errCode = 500) => {
  const e = new Error(msg);
  e.message = msg;
  e.httpStatusCode = errCode;
  console.log(errCode, msg);
  return e;
};

module.exports = {
  err,
};
