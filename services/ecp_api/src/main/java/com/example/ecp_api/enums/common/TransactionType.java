package com.example.ecp_api.enums.common;

public enum TransactionType {
    PURCHASE_RECEIPT,    // Nhập hàng từ đơn mua
    SALES_ISSUE,         // Xuất hàng bán
    STOCK_ADJUSTMENT,    // Điều chỉnh kho (kiểm kê)
    STOCK_TRANSFER,      // Chuyển kho
    RETURN_TO_SUPPLIER,  // Trả hàng NCC
    CUSTOMER_RETURN      // Khách trả hàng
}
