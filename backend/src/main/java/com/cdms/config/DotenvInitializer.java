package com.cdms.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class DotenvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger log = LoggerFactory.getLogger(DotenvInitializer.class);

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();

        Path dotenvPath = findDotenvFile();
        if (dotenvPath == null) {
            log.info("No .env file found, using system environment variables");
            return;
        }

        try {
            Map<String, Object> dotenvProperties = parseDotenv(dotenvPath);
            environment.getPropertySources()
                    .addFirst(new MapPropertySource("dotenv", dotenvProperties));
            log.info("Loaded {} properties from .env file: {}", dotenvProperties.size(), dotenvPath);
        } catch (IOException e) {
            log.warn("Failed to load .env file: {}", e.getMessage());
        }
    }

    private Path findDotenvFile() {
        Path path = Paths.get(".env");
        if (Files.exists(path)) return path.toAbsolutePath();

        path = Paths.get("backend/.env");
        if (Files.exists(path)) return path.toAbsolutePath();

        path = Paths.get(System.getProperty("user.dir"), ".env");
        if (Files.exists(path)) return path;

        return null;
    }

    private Map<String, Object> parseDotenv(Path path) throws IOException {
        Map<String, Object> properties = new HashMap<>();
        for (String line : Files.readAllLines(path)) {
            String trimmed = line.strip();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;

            int equalsIndex = trimmed.indexOf('=');
            if (equalsIndex <= 0) continue;

            String key = trimmed.substring(0, equalsIndex).strip();
            String value = trimmed.substring(equalsIndex + 1).strip();

            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length() - 1);
            }

            properties.put(key, value);
        }
        return properties;
    }
}
