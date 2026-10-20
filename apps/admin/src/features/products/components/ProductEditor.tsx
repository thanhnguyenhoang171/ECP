'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';

import { Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useProductCompositeDetail } from '../hooks/use-products';
import ProductForm from './ProductForm';
import { ProductEditorLoading } from './ProductEditorLoading';

interface ProductEditorProps {
  readonly productId?: string;
}

export const ProductEditor = ({ productId }: ProductEditorProps): React.JSX.Element => {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useProductCompositeDetail(productId);
  const product = data?.product;

  if (productId && isPending) {
    return <ProductEditorLoading />;
  }

  if (productId && (isError || !product)) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center gap-4'>
        <Package className='h-16 w-16 text-slate-300' />
        <h1 className='text-lg font-bold text-slate-800'>Không thể tải sản phẩm</h1>
        <p className='text-sm text-slate-500'>Vui lòng thử lại hoặc quay về danh sách sản phẩm.</p>
        <div className='flex gap-2'>
          <Button type='button' variant='outline' onClick={() => router.push('/products')}>
            <ArrowLeft className='mr-2 h-4 w-4' /> Danh sách sản phẩm
          </Button>
          <Button type='button' onClick={() => { void refetch(); }}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Breadcrumbs items={[
        { label: 'Sản phẩm', href: '/products', icon: Package },
        { label: product ? product.name : 'Thêm sản phẩm mới' },
      ]} />
      <ProductForm
        key={productId || 'create'}
        initialData={product}
        inventory={data?.skus}
        onCancel={() => router.push('/products')}
        onSuccess={() => {
          if (!productId) {
            router.push('/products');
          }
        }}
      />
    </div>
  );
};

export const ProductUpdateView = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  return <ProductEditor key={id} productId={id} />;
};
