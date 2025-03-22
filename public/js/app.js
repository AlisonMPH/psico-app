// Função para obter o dia atual no formato "Segunda", "Terça", etc.
function getDiaAtual() {
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const hoje = new Date();
    return dias[hoje.getDay()];
}

// Função para gerar horários de 1 em 1 hora (último horário às 17:00)
function gerarHorarios() {
    const horarios = [];
    for (let hora = 7; hora <= 17; hora++) { // Até 17:00
        if (hora !== 12) { // Ignorar o horário de almoço
            horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        }
    }
    return horarios;
}

// Função para exibir os horários disponíveis
function exibirHorariosDisponiveis() {
    const horariosDisponiveis = document.getElementById('horariosDisponiveis');
    if (!horariosDisponiveis) return; // Verifica se o elemento existe

    const horarios = gerarHorarios();
    let html = '';
    horarios.forEach(horario => {
        html += `<label><input type="checkbox" class="horario" value="${horario}"> ${horario}</label>`;
    });
    horariosDisponiveis.innerHTML = html;
}

// Função para carregar e exibir a agenda do dia
function carregarAgenda() {
    const diaAtual = getDiaAtual();

    getAllData('psicologos', function(psicologos) {
        getAllData('pacientes', function(pacientes) {
            getAllData('ats', function(ats) {
                const psicologosGrid = document.getElementById('psicologosGrid');
                const pacientesGrid = document.getElementById('pacientesGrid');
                const atsGrid = document.getElementById('atsGrid');

                if (psicologosGrid) psicologosGrid.innerHTML = '';
                if (pacientesGrid) pacientesGrid.innerHTML = '';
                if (atsGrid) atsGrid.innerHTML = '';

                // Filtrar psicólogos, pacientes e ATs para o dia atual
                const psicologosDoDia = psicologos.filter(p => p.horarios.some(h => h.startsWith(diaAtual)));
                const pacientesDoDia = pacientes.filter(p => p.horarios.some(h => h.startsWith(diaAtual)));
                const atsDoDia = ats.filter(a => a.horarios.some(h => h.startsWith(diaAtual)));

                // Exibir psicólogos
                psicologosDoDia.forEach(psicologo => {
                    const item = document.createElement('div');
                    item.className = 'grid-item';
                    item.innerHTML = `
                        <h3>${psicologo.nome}</h3>
                        <p><strong>Horários:</strong></p>
                        <ul>
                            ${psicologo.horarios.filter(h => h.startsWith(diaAtual)).map(h => `<li>${h}</li>`).join('')}
                        </ul>
                        <button class="excluir-btn" onclick="excluirPsicologo(${psicologo.id})">Excluir</button>
                    `;
                    if (psicologosGrid) psicologosGrid.appendChild(item);
                });

                // Exibir pacientes
                pacientesDoDia.forEach(paciente => {
                    const item = document.createElement('div');
                    item.className = 'grid-item';
                    item.innerHTML = `
                        <h3>${paciente.nome}</h3>
                        <p><strong>Horários:</strong></p>
                        <ul>
                            ${paciente.horarios.filter(h => h.startsWith(diaAtual)).map(h => `<li>${h}</li>`).join('')}
                        </ul>
                        <button class="excluir-btn" onclick="excluirPaciente(${paciente.id})">Excluir</button>
                    `;
                    if (pacientesGrid) pacientesGrid.appendChild(item);
                });

                // Exibir ATs
                atsDoDia.forEach(at => {
                    const item = document.createElement('div');
                    item.className = 'grid-item';
                    item.innerHTML = `
                        <h3>${at.nome}</h3>
                        <p><strong>Horários:</strong></p>
                        <ul>
                            ${at.horarios.filter(h => h.startsWith(diaAtual)).map(h => `<li>${h}</li>`).join('')}
                        </ul>
                        <button class="excluir-btn" onclick="excluirAt(${at.id})">Excluir</button>
                    `;
                    if (atsGrid) atsGrid.appendChild(item);
                });
            });
        });
    });
}

// Função para excluir um psicólogo
function excluirPsicologo(id) {
    deleteData('psicologos', id, function() {
        alert('Psicólogo excluído com sucesso!');
        carregarAgenda(); // Recarrega a agenda
    }, function(error) {
        alert('Erro ao excluir psicólogo.');
    });
}

