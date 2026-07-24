'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight, 
  Plus, 
  Minus, 
  Share2, 
  Check, 
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';

// Mock DB sản phẩm Thái Lan
const productsData: Record<string, Product & {
  flavors: string[];
  descriptionFull: string;
  ingredients: string;
  origin: string;
  expiry: string;
}> = {
  'snack-muc-bento-thai-lan': {
    id: 'p1',
    name: 'Snack Mực Bento Thái Lan Cay Giòn Đậm Đà 20g',
    slug: 'snack-muc-bento-thai-lan',
    description: 'Vị mực nướng giòn rụm tẩm vị cay nồng chuẩn Thái, kích thích vị giác cực đỉnh.',
    descriptionFull: 'Snack Mực Bento Thái Lan là món ăn vặt quốc dân vô cùng nổi tiếng đến từ Xứ sở Chùa Vàng. Với nguyên liệu mực tươi ngon chọn lọc kết hợp công nghệ sấy nướng độc quyền và gia vị tẩm ướp cay nồng đặc trưng, từng miếng mực Bento giòn rụm sẽ mang đến trải nghiệm vị giác vô cùng bùng nổ.',
    price: 25000,
    originalPrice: 35000,
    discountPercent: 28,
    rating: 4.9,
    reviewCount: 342,
    images: ['/tmp/bento.webp', '/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    isNew: true,
    isFeatured: true,
    inStock: true,
    flavors: ['Vị Cay Ngọt (Đỏ)', 'Vị Siêu Cay (Cam)', 'Vị Mực Nướng (Xanh)'],
    ingredients: 'Thịt mực tươi (70%), bột mì, đường, muối, ớt Thái, gia vị Tom Yum thiên nhiên.',
    origin: 'Thái Lan (Imported)',
    expiry: '12 tháng kể từ ngày sản xuất',
  },
  'tra-sua-thai-do-chatramue': {
    id: 'p2',
    name: 'Trà Sữa Thái Đỏ ChaTraMue Nguyên Chất Lon 330ml',
    slug: 'tra-sua-thai-do-chatramue',
    description: 'Hương vị trà thơm lừng kết hợp sữa béo ngậy chuẩn gốc Băng Cốc.',
    descriptionFull: 'Trà Sữa Thái Đỏ thương hiệu ChaTraMue danh tiếng từ năm 1945. Được pha chế theo công thức truyền thống đậm đà, giữ trọn vị chát nhẹ của lá trà Assam Thái Lan hòa quyện cùng vị béo thơm của sữa đặc cao cấp.',
    price: 45000,
    originalPrice: 55000,
    discountPercent: 18,
    rating: 4.8,
    reviewCount: 215,
    images: ['/tmp/bento.webp'],
    category: 'Nước giải khát',
    isFeatured: true,
    inStock: true,
    flavors: ['Trà Sữa Thái Đỏ', 'Trà Sữa Thái Xanh'],
    ingredients: 'Lá trà Thái đỏ ChaTraMue, sữa nguyên kem, đường mía, nước tinh khiết.',
    origin: 'Thái Lan (Imported)',
    expiry: '9 tháng kể từ ngày sản xuất',
  },
};

// Sản phẩm mặc định nếu slug không khớp
const defaultProduct = productsData['snack-muc-bento-thai-lan'];

// Sản phẩm tương tự đề xuất
const relatedProducts: Product[] = [
  {
    id: 'p3',
    name: 'Bánh Pocky Chuối Thái Lan Hộp 25g',
    slug: 'banh-pocky-chuoi-thai-lan',
    description: 'Que bánh nướng giòn thơm lừng phủ lớp kem chuối ngọt dịu.',
    price: 18000,
    originalPrice: 25000,
    discountPercent: 28,
    rating: 4.7,
    reviewCount: 180,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    isNew: true,
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Mì Tôm Chua Cay Tom Yum Goong Mama Thái Lan Gói 90g',
    slug: 'mi-tom-chua-cay-tom-yum-mama',
    description: 'Nước dùng chua cay sảng khoái kết hợp sợi mì dai ngon.',
    price: 12000,
    originalPrice: 15000,
    discountPercent: 20,
    rating: 5.0,
    reviewCount: 520,
    images: ['/tmp/bento.webp'],
    category: 'Đồ ăn vặt',
    isFeatured: true,
    inStock: true,
  },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const product = productsData[slug] || {
    ...defaultProduct,
    slug,
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors?.[0] || 'Vị Cay Ngọt (Đỏ)');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAddToCart = () => {
    toast.success(`Đã thêm ${quantity}x ${product.name} (${selectedFlavor}) vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    toast.success('Đang chuyển hướng tới trang thanh toán...');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link href="/products" className="hover:text-zinc-900 transition-colors">Sản phẩm</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-400 truncate max-w-[200px]">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 font-semibold truncate max-w-[250px]">{product.name}</span>
      </nav>

      {/* Main Product Layout (2 Grid Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Product Images Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 shadow-xs group">
            <Image
              src={product.images[selectedImage] || '/tmp/bento.webp'}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Discount Badge */}
            {product.discountPercent && (
              <div className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-[#F5C542] text-[#1E1B18] text-xs font-extrabold rounded-lg shadow-sm">
                -{product.discountPercent}% OFF
              </div>
            )}

            {/* Wishlist Floating Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                setIsWishlisted(!isWishlisted);
                toast(isWishlisted ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');
              }}
              className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-zinc-600 hover:text-red-500 shadow-sm border border-zinc-200/80 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </motion.button>
          </div>

          {/* Thumbnails list */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? 'border-[#F5C542] ring-2 ring-[#F5C542]/30' : 'border-zinc-200 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img} alt="Thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase rounded-md tracking-wider">
                {product.origin}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-md flex items-center gap-1">
                <Check className="w-3 h-3" /> Còn hàng
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex items-center text-[#F5C542]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-[#F5C542] text-[#F5C542]' : 'text-zinc-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-900">{product.rating}</span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs text-zinc-500 font-medium">{product.reviewCount} đánh giá từ người dùng</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-zinc-100/80 border border-zinc-200/80 flex items-baseline gap-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {formatVND(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-zinc-400 line-through font-medium">
                {formatVND(product.originalPrice)}
              </span>
            )}
            {product.discountPercent && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                Tiết kiệm {formatVND(product.originalPrice! - product.price)}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {product.description}
          </p>

          {/* Flavor Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Chọn hương vị / khẩu vị: <span className="text-[#1E1B18] font-bold">{selectedFlavor}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {product.flavors.map((flavor, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFlavor(flavor)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedFlavor === flavor
                      ? 'bg-[#1E1B18] text-[#F5C542] border-[#1E1B18] shadow-sm'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Số lượng:</span>
              <div className="flex items-center border border-zinc-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-zinc-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="py-3 px-6 bg-[#F5C542] hover:bg-[#E5B32E] text-[#1E1B18] font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ hàng
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBuyNow}
                className="py-3 px-6 bg-[#1E1B18] hover:bg-[#2d2925] text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-[#F5C542]" /> Mua ngay
              </motion.button>
            </div>
          </div>

          {/* Guarantees Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-200 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Miễn phí giao hàng từ 500k</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>100% Nhập khẩu Thái Lan</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Đổi trả nếu cận date</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="pt-8 border-t border-zinc-200">
        <div className="flex border-b border-zinc-200 gap-6">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'desc' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Mô tả sản phẩm
            {activeTab === 'desc' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5C542]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'specs' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Thành phần & Xuất xứ
            {activeTab === 'specs' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5C542]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'reviews' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Đánh giá ({product.reviewCount})
            {activeTab === 'reviews' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5C542]" />
            )}
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'desc' && (
            <div className="prose max-w-none text-xs sm:text-sm text-zinc-700 space-y-4 leading-relaxed">
              <p>{product.descriptionFull}</p>
              <p>Trải nghiệm hương vị snack Thái lan chuẩn vị ngay tại nhà cùng Cacao Thai Snack Shop.</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3 text-xs sm:text-sm text-zinc-700 max-w-xl">
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="font-semibold text-zinc-900">Xuất xứ:</span>
                <span>{product.origin}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="font-semibold text-zinc-900">Thành phần:</span>
                <span>{product.ingredients}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="font-semibold text-zinc-900">Hạn sử dụng:</span>
                <span>{product.expiry}</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-900">Minh Tuấn (Hà Nội)</span>
                  <div className="flex text-[#F5C542]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#F5C542]" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-600">
                  Snack Bento cực kỳ giòn và cay đúng vị Thái. Đóng gói cẩn thận, giao hàng rất nhanh!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      <section className="pt-8 border-t border-zinc-200">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 mb-6">
          Sản phẩm liên quan nổi bật
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

    </div>
  );
}
