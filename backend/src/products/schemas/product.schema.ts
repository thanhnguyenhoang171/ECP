import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface ProductImage {
  public_id: string;
  url: string;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  sku: string;

  @Prop({ index: true })
  slug: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ index: true })
  category_id: string;

  @Prop({
    type: [{ key: String, value: String }],
    default: [],
  })
  attributes: ProductAttribute[];

  @Prop({
    type: [{ public_id: String, url: String }],
    default: [],
  })
  images: ProductImage[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = HydratedDocument<Product>;
