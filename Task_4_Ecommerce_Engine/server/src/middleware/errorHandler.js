export function notFoundHandler(_request, response) {
  response.status(404).json({ message: 'This route could not be found.' });
}

export function errorHandler(error, _request, response, _next) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status < 500 ? error.message : 'Something went wrong. Please try again.';

  if (status >= 500) console.error(error);
  response.status(status).json({ message });
}