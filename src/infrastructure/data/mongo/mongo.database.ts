import { Db, MongoClient } from 'mongodb';

interface Options {
  url: string;
  database: string;
}

export class MongoDatabase {
  private static _instance: MongoDatabase;
  public readonly client: MongoClient;
  public readonly db: Db;

  private constructor(client: MongoClient, database: string) {
    this.client = client;
    this.db = client.db(database);
  }

  static get instance(): MongoDatabase {
    if (!MongoDatabase._instance) {
      throw 'MongoDatabase not initialized';
    }
    return MongoDatabase._instance;
  }

  static async connect(options: Options): Promise<MongoDatabase> {
    const { url, database } = options;

    const client = new MongoClient(url);
    await client.connect();

    const instance = new MongoDatabase(client, database);
    MongoDatabase._instance = instance;

    return instance;
  }

  static async disconnect(): Promise<void> {
    await MongoDatabase.instance.client.close();
  }
}
