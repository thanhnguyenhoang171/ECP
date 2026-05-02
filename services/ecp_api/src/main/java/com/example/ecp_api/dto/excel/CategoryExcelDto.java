package com.example.ecp_api.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.ContentStyle;
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
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 51) // ORANGE
@HeadFontStyle(fontHeightInPoints = 12, bold = BooleanEnum.TRUE)
public class CategoryExcelDto {
    @ExcelProperty("STT")
    @ColumnWidth(10)
    private Integer index;

    @ExcelProperty("_id")
    private String id;

    @ExcelProperty("Tên loại sản phẩm")
    @ColumnWidth(30)
    private String name;

    @ExcelProperty("Slug")
    private String slug;

    @ExcelProperty("Cấp độ")
    @ColumnWidth(10)
    private Integer level;

    @ExcelProperty("Mô tả")
    @ColumnWidth(40)
    private String description;

    @ExcelProperty("Trạng thái HĐ")
    private String status;

    @ExcelProperty("Ngày tạo")
    private String createdAt;

    @ExcelProperty("Ngày sửa")
    private String updatedAt;
}
