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

// Header style matching CategoryExcelDto
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

// Content style matching CategoryExcelDto
@ContentFontStyle(
        fontHeightInPoints = 12,
        fontName = "Arial"
)
@ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.LEFT)

public class CategoryTemplateDto {
    @ExcelProperty("STT (*)")
    @ColumnWidth(10)
    private Integer index;

    @ExcelProperty("ID (Để trống nếu tạo mới)")
    @ColumnWidth(30)
    private String id;

    @ExcelProperty("Tên loại sản phẩm (*)")
    @ColumnWidth(35)
    private String name;

    @ExcelProperty("Slug (Tự động nếu trống)")
    @ColumnWidth(30)
    private String slug;

    @ExcelProperty("Cấp độ")
    @ColumnWidth(10)
    private Integer level;

    @ExcelProperty("Slug danh mục cha")
    @ColumnWidth(30)
    private String parentSlug;

    @ExcelProperty("Trạng thái (TRUE/FALSE)")
    @ColumnWidth(35)
    private Boolean status;

    @ExcelProperty("Ngày tạo")
    @ColumnWidth(20)
    private String createdAt;

    @ExcelProperty("Ngày sửa")
    @ColumnWidth(20)
    private String updatedAt;
}
