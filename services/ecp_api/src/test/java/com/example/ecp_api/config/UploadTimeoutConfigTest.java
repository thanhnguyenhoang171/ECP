package com.example.ecp_api.config;

import jakarta.servlet.MultipartConfigElement;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.coyote.http11.AbstractHttp11Protocol;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServer;

import java.io.IOException;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class UploadTimeoutConfigTest {
    private static final String BODY = "--test\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.txt\"\r\n"
            + "Content-Type: text/plain\r\n\r\nhello\r\n--test--\r\n";

    @Test
    void slowMultipartUsesUploadTimeoutInsteadOfConnectionTimeout() throws Exception {
        WebServer server = server(3000);
        try (Socket socket = new Socket("127.0.0.1", server.getPort());
             var sender = Executors.newSingleThreadScheduledExecutor()) {
            socket.setSoTimeout(5000);
            sendHeaders(socket);
            // Exceed the ordinary 100ms timeout while staying below the upload timeout.
            var sent = sender.schedule(() -> {
                socket.getOutputStream().write(BODY.getBytes(StandardCharsets.US_ASCII));
                socket.getOutputStream().flush();
                return null;
            }, 500, TimeUnit.MILLISECONDS);
            String response = new String(socket.getInputStream().readAllBytes(), StandardCharsets.US_ASCII);
            sent.get(5, TimeUnit.SECONDS);
            assertTrue(response.startsWith("HTTP/1.1 200"), response);
            assertTrue(response.endsWith("hello"), response);
        } finally {
            server.stop();
            server.destroy();
        }
    }

    @Test
    void stalledMultipartStillHasBoundedReadTimeout() throws Exception {
        WebServer server = server(200);
        try (Socket socket = new Socket("127.0.0.1", server.getPort())) {
            socket.setSoTimeout(5000);
            sendHeaders(socket);
            String response = new String(socket.getInputStream().readAllBytes(), StandardCharsets.US_ASCII);
            assertTrue(response.startsWith("HTTP/1.1 408"), response);
        } finally {
            server.stop();
            server.destroy();
        }
    }

    @Test
    void rejectsUnboundedTimeout() {
        assertThrows(IllegalArgumentException.class,
                () -> new UploadTimeoutConfig().uploadTimeoutCustomizer(0));
    }

    private WebServer server(int timeoutMs) {
        var factory = new TomcatServletWebServerFactory(0);
        factory.addConnectorCustomizers(connector ->
                ((AbstractHttp11Protocol<?>) connector.getProtocolHandler()).setConnectionTimeout(100));
        new UploadTimeoutConfig().uploadTimeoutCustomizer(timeoutMs).customize(factory);
        WebServer server = factory.getWebServer(context -> {
            var registration = context.addServlet("upload", new HttpServlet() {
                @Override
                protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
                    try {
                        response.getOutputStream().write(request.getPart("file").getInputStream().readAllBytes());
                    } catch (IOException | ServletException ex) {
                        response.setStatus(408);
                    }
                }
            });
            registration.addMapping("/upload");
            registration.setMultipartConfig(new MultipartConfigElement(System.getProperty("java.io.tmpdir")));
        });
        server.start();
        return server;
    }

    private void sendHeaders(Socket socket) throws IOException {
        String headers = "POST /upload HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n"
                + "Content-Type: multipart/form-data; boundary=test\r\nContent-Length: " + BODY.length() + "\r\n\r\n";
        socket.getOutputStream().write(headers.getBytes(StandardCharsets.US_ASCII));
        socket.getOutputStream().flush();
    }
}
