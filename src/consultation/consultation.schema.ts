// schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class FileDocument extends Document {
  @Prop({ required: true })
  patientId: string;
  
  @Prop({ required: true })
  comment: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  data: Buffer;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(FileDocument);
