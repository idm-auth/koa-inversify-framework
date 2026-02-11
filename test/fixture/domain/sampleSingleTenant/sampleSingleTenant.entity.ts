import { baseEntitySchema } from '@/common/base';
import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';

export type SampleSingleTenant = {
  name: string;
  email: string;
  isActive: boolean;
};

export const sampleSingleTenantSchema = new mongoose.Schema<SampleSingleTenant>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true, required: true },
  }
);
sampleSingleTenantSchema.add(baseEntitySchema);

export type SampleSingleTenantSchema = typeof sampleSingleTenantSchema;
export type SampleSingleTenantEntity = HydratedDocument<
  InferSchemaType<typeof sampleSingleTenantSchema>
>;

export type SampleSingleTenantCreate = Omit<
  InferSchemaType<typeof sampleSingleTenantSchema>,
  'isActive'
> & {
  isActive?: boolean;
};
