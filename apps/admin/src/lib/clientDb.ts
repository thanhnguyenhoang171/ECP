'use client';

// Types representing the database entities
export interface ClientWarehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  isActive: boolean;
}

export interface ClientSupplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  isActive: boolean;
}

export interface ClientStockItem {
  id: string;
  sku: string;
  barcode: string;
  productName: string;
  variantName: string;
  warehouseId: string;
  warehouseName: string;
  stock: number;
  lowStockThreshold: number;
  costPrice: number;
  price: number;
}

export interface ClientGoodsReceiptItem {
  skuId: string;
  skuName: string;
  skuCode: string;
  quantity: number;
  unitCost: number;
  batchCode?: string;
  manufactureDate?: string;
  expiryDate?: string;
}

export interface ClientGoodsReceipt {
  id: string;
  receiptCode: string;
  warehouseId: string;
  warehouseName: string;
  purchaseOrderId?: string | null;
  totalItems: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  createdBy: string;
  note?: string;
  items: ClientGoodsReceiptItem[];
}

export interface ClientLedgerEntry {
  id: string;
  skuName: string;
  warehouseName: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  quantityChange: number;
  balanceAfter: number;
  referenceCode: string;
  createdAt: string;
}

// Initial Mock Datasets
const INITIAL_WAREHOUSES: ClientWarehouse[] = [
  { id: 'wh-1', code: 'KHO-HCM-01', name: 'Kho Chính Quận 1', address: '123 Lê Lợi, Q.1, TP.HCM', isActive: true },
  { id: 'wh-2', code: 'KHO-HCM-02', name: 'Kho Phụ Quận 7', address: '456 Nguyễn Văn Linh, Q.7, TP.HCM', isActive: true },
  { id: 'wh-3', code: 'KHO-HN-01', name: 'Kho Miền Bắc', address: 'Số 10 Duy Tân, Cầu Giấy, Hà Nội', isActive: false },
];

const INITIAL_SUPPLIERS: ClientSupplier[] = [
  { 
    id: 'sup-1', 
    name: 'Công ty TNHH Apple Việt Nam', 
    contactName: 'Nguyễn Văn A', 
    phone: '0901234567', 
    email: 'contact@apple.vn',
    address: 'Q1, TP.HCM',
    taxCode: '0101234567',
    isActive: true 
  },
  { 
    id: 'sup-2', 
    name: 'Samsung Electronics HCMC', 
    contactName: 'Trần Thị B', 
    phone: '0907654321', 
    email: 'b.tran@samsung.com',
    address: 'Khu công nghệ cao, Q9, TP.HCM',
    taxCode: '0207654321',
    isActive: true 
  },
  { 
    id: 'sup-3', 
    name: 'Nhà phân phối Digiworld', 
    contactName: 'Lê Văn C', 
    phone: '02812345678', 
    email: 'info@digiworld.com.vn',
    address: 'Quận 3, TP.HCM',
    taxCode: '03012345678',
    isActive: false 
  },
];

const INITIAL_STOCKS: ClientStockItem[] = [
  {
    id: 'st-1',
    sku: 'IP15PM-TITAN-256',
    barcode: '893123456781',
    productName: 'iPhone 15 Pro Max',
    variantName: 'Titan tự nhiên / 256GB',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Chính Quận 1',
    stock: 25,
    lowStockThreshold: 5,
    costPrice: 26500000,
    price: 34990000,
  },
  {
    id: 'st-2',
    sku: 'IP15PM-TITAN-256-Q7',
    barcode: '893123456782',
    productName: 'iPhone 15 Pro Max',
    variantName: 'Titan tự nhiên / 256GB',
    warehouseId: 'wh-2',
    warehouseName: 'Kho Phụ Quận 7',
    stock: 3,
    lowStockThreshold: 5,
    costPrice: 26500000,
    price: 34990000,
  },
  {
    id: 'st-3',
    sku: 'MBP14-M3-SILVER',
    barcode: '893123456783',
    productName: 'MacBook Pro 14 M3',
    variantName: 'Silver / M3 / 16GB',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Chính Quận 1',
    stock: 8,
    lowStockThreshold: 3,
    costPrice: 38000000,
    price: 45990000,
  },
  {
    id: 'st-4',
    sku: 'S24-ULTRA-BLACK-512',
    barcode: '893123456784',
    productName: 'Samsung Galaxy S24 Ultra',
    variantName: 'Titanium Black / 512GB',
    warehouseId: 'wh-2',
    warehouseName: 'Kho Phụ Quận 7',
    stock: 0,
    lowStockThreshold: 4,
    costPrice: 22000000,
    price: 29990000,
  },
  {
    id: 'st-5',
    sku: 'S24-ULTRA-BLACK-512-Q1',
    barcode: '893123456785',
    productName: 'Samsung Galaxy S24 Ultra',
    variantName: 'Titanium Black / 512GB',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Chính Quận 1',
    stock: 12,
    lowStockThreshold: 4,
    costPrice: 22000000,
    price: 29990000,
  },
  {
    id: 'st-6',
    sku: 'AIRPODS-GEN2',
    barcode: '893123456786',
    productName: 'AirPods Pro Gen 2',
    variantName: 'White / Type-C',
    warehouseId: 'wh-2',
    warehouseName: 'Kho Phụ Quận 7',
    stock: 48,
    lowStockThreshold: 10,
    costPrice: 4200000,
    price: 5990000,
  }
];

