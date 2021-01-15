const err = (msg, errCode = 500) => {
  const e = new Error(msg);
  e.message = msg;
  e.httpStatusCode = errCode;
  console.log(errCode, msg);
  return e;
};

const mongoErr = (error) => {
  if (error.kind === "ObjectId") {
    error.httpStatusCode = 404;
    console.log(error.httpStatusCode, error.message);
  }
  return error;
};
module.exports = {
  err,
  mongoErr,
};
