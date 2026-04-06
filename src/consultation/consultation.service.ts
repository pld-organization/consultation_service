 import { Injectable } from '@nestjs/common';
 import { InjectModel } from '@nestjs/mongoose';
 import { Model } from 'mongoose';
 import { FileDocument } from './consultation.schema';
 
 @Injectable()
 export class FilesService {
   constructor(
     @InjectModel(FileDocument.name) private fileModel: Model<FileDocument>,
   ) {}
 
   async uploadFile(file: Express.Multer.File, comment: string , patientId: string): Promise<FileDocument> {
     const newFile = new this.fileModel({
       patientId,
       comment,
       filename: file.originalname,
       contentType: file.mimetype,
       data: file.buffer,
     });
     return newFile.save();
   }
 
   async getFile(patientId: string): Promise<FileDocument> {
     return this.fileModel.findById(patientId).exec();
   }

   async 
 }