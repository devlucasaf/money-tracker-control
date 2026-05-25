const formatCurrency = (value) => {
    if (value === null || value === undefined) {
        return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString) => {
    if (dateString === null || dateString === undefined) {
        return '';
    }
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
};

const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 4000);
};

const showSuccess = (msg) => showToast(msg, 'success');
const showError = (err) => showToast(err instanceof Error ? err.message : String(err), 'error');

export { formatCurrency, formatDate, showToast, showSuccess, showError };
