package com.example.ecp_api.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@Slf4j
@Getter
public class MinioConfig {

    @Value("${minio.endpoint:172.17.0.1:9050}")
    private String endpoint;

    @Value("${minio.access-key:admin}")
    private String accessKey;

    @Value("${minio.secret-key:}")
    private String secretKey;

    @Value("${minio.use-ssl:false}")
    private boolean useSsl;

    @Value("${minio.bucket-name:ecp-media}")
    private String bucketName;

    @Value("${minio.public-url:}")
    private String publicUrl;

    @Bean
    public MinioClient minioClient() {
        String rawEndpoint = endpoint.trim();
        String host = rawEndpoint;
        int port = useSsl ? 443 : 9000;

        if (rawEndpoint.startsWith("http://")) {
            rawEndpoint = rawEndpoint.substring(7);
        } else if (rawEndpoint.startsWith("https://")) {
            rawEndpoint = rawEndpoint.substring(8);
        }

        if (rawEndpoint.contains("/")) {
            rawEndpoint = rawEndpoint.substring(0, rawEndpoint.indexOf("/"));
        }

        if (rawEndpoint.contains(":")) {
            String[] parts = rawEndpoint.split(":");
            host = parts[0];
            try {
                port = Integer.parseInt(parts[1]);
            } catch (NumberFormatException e) {
                log.warn("Invalid port in MinIO endpoint '{}', defaulting to {}", rawEndpoint, port);
            }
        } else {
            host = rawEndpoint;
        }

        log.info("Connecting to MinIO at host: {}, port: {}, useSSL: {}", host, port, useSsl);

        return MinioClient.builder()
                .endpoint(host, port, useSsl)
                .credentials(accessKey, secretKey)
                .build();
    }

    /**
     * Tự động khởi tạo Bucket và thiết lập Public Read policy (giống ValoPro)
     */
    @Bean
    public ApplicationRunner initMinioBucket(MinioClient minioClient) {
        return args -> {
            if (!StringUtils.hasText(bucketName)) {
                log.warn("MINIO_BUCKET_NAME chưa được cấu hình, bỏ qua khởi tạo MinIO.");
                return;
            }

            try {
                boolean exists = minioClient.bucketExists(
                        BucketExistsArgs.builder().bucket(bucketName).build()
                );

                if (!exists) {
                    minioClient.makeBucket(
                            MakeBucketArgs.builder().bucket(bucketName).build()
                    );
                    log.info("Tạo mới bucket MinIO: {}", bucketName);

                    // Thiết lập quyền Public Read cho phép browser tải ảnh trực tiếp (như ValoPro)
                    String publicPolicy = String.format("""
                            {
                              "Version": "2012-10-17",
                              "Statement": [
                                {
                                  "Effect": "Allow",
                                  "Principal": "*",
                                  "Action": ["s3:GetObject"],
                                  "Resource": ["arn:aws:s3:::%s/*"]
                                }
                              ]
                            }
                            """, bucketName);

                    minioClient.setBucketPolicy(
                            SetBucketPolicyArgs.builder()
                                    .bucket(bucketName)
                                    .config(publicPolicy)
                                    .build()
                    );
                    log.info("Đã thiết lập quyền Public Read cho bucket MinIO: {}", bucketName);
                } else {
                    log.info("MinIO bucket '{}' đã sẵn sàng", bucketName);
                }
            } catch (Exception e) {
                log.warn("Không thể kết nối MinIO lúc khởi động (sẽ kết nối lại khi có request): {}", e.getMessage());
            }
        };
    }
}
