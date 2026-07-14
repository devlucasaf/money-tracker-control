package com.moneytracker.infra.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.io.File;
import java.io.IOException;

@Configuration
@Profile("local")
public class FrontendDevServerConfig {

    private static final Logger log = LoggerFactory.getLogger(FrontendDevServerConfig.class);
    private Process frontendProcess;

    @PostConstruct
    public void startFrontend() {
        try {
            File frontendDir = new File(System.getProperty("user.dir"), "frontend");
            if (!frontendDir.exists()) {
                frontendDir = new File(System.getProperty("user.dir"), "../frontend");
            }

            if (!frontendDir.exists()) {
                log.warn("Frontend directory not found. Skipping frontend dev server.");
                return;
            }

            String npm = System.getProperty("os.name").toLowerCase().contains("win") ? "npm.cmd" : "npm";

            ProcessBuilder pb = new ProcessBuilder(npm, "run", "dev")
                    .directory(frontendDir.getCanonicalFile())
                    .inheritIO();

            frontendProcess = pb.start();
            log.info("Frontend dev server started (port 5173)");
        } catch (IOException e) {
            log.error("Failed to start frontend dev server: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void stopFrontend() {
        if (frontendProcess != null && frontendProcess.isAlive()) {
            frontendProcess.descendants().forEach(ProcessHandle::destroyForcibly);
            frontendProcess.destroyForcibly();
            log.info("Frontend dev server stopped");
        }
    }
}
