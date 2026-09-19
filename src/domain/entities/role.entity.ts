export interface RoleCreateProps {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type RoleUpdateProps = Partial<Omit<RoleCreateProps, 'id'>>;

// Agregado independiente: a diferencia de Address (que vive y muere con un
// User), un Role existe por sí mismo — puede crearse sin ningún usuario
// asignado, listarse/editarse/borrarse independientemente. Su relación con
// User y con Permission es una asociación M:N, no composición.
export class RoleEntity {
  private constructor(
    public id: string,
    public name: string,
    public description: string | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(props: RoleCreateProps): RoleEntity {
    const { id, name, description, createdAt, updatedAt } = props;

    if (!id) throw new Error('id is required');
    if (!name || !name.trim()) throw new Error('name is required');

    return new RoleEntity(
      id,
      name.trim(),
      description?.trim() ?? null,
      createdAt ? new Date(createdAt) : new Date(),
      updatedAt ? new Date(updatedAt) : new Date(),
    );
  }

  static fromObject(object: { [key: string]: any }): RoleEntity {
    const { id, name, description, createdAt, updatedAt } = object;

    return RoleEntity.create({ id, name, description, createdAt, updatedAt });
  }
}
