export class CreateTicketDto {
  private constructor(
    public email: string,
    public password: string,
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, CreateTicketDto | undefined] {
    const { email, password } = object;

    if (!email) return ['Missing email', undefined];

    if (!password) return ['Missing password', undefined];
    if (password.length < 6)
      return ['Password must be at least 6 characters', undefined];

    return [undefined, new CreateTicketDto(email, password)];
  }
}
