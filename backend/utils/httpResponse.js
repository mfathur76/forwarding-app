function ok(res, message, data) {
  return res.json({
    success: true,
    message,
    data,
  });
}

function created(res, message, data) {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
}

function fail(res, statusCode, message, errors) {
  const body = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
}

function validationFail(res, message, errors) {
  return fail(res, 422, message, errors);
}

function unauthorized(res, message) {
  return fail(res, 401, message);
}

function forbidden(res, message) {
  return fail(res, 403, message);
}

function notFound(res, message) {
  return fail(res, 404, message);
}

function conflict(res, message) {
  return fail(res, 409, message);
}

function serverError(res, message, error) {
  return res.status(500).json({
    success: false,
    message,
    error: error.message,
  });
}

module.exports = {
  ok,
  created,
  fail,
  validationFail,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
};
