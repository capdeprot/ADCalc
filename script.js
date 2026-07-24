// ==============================
// CONFIGURAÇÃO JSONBIN
// ==============================
const JSONBIN_CONFIG = window.JSONBIN_CONFIG || {
    BIN_ID: '6989462543b1c97be97049c4',
    API_KEY: '$2a$10$swTxyIonZHKjAs9AgVv7VOBgh3Qz8ArBujv6z7fWTNtkXvgr/TCZC',
    UPDATE_INTERVAL: 30000
};

const JSONBIN_LATEST = `https://api.jsonbin.io/v3/b/${JSONBIN_CONFIG.BIN_ID}/latest`;
const JSONBIN_UPDATE = `https://api.jsonbin.io/v3/b/${JSONBIN_CONFIG.BIN_ID}`;

// ==============================
// VARIÁVEIS GLOBAIS
// ==============================
let sessionTotal = 0;
let realGlobalTotal = 0;
let totalCalculations = 0;
let lastUpdateTime = null;
let currentCalculatedValue = 0;
let isOnline = true;
let updateInterval = null;
let outorgaEnabled = false;
const OUTORGA_VALUE = 627.00;

// ==============================
// INICIALIZAÇÃO
// ==============================
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            calculate();
        }
    });
    
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Inicializando AD Calc com JSONBin...');
    loadSessionCounter();
    await loadRealGlobalCounter();
    startPolling();
    setupConnectionIndicator();
    console.log('✅ AD Calc inicializado com sucesso!');
}

// ==============================
// CONTADOR DA SESSÃO (LOCAL)
// ==============================
function loadSessionCounter() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('adcalc_session_date');
    
    if (savedDate === today) {
        sessionTotal = parseFloat(localStorage.getItem('adcalc_session_total')) || 0;
    } else {
        sessionTotal = 0;
        localStorage.setItem('adcalc_session_total', '0');
        localStorage.setItem('adcalc_session_date', today);
    }
    
    updateSessionCounter();
}

function updateSessionCounter() {
    const sessionCounter = document.getElementById('sessionCounter');
    if (sessionCounter) {
        sessionCounter.textContent = formatCurrency(sessionTotal);
    }
}

// ==============================
// CONTADOR GLOBAL REAL (JSONBIN)
// ==============================
async function loadRealGlobalCounter() {
    try {
        console.log('📡 Buscando total global do JSONBin...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(JSONBIN_LATEST, {
            headers: {
                'X-Access-Key': JSONBIN_CONFIG.API_KEY,
                'X-Bin-Meta': 'false'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (data && typeof data.total !== 'undefined') {
            realGlobalTotal = parseFloat(data.total) || 0;
            totalCalculations = parseInt(data.count) || 0;
            lastUpdateTime = data.lastUpdated || new Date().toISOString();
            
            updateGlobalCounterDisplay();
            
            localStorage.setItem('adcalc_real_global', realGlobalTotal.toString());
            localStorage.setItem('adcalc_last_update', lastUpdateTime);
            
            isOnline = true;
            updateConnectionStatus(true);
            
            console.log(`✅ Total global: ${formatCurrency(realGlobalTotal)}`);
            
        } else {
            console.log('⚠️ Inicializando bin...');
            await initializeBin();
            await loadRealGlobalCounter();
        }
        
    } catch (error) {
        console.warn('⚠️ Usando cache local:', error.message);
        
        const cachedTotal = localStorage.getItem('adcalc_real_global');
        const cachedUpdate = localStorage.getItem('adcalc_last_update');
        
        if (cachedTotal) {
            realGlobalTotal = parseFloat(cachedTotal);
            lastUpdateTime = cachedUpdate;
            updateGlobalCounterDisplay();
        }
        
        isOnline = false;
        updateConnectionStatus(false);
    }
}

async function initializeBin() {
    try {
        const initialData = {
            total: 0,
            count: 0,
            lastUpdated: new Date().toISOString(),
            created: new Date().toISOString(),
            description: "AD Calc - Total de cálculos dos usuários",
            version: "1.0"
        };
        
        const response = await fetch(JSONBIN_UPDATE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': JSONBIN_CONFIG.API_KEY
            },
            body: JSON.stringify(initialData)
        });
        
        if (response.ok) {
            console.log('✅ Bin inicializado!');
            return true;
        }
        
        throw new Error('Falha na inicialização');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar bin:', error);
        return false;
    }
}