// Função para excluir um paciente
function excluirPaciente(id) {
    deleteData('pacientes', id, function() {
        alert('Paciente excluído com sucesso!');
        carregarAgenda(); // Recarrega a agenda
    }, function(error) {
        alert('Erro ao excluir paciente.');
    });
}

// Função para excluir um AT
function excluirAt(id) {
    deleteData('ats', id, function() {
        alert('AT excluído com sucesso!');
        carregarAgenda(); // Recarrega a agenda
    }, function(error) {
        alert('Erro ao excluir AT.');
    });
}

// Função para gerar a agenda
function gerarAgenda() {
    const diaAtual = getDiaAtual();

    getAllData('psicologos', function(psicologos) {
        getAllData('pacientes', function(pacientes) {
            getAllData('ats', function(ats) {
                const agendaGerada = document.getElementById('agendaGerada');
                if (!agendaGerada) return;

                agendaGerada.innerHTML = '';

                // Filtrar psicólogos, pacientes e ATs para o dia atual
                const psicologosDoDia = psicologos.filter(p => p.horarios.some(h => h.startsWith(diaAtual)));
                const pacientesDoDia = pacientes.filter(p => p.horarios.some(h => h.startsWith(diaAtual)));
                const atsDoDia = ats.filter(a => a.horarios.some(h => h.startsWith(diaAtual)));

                // Verificar se há pacientes cadastrados
                if (pacientesDoDia.length === 0) {
                    agendaGerada.innerHTML = '<p>Não há pacientes cadastrados para o dia atual.</p>';
                    return;
                }

                // Organizar os horários disponíveis
                const horarios = gerarHorarios();

                // Criar um objeto para organizar os agendamentos
                const agenda = [];

                // Função para contar quantos pacientes um profissional já tem em um horário
                function contarPacientesNoHorario(profissional, horario) {
                    return agenda.filter(item => item.nome === profissional.nome && item.horario === `${diaAtual} ${horario}`).length;
                }

                // Função para encontrar o profissional que já atendeu o paciente anteriormente
                function encontrarProfissionalAnterior(paciente) {
                    const atendimentosAnteriores = agenda.filter(item => item.paciente === paciente.nome);
                    if (atendimentosAnteriores.length > 0) {
                        return atendimentosAnteriores[atendimentosAnteriores.length - 1].nome;
                    }
                    return null;
                }

                // Percorrer todos os horários
                horarios.forEach(horario => {
                    // Filtrar pacientes disponíveis no horário
                    const pacientesNoHorario = pacientesDoDia.filter(p => p.horarios.includes(`${diaAtual} ${horario}`));

                    // Verificar se há ATs disponíveis no horário
                    const atsDisponiveis = atsDoDia.filter(a => a.horarios.includes(`${diaAtual} ${horario}`));

                    // Verificar se há psicólogos disponíveis no horário
                    const psicologosDisponiveis = psicologosDoDia.filter(p => p.horarios.includes(`${diaAtual} ${horario}`));

                    // Atribuir pacientes aos ATs e psicólogos de forma balanceada
                    pacientesNoHorario.forEach(paciente => {
                        let atribuido = false;

                        // Tentar atribuir ao profissional que já atendeu o paciente anteriormente
                        const profissionalAnterior = encontrarProfissionalAnterior(paciente);
                        if (profissionalAnterior) {
                            const atAnterior = atsDisponiveis.find(a => a.nome === profissionalAnterior);
                            const psicologoAnterior = psicologosDisponiveis.find(p => p.nome === profissionalAnterior);

                            if (atAnterior && contarPacientesNoHorario(atAnterior, horario) < 1) {
                                agenda.push({
                                    tipo: 'AT',
                                    nome: atAnterior.nome,
                                    paciente: paciente.nome,
                                    horario: `${diaAtual} ${horario}`
                                });
                                atribuido = true;
                            } else if (psicologoAnterior && contarPacientesNoHorario(psicologoAnterior, horario) < 1) {
                                agenda.push({
                                    tipo: 'Psicólogo',
                                    nome: psicologoAnterior.nome,
                                    paciente: paciente.nome,
                                    horario: `${diaAtual} ${horario}`
                                });
                                atribuido = true;
                            }
                        }

                        // Se não foi atribuído ao profissional anterior, tentar atribuir ao AT com menos pacientes
                        if (!atribuido && atsDisponiveis.length > 0) {
                            const atComMenosPacientes = atsDisponiveis.reduce((a, b) => {
                                return contarPacientesNoHorario(a, horario) < contarPacientesNoHorario(b, horario) ? a : b;
                            });

                            if (contarPacientesNoHorario(atComMenosPacientes, horario) < 1) {
                                agenda.push({
                                    tipo: 'AT',
                                    nome: atComMenosPacientes.nome,
                                    paciente: paciente.nome,
                                    horario: `${diaAtual} ${horario}`
                                });
                                atribuido = true;
                            }
                        }

                        // Se o AT já tiver 1 paciente ou não houver ATs disponíveis, atribuir ao psicólogo
                        if (!atribuido && psicologosDisponiveis.length > 0) {
                            const psicologoComMenosPacientes = psicologosDisponiveis.reduce((a, b) => {
                                return contarPacientesNoHorario(a, horario) < contarPacientesNoHorario(b, horario) ? a : b;
                            });

                            agenda.push({
                                tipo: 'Psicólogo',
                                nome: psicologoComMenosPacientes.nome,
                                paciente: paciente.nome,
                                horario: `${diaAtual} ${horario}`
                            });
                            atribuido = true;
                        }

                        // Se ainda não foi atribuído, tentar novamente com os ATs (mesmo que já tenham 1 paciente)
                        if (!atribuido && atsDisponiveis.length > 0) {
                            const atComMenosPacientes = atsDisponiveis.reduce((a, b) => {
                                return contarPacientesNoHorario(a, horario) < contarPacientesNoHorario(b, horario) ? a : b;
                            });

                            agenda.push({
                                tipo: 'AT',
                                nome: atComMenosPacientes.nome,
                                paciente: paciente.nome,
                                horario: `${diaAtual} ${horario}`
                            });
                        }
                    });
                });

                // Exibir a agenda gerada
                agenda.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'grid-item';
                    if (item.tipo === 'Psicólogo') {
                        itemDiv.style.backgroundColor = '#ffebee'; // Cor diferente para psicólogos
                    }
                    itemDiv.innerHTML = `
                        <h3>${item.nome} (${item.tipo})</h3>
                        <p><strong>Paciente:</strong> ${item.paciente}</p>
                        <p><strong>Horário:</strong> ${item.horario}</p>
                    `;
                    agendaGerada.appendChild(itemDiv);
                });

                // Verificar se todos os pacientes foram atendidos
                const pacientesAtendidos = agenda.map(item => item.paciente);
                const pacientesNaoAtendidos = pacientesDoDia.filter(p => !pacientesAtendidos.includes(p.nome));

                if (pacientesNaoAtendidos.length > 0) {
                    const nomesPacientesNaoAtendidos = pacientesNaoAtendidos.map(p => p.nome).join(', ');
                    const alerta = document.createElement('div');
                    alerta.className = 'alerta';
                    alerta.innerHTML = `<p>Não foi possível agendar todos os pacientes. Pacientes não atendidos: ${nomesPacientesNaoAtendidos}</p>`;
                    agendaGerada.appendChild(alerta);
                }
            });
        });
    });
}

