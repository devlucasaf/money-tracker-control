package cloudsupport.moneytracker.modules.transacao.model;

import java.time.LocalDate;

public enum FrequenciaRecorrencia {
    SEMANAL,
    MENSAL;

    // --- CALCULA A PRÓXIMA DATA A PARTIR DE UMA DATA BASE ---
    public LocalDate proximaData(LocalDate base) {
        return switch (this) {
            case SEMANAL -> base.plusWeeks(1);
            case MENSAL  -> base.plusMonths(1);
        };
    }
}

