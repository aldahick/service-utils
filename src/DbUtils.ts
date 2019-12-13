import * as typegoose from "@typegoose/typegoose";
import * as mongoose from "mongoose";

export class DbUtils {
  static async connect(url: string, options?: mongoose.ConnectionOptions): Promise<mongoose.Connection> {
    return (await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options
    })).connection;
  }

  static collection<Model>(model: Model, name: string): PropertyDecorator {
    return (target, key) => {
      Reflect.defineMetadata("collection", { name, model }, target, key);
      (target as any)[key] = true;
    };
  }

  static async initCollections(modelsClass: any, connection: mongoose.Connection) {
    typegoose.setGlobalOptions({
      globalOptions: {
        useNewEnum: true
      }
    });
    for (const key in modelsClass) {
      if (!Reflect.hasMetadata("collection", modelsClass, key)) { continue; }
      const metadata = Reflect.getMetadata("collection", modelsClass, key);
      modelsClass[key] = typegoose.getModelForClass(metadata.model, {
        existingConnection: connection,
        schemaOptions: { collection: metadata.name }
      });
    }
  }
}
