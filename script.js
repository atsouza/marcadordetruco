// Estado da aplicação (guardado em JSON)
let appState = {
    team1: {
        name: "Nós",
        score: 0,
        victories: 0
    },
    team2: {
        name: "Eles",
        score: 0,
        victories: 0
    },
    incrementValue: 1,
    maxScore: 12
};

// Histórico para a funcionalidade de restaurar
let history = [];

// Elementos da DOM
const elements = {
    team1: {
        nameInput: document.getElementById('name-team1'),
        scoreDisplay: document.getElementById('score-team1'),
        victoriesDisplay: document.getElementById('victories-team1'),
        btnScore: document.getElementById('btn-score-team1'),
        incrementPreview: document.getElementById('increment-preview-team1')
    },
    team2: {
        nameInput: document.getElementById('name-team2'),
        scoreDisplay: document.getElementById('score-team2'),
        victoriesDisplay: document.getElementById('victories-team2'),
        btnScore: document.getElementById('btn-score-team2'),
        incrementPreview: document.getElementById('increment-preview-team2')
    },
    trucoBtn: document.getElementById('btn-truco'),
    trucoValue: document.getElementById('current-increment'),
    trucoLabel: document.getElementById('truco-label'),
    undoBtn: document.getElementById('btn-undo'),
    resetBtn: document.getElementById('btn-reset'),
    btnMax12: document.getElementById('btn-max-12'),
    btnMax15: document.getElementById('btn-max-15'),
    modal: document.getElementById('victory-modal'),
    modalTitle: document.getElementById('victory-title'),
    modalMessage: document.getElementById('victory-message'),
    btnNextMatch: document.getElementById('btn-next-match'),
    resetModal: document.getElementById('reset-modal'),
    btnConfirmReset: document.getElementById('btn-confirm-reset'),
    btnCancelReset: document.getElementById('btn-cancel-reset')
};

// Salva o estado atual no histórico
function saveToHistory() {
    // Clonagem profunda do estado atual
    const stateCopy = JSON.parse(JSON.stringify(appState));
    history.push(stateCopy);
    elements.undoBtn.disabled = false;
}

// Atualiza a interface baseada no estado atual
function updateUI() {
    // Atualiza nomes
    if (document.activeElement !== elements.team1.nameInput) {
        elements.team1.nameInput.value = appState.team1.name;
    }
    if (document.activeElement !== elements.team2.nameInput) {
        elements.team2.nameInput.value = appState.team2.name;
    }

    // Atualiza pontuações
    elements.team1.scoreDisplay.textContent = appState.team1.score;
    elements.team2.scoreDisplay.textContent = appState.team2.score;

    // Atualiza vitórias
    elements.team1.victoriesDisplay.textContent = appState.team1.victories;
    elements.team2.victoriesDisplay.textContent = appState.team2.victories;

    // Atualiza botão de truco
    elements.trucoValue.textContent = appState.incrementValue;

    let label = 'Ponto';
    if (appState.incrementValue === 3) label = 'Truco!';
    if (appState.incrementValue === 6) label = 'Seis!';
    if (appState.incrementValue === 9) label = 'Nove!';
    if (appState.incrementValue === 12) label = 'Doze!';
    if (appState.incrementValue === 15) label = 'Quinze!';
    elements.trucoLabel.textContent = label;

    // Atualiza classes do botão de truco para estilo
    elements.trucoBtn.className = `btn-truco value-${appState.incrementValue}`;

    // Atualiza o preview nos botões de pontuar
    elements.team1.incrementPreview.textContent = `+${appState.incrementValue}`;
    elements.team2.incrementPreview.textContent = `+${appState.incrementValue}`;

    // Atualiza estado do botão desfazer
    elements.undoBtn.disabled = history.length === 0;

    // Atualiza classes dos botões de maxScore
    if (appState.maxScore === 12) {
        elements.btnMax12.classList.add('active');
        elements.btnMax15.classList.remove('active');
    } else {
        elements.btnMax15.classList.add('active');
        elements.btnMax12.classList.remove('active');
    }
}

