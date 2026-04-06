// module
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './consultation.controller';
import { FilesService } from './consultation.service';
import { FileDocument, FileSchema } from './consultation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileDocument.name, schema: FileSchema }]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class ConsultationModule {}
