package com.example.ecp_api.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.HeadFontStyle;
import com.alibaba.excel.annotation.write.style.HeadStyle;
import com.alibaba.excel.enums.BooleanEnum;
import com.alibaba.excel.enums.poi.FillPatternTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ColumnWidth(25)
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 24) // CORNFLOWER_BLUE (approx index 24)
@HeadFontStyle(fontHeightInPoints = 12, bold = BooleanEnum.TRUE, color = 9) // WHITE (index 9)
public class CategoryTemplateDto {
    @ExcelProperty("STT (*)")
    @ColumnWidth(10)
    private Integer index;

    @ExcelProperty("ID (Để trống nếu tạo mới)")
    private String id;

    @ExcelProperty("Tên loại sản phẩm (*)")
    @ColumnWidth(30)
    private String name;

    @ExcelProperty("Slug (Tự động nếu trống)")
    private String slug;

    @ExcelProperty("Danh mục cha (Chọn list)")
    @ColumnWidth(35)
    private String parentNameWithId;

    @ExcelProperty("Mô tả")
    @ColumnWidth(40)
    private String description;

    @ExcelProperty("Trạng thái")
    private String status;
}
