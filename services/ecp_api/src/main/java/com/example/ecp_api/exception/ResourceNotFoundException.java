package com.example.ecp_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Custom anotation to help Spring know Exception throw out, default is 404 error
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    private String code;

    public ResourceNotFoundException(String message) {
        super(message);
        this.code = "RESOURCE_NOT_FOUND";
    }

    public ResourceNotFoundException(String message, String code) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}