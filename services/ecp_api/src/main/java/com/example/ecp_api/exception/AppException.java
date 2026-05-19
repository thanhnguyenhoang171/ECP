package com.example.ecp_api.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException { //Handle response business error message
    private final HttpStatus status;
    private final String code;

    public AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.code = null;
    }

    public AppException(String code, String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
