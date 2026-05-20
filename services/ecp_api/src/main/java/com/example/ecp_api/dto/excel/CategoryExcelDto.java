package com.example.ecp_api.dto.excel;

import com.alibaba.excel.annotation.ExcelIgnore;
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
@ContentFontStyle(
        fontHeightInPoints = 12,
        fontName = "Arial"
)


public class CategoryExcelDto {
    @ExcelIgnore
    private Integer rowNumber;

    @ExcelProperty("STT")
    @ColumnWidth(8)
    private Integer index;

    @ExcelProperty("ID")
    @ColumnWidth(25)
    private String id;

    @ExcelProperty("Tên danh mục")
    @ColumnWidth(30)
    private String name;

    @ExcelProperty("Slug")
    @ColumnWidth(25)
    private String slug;

    @ExcelProperty("Slug danh mục cha")
    @ColumnWidth(30)
    private String parentSlug;

    @ExcelProperty("Cấp độ")
    @ColumnWidth(10)
    private Integer level;

    @ExcelProperty("Trạng thái (TRUE/FALSE)")
    @ColumnWidth(25)
    private Boolean status;

    @ExcelProperty("Ngày tạo")
    @ColumnWidth(20)
    private String createdAt;

    @ExcelProperty("Ngày sửa")
    @ColumnWidth(20)
    private String updatedAt;
}
