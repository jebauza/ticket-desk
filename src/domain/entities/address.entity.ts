export interface AddressCreateProps {
  // Opcional a nivel de tipo porque representa tanto el shape crudo que
  // llega del DTO/HTTP (el cliente puede omitirlo en una address nueva)
  // como el shape ya normalizado que recibe la entidad (donde ya no debería
  // faltar). El contrato real lo impone el `throw` de abajo, igual que con
  // cualquier otro campo required de las demás entidades del proyecto.
  id?: string;
  label: string;
  street: string;
  city: string;
  country: string;
}

// Value object de composición: no tiene existencia propia fuera de un User
// — nace, se edita y muere junto con él (ver migración `addresses`,
// ON DELETE CASCADE). Sin datasource/repository propios: lo persiste
// UserDatasource/UserRepository dentro de la misma transacción que User
// (ver PostgresDatabase.transaction() en user.datasource.impl.ts).
export class AddressEntity {
  private constructor(
    public id: string,
    public label: string,
    public street: string,
    public city: string,
    public country: string,
  ) {}

  // El id SIEMPRE llega ya generado — igual que UserEntity/TicketEntity/
  // RoleEntity/PermissionEntity, la entidad nunca genera su propio id (eso
  // requeriría importar algo fuera del dominio, ej. crypto.randomUUID()).
  // Quien genera el id que falte es el service, vía el puerto IdManager ya
  // inyectado (ver UserService.createUser/updateUser, AuthService.register).
  static create(props: AddressCreateProps): AddressEntity {
    const { id, label, street, city, country } = props;

    if (!id) throw new Error('address id is required');
    if (!label || !label.trim()) throw new Error('address label is required');
    if (!street || !street.trim()) throw new Error('address street is required');
    if (!city || !city.trim()) throw new Error('address city is required');
    if (!country || !country.trim()) throw new Error('address country is required');

    return new AddressEntity(
      id,
      label.trim(),
      street.trim(),
      city.trim(),
      country.trim(),
    );
  }

  static fromObject(object: { [key: string]: any }): AddressEntity {
    const { id, label, street, city, country } = object;
    return AddressEntity.create({ id, label, street, city, country });
  }
}
