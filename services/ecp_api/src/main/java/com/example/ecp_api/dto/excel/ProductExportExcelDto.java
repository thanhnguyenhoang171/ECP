package com.example.ecp_api.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.ContentFontStyle;
import com.alibaba.excel.annotation.write.style.HeadFontStyle;
import com.alibaba.excel.annotation.write.style.HeadStyle;
import com.alibaba.excel.enums.BooleanEnum;
import com.alibaba.excel.enums.poi.FillPatternTypeEnum;
import com.alibaba.excel.enums.poi.HorizontalAlignmentEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.net.URL;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ColumnWidth(20)

// Header style
@HeadStyle(
        fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND,
        fillForegroundColor = 51,
        horizontalAlignment = HorizontalAlignmentEnum.CENTER
)

@HeadFontStyle(
        fontHeightInPoints = 12,
        bold = BooleanEnum.TRUE,
        fontName = "Arial"
)

// Content style
@ContentFontStyle(
        fontHeightInPoints = 12,
        fontName = "Arial"
)
public class ProductExportExcelDto {

    @ExcelProperty("STT")
    @ColumnWidth(8)
    private Integer index;

    @ExcelProperty("ID")
    @ColumnWidth(25)
    private String id;

    @ExcelProperty("Mã SKU")
    @ColumnWidth(20)
    private String sku;

    @ExcelProperty("Tên sản phẩm")
    @ColumnWidth(35)
    private String name;

    @ExcelProperty("Slug")
    @ColumnWidth(25)
    private String slug;

    @ExcelProperty("Thương hiệu")
    @ColumnWidth(20)
    private String brand;

    @ExcelProperty("Danh mục")
    @ColumnWidth(25)
    private String category;

    @ExcelProperty("Giá bán")
    @ColumnWidth(18)
    private BigDecimal price;

    @ExcelProperty("Giá gốc")
    @ColumnWidth(18)
    private BigDecimal compareAtPrice;

    @ExcelProperty("Giá vốn")
    @ColumnWidth(18)
    private BigDecimal costPrice;

    @ExcelProperty("Ảnh đại diện")
    @ColumnWidth(25)
    private URL thumbnail;

    @ExcelProperty("Trạng thái")
    @ColumnWidth(15)
    private String status;

    @ExcelProperty("Đã bán")
    @ColumnWidth(12)
    private Integer soldCount;

    @ExcelProperty("Ngày tạo")
    @ColumnWidth(20)
    private String createdAt;
}