async function addToRealGlobalCounter(value) {
    if (!value || isNaN(value) || value <= 0) return false;
    
    try {
        console.log(`🔄 Adicionando ${formatCurrency(value)} ao total global...`);
        
        const response = await fetch(JSONBIN_LATEST, {
            headers: {
                'X-Access-Key': JSONBIN_CONFIG.API_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!response.ok) throw new Error('Falha ao buscar dados');
        
        const currentData = await response.json();
        const currentTotal = parseFloat(currentData.total) || 0;
        const currentCount = parseInt(currentData.count) || 0;
        
        const newTotal = currentTotal + value;
        const newCount = currentCount + 1;
        
        console.log(`📊 Novo total: ${formatCurrency(currentTotal)} + ${formatCurrency(value)} = ${formatCurrency(newTotal)}`);
        console.log(`📊 Total de cálculos: ${currentCount} → ${newCount}`);
        
        const updateData = {
            total: newTotal,
            count: newCount,
            lastUpdated: new Date().toISOString(),
            lastCalculation: value,
            lastCalculationValue: value,
            description: "AD Calc - Total de cálculos dos usuários"
        };
        
        const updateResponse = await fetch(JSONBIN_UPDATE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': JSONBIN_CONFIG.API_KEY,
                'X-Bin-Versioning': 'false'
            },
            body: JSON.stringify(updateData)
        });
        
        if (updateResponse.ok) {
            realGlobalTotal = newTotal;
            totalCalculations = newCount;
            lastUpdateTime = updateData.lastUpdated;
            
            updateGlobalCounterDisplay();
            animateGlobalCounter();
            animateGlobalStats();
            
            localStorage.setItem('adcalc_real_global', newTotal.toString());
            localStorage.setItem('adcalc_total_calculations', newCount.toString());
            localStorage.setItem('adcalc_last_update', lastUpdateTime);
            
            console.log(`✅ Total global atualizado: ${formatCurrency(newTotal)} (${newCount} cálculos)`);
            
            return true;
        } else {
            throw new Error('Falha na atualização');
        }
        
    } catch (error) {
        console.error('❌ Erro ao atualizar:', error);
        savePendingUpdate(value);
        isOnline = false;
        updateConnectionStatus(false);
        return false;
    }
}

// ==============================
// FUNÇÕES DE ATUALIZAÇÃO E DISPLAY
// ==============================
function updateGlobalCounterDisplay() {
    const globalCounter = document.getElementById('globalCounter');
    const globalStats = document.getElementById('globalStats');
    const globalCount = document.getElementById('globalCount');
    const lastUpdateElement = document.getElementById('lastUpdate');
    
    if (globalCounter) {
        globalCounter.textContent = formatCurrency(realGlobalTotal);
        
        if (globalCount) {
            globalCount.textContent = totalCalculations.toLocaleString('pt-BR');
        }
        
        let tooltip = `💰 Total acumulado: ${formatCurrency(realGlobalTotal)}`;
        if (totalCalculations > 0) {
            tooltip += `\n🧮 ${totalCalculations.toLocaleString('pt-BR')} cálculo${totalCalculations !== 1 ? 's' : ''}`;
            const avg = realGlobalTotal / totalCalculations;
            tooltip += `\n📊 Média por cálculo: ${formatCurrency(avg)}`;
        }
        if (lastUpdateTime) {
            const updateDate = new Date(lastUpdateTime);
            tooltip += `\n🕐 Última atualização: ${updateDate.toLocaleString('pt-BR')}`;
        }
        tooltip += `\n📡 Status: ${isOnline ? 'Online ✅' : 'Offline ⚠️'}`;
        globalCounter.title = tooltip;
    }
    
    if (lastUpdateElement && lastUpdateTime) {
        const updateDate = new Date(lastUpdateTime);
        const now = new Date();
        const diffMinutes = Math.floor((now - updateDate) / (1000 * 60));
        
        if (diffMinutes < 1) {
            lastUpdateElement.textContent = 'Agora mesmo';
        } else if (diffMinutes < 60) {
            lastUpdateElement.textContent = `há ${diffMinutes} min`;
        } else {
            lastUpdateElement.textContent = `há ${Math.floor(diffMinutes/60)}h`;
        }
        
        lastUpdateElement.title = `Última sincronização: ${updateDate.toLocaleString('pt-BR')}`;
    }
}

