package com.example.ecp_api.exception;

import com.example.ecp_api.service.TelegramNotificationService;
import org.apache.catalina.connector.ClientAbortException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import java.io.EOFException;
import java.io.IOException;
import java.net.SocketTimeoutException;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MultipartExceptionHandlerTest {
    private final TelegramNotificationService notifications = mock(TelegramNotificationService.class);
    private final UploadController controller = new UploadController();
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler(notifications)).build();
    }

    @Test
    void nestedTomcatReadTimeoutReturns408WithoutAlert() throws Exception {
        controller.failure = new MultipartException("Failed to parse", new IOException("multipart",
                new ClientAbortException(new SocketTimeoutException())));
        mvc.perform(post("/api/v1/files/upload"))
                .andExpect(status().isRequestTimeout())
                .andExpect(jsonPath("code").value("SYS_UPLOAD_TIMEOUT"));
        verifyNoInteractions(notifications);
    }

    @Test
    void nestedDisconnectReturnsEmpty499WithoutAlert() throws Exception {
        controller.failure = new MultipartException("Failed to parse", new IOException("multipart",
                new ClientAbortException(new EOFException())));
        mvc.perform(post("/api/v1/files/upload"))
                .andExpect(status().is(499)).andExpect(content().string(""));
        verifyNoInteractions(notifications);
    }

    @Test
    void prematureEofReturnsEmpty499WithoutAlert() throws Exception {
        controller.failure = new MultipartException("Failed to parse", new EOFException());
        mvc.perform(post("/api/v1/files/upload"))
                .andExpect(status().is(499)).andExpect(content().string(""));
        verifyNoInteractions(notifications);
    }

    @Test
    void malformedMultipartReturns400WithoutAlert() throws Exception {
        controller.failure = new MultipartException("Missing boundary");
        mvc.perform(post("/api/v1/files/upload"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("code").value("SYS_INVALID_MULTIPART"));
        verifyNoInteractions(notifications);
    }

    @Test
    void sizeLimitStillReturns413WithoutAlert() throws Exception {
        controller.failure = new MaxUploadSizeExceededException(100);
        mvc.perform(post("/api/v1/files/upload"))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("code").value("SYS_FILE_TOO_LARGE"));
        verifyNoInteractions(notifications);
    }

    @Test
    void serverDiskFailureStillReturns500AndAlerts() throws Exception {
        controller.failure = new MultipartException("Failed to parse", new IOException("No space left on device"));
        mvc.perform(post("/api/v1/files/upload"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("code").value("SYS_INTERNAL_ERROR"));
        verify(notifications).sendErrorLogAsync("/api/v1/files/upload", controller.failure);
    }

    @RestController
    static class UploadController {
        private MultipartException failure;

        @PostMapping("/api/v1/files/upload")
        void upload() {
            throw failure;
        }
    }
}
