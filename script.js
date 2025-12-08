/* ==========================================================================
   1. VARIÁVEIS GLOBAIS (O navegador lê isso primeiro)
   ========================================================================== */
const itensPorPagina = 12; 
let paginaAtual = 1;
let carrinho = JSON.parse(localStorage.getItem('carrinho_olivi')) || [];
let produtosParaExibir = [];

/* ==========================================================================
   2. FUNÇÃO DE MENU MOBILE (TOGGLE SIDEBAR)
   Colocamos aqui no topo para garantir que o HTML enxergue ela
   ========================================================================== */
function toggleSidebar() {
    console.log("--> Função toggleSidebar foi chamada!"); // Teste de clique

    const sidebar = document.getElementById('sidebar');
    const backdrop = document.querySelector('.backdrop-menu');
    const btn = document.getElementById('btn-abrir-sidebar');

    if (!sidebar) {
        console.error("ERRO: Não achei o elemento #sidebar");
        return;
    }

    // Verifica se está fechada (ou sem estilo definido) e ABRE
    if (sidebar.style.transform === '' || sidebar.style.transform === 'translateX(-100%)') {
        sidebar.style.transform = 'translateX(0)'; // Abre
        if (backdrop) backdrop.style.display = 'block';
        if (btn) btn.style.display = 'none'; // Esconde botão
    } else {
        sidebar.style.transform = 'translateX(-100%)'; // Fecha
        if (backdrop) backdrop.style.display = 'none';
        if (btn) btn.style.display = 'flex'; // Mostra botão
    }
}

/* ==========================================================================
   3. INICIALIZAÇÃO (Só roda quando a tela termina de carregar)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Carrega produtos
    if (typeof listaProdutos !== 'undefined') {
        produtosParaExibir = listaProdutos;
        if(typeof gerarCategorias === 'function') gerarCategorias();
        renderizarLoja(paginaAtual);
    } else {
        console.error("ERRO CRÍTICO: listaProdutos não encontrada.");
    }
    
    // Atualiza o carrinho
    atualizarVisualCarrinho();
});

/* ==========================================================================
   4. FUNÇÕES DA LOJA E RENDERIZAÇÃO
   ========================================================================== */
function renderizarLoja(pagina) {
    const container = document.getElementById('grade-produtos');
    const containerPaginacao = document.getElementById('paginacao');

    if (!container) return;

    const totalPaginas = Math.ceil(produtosParaExibir.length / itensPorPagina);
    if (pagina < 1) pagina = 1;
    if (pagina > totalPaginas && totalPaginas > 0) pagina = totalPaginas;
    
    paginaAtual = pagina;
    container.innerHTML = '';

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosDaVez = produtosParaExibir.slice(inicio, fim);

    if (produtosDaVez.length === 0) {
        container.innerHTML = '<div style="padding:40px; text-align:center; width:100%"><h3>Nenhum produto encontrado.</h3></div>';
    } else {
        produtosDaVez.forEach(produto => {
            const nomeSeguro = produto.nome.replace(/"/g, '&quot;').replace(/'/g, "\\'");
            const imagemSrc = produto.imagem ? produto.imagem : 'img/sem-foto.jpg'; // Ajuste o caminho da imagem padrão se precisar

            container.innerHTML += `
                <div class="card-produto">
                    <img src="${imagemSrc}" alt="${nomeSeguro}" loading="lazy">
                    <div class="info-produto">
                        <h3>${produto.nome}</h3>
                        <p class="categoria-tag" style="color:#888; font-size:0.8rem; margin-bottom:5px;">${produto.categoria || 'Geral'}</p>
                        <button onclick="adicionarAoOrcamento('${nomeSeguro}')" class="btn-orcamento">
                            Adicionar ao Orçamento
                        </button>
                    </div>
                </div>
            `;
        });
    }

    if(containerPaginacao) atualizarBotoesPaginacao(totalPaginas);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function atualizarBotoesPaginacao(totalPaginas) {
    const container = document.getElementById('paginacao');
    container.innerHTML = '';
    if (totalPaginas <= 1) return;

    if (paginaAtual > 1) {
        container.innerHTML += `<button class="seta" onclick="renderizarLoja(${paginaAtual - 1})">&laquo;</button>`;
    }

    let inicio = Math.max(1, paginaAtual - 2);
    let fim = Math.min(totalPaginas, paginaAtual + 2);

    if (inicio > 1) container.innerHTML += `<button class="pagina" onclick="renderizarLoja(1)">1</button><span>...</span>`;
    
    for (let i = inicio; i <= fim; i++) {
        const ativo = i === paginaAtual ? 'ativa' : '';
        container.innerHTML += `<button class="pagina ${ativo}" onclick="renderizarLoja(${i})">${i}</button>`;
    }

    if (fim < totalPaginas) container.innerHTML += `<span>...</span><button class="pagina" onclick="renderizarLoja(${totalPaginas})">${totalPaginas}</button>`;

    if (paginaAtual < totalPaginas) {
        container.innerHTML += `<button class="seta" onclick="renderizarLoja(${paginaAtual + 1})">&raquo;</button>`;
    }
}

/* ==========================================================================
   5. CARRINHO E WHATSAPP
   ========================================================================== */
function adicionarAoOrcamento(nome) {
    carrinho.push(nome);
    localStorage.setItem('carrinho_olivi', JSON.stringify(carrinho));
    alert(`✅ "${nome}" adicionado!`);
    atualizarVisualCarrinho();
}

function atualizarVisualCarrinho() {
    const btnFloat = document.querySelector('.carrinho-flutuante');
    const contador = document.getElementById('contador-carrinho');
    
    if (carrinho.length > 0) {
        btnFloat.style.display = 'flex';
        btnFloat.style.visibility = 'visible'; // Força bruta visual
        btnFloat.style.opacity = '1';
        if(contador) contador.innerText = carrinho.length;
    } else {
        btnFloat.style.display = 'none';
    }
}

function finalizarNoWhatsapp() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const telefone = "5533991781075"; // SEU NÚMERO AQUI
    let texto = "*Olá! Gostaria de um orçamento:*\n\n";
    const contagem = {};
    
    carrinho.forEach(item => {
        contagem[item] = (contagem[item] || 0) + 1;
    });

    for (let item in contagem) {
        texto += `- ${item} (${contagem[item]}x)\n`;
    }
    texto += "\n*Aguardo retorno!*";

    const link = `https://wa.me/${5533991781075}?text=${encodeURIComponent(texto)}`;

    // LIMPEZA
    carrinho = []; 
    localStorage.removeItem('carrinho_olivi'); 
    localStorage.setItem('carrinho_olivi', '[]'); 
    atualizarVisualCarrinho(); 

    window.open(link, '_blank');
}

/* =================

