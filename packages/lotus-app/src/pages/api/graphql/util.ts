export class UnauthorizedError extends Error {
  constructor() {
    super('UNAUTHORIZED');
  }
}

export class UnauthenticatedError extends Error {
  constructor() {
    super('UNAUTHENTICATED');
  }
}
