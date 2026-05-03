package com.example.ecp_api.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.*;
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

// Content style
@ContentStyle(
        horizontalAlignment = HorizontalAlignmentEnum.CENTER
)

@ContentFontStyle(
        fontHeightInPoints = 12,
        fontName = "Arial"
)


public class CategoryExcelDto {
    @ExcelProperty("STT")
    @ColumnWidth(10)
    private Integer index;

    @ExcelProperty("_id")
    private String id;

    @ExcelProperty("Tên loại sản phẩm")
    @ColumnWidth(30)
    private String name;

    @ExcelProperty("Đường dẫn slug")
    private String slug;

    @ExcelProperty("Cấp độ")
    @ColumnWidth(10)
    private Integer level;

    @ExcelProperty("Trạng thái")
    private Boolean status;

    @ExcelProperty("Ngày tạo")
    private String createdAt;

    @ExcelProperty("Ngày sửa")
    private String updatedAt;
}