// Adiciona pontos a um time
function addScore(teamId) {
    saveToHistory();

    appState[teamId].score += appState.incrementValue;

    // Animação de pontuação no display
    const displayElement = elements[teamId].scoreDisplay;
    displayElement.style.transform = 'scale(1.3)';
    displayElement.style.color = 'var(--accent-color)';
    setTimeout(() => {
        displayElement.style.transform = 'scale(1)';
        displayElement.style.color = '';
    }, 200);

    // Verifica vitória
    if (appState[teamId].score >= appState.maxScore) {
        appState[teamId].score = appState.maxScore; // Trava no máximo visualmente
        updateUI(); // Atualiza UI antes de mostrar modal
        showVictoryModal(teamId);
    } else {
        // Reseta o incremento para 1 se não houve vitória
        if (appState.incrementValue > 1) {
            appState.incrementValue = 1;
        }
        updateUI();
    }
}

// Lida com a mudança do valor da rodada (Truco)
function toggleTruco() {
    saveToHistory();

    // Ciclo do truco: 1 -> 3 -> 6 -> 9 -> 12 -> (15 se maxScore for 15) -> 1
    switch (appState.incrementValue) {
        case 1: appState.incrementValue = 3; break;
        case 3: appState.incrementValue = 6; break;
        case 6: appState.incrementValue = 9; break;
        case 9: appState.incrementValue = 12; break;
        case 12:
            if (appState.maxScore === 15) {
                appState.incrementValue = 15;
            } else {
                appState.incrementValue = 1;
            }
            break;
        case 15: appState.incrementValue = 1; break;
        default: appState.incrementValue = 1;
    }

    updateUI();
}

// Desfaz a última ação
function undo() {
    if (history.length > 0) {
        appState = history.pop();
        updateUI();
    }
}

// Mostra o modal de reiniciar
function showResetModal() {
    elements.resetModal.classList.add('show');
}

// Fecha o modal de reiniciar
function closeResetModal() {
    elements.resetModal.classList.remove('show');
}

// Zera todas as pontuações e vitórias
function resetAll() {
    saveToHistory();
    appState.team1.score = 0;
    appState.team1.victories = 0;
    appState.team1.name = "Nós";
    appState.team2.score = 0;
    appState.team2.victories = 0;
    appState.team2.name = "Eles";
    appState.incrementValue = 1;
    updateUI();
    closeResetModal();
}

// Mostra o modal de vitória
function showVictoryModal(teamId) {
    const teamName = appState[teamId].name;
    elements.modalTitle.textContent = "Vitória!";
    elements.modalMessage.textContent = `O time "${teamName}" atingiu ${appState.maxScore} pontos e ganhou a partida.`;
    elements.modal.classList.add('show');

    // Atualiza vitórias no estado, mas não atualiza a UI ainda
    appState[teamId].victories += 1;
}

// Prepara para a próxima partida
function nextMatch() {
    saveToHistory();
    appState.team1.score = 0;
    appState.team2.score = 0;
    appState.incrementValue = 1;
    elements.modal.classList.remove('show');
    updateUI();
}

// Atualiza o nome do time
function updateTeamName(teamId, newName) {
    appState[teamId].name = newName || (teamId === 'team1' ? 'Nós' : 'Eles');
    updateUI();
}

// Altera a pontuação máxima
function setMaxScore(value) {
    if (appState.maxScore !== value) {
        saveToHistory();
        appState.maxScore = value;
        // Se mudou para 12 e o incremento estava em 15, volta para 1
        if (value === 12 && appState.incrementValue === 15) {
            appState.incrementValue = 1;
        }
        updateUI();
    }
}

// Event Listeners
elements.team1.btnScore.addEventListener('click', () => addScore('team1'));
elements.team2.btnScore.addEventListener('click', () => addScore('team2'));

elements.trucoBtn.addEventListener('click', toggleTruco);
elements.undoBtn.addEventListener('click', undo);
elements.resetBtn.addEventListener('click', showResetModal);
elements.btnMax12.addEventListener('click', () => setMaxScore(12));
elements.btnMax15.addEventListener('click', () => setMaxScore(15));
elements.btnNextMatch.addEventListener('click', nextMatch);
elements.btnConfirmReset.addEventListener('click', resetAll);
elements.btnCancelReset.addEventListener('click', closeResetModal);

// Event Listeners para edição de nomes
elements.team1.nameInput.addEventListener('input', (e) => updateTeamName('team1', e.target.value));
elements.team2.nameInput.addEventListener('input', (e) => updateTeamName('team2', e.target.value));

// Inicialização
updateUI();