function animateGlobalCounter() {
    const globalCounter = document.getElementById('globalCounter');
    if (globalCounter) {
        globalCounter.classList.add('updated');
        setTimeout(() => globalCounter.classList.remove('updated'), 1000);
    }
}

// ==============================
// POLLING E CONEXÃO
// ==============================
function startPolling() {
    if (updateInterval) clearInterval(updateInterval);
    
    updateInterval = setInterval(async () => {
        await loadRealGlobalCounter();
    }, JSONBIN_CONFIG.UPDATE_INTERVAL);
    
    console.log(`🔄 Polling iniciado (${JSONBIN_CONFIG.UPDATE_INTERVAL/1000}s)`);
}

function setupConnectionIndicator() {
    setInterval(() => {
        checkConnection();
    }, 10000);
}

function checkConnection() {
    fetch('https://api.jsonbin.io/', { 
        method: 'HEAD',
        mode: 'no-cors'
    }).then(() => {
        if (!isOnline) {
            isOnline = true;
            updateConnectionStatus(true);
            console.log('🌐 Conexão restaurada');
            syncPendingUpdates();
        }
    }).catch(() => {
        if (isOnline) {
            isOnline = false;
            updateConnectionStatus(false);
            console.warn('⚠️ Conexão perdida');
        }
    });
}

function updateConnectionStatus(online) {
    isOnline = online;
    const globalCounter = document.getElementById('globalCounter');
    
    if (globalCounter) {
        if (online) {
            globalCounter.style.opacity = '1';
            globalCounter.style.color = '';
        } else {
            globalCounter.style.opacity = '0.8';
            globalCounter.style.color = '#f59e0b';
        }
    }
}

