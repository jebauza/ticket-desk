export interface PermissionCreateProps {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: Date | string;
}

// Sin PermissionUpdateProps para "name": es la clave estable con la que el
// código futuro verifica permisos (ej. "tickets:create") — cambiarla
// silenciosamente rompería cualquier chequeo que dependa de ese string.
// Solo "description" es mutable (ver UpdatePermissionDto).
export type PermissionUpdateProps = { description?: string | null };

export class PermissionEntity {
  private constructor(
    public id: string,
    public name: string,
    public description: string | null,
    public createdAt: Date,
  ) {}

  static create(props: PermissionCreateProps): PermissionEntity {
    const { id, name, description, createdAt } = props;

    if (!id) throw new Error('id is required');
    if (!name || !name.trim()) throw new Error('name is required');

    return new PermissionEntity(
      id,
      name.trim(),
      description?.trim() ?? null,
      createdAt ? new Date(createdAt) : new Date(),
    );
  }

  static fromObject(object: { [key: string]: any }): PermissionEntity {
    const { id, name, description, createdAt } = object;

    return PermissionEntity.create({ id, name, description, createdAt });
  }
}
