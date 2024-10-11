const apiLogUrl = 'https://www.piway.com.br/unoesc/api/doc.html';

function mostrarModal() {
    const modal = document.getElementById('logs-modal');
    modal.style.display = 'block';
}

function fecharModal() {
    const modal = document.getElementById('logs-modal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('logs-modal');
    if (event.target === modal) {
        fecharModal();
    }
};

async function buscarPaises() {
    try {
        const resposta = await fetch('https://restcountries.com/v3.1/all'); 
        if (!resposta.ok) throw new Error('Erro ao buscar países'); 
        const paises = await resposta.json(); 
        return paises; 
    } catch (error) {
        return []; 
    }
}

function exibirPaises(paises) {
    const container = document.getElementById('countries-container'); 
    container.innerHTML = ''; 

    if (paises.length === 0) {
        container.innerHTML = '<p>Nenhum país encontrado.</p>';
        return;
    }

    paises.forEach(pais => {
        const paisDiv = document.createElement('div');
        paisDiv.className = 'country'; 
        paisDiv.innerHTML = `
            <img src="${pais.flags.svg}" alt="Bandeira de ${pais.name.common}" class="flag">
            <h2>${pais.name.common}</h2>
            <p><strong>Capital</strong>: ${pais.capital ? pais.capital[0] : 'N/A'}</p>
            <p><strong>População</strong>: ${pais.population.toLocaleString('pt-BR')}</p>
            <p><strong>Região</strong>: ${pais.region}</p>
            <p><strong>Sub-região</strong>: ${pais.subregion || 'N/A'}</p>
            <p><strong>Moeda</strong>: ${pais.currencies ? Object.values(pais.currencies)[0].name : 'N/A'}</p>
            <p><strong>Idioma(s)</strong>: ${pais.languages ? Object.values(pais.languages).join(', ') : 'N/A'}</p>
        `;
        container.appendChild(paisDiv);
    });
}

async function buscarPaisPorTraducao(traducao) {
    try {
        const resposta = await fetch(`https://restcountries.com/v3.1/translation/${traducao}`); 
        if (!resposta.ok) throw new Error('País não encontrado');
        const dados = await resposta.json();
        return dados; 
    } catch (error) {
        return null; 
    }
}

async function buscarPaisesPorMoeda(moeda) {
    try {
        const resposta = await fetch(`https://restcountries.com/v3.1/currency/${moeda}`); 
        if (!resposta.ok) throw new Error('Erro ao buscar países pela moeda'); 
        const paises = await resposta.json();
        return paises; 
    } catch (error) {
        return []; 
    }
}

function filtrarPaises(paises, inputPesquisa) {
    return paises.filter(pais => {
        const pesquisa = inputPesquisa.toLowerCase();
        const nomeCorrespondente = pais.name.common.toLowerCase().includes(pesquisa); 
        const capitalCorrespondente = pais.capital && pais.capital[0].toLowerCase().includes(pesquisa); 
        const moedaCorrespondente = pais.currencies && Object.values(pais.currencies)[0].name.toLowerCase().includes(pesquisa); 
        const idiomaCorrespondente = pais.languages && Object.values(pais.languages).some(idioma => idioma.toLowerCase().includes(pesquisa)); 
        const regiaoCorrespondente = pais.region.toLowerCase().includes(pesquisa);
        const subregiaoCorrespondente = pais.subregion && pais.subregion.toLowerCase().includes(pesquisa); 

        return nomeCorrespondente || capitalCorrespondente || moedaCorrespondente || idiomaCorrespondente || regiaoCorrespondente || subregiaoCorrespondente;
    });
}

async function pesquisarPais() {
    const inputPesquisa = document.getElementById('search-input').value; 

    const paisesTraduzidos = await buscarPaisPorTraducao(inputPesquisa);
    if (paisesTraduzidos) {
        exibirPaises(paisesTraduzidos); 
        return;
    }

    const paises = await buscarPaises(); 
    const paisesFiltrados = filtrarPaises(paises, inputPesquisa); 

    exibirPaises(paisesFiltrados); 
}

async function pesquisarPaisesPorMoeda() {
    const inputMoeda = document.getElementById('currency-input').value;
    const paises = await buscarPaisesPorMoeda(inputMoeda);
    exibirPaises(paises); 
}

async function inserirLog(metodo, resultado) {
    await fetch(`https://www.piway.com.br/unoesc/api/inserir/log/433969/CountryAPI/${metodo}/${resultado}`).then(resposta => { return resposta.json(); });
}

async function excluirLog(id) {
    await fetch(`https://www.piway.com.br/unoesc/api/excluir/log/${id}/aluno/433969`).then(resposta => { return resposta.json(); });
    exibirLogs();
}

async function exibirLogs() {
    var res = await fetch('https://www.piway.com.br/unoesc/api/logs/433969').then(resposta => { return resposta.json(); });
    var modal = document.getElementById('tabela').getElementsByTagName('tbody')[0];
    modal.innerHTML = '';
    for (var i = 0; i < res.length; i++) {
        modal.innerHTML += `<tr class="tr-table">
            <td>${res[i].idlog}</td>
            <td>${res[i].log}</td>
            <td>${res[i].api}</td>
            <td>${res[i].metodo}</td>
            <td>${res[i].resultado}</td>
            <td><button id="btn-table" onclick="excluirLog(${res[i].idlog})">Excluir</button></td>
        </tr>`;
    }
}

document.getElementById('search-button').onclick = async () => {
    await pesquisarPais();
    await inserirLog('Buscar País', 'Busca realizada com sucesso');
};

document.getElementById('currency-button').onclick = async () => {
    await pesquisarPaisesPorMoeda();
    await inserirLog('Buscar Moeda', 'Busca realizada com sucesso');
};
