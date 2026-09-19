export class CreatePermissionDto {
  private constructor(
    public name: string,
    public description?: string,
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, CreatePermissionDto | undefined] {
    const { name, description } = object;

    if (!name) return ['Missing name', undefined];

    return [undefined, new CreatePermissionDto(name, description)];
  }
}
