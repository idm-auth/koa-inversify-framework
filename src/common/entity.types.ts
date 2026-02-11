import type {
  ApplyBasicCreateCasting,
  DeepPartial,
  HydratedDocument,
  InferSchemaType,
  Require_id,
  Schema,
} from 'mongoose';

export type CreateData<TSchema extends Schema> = Omit<
  ApplyBasicCreateCasting<Require_id<InferSchemaType<TSchema>>>,
  '_id'
> &
  Partial<
    Pick<ApplyBasicCreateCasting<Require_id<InferSchemaType<TSchema>>>, '_id'>
  >;

// Used only in repository layer to cast CreateData to mongoose's expected type
export type CreateInput<TSchema extends Schema> = DeepPartial<
  ApplyBasicCreateCasting<Require_id<InferSchemaType<TSchema>>>
>;

export type Entity<TSchema extends Schema> = HydratedDocument<
  InferSchemaType<TSchema>
>;