const INITIAL_RECEIPTS: ClientGoodsReceipt[] = [
  {
    id: 'gr-1',
    receiptCode: 'GR-20260601-001',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Chính Quận 1',
    purchaseOrderId: 'PO-20260520-05',
    totalItems: 5,
    status: 'COMPLETED',
    createdAt: '2026-06-01T10:30:00Z',
    createdBy: 'Thanh Nguyen',
    note: 'Nhập hàng đợt đầu tháng 6',
    items: [
      {
        skuId: 'st-1',
        skuName: 'iPhone 15 Pro Max',
        skuCode: 'IP15PM-TITAN-256',
        quantity: 5,
        unitCost: 26500000,
        batchCode: 'B-0601',
      }
    ]
  },
  {
    id: 'gr-2',
    receiptCode: 'GR-20260528-003',
    warehouseId: 'wh-2',
    warehouseName: 'Kho Phụ Quận 7',
    purchaseOrderId: null,
    totalItems: 12,
    status: 'PENDING',
    createdAt: '2026-05-28T14:20:00Z',
    createdBy: 'Admin User',
    note: 'Kiểm tra tồn kho phụ',
    items: [
      {
        skuId: 'st-6',
        skuName: 'AirPods Pro Gen 2',
        skuCode: 'AIRPODS-GEN2',
        quantity: 12,
        unitCost: 4200000,
        batchCode: 'B-0528',
      }
    ]
  }
];

const INITIAL_LEDGER: ClientLedgerEntry[] = [
  {
    id: 'l-1',
    skuName: 'iPhone 15 Pro Max - Titan tự nhiên / 256GB',
    warehouseName: 'Kho Chính Quận 1',
    type: 'INBOUND',
    quantityChange: 50,
    balanceAfter: 150,
    referenceCode: 'GR-20260601-001',
    createdAt: '2026-06-01T10:30:00Z'
  },
  {
    id: 'l-2',
    skuName: 'Samsung Galaxy S24 Ultra - Titanium Black / 512GB',
    warehouseName: 'Kho Chính Quận 1',
    type: 'OUTBOUND',
    quantityChange: -10,
    balanceAfter: 90,
    referenceCode: 'ORD-20260531-12',
    createdAt: '2026-05-31T15:20:00Z'
  },
  {
    id: 'l-3',
    skuName: 'AirPods Pro Gen 2 - White / Type-C',
    warehouseName: 'Kho Phụ Quận 7',
    type: 'ADJUSTMENT',
    quantityChange: -2,
    balanceAfter: 48,
    referenceCode: 'ADJ-20260530-05',
    createdAt: '2026-05-30T09:00:00Z'
  }
];

// Helper to check if window is defined (browser environment)
const isBrowser = typeof window !== 'undefined';

// Generic localStorage persistence helpers
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const stored = localStorage.getItem(`ecp_admin_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error reading key ${key} from localStorage`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(`ecp_admin_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key ${key} to localStorage`, error);
  }
}

