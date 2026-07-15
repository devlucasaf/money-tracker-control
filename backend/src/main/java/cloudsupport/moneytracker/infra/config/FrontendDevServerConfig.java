package cloudsupport.moneytracker.infra.config;

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
    private Process processoFrontend;

    // --- SOBE O SERVIDOR VITE AO INICIAR A APLICAÇÃO ---
    @PostConstruct
    public void iniciarFrontend() {
        try {
            File diretorioFrontend = new File(System.getProperty("user.dir"), "frontend");
            if (!diretorioFrontend.exists()) {
                diretorioFrontend = new File(System.getProperty("user.dir"), "../frontend");
            }

            if (!diretorioFrontend.exists()) {
                log.warn("Diretório do frontend não encontrado. Ignorando o servidor de desenvolvimento do frontend.");
                return;
            }

            String npm = System.getProperty("os.name").toLowerCase().contains("win") ? "npm.cmd" : "npm";

            ProcessBuilder pb = new ProcessBuilder(npm, "run", "dev")
                    .directory(diretorioFrontend.getCanonicalFile())
                    .inheritIO();

            processoFrontend = pb.start();
            log.info("Servidor de desenvolvimento do frontend iniciado (porta 5173)");
        } catch (IOException e) {
            log.error("Falha ao iniciar o servidor de desenvolvimento do frontend: {}", e.getMessage());
        }
    }

    // --- FINALIZA O SERVIDOR AO PARAR A APLICAÇÃO ---
    @PreDestroy
    public void pararFrontend() {
        if (processoFrontend != null && processoFrontend.isAlive()) {
            processoFrontend.descendants().forEach(ProcessHandle::destroyForcibly);
            processoFrontend.destroyForcibly();
            log.info("Servidor de desenvolvimento do frontend encerrado");
        }
    }
}
