class APIError extends Error {
  constructor(message, statusCode = 500, operational = true) {
    super(message);
    this.httpStatusCode = statusCode;
    this.message = message;
    this.isOperational = operational;
  }
}
module.exports = { APIError };