// Client Database Manager
export const clientDb = {
  // Warehouses
  getWarehouses(): ClientWarehouse[] {
    return loadFromStorage('warehouses', INITIAL_WAREHOUSES);
  },

  saveWarehouse(warehouse: Omit<ClientWarehouse, 'id'> & { id?: string }): ClientWarehouse {
    const warehouses = this.getWarehouses();
    let saved: ClientWarehouse;

    if (warehouse.id) {
      saved = {
        id: warehouse.id,
        code: warehouse.code || `KHO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        name: warehouse.name,
        address: warehouse.address || '',
        isActive: warehouse.isActive
      };
      const index = warehouses.findIndex(w => w.id === warehouse.id);
      if (index !== -1) {
        warehouses[index] = saved;
      }
    } else {
      saved = {
        id: `wh-${Math.random().toString(36).substring(2, 9)}`,
        code: warehouse.code || `KHO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        name: warehouse.name,
        address: warehouse.address || '',
        isActive: warehouse.isActive
      };
      warehouses.unshift(saved);
    }

    saveToStorage('warehouses', warehouses);
    return saved;
  },

  deleteWarehouse(id: string): boolean {
    const warehouses = this.getWarehouses();
    const filtered = warehouses.filter(w => w.id !== id);
    if (filtered.length !== warehouses.length) {
      saveToStorage('warehouses', filtered);
      return true;
    }
    return false;
  },

  // Suppliers
  getSuppliers(): ClientSupplier[] {
    return loadFromStorage('suppliers', INITIAL_SUPPLIERS);
  },

  saveSupplier(supplier: Omit<ClientSupplier, 'id'> & { id?: string }): ClientSupplier {
    const suppliers = this.getSuppliers();
    let saved: ClientSupplier;

    if (supplier.id) {
      saved = {
        id: supplier.id,
        name: supplier.name,
        contactName: supplier.contactName || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        taxCode: supplier.taxCode || '',
        isActive: supplier.isActive
      };
      const index = suppliers.findIndex(s => s.id === supplier.id);
      if (index !== -1) {
        suppliers[index] = saved;
      }
    } else {
      saved = {
        id: `sup-${Math.random().toString(36).substring(2, 9)}`,
        name: supplier.name,
        contactName: supplier.contactName || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        taxCode: supplier.taxCode || '',
        isActive: supplier.isActive
      };
      suppliers.unshift(saved);
    }

    saveToStorage('suppliers', suppliers);
    return saved;
  },

  deleteSupplier(id: string): boolean {
    const suppliers = this.getSuppliers();
    const filtered = suppliers.filter(s => s.id !== id);
    if (filtered.length !== suppliers.length) {
      saveToStorage('suppliers', filtered);
      return true;
    }
    return false;
  },

  // Stock
  getStockItems(): ClientStockItem[] {
    return loadFromStorage('stocks', INITIAL_STOCKS);
  },

  adjustStock(
    stockItemId: string,
    type: 'add' | 'subtract' | 'set',
    quantity: number,
    _reason: string = 'check',
    referenceCode?: string
  ): ClientStockItem | null {
    const stocks = this.getStockItems();
    const itemIndex = stocks.findIndex(s => s.id === stockItemId);
    if (itemIndex === -1) return null;

    const item = stocks[itemIndex];
    const prevStock = item.stock;
    let newStock = prevStock;

    if (type === 'add') {
      newStock += quantity;
    } else if (type === 'subtract') {
      newStock = Math.max(0, prevStock - quantity);
    } else {
      newStock = quantity;
    }

    const updatedItem = { ...item, stock: newStock };
    stocks[itemIndex] = updatedItem;
    saveToStorage('stocks', stocks);

    // Write to Ledger
    const quantityChange = newStock - prevStock;
    if (quantityChange !== 0) {
      const ref = referenceCode || `ADJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      this.addLedgerEntry({
        skuName: `${item.productName} - ${item.variantName}`,
        warehouseName: item.warehouseName,
        type: 'ADJUSTMENT',
        quantityChange,
        balanceAfter: newStock,
        referenceCode: ref
      });
    }

    return updatedItem;
  },

  // Ledger
  getLedger(): ClientLedgerEntry[] {
    return loadFromStorage('ledger', INITIAL_LEDGER);
  },

  addLedgerEntry(entry: Omit<ClientLedgerEntry, 'id' | 'createdAt'>): ClientLedgerEntry {
    const ledger = this.getLedger();
    const newEntry: ClientLedgerEntry = {
      id: `l-${Math.random().toString(36).substring(2, 9)}`,
      skuName: entry.skuName,
      warehouseName: entry.warehouseName,
      type: entry.type,
      quantityChange: entry.quantityChange,
      balanceAfter: entry.balanceAfter,
      referenceCode: entry.referenceCode,
      createdAt: new Date().toISOString()
    };
    ledger.unshift(newEntry);
    saveToStorage('ledger', ledger);
    return newEntry;
  },

  // Goods Receipts
  getGoodsReceipts(): ClientGoodsReceipt[] {
    return loadFromStorage('receipts', INITIAL_RECEIPTS);
  },

  saveGoodsReceipt(
    receipt: Omit<ClientGoodsReceipt, 'id' | 'createdAt' | 'status' | 'totalItems' | 'warehouseName'> & {
      id?: string;
      warehouseName?: string;
    }
  ): ClientGoodsReceipt {
    const receipts = this.getGoodsReceipts();
    const warehouses = this.getWarehouses();
    const stocks = this.getStockItems();

    const wh = warehouses.find(w => w.id === receipt.warehouseId);
    const warehouseName = wh ? wh.name : (receipt.warehouseName || 'Kho hàng không rõ');

    const totalQty = receipt.items.reduce((acc, it) => acc + it.quantity, 0);

    const savedReceipt: ClientGoodsReceipt = {
      id: receipt.id || `gr-${Math.random().toString(36).substring(2, 9)}`,
      receiptCode: receipt.receiptCode || `GR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      warehouseId: receipt.warehouseId,
      warehouseName,
      purchaseOrderId: receipt.purchaseOrderId || null,
      totalItems: totalQty,
      status: 'COMPLETED', // default to completed on insert
      createdAt: new Date().toISOString(),
      createdBy: receipt.createdBy || 'Thanh Nguyen',
      note: receipt.note || '',
      items: receipt.items.map(item => {
        const matchingStock = stocks.find(s => s.id === item.skuId);
        return {
          skuId: item.skuId,
          skuName: matchingStock ? matchingStock.productName : item.skuName,
          skuCode: matchingStock ? matchingStock.sku : item.skuCode,
          quantity: item.quantity,
          unitCost: item.unitCost,
          batchCode: item.batchCode || '',
          manufactureDate: item.manufactureDate || '',
          expiryDate: item.expiryDate || '',
        };
      })
    };

    receipts.unshift(savedReceipt);
    saveToStorage('receipts', receipts);

    // UPDATE stocks and write to Ledger
    receipt.items.forEach(item => {
      const stockItem = stocks.find(s => s.id === item.skuId && s.warehouseId === receipt.warehouseId);
      if (stockItem) {
        const prevStock = stockItem.stock;
        stockItem.stock = prevStock + item.quantity;
        // Optionally update cost price if new batch cost is different
        if (item.unitCost > 0) {
          stockItem.costPrice = item.unitCost;
        }

        // Add ledger entry
        this.addLedgerEntry({
          skuName: `${stockItem.productName} - ${stockItem.variantName}`,
          warehouseName,
          type: 'INBOUND',
          quantityChange: item.quantity,
          balanceAfter: stockItem.stock,
          referenceCode: savedReceipt.receiptCode
        });
      }
    });

    saveToStorage('stocks', stocks);
    return savedReceipt;
  },

  cancelGoodsReceipt(id: string): boolean {
    const receipts = this.getGoodsReceipts();
    const receiptIndex = receipts.findIndex(r => r.id === id);
    if (receiptIndex === -1) return false;

    const receipt = receipts[receiptIndex];
    if (receipt.status === 'CANCELLED') return false;

    receipt.status = 'CANCELLED';
    receipts[receiptIndex] = receipt;
    saveToStorage('receipts', receipts);

    // REVERSE stocks and log OUTBOUND reversal in Ledger
    const stocks = this.getStockItems();
    receipt.items.forEach(item => {
      const stockItem = stocks.find(s => s.id === item.skuId && s.warehouseId === receipt.warehouseId);
      if (stockItem) {
        const prevStock = stockItem.stock;
        stockItem.stock = Math.max(0, prevStock - item.quantity);

        this.addLedgerEntry({
          skuName: `${stockItem.productName} - ${stockItem.variantName}`,
          warehouseName: receipt.warehouseName,
          type: 'OUTBOUND',
          quantityChange: -item.quantity,
          balanceAfter: stockItem.stock,
          referenceCode: `CANCEL-${receipt.receiptCode}`
        });
      }
    });

    saveToStorage('stocks', stocks);
    return true;
  }
};
