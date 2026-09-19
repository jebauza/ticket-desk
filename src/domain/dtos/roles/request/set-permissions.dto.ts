export class SetPermissionsDto {
  private constructor(public permissionIds: string[]) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, SetPermissionsDto | undefined] {
    const { permissionIds } = object;

    if (!Array.isArray(permissionIds)) return ['permissionIds must be an array', undefined];
    if (!permissionIds.every((id) => typeof id === 'string')) {
      return ['permissionIds must be an array of strings', undefined];
    }

    return [undefined, new SetPermissionsDto(permissionIds)];
  }
}
