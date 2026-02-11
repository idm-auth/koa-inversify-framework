export class NotFoundError extends Error {
  constructor(
    public readonly resource: string,
    public readonly identifier: string
  ) {
    super(`${resource} not found: ${identifier}`);
    this.name = 'NotFoundError';
  }
}
