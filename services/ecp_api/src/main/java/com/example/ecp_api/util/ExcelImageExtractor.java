package com.example.ecp_api.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.hssf.usermodel.HSSFClientAnchor;
import org.apache.poi.hssf.usermodel.HSSFPatriarch;
import org.apache.poi.hssf.usermodel.HSSFPicture;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.ss.usermodel.PictureData;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.*;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Utility for extracting embedded images from Excel worksheets (.xlsx and .xls).
 * Supports standard floating shapes (Over Cells), Shape Groups, and modern Excel 365 "Place in Cell" images.
 */
@Slf4j
public final class ExcelImageExtractor {

    private static final Pattern CELL_ROW_PATTERN = Pattern.compile("^[A-Za-z]+(\\d+)$");
    private static final Pattern DISPIMG_PATTERN = Pattern.compile("DISPIMG\\([\"']([^\"']+)[\"']");

    private ExcelImageExtractor() {
        // Private constructor
    }

    /**
     * Extract all embedded pictures from an Excel workbook by row number.
     *
     * @param excelBytes raw byte array of the Excel file
     * @return Map where Key is the 1-based row number (matching Excel UI row numbers) and Value is the image byte array
     */
    public static Map<Integer, byte[]> extractImagesByRow(byte[] excelBytes) {
        if (excelBytes == null || excelBytes.length == 0) {
            log.warn("extractImagesByRow: excelBytes is empty");
            return Collections.emptyMap();
        }

        Map<Integer, byte[]> resultMap = new HashMap<>();

        // Strategy 1: Excel 365 "Place in Cell" (xl/cellimages.xml)
        try {
            Map<Integer, byte[]> cellImages = extractPlaceInCellImages(excelBytes);
            if (!cellImages.isEmpty()) {
                resultMap.putAll(cellImages);
            }
        } catch (Exception e) {
            log.debug("Strategy 1 (Place in Cell) not applicable: {}", e.getMessage());
        }

        // Strategy 2: Drawing Patriarch (Floating / Over Cells / Paste)
        try (InputStream is = new ByteArrayInputStream(excelBytes);
             Workbook workbook = WorkbookFactory.create(is)) {

            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                Map<Integer, byte[]> drawingImages = extractImagesFromSheet(sheet);
                for (Map.Entry<Integer, byte[]> entry : drawingImages.entrySet()) {
                    resultMap.putIfAbsent(entry.getKey(), entry.getValue());
                }
            }

            // Strategy 3: Global Pictures Fallback
            List<? extends PictureData> allPictures = workbook.getAllPictures();
            if (!allPictures.isEmpty() && resultMap.isEmpty()) {
                int row = 2;
                for (PictureData pic : allPictures) {
                    byte[] data = pic.getData();
                    if (data != null && data.length > 0) {
                        resultMap.put(row++, data);
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to extract images from workbook: {}", ex.getMessage());
        }

        return resultMap;
    }

    /**
     * Extract pictures from a specific Sheet using Apache POI Drawing Patriarch.
     */
    public static Map<Integer, byte[]> extractImagesFromSheet(Sheet sheet) {
        Map<Integer, byte[]> rowImageMap = new HashMap<>();
        if (sheet == null) {
            return rowImageMap;
        }

        try {
            if (sheet instanceof XSSFSheet xssfSheet) {
                XSSFDrawing drawing = xssfSheet.getDrawingPatriarch();
                if (drawing != null) {
                    processXSSFShapes(drawing.getShapes(), rowImageMap);
                }
            } else if (sheet instanceof HSSFSheet hssfSheet) {
                HSSFPatriarch patriarch = hssfSheet.getDrawingPatriarch();
                if (patriarch != null) {
                    for (org.apache.poi.hssf.usermodel.HSSFShape shape : patriarch.getChildren()) {
                        if (shape instanceof HSSFPicture picture) {
                            HSSFClientAnchor anchor = (HSSFClientAnchor) picture.getAnchor();
                            if (anchor != null) {
                                int rowNumber = calculateRowNumber(anchor.getRow1(), anchor.getRow2());
                                if (picture.getPictureData() != null && picture.getPictureData().getData() != null) {
                                    rowImageMap.putIfAbsent(rowNumber, picture.getPictureData().getData());
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error reading drawings from sheet '{}': {}", sheet.getSheetName(), e.getMessage());
        }

        return rowImageMap;
    }

    private static void processXSSFShapes(List<XSSFShape> shapes, Map<Integer, byte[]> rowImageMap) {
        if (shapes == null) return;
        for (XSSFShape shape : shapes) {
            if (shape instanceof XSSFPicture picture) {
                XSSFClientAnchor anchor = picture.getClientAnchor();
                if (anchor == null && picture.getAnchor() instanceof XSSFClientAnchor clientAnchor) {
                    anchor = clientAnchor;
                }
                if (anchor != null) {
                    int rowNumber = calculateRowNumber(anchor.getRow1(), anchor.getRow2());
                    if (picture.getPictureData() != null && picture.getPictureData().getData() != null) {
                        rowImageMap.putIfAbsent(rowNumber, picture.getPictureData().getData());
                    }
                }
            } else if (shape instanceof XSSFShapeGroup group) {
                // Recursively process shapes inside a group
                List<XSSFShape> subShapes = new ArrayList<>();
                for (XSSFShape sub : group) {
                    subShapes.add(sub);
                }
                processXSSFShapes(subShapes, rowImageMap);
            }
        }
    }

    /**
     * Calculate 1-based row number from 0-based anchor row indices.
     * Header row is 0 (1-based row 1). If image slightly touches row 0 but spans down to row >= 1,
     * it belongs to data row 2.
     */
    private static int calculateRowNumber(int row1, int row2) {
        if (row1 == 0 && row2 >= 1) {
            return 2; // Placed on first data row but top edge touched header
        }
        return row1 + 1; // 1-based row number
    }

    /**
     * Extract images placed directly inside cells ("Place in Cell" in Excel 365 / Online).
     * These images reside in xl/cellimages.xml with relations in xl/_rels/cellimages.xml.rels
     * and referenced in xl/worksheets/sheet1.xml via =DISPIMG("ID_...", 1) or metadata.
     */
    private static Map<Integer, byte[]> extractPlaceInCellImages(byte[] excelBytes) {
        Map<Integer, byte[]> rowImages = new HashMap<>();

        Map<String, byte[]> zipEntries = new HashMap<>();
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(excelBytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    String name = entry.getName().replace("\\", "/");
                    if (name.startsWith("xl/cellimages.xml")
                            || name.startsWith("xl/_rels/cellimages.xml.rels")
                            || name.startsWith("xl/worksheets/sheet")
                            || name.startsWith("xl/media/")) {
                        zipEntries.put(name, zis.readAllBytes());
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error unzipping xlsx for cellimages: {}", e.getMessage());
            return rowImages;
        }

        byte[] cellImagesXml = zipEntries.get("xl/cellimages.xml");
        byte[] cellImagesRelsXml = zipEntries.get("xl/_rels/cellimages.xml.rels");

        if (cellImagesXml == null || cellImagesRelsXml == null) {
            return rowImages;
        }

        // 1. Parse cellimages.xml.rels: Map rId -> media path (e.g. "rId1" -> "media/image1.png")
        Map<String, String> rIdToMediaPath = parseRelsXml(cellImagesRelsXml);

        // 2. Parse cellimages.xml: Map imageId/name -> rId (and ordered list of rIds)
        Map<String, String> nameToRId = new HashMap<>();
        List<String> orderedRIds = new ArrayList<>();
        parseCellImagesXml(cellImagesXml, nameToRId, orderedRIds);

        // 3. Scan sheet XMLs to find which row references each imageId or formula DISPIMG
        Map<Integer, String> rowToImageId = new HashMap<>();
        List<Integer> rowsWithImagesInOrder = new ArrayList<>();

        for (Map.Entry<String, byte[]> entry : zipEntries.entrySet()) {
            if (entry.getKey().startsWith("xl/worksheets/sheet") && entry.getKey().endsWith(".xml")) {
                parseSheetForCellImages(entry.getValue(), rowToImageId, rowsWithImagesInOrder);
            }
        }

        // 4. Map rows to actual image bytes
        // 4a. Map by specific Image ID if matched
        for (Map.Entry<Integer, String> mapping : rowToImageId.entrySet()) {
            int row = mapping.getKey();
            String imageId = mapping.getValue();
            String rId = nameToRId.get(imageId);
            if (rId != null) {
                byte[] imageBytes = getImageBytesByRId(rId, rIdToMediaPath, zipEntries);
                if (imageBytes != null) {
                    rowImages.put(row, imageBytes);
                }
            }
        }

        // 4b. If rowToImageId was empty, map ordered rows to ordered rIds
        if (rowImages.isEmpty() && !rowsWithImagesInOrder.isEmpty() && !orderedRIds.isEmpty()) {
            int count = Math.min(rowsWithImagesInOrder.size(), orderedRIds.size());
            for (int i = 0; i < count; i++) {
                int row = rowsWithImagesInOrder.get(i);
                String rId = orderedRIds.get(i);
                byte[] imageBytes = getImageBytesByRId(rId, rIdToMediaPath, zipEntries);
                if (imageBytes != null) {
                    rowImages.put(row, imageBytes);
                }
            }
        }

        // 4c. Fallback: If rows couldn't be parsed from sheet XML, map ordered rIds to rows 2, 3, ...
        if (rowImages.isEmpty() && !orderedRIds.isEmpty()) {
            int startRow = 2;
            for (String rId : orderedRIds) {
                byte[] imageBytes = getImageBytesByRId(rId, rIdToMediaPath, zipEntries);
                if (imageBytes != null) {
                    rowImages.put(startRow++, imageBytes);
                }
            }
        }

        return rowImages;
    }

    private static byte[] getImageBytesByRId(String rId, Map<String, String> rIdToMediaPath, Map<String, byte[]> zipEntries) {
        String mediaPath = rIdToMediaPath.get(rId);
        if (mediaPath == null) return null;
        if (!mediaPath.startsWith("xl/")) {
            mediaPath = "xl/" + mediaPath;
        }
        return zipEntries.get(mediaPath);
    }

    private static Map<String, String> parseRelsXml(byte[] relsXml) {
        Map<String, String> rels = new HashMap<>();
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new ByteArrayInputStream(relsXml));
            NodeList list = doc.getElementsByTagName("Relationship");
            for (int i = 0; i < list.getLength(); i++) {
                Element el = (Element) list.item(i);
                String id = el.getAttribute("Id");
                String target = el.getAttribute("Target");
                if (id != null && target != null) {
                    rels.put(id, target);
                }
            }
        } catch (Exception e) {
            log.debug("Error parsing cellimages rels XML: {}", e.getMessage());
        }
        return rels;
    }

    private static void parseCellImagesXml(byte[] cellImagesXml, Map<String, String> nameToRId, List<String> orderedRIds) {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new ByteArrayInputStream(cellImagesXml));

            NodeList picList = doc.getElementsByTagNameNS("*", "pic");
            for (int i = 0; i < picList.getLength(); i++) {
                Element pic = (Element) picList.item(i);

                String name = "";
                NodeList cNvPrList = pic.getElementsByTagNameNS("*", "cNvPr");
                if (cNvPrList.getLength() > 0) {
                    Element cNvPr = (Element) cNvPrList.item(0);
                    name = cNvPr.getAttribute("name");
                }

                String rId = "";
                NodeList blipList = pic.getElementsByTagNameNS("*", "blip");
                if (blipList.getLength() > 0) {
                    Element blip = (Element) blipList.item(0);
                    rId = blip.getAttribute("r:embed");
                    if (rId == null || rId.isEmpty()) {
                        rId = blip.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "embed");
                    }
                }

                if (!rId.isEmpty()) {
                    orderedRIds.add(rId);
                    if (!name.isEmpty()) {
                        nameToRId.put(name, rId);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error parsing cellimages.xml: {}", e.getMessage());
        }
    }

    private static void parseSheetForCellImages(byte[] sheetXml, Map<Integer, String> rowToImageId, List<Integer> rowsWithImagesInOrder) {
        try {
            String xmlContent = new String(sheetXml, StandardCharsets.UTF_8);

            // Match cells like <c r="H2" ...> ... <f>=_xlfn.DISPIMG("ID_XXXX", 1)</f> ... </c>
            Pattern cellPattern = Pattern.compile("<c[^>]+r=\"([A-Z]+)(\\d+)\"[^>]*>(.*?)</c>", Pattern.DOTALL);
            Matcher cellMatcher = cellPattern.matcher(xmlContent);

            while (cellMatcher.find()) {
                int row = Integer.parseInt(cellMatcher.group(2));
                String cellBody = cellMatcher.group(3);

                if (cellBody.contains("DISPIMG")) {
                    Matcher dispimgMatcher = DISPIMG_PATTERN.matcher(cellBody);
                    if (dispimgMatcher.find()) {
                        String imageId = dispimgMatcher.group(1);
                        rowToImageId.put(row, imageId);
                        rowsWithImagesInOrder.add(row);
                    }
                } else if (cellBody.contains("<vm>") || cellMatcher.group(0).contains("vm=")) {
                    // Cell contains value metadata (Place in Cell without DISPIMG formula)
                    rowsWithImagesInOrder.add(row);
                }
            }
        } catch (Exception e) {
            log.debug("Error parsing sheet xml for cell images: {}", e.getMessage());
        }
    }
}
