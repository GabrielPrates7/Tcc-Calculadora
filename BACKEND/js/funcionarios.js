// js/funcionarios.js

const API_URL = 'http://localhost:3000/funcionarios';
let idEmEdicao = null; // Variável para saber se estamos editando alguém

const formatarMoeda = (valor) => {
    const numero = Number(valor); 
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
};

// --- RENDERIZAR TABELA ---
async function renderizarTabela() {
    const corpoTabela = document.getElementById('tabela-corpo');
    const rodapeTabela = document.getElementById('tabela-rodape');
    
    const resposta = await fetch(API_URL);
    const listaFuncionarios = await resposta.json();

    corpoTabela.innerHTML = ''; 
    rodapeTabela.innerHTML = '';

    // Variáveis de Totais
    let [tSalario, tDecimo, tUmTerco, tFerias, tInss, tMulta, tEpi, tGeral] = [0,0,0,0,0,0,0,0];

    listaFuncionarios.forEach((func) => {
        const salario = Number(func.salario_base);
        const decimo = Number(func.decimo_terceiro);
        const umTerco = Number(func.um_terco_ferias);
        const ferias = Number(func.ferias);
        const inss = Number(func.inss);
        const multa = Number(func.multa_fgts);
        const epi = Number(func.epi);
        const somatorioLinha = salario + decimo + umTerco + ferias + inss + multa + epi;

        // Acumula totais
        tSalario += salario; tDecimo += decimo; tUmTerco += umTerco; 
        tFerias += ferias; tInss += inss; tMulta += multa; tEpi += epi; 
        tGeral += somatorioLinha;

        const tr = document.createElement('tr');
        // Adicionamos os dados crus (dataset) para facilitar a edição sem ter que converter R$ de volta pra número
        tr.innerHTML = `
            <td class="texto-esq" style="font-weight: bold;">${func.nome}</td>
            <td class="monetario">${formatarMoeda(salario)}</td>
            <td class="monetario">${formatarMoeda(decimo)}</td>
            <td class="monetario">${formatarMoeda(umTerco)}</td>
            <td class="monetario">${formatarMoeda(ferias)}</td>
            <td class="monetario">${formatarMoeda(inss)}</td>
            <td class="monetario">${formatarMoeda(multa)}</td>
            <td class="monetario">${formatarMoeda(epi)}</td>
            <td class="monetario" style="font-weight: bold; background-color: #eaf2f8;">${formatarMoeda(somatorioLinha)}</td>
            <td>
                <button onclick="prepararEdicao(${func.id}, '${func.nome}', ${salario}, ${epi})" 
                    style="background-color: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                    ✎
                </button>
                <button onclick="removerFuncionario(${func.id})" 
                    style="background-color: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    🗑
                </button>
            </td>
        `;
        corpoTabela.appendChild(tr);
    });

    // Rodapé de Totais
    if (listaFuncionarios.length > 0) {
        const trTotal = document.createElement('tr');
        trTotal.innerHTML = `
            <td style="text-align: center;">TOTAIS</td>
            <td>${formatarMoeda(tSalario)}</td>
            <td>${formatarMoeda(tDecimo)}</td>
            <td>${formatarMoeda(tUmTerco)}</td>
            <td>${formatarMoeda(tFerias)}</td>
            <td>${formatarMoeda(tInss)}</td>
            <td>${formatarMoeda(tMulta)}</td>
            <td>${formatarMoeda(tEpi)}</td>
            <td style="background-color: #cbdcea; color: #000;">${formatarMoeda(tGeral)}</td>
            <td>-</td>
        `;
        rodapeTabela.appendChild(trTotal);
    }
}

// --- SALVAR (DECIDE SE É CRIAR OU ATUALIZAR) ---
async function salvarFuncionario() {
    const inputNome = document.getElementById('input-nome');
    const inputSalario = document.getElementById('input-salario');
    const inputEpi = document.getElementById('input-epi');

    const nome = inputNome.value.trim();
    const salario = parseFloat(inputSalario.value);
    const epi = parseFloat(inputEpi.value);

    if (nome === '' || isNaN(salario) || isNaN(epi)) {
        alert("Preencha todos os campos!");
        return;
    }

    const dados = { nome, salario, epi };

    if (idEmEdicao === null) {
        // MODO CRIAR (POST)
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    } else {
        // MODO EDITAR (PUT)
        await fetch(`${API_URL}/${idEmEdicao}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        cancelarEdicao(); // Sai do modo edição
    }

    inputNome.value = '';
    inputSalario.value = '';
    inputEpi.value = '';
    renderizarTabela();
}

// --- PREPARAR EDIÇÃO (JOGA DADOS NO FORMULÁRIO) ---
function prepararEdicao(id, nome, salario, epi) {
    idEmEdicao = id; // Marca qual ID estamos mexendo

    // Preenche os inputs
    document.getElementById('input-nome').value = nome;
    document.getElementById('input-salario').value = salario;
    document.getElementById('input-epi').value = epi;

    // Muda o visual do botão
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');

    btnSalvar.innerText = "Salvar Alterações";
    btnSalvar.style.backgroundColor = "#2980b9"; // Azul
    btnCancelar.style.display = "inline-block"; // Mostra botão cancelar

    // Foca no nome para editar rápido
    document.getElementById('input-nome').focus();
}

// --- CANCELAR EDIÇÃO ---
function cancelarEdicao() {
    idEmEdicao = null;
    
    // Limpa inputs
    document.getElementById('input-nome').value = '';
    document.getElementById('input-salario').value = '';
    document.getElementById('input-epi').value = '';

    // Volta botões ao normal
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');

    btnSalvar.innerText = "+ Calcular e Adicionar";
    btnSalvar.style.backgroundColor = "#27ae60"; // Verde
    btnCancelar.style.display = "none";
}

// --- EXCLUIR ---
async function removerFuncionario(id) {
    if(confirm("Deseja excluir este registro?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        renderizarTabela();
    }
}

// Inicia
renderizarTabela();