// Função para exportar a agenda para Excel
function exportarParaExcel() {
    const agendaGerada = document.getElementById('agendaGerada');
    if (!agendaGerada || agendaGerada.children.length === 0) {
        alert('Nenhuma agenda gerada para exportar.');
        return;
    }

    const horarios = gerarHorarios();
    const diaAtual = getDiaAtual();

    getAllData('psicologos', function(psicologos) {
        getAllData('ats', function(ats) {
            const psicologosDoDia = psicologos.filter(p => p.horarios.some(h => h.startsWith(diaAtual)));
            const atsDoDia = ats.filter(a => a.horarios.some(h => h.startsWith(diaAtual)));

            // Criar um objeto para organizar os dados
            const dados = {};
            horarios.forEach(horario => {
                dados[horario] = {};
                psicologosDoDia.forEach(psicologo => {
                    dados[horario][psicologo.nome] = [];
                });
                atsDoDia.forEach(at => {
                    dados[horario][at.nome] = [];
                });
            });

            // Preencher os dados com os pacientes agendados
            Array.from(agendaGerada.children).forEach(item => {
                const nome = item.querySelector('h3').textContent.replace(/ \(.*\)/, ''); // Remover o tipo (AT/Psicólogo)
                const paciente = item.querySelector('p:nth-child(2)').textContent.replace('Paciente: ', '');
                const horario = item.querySelector('p:nth-child(3)').textContent.replace('Horário: ', '').split(' ')[1]; // Extrair apenas o horário (ex: "08:00")

                if (dados[horario] && dados[horario][nome]) {
                    dados[horario][nome].push(paciente);
                }
            });

            // Criar um array com os dados para a planilha
            const planilha = [];
            const cabecalho = ["Horário", ...psicologosDoDia.map(p => p.nome), ...atsDoDia.map(a => a.nome)];
            planilha.push(cabecalho);

            horarios.forEach(horario => {
                const linha = [horario];
                psicologosDoDia.forEach(psicologo => {
                    const pacientes = dados[horario][psicologo.nome];
                    linha.push(pacientes.join(", ")); // Concatenar nomes dos pacientes
                });
                atsDoDia.forEach(at => {
                    const pacientes = dados[horario][at.nome];
                    linha.push(pacientes.join(", ")); // Concatenar nomes dos pacientes
                });
                planilha.push(linha);
            });

            // Criar uma planilha
            const ws = XLSX.utils.aoa_to_sheet(planilha);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Agenda");

            // Exportar para Excel
            XLSX.writeFile(wb, `Agenda_${diaAtual}.xlsx`);
        });
    });
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    openDB().then(() => {
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registrado com sucesso:', registration);
                })
                .catch((error) => {
                    console.log('Falha ao registrar o Service Worker:', error);
                });
        }
        
        console.log("Banco de dados inicializado. Iniciando aplicação...");
        exibirHorariosDisponiveis();
        carregarAgenda();
        // Evento de cadastro
        const cadastroForm = document.getElementById('cadastroForm');
        if (cadastroForm) {
            cadastroForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const tipo = document.getElementById('tipo').value;
                const nome = document.getElementById('nome').value.trim();
                const diaAtual = getDiaAtual();

                // Obter horários selecionados
                const horariosSelecionados = Array.from(document.querySelectorAll('#horariosDisponiveis .horario:checked'))
                    .map(checkbox => `${diaAtual} ${checkbox.value}`);

                if (!nome) {
                    alert('Por favor, insira um nome.');
                    return;
                }

                if (horariosSelecionados.length === 0) {
                    alert('Por favor, selecione pelo menos um horário.');
                    return;
                }

                const data = { nome, horarios: horariosSelecionados };

                if (tipo === 'psicologo') {
                    addData('psicologos', data, function() {
                        alert('Psicólogo cadastrado com sucesso!');
                        document.getElementById('cadastroForm').reset();
                        carregarAgenda();
                    }, function(error) {
                        alert('Erro ao cadastrar psicólogo.');
                    });
                } else if (tipo === 'paciente') {
                    addData('pacientes', data, function() {
                        alert('Paciente cadastrado com sucesso!');
                        document.getElementById('cadastroForm').reset();
                        carregarAgenda();
                    }, function(error) {
                        alert('Erro ao cadastrar paciente.');
                    });
                } else if (tipo === 'at') {
                    addData('ats', data, function() {
                        alert('AT cadastrado com sucesso!');
                        document.getElementById('cadastroForm').reset();
                        carregarAgenda();
                    }, function(error) {
                        alert('Erro ao cadastrar AT.');
                    });
                }
            });
        }

        // Botão Atualizar
        const atualizarBtn = document.getElementById('atualizarBtn');
        if (atualizarBtn) {
            atualizarBtn.addEventListener('click', function() {
                setTimeout(() => {
                    location.reload();
                }, 500);

                carregarAgenda();
            });
        }

        // Botão Gerar Agenda
        const gerarAgendaBtn = document.getElementById('gerarAgendaBtn');
        if (gerarAgendaBtn) {
            gerarAgendaBtn.addEventListener('click', function() {
                gerarAgenda();
            });
        }

        // Botão Baixar Agenda em Excel
        const baixarExcelBtn = document.getElementById('baixarExcelBtn');
        if (baixarExcelBtn) {
            baixarExcelBtn.addEventListener('click', function() {
                exportarParaExcel();
            });
        }
    }).catch((error) => {
        console.error("Erro ao inicializar o banco de dados:", error);
    });
});
