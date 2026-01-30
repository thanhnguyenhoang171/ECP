import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  // imports: [MongooseModule.forFeature()]
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
