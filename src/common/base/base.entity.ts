import { InferSchemaType, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const baseEntityIDSchema = new Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
});

export const baseEntitySchema = new Schema({});
baseEntitySchema.add(baseEntityIDSchema);

// baseEntitySchema.pre('save', async function () {
//   if (!this.metadata) {
//     this.metadata = { createdAt: new Date(), updatedAt: new Date() };
//   }
//   this.metadata.updatedAt = new Date();
// });

// baseEntitySchema.pre(['updateOne', 'findOneAndUpdate'], updatedAtMiddleware);

export type BaseEntityID = InferSchemaType<typeof baseEntityIDSchema>;

export type BaseEntity = InferSchemaType<typeof baseEntitySchema> &
  BaseEntityID;
