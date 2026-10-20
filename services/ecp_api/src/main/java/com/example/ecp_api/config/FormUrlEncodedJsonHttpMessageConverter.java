package com.example.ecp_api.config;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
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
        try {
            MultiValueMap<String, String> values = new FormHttpMessageConverter().read(null, inputMessage);
            Map<String, JavaType> propertyTypes = new HashMap<>();
            objectMapper.getDeserializationConfig().introspect(objectMapper.constructType(clazz))
                    .findProperties().forEach(property -> {
                        if (property.getPrimaryMember() != null) {
                            propertyTypes.put(property.getName(), property.getPrimaryType());
                        }
                    });
            Map<String, Object> map = new HashMap<>();
            for (Map.Entry<String, List<String>> entry : values.entrySet()) {
                List<String> fieldValues = entry.getValue();
                if (fieldValues.isEmpty()) continue;
                String value = fieldValues.getLast();
                JavaType type = propertyTypes.get(entry.getKey());
                boolean structured = type != null && (type.isContainerType()
                        || type.getRawClass().getPackageName().startsWith("com.example.ecp_api") && !type.isEnumType());
                if (structured && type.isCollectionLikeType() && fieldValues.size() > 1) {
                    map.put(entry.getKey(), fieldValues);
                } else if (structured && value != null && !value.isBlank()) {
                    map.put(entry.getKey(), objectMapper.readValue(value, Object.class));
                } else {
                    map.put(entry.getKey(), structured ? null : value);
                }
            }
            return objectMapper.convertValue(map, clazz);
        } catch (IllegalArgumentException | IOException ex) {
            throw new HttpMessageNotReadableException("Failed to bind form-urlencoded data to " + clazz.getSimpleName(), ex, inputMessage);
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
