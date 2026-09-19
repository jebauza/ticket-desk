import { Collection } from 'mongodb';
import { PermissionEntity } from '../../../../domain/entities/permission.entity';
import { RoleEntity } from '../../../../domain/entities/role.entity';
import { PermissionDatasource } from '../../../../domain/datasources/permission.datasource';
import { CustomError } from '../../../../domain/errors/custom.error';
import { MongoDatabase } from '../mongo.database';
import { PermissionDocument, PermissionMongoMapper } from './permission.mapper';
import { RoleDocument, RoleMongoMapper } from '../roles/role.mapper';

const DUPLICATE_KEY = 11000;

export class PermissionDatasourceImpl extends PermissionDatasource {
  private get collection(): Collection<PermissionDocument> {
    return MongoDatabase.instance.db.collection<PermissionDocument>('permissions');
  }

  private get rolesCollection(): Collection<RoleDocument> {
    return MongoDatabase.instance.db.collection<RoleDocument>('roles');
  }

  async findOne(id: string): Promise<PermissionEntity | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? PermissionMongoMapper.fromDocument(doc) : null;
  }

  async findByName(name: string): Promise<PermissionEntity | null> {
    const doc = await this.collection.findOne({ name });
    return doc ? PermissionMongoMapper.fromDocument(doc) : null;
  }

  async getAll(): Promise<PermissionEntity[]> {
    const docs = await this.collection.find().sort({ name: 1 }).toArray();
    return docs.map(PermissionMongoMapper.fromDocument);
  }

  async create(permission: PermissionEntity): Promise<PermissionEntity> {
    const doc: PermissionDocument = {
      _id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
    };

    try {
      await this.collection.insertOne(doc);
      return PermissionMongoMapper.fromDocument(doc);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async update(id: string, description: string | null): Promise<PermissionEntity | null> {
    const doc = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: { description } },
      { returnDocument: 'after' },
    );
    return doc ? PermissionMongoMapper.fromDocument(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async getRoles(permissionId: string): Promise<RoleEntity[]> {
    const docs = await this.rolesCollection.find({ permissionIds: permissionId }).toArray();
    return docs.map(RoleMongoMapper.fromDocument);
  }

  private translateError(error: unknown): Error {
    if (error && typeof error === 'object' && (error as { code?: number }).code === DUPLICATE_KEY) {
      return CustomError.conflict('Permission name is already in use');
    }

    return error as Error;
  }
}
