package com.example.ecp_api.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtils {

    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    /**
     * Định dạng LocalDateTime thành chuỗi dd/MM/yyyy HH:mm:ss
     *
     * @param dateTime đối tượng ngày giờ
     * @return chuỗi đã định dạng hoặc rỗng nếu dateTime null
     */
    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        return dateTime.format(DEFAULT_FORMATTER);
    }

    /**
     * Định dạng LocalDateTime theo pattern tùy chỉnh
     *
     * @param dateTime đối tượng ngày giờ
     * @param pattern  định dạng mong muốn
     * @return chuỗi đã định dạng
     */
    public static String format(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) {
            return "";
        }
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * Chuyển đổi chuỗi dd/MM/yyyy HH:mm:ss về LocalDateTime
     *
     * @param dateStr chuỗi ngày giờ
     * @return đối tượng LocalDateTime hoặc null nếu lỗi/rỗng
     */
    public static LocalDateTime parse(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateStr, DEFAULT_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Chuyển đổi chuỗi ngày giờ về LocalDateTime theo pattern tùy chỉnh
     *
     * @param dateStr chuỗi ngày giờ
     * @param pattern định dạng của chuỗi
     * @return đối tượng LocalDateTime
     */
    public static LocalDateTime parse(String dateStr, String pattern) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern(pattern));
        } catch (Exception e) {
            return null;
        }
    }
}
