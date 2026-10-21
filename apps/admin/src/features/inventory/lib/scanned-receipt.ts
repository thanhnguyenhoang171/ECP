import type { GoodsReceiptFormValues } from '../schemas/goods-receipt.schema';
import type { BarcodeLookup } from '../types/barcode';
import type { ClientPurchaseOrder } from '../types/inventory.types';

type ReceiptItems = GoodsReceiptFormValues['items'];

export const addScannedReceiptItem = (items: ReceiptItems, found: BarcodeLookup, purchaseOrder?: ClientPurchaseOrder): ReceiptItems => {
  if (!found.sku.active) { throw new Error('SKU đã ngừng hoạt động, không thể thêm vào phiếu nhập.'); }
  const matching = items.map((item, index) => ({ item, index })).filter(row => row.item.skuId === found.sku.id);
  if (matching.length > 1) { throw new Error('Mặt hàng đang có nhiều dòng/lô. Hãy tăng số lượng tại đúng dòng cần nhập.'); }
  if (matching.some(row => !Number.isInteger(row.item.quantity) || row.item.quantity < 0 || row.item.quantity >= 2147483647)) {
    throw new Error('Số lượng hiện tại không hợp lệ hoặc vượt giới hạn cho phép.');
  }
  const poItem = purchaseOrder?.items.find(item => item.skuId === found.sku.id);
  if (purchaseOrder && !poItem) { throw new Error('Mặt hàng không thuộc đơn mua hàng đang liên kết.'); }
  if (poItem && matching.reduce((sum, row) => sum + row.item.quantity, 0) + 1 > poItem.orderedQuantity - poItem.receivedQuantity) {
    throw new Error('Đã đạt số lượng còn được nhận của đơn mua hàng. Giảm số lượng trên phiếu hoặc chọn đếm lại PO bằng quét mã.');
  }
  if (matching.length === 1) {
    return items.map((item, index) => index === matching[0].index ? { ...item, quantity: item.quantity + 1 } : item);
  }
  const row = { skuId: found.sku.id, quantity: 1, unitCost: poItem?.unitPrice ?? found.costPrice, batchCode: '', manufactureDate: '', expiryDate: '' };
  const empty = items.findIndex(item => !item.skuId);
  return empty >= 0 ? items.map((item, index) => index === empty ? { ...item, skuId: row.skuId, quantity: 1, unitCost: row.unitCost } : item) : [...items, row];
};
