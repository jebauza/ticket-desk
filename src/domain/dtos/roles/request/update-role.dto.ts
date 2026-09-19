const FORBIDDEN_FIELDS = ['id', 'createdAt'];

export class UpdateRoleDto {
  private constructor(
    public name?: string,
    public description?: string,
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, UpdateRoleDto | undefined] {
    const forbidden = FORBIDDEN_FIELDS.filter((field) => field in object);
    if (forbidden.length > 0) {
      return [`Fields not allowed: ${forbidden.join(', ')}`, undefined];
    }

    const { name, description } = object;

    if (name === undefined && description === undefined) {
      return ['At least one field must be provided', undefined];
    }

    return [undefined, new UpdateRoleDto(name, description)];
  }
}
