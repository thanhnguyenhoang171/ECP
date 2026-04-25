package com.example.ecp_api;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Collections;
import java.util.Optional;

@SpringBootApplication
@Slf4j
public class EcpApiApplication {

	public static void main(String[] args) throws UnknownHostException {
		SpringApplication app = new SpringApplication(EcpApiApplication.class);

		app.setDefaultProperties(Collections.singletonMap("server.port", "9090"));
		ConfigurableApplicationContext context = app.run(args);

		Environment env = context.getEnvironment();
		String protocol = Optional.ofNullable(env.getProperty("server.ssl.key-store")).map(key -> "https").orElse("http");
		String hostAddress = InetAddress.getLocalHost().getHostAddress();
		String serverPort = env.getProperty("server.port");
		String contextPath = Optional.ofNullable(env.getProperty("server.servlet.context-path")).orElse("");

		log.info("""
			
			----------------------------------------------------------
			Application '{}' is running! Access URLs:
			Local: \t\t{}://localhost:{}{}
			External: \t{}://{}:{}{}
			Swagger UI: \t{}://localhost:{}{}/swagger-ui/index.html
			
			Databases:
			MySQL: \t\t{}
			MongoDB: \t{}
			----------------------------------------------------------""",
				env.getProperty("spring.application.name"),
				protocol, serverPort, contextPath,
				protocol, hostAddress, serverPort, contextPath,
				protocol, serverPort, contextPath,
				env.getProperty("spring.datasource.url"),
				env.getProperty("spring.data.mongodb.uri"));
	}
}
