import { baseEntitySchema, PublicUUID } from '@/common/base';
import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type Realm = {
  name: string;
  dbName: string;
  isActive: boolean;
  publicUUID: PublicUUID;
};

export const realmSchema = new mongoose.Schema<Realm>({
  name: { type: String, required: true },
  dbName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  publicUUID: {
    type: String,
    unique: true,
    default: () => uuidv4(),
  },
});
realmSchema.add(baseEntitySchema);

export type RealmSchema = typeof realmSchema;
export type RealmEntity = HydratedDocument<InferSchemaType<RealmSchema>>;

export type RealmCreate = Omit<
  InferSchemaType<typeof realmSchema>,
  'isActive' | 'publicUUID'
>;
