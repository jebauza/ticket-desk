export interface TicketCreateProps {
  id: string;
  number: number;
  createAt?: Date | string;
  handleAtDesk?: string | null;
  handleAt?: Date | string | null;
  done?: boolean;
}

export type TicketUpdateProps = Partial<Omit<TicketCreateProps, 'id'>>;

export const TICKET_STATUSES = ['pending', 'in-progress', 'done'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export class TicketEntity {
  private constructor(
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

  public get status(): TicketStatus {
    if (this.done) return 'done';
    return this.isPending ? 'pending' : 'in-progress';
  }

  static create(props: TicketCreateProps): TicketEntity {
    const { id, number, createAt, handleAtDesk, handleAt, done } = props;

    if (!id) throw new Error('id is required');
    if (number === undefined || number === null) {
      throw new Error('number is required');
    }
    if (number <= 0) throw new Error('number must be a positive integer');
    if (!handleAtDesk && handleAt) {
      throw new Error('a ticket without desk cannot have handleAt');
    }

    return new TicketEntity(
      id,
      number,
      createAt ? new Date(createAt) : new Date(),
      handleAtDesk ?? null,
      handleAt ? new Date(handleAt) : null,
      !!done,
    );
  }

  static fromObject(object: { [key: string]: any }): TicketEntity {
    const { id, number, createAt, handleAtDesk, handleAt, done } = object;

    return TicketEntity.create({
      id,
      number,
      createAt,
      handleAtDesk,
      handleAt,
      done,
    });
  }
}
