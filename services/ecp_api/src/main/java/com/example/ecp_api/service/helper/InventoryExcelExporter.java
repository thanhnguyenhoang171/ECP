package com.example.ecp_api.service.helper;
import com.example.ecp_api.security.DataOwnership;

import com.example.ecp_api.dto.request.InventoryFilterRequest;
import com.example.ecp_api.entity.jpa.Inventory;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.repository.jpa.InventoryRepository;
import com.example.ecp_api.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class InventoryExcelExporter {
    private static final int HEADER_ROW = 4;
    private static final int FIRST_DATA_ROW = 5;
    private static final int PAGE_SIZE = 500;
    private static final int LAST_DATA_ROW = 1_048_575;
    private static final String[] HEADERS = { "STT", "Kho hàng", "Mã SKU", "Tên sản phẩm", "Mã lô",
            "Ngày sản xuất", "Hạn sử dụng", "Tồn hệ thống", "Đang giữ", "Tồn khả dụng", "Cập nhật lúc",
            "Kiểm đếm thực tế", "Chênh lệch" };
    private final org.springframework.data.mongodb.core.MongoTemplate ownershipMongo;
    private final InventoryRepository inventoryRepository;

    public byte[] export(InventoryFilterRequest filter, String requestedSort) {
        Sort sort = parseSort(requestedSort).and(Sort.by("id"));
        var specification = InventorySpecifications.matching(filter).and(DataOwnership.stock(ownershipMongo));
        try (var workbook = new SXSSFWorkbook(100); var output = new ByteArrayOutputStream()) {
            workbook.setCompressTempFiles(true);
            try {
                var sheet = workbook.createSheet("Đối soát tồn kho");
                sheet.createRow(0).createCell(0).setCellValue("BÁO CÁO ĐỐI SOÁT TỒN KHO");
                sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 12));
                sheet.createRow(1).createCell(0).setCellValue("Thời điểm xuất (UTC+7): "
                        + LocalDateTime.now(ZoneId.of("Asia/Bangkok")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
                        + " | Người xuất: " + SecurityUtils.getCurrentUserEmail());
                sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 12));
                sheet.createRow(2).createCell(0).setCellValue(scope(filter));
                sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 12));
                sheet.createRow(3).createCell(0).setCellValue("Nhập số kiểm đếm vào cột L. Chênh lệch = kiểm đếm - tồn hệ thống. Số tồn là dữ liệu tại thời điểm xuất; xuất file mới nếu cần số liệu mới nhất.");
                sheet.addMergedRegion(new CellRangeAddress(3, 3, 0, 12));

                CellStyle header = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                font.setColor(IndexedColors.WHITE.getIndex());
                header.setFont(font);
                header.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
                header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                header.setWrapText(true);
                Row headerRow = sheet.createRow(HEADER_ROW);
                headerRow.setHeightInPoints(32);
                for (int column = 0; column < HEADERS.length; column++) {
                    Cell cell = headerRow.createCell(column);
                    cell.setCellValue(HEADERS[column]);
                    cell.setCellStyle(header);
                }
                CellStyle dateStyle = workbook.createCellStyle();
                dateStyle.setDataFormat(workbook.createDataFormat().getFormat("dd/mm/yyyy"));
                CellStyle dateTimeStyle = workbook.createCellStyle();
                dateTimeStyle.setDataFormat(workbook.createDataFormat().getFormat("dd/mm/yyyy hh:mm:ss"));
                CellStyle countStyle = workbook.createCellStyle();
                countStyle.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
                countStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                countStyle.setDataFormat(workbook.createDataFormat().getFormat("0"));

                int rowIndex = FIRST_DATA_ROW;
                long onHandTotal = 0, lockedTotal = 0;
                for (int pageIndex = 0; ; pageIndex++) {
                    var page = inventoryRepository.findAll(specification, PageRequest.of(pageIndex, PAGE_SIZE, sort));
                    for (Inventory inventory : page.getContent()) {
                        if (rowIndex >= LAST_DATA_ROW) {
                            throw new AppException("EXPORT_TOO_LARGE", "Dữ liệu vượt giới hạn Excel. Hãy lọc theo từng kho để xuất.", HttpStatus.BAD_REQUEST);
                        }
                        Row row = sheet.createRow(rowIndex);
                        row.createCell(0).setCellValue(rowIndex - FIRST_DATA_ROW + 1);
                        row.createCell(1).setCellValue(inventory.getWarehouse().getName());
                        row.createCell(2).setCellValue(inventory.getSku().getSkuCode());
                        row.createCell(3).setCellValue(inventory.getSku().getProductName());
                        row.createCell(4).setCellValue(inventory.getBatchCode());
                        dateCell(row, 5, inventory.getManufactureDate(), dateStyle);
                        dateCell(row, 6, inventory.getExpiryDate(), dateStyle);
                        int onHand = inventory.getQuantityOnHand();
                        int locked = inventory.getQuantityLocked();
                        row.createCell(7).setCellValue(onHand);
                        row.createCell(8).setCellValue(locked);
                        row.createCell(9).setCellValue((long) onHand - locked);
                        dateCell(row, 10, inventory.getUpdatedAt(), dateTimeStyle);
                        row.createCell(11).setCellStyle(countStyle);
                        int excelRow = rowIndex + 1;
                        row.createCell(12).setCellFormula("IF(ISNUMBER(L" + excelRow + "),L" + excelRow + "-H" + excelRow + ",\"\")");
                        onHandTotal += onHand;
                        lockedTotal += locked;
                        rowIndex++;
                    }
                    if (!page.hasNext()) { break; }
                }
                Row total = sheet.createRow(rowIndex);
                total.createCell(0).setCellValue("TỔNG (" + (rowIndex - FIRST_DATA_ROW) + " dòng)");
                sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 0, 6));
                total.createCell(7).setCellValue(onHandTotal);
                total.createCell(8).setCellValue(lockedTotal);
                total.createCell(9).setCellValue(onHandTotal - lockedTotal);
                if (rowIndex > FIRST_DATA_ROW) {
                    String countRange = "L6:L" + rowIndex;
                    total.createCell(11).setCellFormula("IF(COUNT(" + countRange + ")=0,\"\",SUM(" + countRange + "))");
                    total.createCell(12).setCellFormula("IF(COUNT(" + countRange + ")=0,\"\",SUM(M6:M" + rowIndex + "))");
                    var helper = sheet.getDataValidationHelper();
                    var constraint = helper.createIntegerConstraint(DataValidationConstraint.OperatorType.BETWEEN, "0", "2147483647");
                    var validation = helper.createValidation(constraint, new CellRangeAddressList(FIRST_DATA_ROW, rowIndex - 1, 11, 11));
                    validation.setEmptyCellAllowed(true);
                    validation.setShowErrorBox(true);
                    validation.createErrorBox("Số kiểm đếm không hợp lệ", "Nhập số nguyên không âm.");
                    sheet.addValidationData(validation);
                }
                int[] widths = { 9, 26, 28, 45, 22, 18, 18, 18, 16, 18, 24, 22, 18 };
                for (int column = 0; column < widths.length; column++) { sheet.setColumnWidth(column, widths[column] * 256); }
                sheet.createFreezePane(3, FIRST_DATA_ROW);
                sheet.setAutoFilter(new CellRangeAddress(HEADER_ROW, Math.max(HEADER_ROW, rowIndex - 1), 0, 12));
                workbook.setForceFormulaRecalculation(true);
                workbook.write(output);
                return output.toByteArray();
            } finally {
                workbook.dispose();
            }
        } catch (IOException error) {
            throw new AppException("INVENTORY_EXPORT_FAILED", "Không thể tạo file đối soát tồn kho.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private static void dateCell(Row row, int column, LocalDateTime value, CellStyle style) {
        Cell cell = row.createCell(column);
        if (value != null) { cell.setCellValue(value); cell.setCellStyle(style); }
    }

    private static Sort parseSort(String requested) {
        String[] parts = requested == null ? new String[] { "sku", "asc" } : requested.split(",", -1);
        if (parts.length != 2 || (!parts[1].equals("asc") && !parts[1].equals("desc"))) {
            throw new AppException("INVALID_EXPORT_SORT", "Thứ tự xuất tồn kho không hợp lệ.", HttpStatus.BAD_REQUEST);
        }
        String property = switch (parts[0]) {
            case "sku" -> "sku.skuCode";
            case "quantityOnHand", "stock" -> "quantityOnHand";
            default -> throw new AppException("INVALID_EXPORT_SORT", "Thứ tự xuất tồn kho không hợp lệ.", HttpStatus.BAD_REQUEST);
        };
        return Sort.by(Sort.Direction.fromString(parts[1]), property);
    }

    private static String scope(InventoryFilterRequest filter) {
        if (filter == null) { return "Phạm vi: Tất cả tồn kho được cấp quyền"; }
        String status = filter.getStockStatus() == null ? "all" : filter.getStockStatus();
        String label = switch (status) { case "low" -> "Sắp hết (1–5)"; case "out" -> "Hết hàng"; case "ok" -> "Đủ hàng (>5)"; default -> "Tất cả"; };
        return "Phạm vi: " + (filter.getWarehouseId() == null || filter.getWarehouseId().isBlank() ? "Tất cả kho được cấp quyền" : "Kho đã chọn")
                + " | Trạng thái: " + label + " | Từ khoá: " + (filter.getKeyword() == null ? "" : filter.getKeyword());
    }

}
