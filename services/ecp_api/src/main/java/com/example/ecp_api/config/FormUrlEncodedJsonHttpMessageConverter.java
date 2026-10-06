package com.example.ecp_api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Message converter supporting application/x-www-form-urlencoded into @RequestBody POJO DTOs.
 * Enables single endpoint handling for both JSON and Form-UrlEncoded data without endpoint duplication.
 */
@Component
public class FormUrlEncodedJsonHttpMessageConverter extends AbstractHttpMessageConverter<Object> {

    private final ObjectMapper objectMapper;

    public FormUrlEncodedJsonHttpMessageConverter(ObjectMapper objectMapper) {
        super(StandardCharsets.UTF_8, MediaType.APPLICATION_FORM_URLENCODED);
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean supports(Class<?> clazz) {
        return !MultiValueMap.class.isAssignableFrom(clazz)
                && !String.class.isAssignableFrom(clazz)
                && !byte[].class.isAssignableFrom(clazz);
    }

    @Override
    protected Object readInternal(Class<?> clazz, HttpInputMessage inputMessage)
            throws IOException, HttpMessageNotReadableException {
        String body = StreamUtils.copyToString(inputMessage.getBody(), StandardCharsets.UTF_8);
        Map<String, Object> map = new HashMap<>();
        if (!body.isEmpty()) {
            String[] pairs = body.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf('=');
                if (idx > 0) {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String val = (idx < pair.length() - 1)
                            ? URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8)
                            : "";
                    map.put(key, val);
                } else if (idx == -1 && !pair.isEmpty()) {
                    map.put(URLDecoder.decode(pair, StandardCharsets.UTF_8), "");
                }
            }
        }
        try {
            return objectMapper.convertValue(map, clazz);
        } catch (IllegalArgumentException ex) {
            throw new HttpMessageNotReadableException("Failed to bind form-urlencoded data to " + clazz.getSimpleName() + ": " + ex.getMessage(), inputMessage);
        }
    }

    @Override
    public boolean canWrite(Class<?> clazz, MediaType mediaType) {
        return false;
    }

    @Override
    public boolean canWrite(MediaType mediaType) {
        return false;
    }

    @Override
    protected void writeInternal(Object o, HttpOutputMessage outputMessage)
            throws IOException, HttpMessageNotWritableException {
        throw new UnsupportedOperationException("Writing form-urlencoded responses is not supported");
    }
}
