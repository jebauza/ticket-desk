export class TicketEntity {
  constructor(
    public id: string,
    public number: number,
    public createAt: Date,
    public handleAtDesk: string | null,
    public handleAt: Date | null,
    public done: boolean,
  ) {}

  public get isPending(): boolean {
    return this.handleAtDesk === null;
  }

  static fromObject(object: { [key: string]: any }): TicketEntity {
    const { id, number, createAt, handleAtDesk, handleAt, done } = object;
    if (id === undefined) throw new Error('id is required');
    if (number === undefined) throw new Error('number is required');

    const parsedCreateAt = createAt ? new Date(createAt) : new Date();
    const parsedHandleAt = handleAt ? new Date(handleAt) : null;

    return new TicketEntity(
      id,
      number,
      parsedCreateAt,
      handleAtDesk ?? null,
      parsedHandleAt,
      !!done,
    );
  }
}
