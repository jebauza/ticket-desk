export class CreateRoleDto {
  private constructor(
    public name: string,
    public description?: string,
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, CreateRoleDto | undefined] {
    const { name, description } = object;

    if (!name) return ['Missing name', undefined];

    return [undefined, new CreateRoleDto(name, description)];
  }
}
