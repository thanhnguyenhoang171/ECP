package com.example.ecp_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Collections;

@SpringBootApplication
public class EcpApiApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(EcpApiApplication.class);

		app.setDefaultProperties(Collections.singletonMap("server.port", "9090"));
		app.run(args);

	}

}
