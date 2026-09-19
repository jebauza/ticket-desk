export class SetRolesDto {
  private constructor(public roleIds: string[]) {}

  static create(object: {
    [key: string]: any;
  }): [string | undefined, SetRolesDto | undefined] {
    const { roleIds } = object;

    if (!Array.isArray(roleIds)) return ['roleIds must be an array', undefined];
    if (!roleIds.every((id) => typeof id === 'string')) {
      return ['roleIds must be an array of strings', undefined];
    }

    return [undefined, new SetRolesDto(roleIds)];
  }
}
