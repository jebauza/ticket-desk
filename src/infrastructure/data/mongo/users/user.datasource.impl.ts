import { Collection } from 'mongodb';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { RoleEntity } from '../../../../domain/entities/role.entity';
import { UserDatasource } from '../../../../domain/datasources/user.datasource';
import { PaginationDto } from '../../../../domain/dtos/shared/pagination.dto';
import { CustomError } from '../../../../domain/errors/custom.error';
import { MongoDatabase } from '../mongo.database';
import { UserDocument, UserMongoMapper } from './user.mapper';
import { RoleDocument, RoleMongoMapper } from '../roles/role.mapper';

// Código de error de MongoDB para "duplicate key" (índice único de email).
const DUPLICATE_KEY = 11000;

export class UserDatasourceImpl extends UserDatasource {
  private get collection(): Collection<UserDocument> {
    return MongoDatabase.instance.db.collection<UserDocument>('users');
  }

  private get rolesCollection(): Collection<RoleDocument> {
    return MongoDatabase.instance.db.collection<RoleDocument>('roles');
  }

  async findOne(id: string): Promise<UserEntity | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? UserMongoMapper.fromDocument(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.collection.findOne({
      email: email.toLowerCase(),
    });
    return doc ? UserMongoMapper.fromDocument(doc) : null;
  }

  async getAll(pagination: PaginationDto): Promise<UserEntity[]> {
    const docs = await this.collection
      .find()
      .sort({ createdAt: 1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .toArray();

    return docs.map(UserMongoMapper.fromDocument);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const doc: UserDocument = {
      _id: user.id,
      roleIds: [],
      ...UserMongoMapper.toUpdateDocument(user),
    };

    try {
      await this.collection.insertOne(doc);
      return UserMongoMapper.fromDocument(doc);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async update(id: string, data: UserEntity): Promise<UserEntity | null> {
    try {
      const doc = await this.collection.findOneAndUpdate(
        { _id: id },
        { $set: UserMongoMapper.toUpdateDocument(data) },
        { returnDocument: 'after' },
      );

      return doc ? UserMongoMapper.fromDocument(doc) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async countAll(): Promise<number> {
    return this.collection.countDocuments();
  }

  async getRoles(userId: string): Promise<RoleEntity[]> {
    const user = await this.collection.findOne({ _id: userId });
    if (!user || user.roleIds.length === 0) return [];

    const docs = await this.rolesCollection
      .find({ _id: { $in: user.roleIds } })
      .toArray();

    return docs.map(RoleMongoMapper.fromDocument);
  }

  async setRoles(userId: string, roleIds: string[]): Promise<void> {
    // Escritura atómica de un solo documento: no hace falta transacción,
    // a diferencia del DELETE+INSERT sobre user_roles en Postgres.
    await this.collection.updateOne({ _id: userId }, { $set: { roleIds } });
  }

  private translateError(error: unknown): Error {
    if (error && typeof error === 'object' && (error as { code?: number }).code === DUPLICATE_KEY) {
      return CustomError.conflict('Email is already in use');
    }

    return error as Error;
  }
}
