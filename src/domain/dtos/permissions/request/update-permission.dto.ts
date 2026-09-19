// Solo "description" es editable — "name" es la clave estable del permiso
// (ver PermissionEntity), nunca se expone como campo actualizable aquí.
const FORBIDDEN_FIELDS = ['id', 'name', 'createdAt'];

export class UpdatePermissionDto {
  private constructor(public description: string) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, UpdatePermissionDto | undefined] {
    const forbidden = FORBIDDEN_FIELDS.filter((field) => field in object);
    if (forbidden.length > 0) {
      return [`Fields not allowed: ${forbidden.join(', ')}`, undefined];
    }

    const { description } = object;
    if (description === undefined) return ['Missing description', undefined];

    return [undefined, new UpdatePermissionDto(description)];
  }
}
