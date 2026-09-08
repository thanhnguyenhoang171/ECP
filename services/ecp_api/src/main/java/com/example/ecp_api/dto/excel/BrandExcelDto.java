package com.example.ecp_api.dto.excel;

import com.alibaba.excel.annotation.ExcelIgnore;
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

//Content Type
@ContentFontStyle(
        fontHeightInPoints = 12,
        fontName = "Arial"
)

public class BrandExcelDto {
    @ExcelIgnore
    private Integer rowNumber;

    @ExcelProperty("STT")
    @ColumnWidth(8)
    private Integer index;

    @ExcelProperty("ID")
    @ColumnWidth(25)
    private String id;

    @ExcelProperty("Tên thương hiệu")
    @ColumnWidth(30)
    private String name;

    @ExcelProperty("Mô tả")
    @ColumnWidth(40)
    private String description;

    @ExcelProperty("Website")
    @ColumnWidth(30)
    private String website;

    @ExcelProperty("Slug")
    @ColumnWidth(25)
    private String slug;

    @ExcelProperty("Trạng thái")
    @ColumnWidth(15)
    private Boolean active;

    @ExcelProperty("Hình ảnh")
    @ColumnWidth(25)
    private String logo;

    @ExcelIgnore
    private byte[] embeddedImageBytes;
}
