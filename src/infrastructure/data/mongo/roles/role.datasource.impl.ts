import { Collection } from 'mongodb';
import { RoleEntity } from '../../../../domain/entities/role.entity';
import { PermissionEntity } from '../../../../domain/entities/permission.entity';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { RoleDatasource } from '../../../../domain/datasources/role.datasource';
import { CustomError } from '../../../../domain/errors/custom.error';
import { MongoDatabase } from '../mongo.database';
import { RoleDocument, RoleMongoMapper } from './role.mapper';
import { PermissionDocument, PermissionMongoMapper } from '../permissions/permission.mapper';
import { UserDocument, UserMongoMapper } from '../users/user.mapper';

const DUPLICATE_KEY = 11000;

export class RoleDatasourceImpl extends RoleDatasource {
  private get collection(): Collection<RoleDocument> {
    return MongoDatabase.instance.db.collection<RoleDocument>('roles');
  }

  private get permissionsCollection(): Collection<PermissionDocument> {
    return MongoDatabase.instance.db.collection<PermissionDocument>('permissions');
  }

  private get usersCollection(): Collection<UserDocument> {
    return MongoDatabase.instance.db.collection<UserDocument>('users');
  }

  async findOne(id: string): Promise<RoleEntity | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? RoleMongoMapper.fromDocument(doc) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const doc = await this.collection.findOne({ name });
    return doc ? RoleMongoMapper.fromDocument(doc) : null;
  }

  async getAll(): Promise<RoleEntity[]> {
    const docs = await this.collection.find().sort({ name: 1 }).toArray();
    return docs.map(RoleMongoMapper.fromDocument);
  }

  async create(role: RoleEntity): Promise<RoleEntity> {
    const doc: RoleDocument = {
      _id: role.id,
      name: role.name,
      description: role.description,
      permissionIds: [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };

    try {
      await this.collection.insertOne(doc);
      return RoleMongoMapper.fromDocument(doc);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async update(id: string, data: RoleEntity): Promise<RoleEntity | null> {
    try {
      const doc = await this.collection.findOneAndUpdate(
        { _id: id },
        { $set: { name: data.name, description: data.description, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
      return doc ? RoleMongoMapper.fromDocument(doc) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async getPermissions(roleId: string): Promise<PermissionEntity[]> {
    const role = await this.collection.findOne({ _id: roleId });
    if (!role || role.permissionIds.length === 0) return [];

    const docs = await this.permissionsCollection
      .find({ _id: { $in: role.permissionIds } })
      .toArray();

    return docs.map(PermissionMongoMapper.fromDocument);
  }

  async setPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.collection.updateOne({ _id: roleId }, { $set: { permissionIds } });
  }

  async getUsers(roleId: string): Promise<UserEntity[]> {
    const docs = await this.usersCollection.find({ roleIds: roleId }).toArray();
    return docs.map(UserMongoMapper.fromDocument);
  }

  private translateError(error: unknown): Error {
    if (error && typeof error === 'object' && (error as { code?: number }).code === DUPLICATE_KEY) {
      return CustomError.conflict('Role name is already in use');
    }

    return error as Error;
  }
}