// ==============================
// FUNÇÕES UTILITÁRIAS
// ==============================
function formatCurrency(value) {
    return 'R$ ' + value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatCurrencyForCopy(value) {
    return value.toFixed(2).replace('.', '.');
}

function savePendingUpdate(value) {
    const pendingUpdates = JSON.parse(localStorage.getItem('adcalc_pending_updates') || '[]');
    pendingUpdates.push({
        value: value,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('adcalc_pending_updates', JSON.stringify(pendingUpdates));
    console.log(`💾 Salvo localmente: ${formatCurrency(value)}`);
}

async function syncPendingUpdates() {
    if (!isOnline) return;
    
    const pendingUpdates = JSON.parse(localStorage.getItem('adcalc_pending_updates') || '[]');
    if (pendingUpdates.length === 0) return;
    
    console.log(`🔄 Sincronizando ${pendingUpdates.length} pendências...`);
    
    for (const update of pendingUpdates) {
        const success = await addToRealGlobalCounter(update.value);
        if (success) {
            const index = pendingUpdates.indexOf(update);
            if (index > -1) pendingUpdates.splice(index, 1);
        }
    }
    
    localStorage.setItem('adcalc_pending_updates', JSON.stringify(pendingUpdates));
}

// ==============================
// OUTORGA ONEROSA
// ==============================
function toggleOutorga() {
    const toggle = document.getElementById('outorgaToggle');
    const outorgaContainer = document.getElementById('outorgaResultadoContainer');
    const resultadoContainer = document.getElementById('resultadoContainer');
    
    outorgaEnabled = toggle.checked;
    
    const switchWrapper = toggle.closest('.switch-wrapper');
    if (outorgaEnabled) {
        switchWrapper.classList.add('active');
        if (resultadoContainer.style.display !== 'none') {
            outorgaContainer.style.display = 'block';
            outorgaContainer.style.animation = 'fadeIn 0.3s ease-out';
            resultadoContainer.classList.add('has-outorga');
        }
    } else {
        switchWrapper.classList.remove('active');
        outorgaContainer.style.display = 'none';
        resultadoContainer.classList.remove('has-outorga');
    }
}

function copyOutorgaResult() {
    const valueToCopy = OUTORGA_VALUE.toFixed(2);
    
    navigator.clipboard.writeText(valueToCopy)
        .then(() => {
            showCopyFeedback('Valor da Outorga copiado!', 'success');
        })
        .catch(err => {
            console.error('Erro ao copiar:', err);
            try {
                const textArea = document.createElement('textarea');
                textArea.value = valueToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showCopyFeedback('Valor da Outorga copiado!', 'success');
            } catch (fallbackErr) {
                showCopyFeedback('Erro ao copiar', 'error');
            }
        });
}

// ==============================
// COPIAR RESULTADO
// ==============================
function copyResult() {
    if (!currentCalculatedValue || currentCalculatedValue <= 0) {
        showCopyFeedback('Nenhum valor para copiar', 'error');
        return;
    }
    
    const valueToCopy = formatCurrencyForCopy(currentCalculatedValue);
    
    navigator.clipboard.writeText(valueToCopy)
        .then(() => {
            showCopyFeedback('Valor copiado!', 'success');
            console.log('📋 Copiado:', valueToCopy);
        })
        .catch(err => {
            console.error('Erro ao copiar:', err);
            try {
                const textArea = document.createElement('textarea');
                textArea.value = valueToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showCopyFeedback('Valor copiado!', 'success');
            } catch (fallbackErr) {
                showCopyFeedback('Erro ao copiar', 'error');
            }
        });
}

function showCopyFeedback(message, type) {
    const feedbackElement = document.getElementById('copyFeedback');
    if (!feedbackElement) return;
    
    feedbackElement.textContent = message;
    feedbackElement.className = 'copy-feedback ' + type;
    feedbackElement.style.display = 'block';
    
    setTimeout(() => {
        feedbackElement.style.display = 'none';
    }, 3000);
}

// ==============================
// ATUALIZAR CONTADORES
// ==============================
function updateCounters(value) {
    if (!value || isNaN(value) || value <= 0) return;
    
    sessionTotal += value;
    localStorage.setItem('adcalc_session_total', sessionTotal.toString());
    updateSessionCounter();
    
    addToRealGlobalCounter(value);
    
    const sessionCounter = document.getElementById('sessionCounter');
    if (sessionCounter) {
        sessionCounter.classList.add('updated');
        setTimeout(() => sessionCounter.classList.remove('updated'), 300);
    }
}

// ==============================
// FUNÇÕES ORIGINAIS DO SIMULADOR
// ==============================
function changeLabel() {
    document.getElementById('area').value = '';
    document.getElementById('areaConstruida').value = '';
    document.getElementById('quantidadeUnidades').value = '1';
    document.getElementById('areaTotalUso').value = '';
    document.getElementById('areaTotalReformar').value = '';
    document.getElementById('areaTotalRegularizar').value = '';
    document.getElementById('areaTotalConstruir').value = '';
    document.getElementById('areaConstruirAprovado').value = '';
    document.getElementById('areaReformarAprovado').value = '';
    document.getElementById('areaRegularizarAprovado').value = '';
    document.getElementById('areaTotalAprovado').value = '';
    document.getElementById('areaConstruirModificativo').value = '';
    document.getElementById('areaReformarModificativo').value = '';
    document.getElementById('areaRegularizarModificativo').value = '';
    document.getElementById('areaTotalModificativo').value = '';
    
    document.getElementById('resultadoContainer').style.display = 'none';
    document.getElementById('resultado').textContent = '';
    document.getElementById('copyFeedback').style.display = 'none';
    
    var assunto = document.getElementById('assunto').value;
    var areaLabel = document.getElementById('areaLabel');
    var areaStandardContainer = document.getElementById('areaStandardContainer');
    var areaConstruidaContainer = document.getElementById('areaConstruidaContainer');
    var reformaContainer = document.getElementById('reformaContainer');
    var quantidadeUnidadesContainer = document.getElementById('quantidadeUnidadesContainer');
    var projetoModificativoContainer = document.getElementById('projetoModificativoReformaContainer');

    areaStandardContainer.style.display = 'none';
    areaConstruidaContainer.style.display = 'none';
    reformaContainer.style.display = 'none';
    quantidadeUnidadesContainer.style.display = 'none';
    projetoModificativoContainer.style.display = 'none';

    switch (assunto) {
        case 'reforma':
            reformaContainer.style.display = 'block';
            break;

        case 'projeto_modificativo_edificacao':
            areaConstruidaContainer.style.display = 'block';
            areaStandardContainer.style.display = 'block';
            document.querySelector('#areaConstruidaContainer label').textContent = 'Área total construída no alvará (m²):';
            areaLabel.textContent = 'Área total na planta do Projeto Modificativo (m²):';
            break;
            
        case 'projeto_modificativo_reforma':
            projetoModificativoContainer.style.display = 'block';
            break;

        case 'edificacao_nova':
            areaStandardContainer.style.display = 'block';
            areaLabel.textContent = 'Área a construir (m²):';
            break;

        case 'revalidacao':
            areaStandardContainer.style.display = 'block';
            areaLabel.textContent = 'Área total construída no alvará a ser revalidado (m²):';
            break;
        
        case 'avanco_grua':
        case 'tapume':
            areaStandardContainer.style.display = 'block';
            quantidadeUnidadesContainer.style.display = 'block';
            areaLabel.textContent = 'Informe a área construída em m²:';
            break;

        case 'tanques_bombas':
            areaStandardContainer.style.display = 'block';
            areaLabel.textContent = 'Informe a quantidade de equipamentos:';
            break;

        case 'acessibilidade':
        case 'sistema_seguranca':
        case 'certificado_seguranca':
            areaStandardContainer.style.display = 'block';
            areaConstruidaContainer.style.display = 'block';
            areaLabel.textContent = 'Área objeto do pedido (m²):';
            document.querySelector('#areaConstruidaContainer label').textContent = 'Área total construída (m²):';
            break;

        default:
            areaStandardContainer.style.display = 'block';
            areaLabel.textContent = 'Área objeto do pedido (m²):';
            break;
    }
    
    // Controle da Outorga
    const outorgaContainer = document.getElementById('outorgaContainer');
    const outorgaResultadoContainer = document.getElementById('outorgaResultadoContainer');
    const assuntosComOutorga = [
        'edificacao_nova',
        'reforma',
        'projeto_modificativo_edificacao',
        'projeto_modificativo_reforma'
    ];
    
    if (assuntosComOutorga.includes(assunto)) {
        outorgaContainer.style.display = 'block';
        const toggle = document.getElementById('outorgaToggle');
        if (toggle) {
            toggle.checked = false;
            outorgaEnabled = false;
            const switchWrapper = toggle.closest('.switch-wrapper');
            if (switchWrapper) switchWrapper.classList.remove('active');
        }
        outorgaResultadoContainer.style.display = 'none';
        document.getElementById('resultadoContainer').classList.remove('has-outorga');
    } else {
        outorgaContainer.style.display = 'none';
        outorgaResultadoContainer.style.display = 'none';
        document.getElementById('resultadoContainer').classList.remove('has-outorga');
        const toggle = document.getElementById('outorgaToggle');
        if (toggle) {
            toggle.checked = false;
            outorgaEnabled = false;
            const switchWrapper = toggle.closest('.switch-wrapper');
            if (switchWrapper) switchWrapper.classList.remove('active');
        }
    }
}

function calculate() {
    var assunto = document.getElementById('assunto').value;

    if (!assunto) {
        alert("Por favor, selecione uma opção válida.");
        return;
    }

    var resultado = document.getElementById('resultado');
    var resultadoContainer = document.getElementById('resultadoContainer');
    var copyFeedback = document.getElementById('copyFeedback');
    var valor;

    function validateRequired(value, fieldName) {
        if (value === '' || isNaN(parseFloat(value))) {
            alert("Por favor, informe " + fieldName);
            return false;
        }
        return true;
    }

    function parseOptional(value) {
        return value === '' ? 0 : parseFloat(value);
    }

    switch (assunto) {
        case 'edificacao_nova':
            var area = document.getElementById('area').value;
            if (!validateRequired(area, 'a área a construir')) return;
            area = parseFloat(area);
            
            if (area <= 1500) {
                valor = area * 6.97;
            } else if (area <= 20000) {
                valor = area * 9.31;
            } else {
                valor = area * 12.41;
            }
            break;

        case 'reforma':
            var areaTotalUso = document.getElementById('areaTotalUso').value;
            var areaTotalReformar = document.getElementById('areaTotalReformar').value;
            var areaTotalRegularizar = document.getElementById('areaTotalRegularizar').value;
            var areaTotalConstruir = document.getElementById('areaTotalConstruir').value;
            
            if (!validateRequired(areaTotalUso, 'a Área Total referente ao uso indicado')) return;
            
            areaTotalUso = parseFloat(areaTotalUso);
            areaTotalReformar = parseOptional(areaTotalReformar);
            areaTotalRegularizar = parseOptional(areaTotalRegularizar);
            areaTotalConstruir = parseOptional(areaTotalConstruir);
            
            if (areaTotalUso <= 1500) {
                valor = (areaTotalReformar * 6.97) + (areaTotalRegularizar * 6.19) + (areaTotalConstruir * 6.97);
            } else if (areaTotalUso <= 20000) {
                valor = (areaTotalReformar * 9.31) + (areaTotalRegularizar * 9.31) + (areaTotalConstruir * 9.31);
            } else {
                valor = (areaTotalReformar * 12.41) + (areaTotalRegularizar * 12.41) + (areaTotalConstruir * 12.41);
            }
            break;

        case 'revalidacao':
            var area = document.getElementById('area').value;
            if (!validateRequired(area, 'a área total construída')) return;
            area = parseFloat(area);
            valor = area * 3.11;
            break;
        
        case 'projeto_modificativo_edificacao':
            var area = document.getElementById('area').value;
            var areaConstruida = document.getElementById('areaConstruida').value;
            
            if (!validateRequired(area, 'a área total na planta do Projeto Modificativo')) return;
            if (!validateRequired(areaConstruida, 'a área total construída no alvará')) return;
            
            area = parseFloat(area);
            areaConstruida = parseFloat(areaConstruida);
            
            if (area <= 1500) {
              if (area <= areaConstruida) {
                valor = area * 3.89;
              } else {
                valor = (area - areaConstruida) * 6.97 + (areaConstruida * 3.89);
              }
            } else if (area <= 20000) {
                if (area <= areaConstruida) {
                valor = area * 4.66;
              } else {
                valor = (area - areaConstruida) * 9.31 + (areaConstruida * 4.66);
              }
            } else {
                if (area <= areaConstruida) {
                valor = area * 6.19;
              } else {
                valor = (area - areaConstruida) * 12.41 + (areaConstruida * 6.19);
              }
            }
            break;

        case 'projeto_modificativo_reforma':
            var areaConstruirAprovado = document.getElementById('areaConstruirAprovado').value;
            var areaReformarAprovado = document.getElementById('areaReformarAprovado').value;
            var areaTotalAprovado = document.getElementById('areaTotalAprovado').value;
            var areaConstruirModificativo = document.getElementById('areaConstruirModificativo').value;
            var areaReformarModificativo = document.getElementById('areaReformarModificativo').value;
            var areaTotalModificativo = document.getElementById('areaTotalModificativo').value;
            
            if (!validateRequired(areaConstruirAprovado, 'a área a construir do projeto aprovado')) return;
            if (!validateRequired(areaReformarAprovado, 'a área a reformar do projeto aprovado')) return;
            if (!validateRequired(areaTotalAprovado, 'a área total do projeto aprovado')) return;
            if (!validateRequired(areaConstruirModificativo, 'a área a construir do projeto modificativo')) return;
            if (!validateRequired(areaReformarModificativo, 'a área a reformar do projeto modificativo')) return;
            if (!validateRequired(areaTotalModificativo, 'a área total do projeto modificativo')) return;
            
            areaConstruirAprovado = parseFloat(areaConstruirAprovado);
            areaReformarAprovado = parseFloat(areaReformarAprovado);
            areaTotalAprovado = parseFloat(areaTotalAprovado);
            areaConstruirModificativo = parseFloat(areaConstruirModificativo);
            areaReformarModificativo = parseFloat(areaReformarModificativo);
            areaTotalModificativo = parseFloat(areaTotalModificativo);
            
            var areaRegularizarAprovado = parseOptional(document.getElementById('areaRegularizarAprovado').value);
            var areaRegularizarModificativo = parseOptional(document.getElementById('areaRegularizarModificativo').value);
            
            var diferencaConstruir = Math.max(0, areaConstruirModificativo - areaConstruirAprovado);
            var diferencaReformar = Math.max(0, areaReformarModificativo - areaReformarAprovado);
            var diferencaRegularizar = Math.max(0, areaRegularizarModificativo - areaRegularizarAprovado);
            var areaModificada;
            
            if (areaTotalModificativo <= areaTotalAprovado){
                areaModificada = areaTotalAprovado - areaTotalModificativo;
            } else {
                areaModificada = areaTotalModificativo - areaTotalAprovado;
            }
            
            if (areaTotalModificativo <= 1500) {
                areaModificada = areaModificada * 1.55;
                diferencaConstruir = diferencaConstruir * 6.97;
                diferencaReformar = diferencaReformar * 6.97;
                diferencaRegularizar = diferencaRegularizar * 6.19;
            } else if (areaTotalModificativo <= 20000){
                areaModificada = areaModificada * 3.11;
                diferencaConstruir = diferencaConstruir * 9.31;
                diferencaReformar = diferencaReformar * 9.31;
                diferencaRegularizar = diferencaRegularizar * 9.31;
            } else {
                areaModificada = areaModificada * 4.66;
                diferencaConstruir = diferencaConstruir * 12.41;
                diferencaReformar = diferencaReformar * 12.41;
                diferencaRegularizar = diferencaRegularizar * 12.41;
            }

            valor = (areaModificada + diferencaConstruir + diferencaReformar + diferencaRegularizar);
            break;

        case 'avanco_grua':
        case 'tapume':
            var area = parseFloat(document.getElementById('area').value);
            var quantidadeUnidades = parseFloat(document.getElementById('quantidadeUnidades').value);
            
            if (area <= 1500) {
                valor = 1085.23 * quantidadeUnidades;
            } else if (area > 1500) {
                valor = 2170.51 * quantidadeUnidades;
            } else {
                valor = 0;
            }
            break;

        case 'alvara_heliponto':
            valor = 2260.00;
            break;

        case 'execucao_erb':
            valor = 250.00;
            break;

        case 'estande_vendas':
            var area = document.getElementById('area').value;
            if (!validateRequired(area, 'a área')) return;
            area = parseFloat(area);
            valor = area * 3.11;
            break;

        case 'acessibilidade':
            var area = document.getElementById('area').value;
            var areaConstruida = document.getElementById('areaConstruida').value;
            
            if (!validateRequired(area, 'a área objeto do pedido')) return;
            if (!validateRequired(areaConstruida, 'a área total construída')) return;
            
            area = parseFloat(area);
            areaConstruida = parseFloat(areaConstruida);
            
            if (areaConstruida <= 1500) {
                valor = area * 3.11;
            } else if (areaConstruida <= 20000) {
                valor = area * 4.66;
            } else if (areaConstruida > 20000) {
                valor = area * 6.19;
            } else {
                valor = 0;
            }
            break;

        case 'reuniao':
            var area = document.getElementById('area').value;
            if (!validateRequired(area, 'a área')) return;
            area = parseFloat(area);
            valor = area * 3.25;
            break;

        case 'sistema_seguranca':
        case 'certificado_seguranca':
            var area = document.getElementById('area').value;
            var areaConstruida = document.getElementById('areaConstruida').value;
            
            if (!validateRequired(area, 'a área objeto do pedido')) return;
            if (!validateRequired(areaConstruida, 'a área total construída')) return;
            
            area = parseFloat(area);
            areaConstruida = parseFloat(areaConstruida);
            
            if (areaConstruida <= 20000) {
                valor = area * 3.11;
            } else {
                valor = area * 6.19;
            }
            break;

        case 'certificado_manutencao':
            var area = document.getElementById('area').value;
            if (!validateRequired(area, 'a área')) return;
            area = parseFloat(area);
            valor = area * 1.90;
            break;

        case 'tanques_bombas':
            var area = document.getElementById('area').value;
            if (!validateRequired(area, 'a quantidade de equipamentos')) return;
            area = parseFloat(area);
            valor = area * 232.56;
            break;

        case 'desmembramento_remembramento':
        case 'diretrizes_urbanisticas':
            var area = document.getElementById('area').value;
            if (!validateRequired(area, 'a área')) return;
            area = parseFloat(area);
            valor = area * 0.35;
            break;

        case 'reparcelamento':
            var area = document.getElementById('area').value;
            if (!validateRequired(area, 'a área')) return;
            area = parseFloat(area);
            valor = area * 0.30;
            break;

        case 'execucao':
            valor = 1116.27;
            break;

        default:
            valor = 0;
    }

    valor = Math.round(valor * 100) / 100;
    currentCalculatedValue = valor;
    
    // Verificar se outorga está ativa
    const outorgaEnabled_local = document.getElementById('outorgaToggle')?.checked || false;
    const outorgaContainer = document.getElementById('outorgaResultadoContainer');
    
    // Exibir resultado base
    resultado.textContent = formatCurrency(valor);
    resultadoContainer.style.display = 'block';
    copyFeedback.style.display = 'none';
    
    // Mostrar ou ocultar outorga separadamente
    if (outorgaEnabled_local) {
        outorgaContainer.style.display = 'block';
        outorgaContainer.style.animation = 'fadeIn 0.3s ease-out';
        resultadoContainer.classList.add('has-outorga');
    } else {
        outorgaContainer.style.display = 'none';
        resultadoContainer.classList.remove('has-outorga');
    }
    
    resultadoContainer.style.animation = 'none';
    setTimeout(() => {
        resultadoContainer.style.animation = 'fadeIn 0.5s ease-out';
    }, 10);
    
    updateCounters(valor);
    syncPendingUpdates();
    
    resultadoContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==============================
// ANIMAÇÃO DAS ESTATÍSTICAS
// ==============================
function animateGlobalStats() {
    const globalStats = document.getElementById('globalStats');
    const globalCount = document.getElementById('globalCount');
    
    if (globalStats) {
        globalStats.classList.add('updated');
        setTimeout(() => {
            globalStats.classList.remove('updated');
        }, 500);
    }
    
    if (globalCount) {
        globalCount.style.transform = 'scale(1.2)';
        globalCount.style.color = '#3b82f6';
        setTimeout(() => {
            globalCount.style.transform = 'scale(1)';
            globalCount.style.color = '';
        }, 500);
    }
}
