export default class ErrorException extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ErrorException';
    this.status = status;
  }
}
