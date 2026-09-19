export class LoginUserDto {
  private constructor(
    public email: string,
    public password: string,
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, LoginUserDto | undefined] {
    const { email, password } = object;

    if (!email) return ['Missing email', undefined];
    if (!password) return ['Missing password', undefined];

    return [undefined, new LoginUserDto(email, password)];
  }
}
