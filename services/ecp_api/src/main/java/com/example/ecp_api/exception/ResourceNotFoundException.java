package com.example.ecp_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Custom anotation to help Spring know Exception throw out, default is 404 error
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}


//public User getUserById(Long id) {
//    return userRepository.findById(id)
//            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
//}