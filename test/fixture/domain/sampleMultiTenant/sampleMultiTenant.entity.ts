import { baseEntitySchema } from '@/common/base';
import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';

export type SampleMultiTenant = {
  name: string;
  email: string;
  isActive: boolean;
};

export const sampleMultiTenantSchema = new mongoose.Schema<SampleMultiTenant>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
});
sampleMultiTenantSchema.add(baseEntitySchema);

export type SampleMultiTenantSchema = typeof sampleMultiTenantSchema;
export type SampleMultiTenantEntity = HydratedDocument<
  InferSchemaType<typeof sampleMultiTenantSchema>
>;

export type SampleMultiTenantCreate = Omit<
  InferSchemaType<typeof sampleMultiTenantSchema>,
  'isActive'
>;
