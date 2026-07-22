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

import java.net.URL;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

@ColumnWidth(20)

// Header style
@HeadStyle(
        fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND,
        fillForegroundColor = 51, // light blue/green depending on palette
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
public class CategoryExportExcelDto {

    @ExcelProperty("STT")
    @ColumnWidth(8)
    private Integer index;

    @ExcelProperty("ID")
    @ColumnWidth(25)
    private String id;

    @ExcelProperty("Tên danh mục")
    @ColumnWidth(30)
    private String name;

    @ExcelProperty("Mô tả")
    @ColumnWidth(40)
    private String description;
    
    @ExcelProperty("Ảnh")
    @ColumnWidth(25)
    // We use java.net.URL type so EasyExcel can automatically download and render the image!
    // But if URL fails, it will throw error. Let's use String for URL to be safe, or just String.
    // I will use String for now, as downloading all images during export can block the thread for a long time.
    private java.net.URL imageUrl;

    @ExcelProperty("Slug")
    @ColumnWidth(25)
    private String slug;

    @ExcelProperty("Slug danh mục cha")
    @ColumnWidth(30)
    private String parentSlug;

    @ExcelProperty("Cấp độ")
    @ColumnWidth(10)
    private Integer level;

    @ExcelProperty("Thứ tự")
    @ColumnWidth(12)
    private Integer order;

    @ExcelProperty("Trạng thái (Hoạt động)")
    @ColumnWidth(25)
    private String status;

    @ExcelProperty("Ngày tạo")
    @ColumnWidth(20)
    private String createdAt;

    @ExcelProperty("Ngày sửa")
    @ColumnWidth(20)
    private String updatedAt;
}
