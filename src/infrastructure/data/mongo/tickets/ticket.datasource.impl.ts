import { Collection, Filter } from 'mongodb';
import { TicketEntity, TicketStatus } from '../../../../domain/entities/ticket.entity';
import { PaginationDto } from '../../../../domain/dtos/shared/pagination.dto';
import { PaginatedResult } from '../../../../domain/dtos/shared/paginated-result.dto';
import { TicketFiltersDto } from '../../../../domain/dtos/tickets/request/ticket-filters.dto';
import { TicketDatasource } from '../../../../domain/datasources/ticket.datasource';
import { MongoDatabase } from '../mongo.database';
import { TicketDocument, TicketMongoMapper } from './ticket.mapper';

interface CounterDocument {
  _id: string;
  seq: number;
}

const STATUS_FILTERS: Record<TicketStatus, Filter<TicketDocument>> = {
  pending: { handleAtDesk: null },
  'in-progress': { handleAtDesk: { $ne: null }, done: false },
  done: { done: true },
};

export class TicketDatasourceImpl extends TicketDatasource {
  private get collection(): Collection<TicketDocument> {
    return MongoDatabase.instance.db.collection<TicketDocument>('tickets');
  }

  private get counters(): Collection<CounterDocument> {
    return MongoDatabase.instance.db.collection<CounterDocument>('counters');
  }

  async getAll(): Promise<TicketEntity[]> {
    const docs = await this.collection.find().sort({ number: 1 }).toArray();
    return docs.map(TicketMongoMapper.fromDocument);
  }

  async findPaginated(
    filters: TicketFiltersDto,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<TicketEntity>> {
    const filter = filters.status ? STATUS_FILTERS[filters.status] : {};

    const [docs, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort({ number: 1 })
        .skip(pagination.offset)
        .limit(pagination.limit)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);

    return PaginatedResult.create(docs.map(TicketMongoMapper.fromDocument), total, pagination);
  }

  async getPending(): Promise<TicketEntity[]> {
    const docs = await this.collection
      .find({ handleAtDesk: null })
      .sort({ number: 1 })
      .toArray();

    return docs.map(TicketMongoMapper.fromDocument);
  }

  async getLast(): Promise<TicketEntity | null> {
    const [last] = await this.collection
      .find()
      .sort({ number: -1 })
      .limit(1)
      .toArray();

    return last ? TicketMongoMapper.fromDocument(last) : null;
  }

  async getWorkingOn(limit: number): Promise<TicketEntity[]> {
    const docs = await this.collection
      .find({ handleAtDesk: { $ne: null } })
      .sort({ handleAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map(TicketMongoMapper.fromDocument);
  }

  async create(id: string): Promise<TicketEntity> {
    // Mongo no tiene un equivalente directo a "INSERT ... SELECT MAX()+1" en una
    // sola sentencia; el patrón idiomático es un contador con $inc atómico.
    const counter = await this.counters.findOneAndUpdate(
      { _id: 'ticket_number' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );

    if (!counter) throw new Error('Failed to increment ticket counter');

    const doc: TicketDocument = {
      _id: id,
      number: counter.seq,
      createAt: new Date(),
      handleAtDesk: null,
      handleAt: null,
      done: false,
    };

    await this.collection.insertOne(doc);

    return TicketMongoMapper.fromDocument(doc);
  }

  async nextPending(desk: string): Promise<TicketEntity | null> {
    const doc = await this.collection.findOneAndUpdate(
      { handleAtDesk: null },
      { $set: { handleAtDesk: desk, handleAt: new Date() } },
      { sort: { number: 1 }, returnDocument: 'after' },
    );

    return doc ? TicketMongoMapper.fromDocument(doc) : null;
  }

  async getCurrentByDesk(desk: string): Promise<TicketEntity | null> {
    const doc = await this.collection.findOne(
      { handleAtDesk: desk, done: false },
      { sort: { handleAt: -1 } },
    );

    return doc ? TicketMongoMapper.fromDocument(doc) : null;
  }

  async update(id: string, data: TicketEntity): Promise<TicketEntity | null> {
    const doc = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: TicketMongoMapper.toUpdateDocument(data) },
      { returnDocument: 'after' },
    );

    return doc ? TicketMongoMapper.fromDocument(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async findOne(id: string): Promise<TicketEntity | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? TicketMongoMapper.fromDocument(doc) : null;
  }

  async markAsDone(id: string): Promise<TicketEntity | null> {
    const doc = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: { done: true } },
      { returnDocument: 'after' },
    );

    return doc ? TicketMongoMapper.fromDocument(doc) : null;
  }

  async countAll(): Promise<number> {
    return this.collection.countDocuments();
  }

  async seed(tickets: TicketEntity[]): Promise<void> {
    if (tickets.length === 0) return;

    await this.collection.bulkWrite(
      tickets.map((ticket) => ({
        updateOne: {
          filter: { _id: ticket.id },
          update: {
            $setOnInsert: {
              _id: ticket.id,
              number: ticket.number,
              createAt: ticket.createAt,
              handleAtDesk: ticket.handleAtDesk,
              handleAt: ticket.handleAt,
              done: ticket.done,
            },
          },
          upsert: true,
        },
      })),
    );
  }
}
