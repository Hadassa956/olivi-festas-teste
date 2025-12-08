/* ==========================================================================
   1. CONFIGURAÇÕES E INICIALIZAÇÃO
   ========================================================================== */
const itensPorPagina = 12; // Quantos produtos por tela
let paginaAtual = 1;

// Recupera o carrinho salvo na memória do navegador (se existir)
let carrinho = JSON.parse(localStorage.getItem('carrinho_olivi')) || [];

// Copia a lista de produtos (do arquivo produtos.js) para poder filtrar
let produtosParaExibir = [];

// Inicia o site
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se a lista de produtos carregou
    if (typeof listaProdutos !== 'undefined') {
        produtosParaExibir = listaProdutos;

        // Gera as categorias e produtos
        if (typeof gerarCategorias === 'function') gerarCategorias();
        renderizarLoja(paginaAtual);
    } else {
        console.error("ERRO: O arquivo produtos.js não foi carregado corretamente.");
    }

    // Atualiza o botão do carrinho se já tiver itens salvos
    atualizarVisualCarrinho();
});


/* ==========================================================================
   2. LÓGICA DA LOJA (RENDERIZAÇÃO)
   ========================================================================== */
function renderizarLoja(pagina) {
    const container = document.getElementById('grade-produtos');
    const containerPaginacao = document.getElementById('paginacao');

    if (!container) return;

    // Cálculos da paginação
    const totalPaginas = Math.ceil(produtosParaExibir.length / itensPorPagina);

    // Proteção para não quebrar se a página não existir
    if (pagina < 1) pagina = 1;
    if (pagina > totalPaginas && totalPaginas > 0) pagina = totalPaginas;

    paginaAtual = pagina;
    container.innerHTML = ''; // Limpa a tela

    // Fatiar a lista (Paginação)
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosDaVez = produtosParaExibir.slice(inicio, fim);

    // Se não tiver produtos
    if (produtosDaVez.length === 0) {
        container.innerHTML = '<p style="width:100%; text-align:center; padding:20px;">Nenhum produto encontrado.</p>';
    } else {
        // Desenha os cards
        produtosDaVez.forEach(produto => {
            const nomeSeguro = produto.nome.replace(/"/g, '&quot;').replace(/'/g, "\\'");
            const imagemSrc = produto.imagem ? produto.imagem : 'https://via.placeholder.com/300x300?text=Sem+Foto';

            const cardHTML = `
                <div class="card-produto">
                    <div class="img-wrapper">
                        <img src="${imagemSrc}" alt="${nomeSeguro}" loading="lazy">
                    </div>
                    <div class="info-produto">
                        <h3>${produto.nome}</h3>
                        <p class="categoria-tag" style="color:#888; font-size:0.8rem; margin-bottom:5px;">${produto.categoria || ''}</p>
                        <button onclick="adicionarAoOrcamento('${nomeSeguro}')" class="btn-orcamento">
                            Adicionar ao Orçamento
                        </button>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });
    }

    // Desenha os botões de paginação (1, 2, 3...)
    if (containerPaginacao) atualizarBotoesPaginacao(totalPaginas);

    // Rola para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function atualizarBotoesPaginacao(totalPaginas) {
    const container = document.getElementById('paginacao');
    container.innerHTML = '';

    if (totalPaginas <= 1) return;

    // Botão Anterior
    if (paginaAtual > 1) {
        container.innerHTML += `<button class="seta" onclick="renderizarLoja(${paginaAtual - 1})">&laquo;</button>`;
    }

    // Lógica inteligente de números (Mostra atual, +2 e -2)
    let inicio = Math.max(1, paginaAtual - 2);
    let fim = Math.min(totalPaginas, paginaAtual + 2);

    if (inicio > 1) container.innerHTML += `<button class="pagina" onclick="renderizarLoja(1)">1</button><span>...</span>`;

    for (let i = inicio; i <= fim; i++) {
        const ativo = i === paginaAtual ? 'ativa' : '';
        container.innerHTML += `<button class="pagina ${ativo}" onclick="renderizarLoja(${i})">${i}</button>`;
    }

    if (fim < totalPaginas) container.innerHTML += `<span>...</span><button class="pagina" onclick="renderizarLoja(${totalPaginas})">${totalPaginas}</button>`;

    // Botão Próximo
    if (paginaAtual < totalPaginas) {
        container.innerHTML += `<button class="seta" onclick="renderizarLoja(${paginaAtual + 1})">&raquo;</button>`;
    }
}


/* ==========================================================================
   3. LÓGICA DO CARRINHO (WHATSAPP)
   ========================================================================== */
function adicionarAoOrcamento(nome) {
    carrinho.push(nome);

    // Salva no navegador para não perder se atualizar a página
    localStorage.setItem('carrinho_olivi', JSON.stringify(carrinho));

    // Feedback visual rápido
    alert(`✅ "${nome}" adicionado!`);
    atualizarVisualCarrinho();
}

function atualizarVisualCarrinho() {
    const btnFloat = document.querySelector('.carrinho-flutuante');
    const contador = document.getElementById('contador-carrinho');

    if (carrinho.length > 0) {
        // Mostra o botão (Flex para PC, ou a regra do CSS decide)
        // O CSS com !important no mobile vai garantir que apareça lá
        if (window.innerWidth > 800) {
            btnFloat.style.display = 'flex';
        } else {
            // No mobile, o CSS já trata, mas garantimos aqui
            btnFloat.style.display = 'flex';
        }

        if (contador) contador.innerText = carrinho.length;
    } else {
        btnFloat.style.display = 'none';
    }
}

function finalizarNoWhatsapp() {
    console.log("Tentando finalizar orçamento..."); // Debug para você ver no F12 se precisar

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio! Adicione produtos antes de finalizar.");
        return;
    }

    // --- CONFIGURE SEU NÚMERO AQUI (Apenas números, código país + ddd + numero) ---
    const telefone = "5533991781075";
    // -----------------------------------------------------------------------------

    let texto = "*Olá! Gostaria de um orçamento para os seguintes itens:*\n\n";

    // Agrupa itens repetidos (ex: Cadeira x2)
    const contagem = {};
    carrinho.forEach(item => {
        contagem[item] = (contagem[item] || 0) + 1;
    });

    for (let item in contagem) {
        texto += `- ${item} (${contagem[item]}x)\n`;
    }

    texto += "\n*Aguardo o retorno!*";

    // Cria o link e abre
    const link = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
    window.open(link, '_blank');
}


/* ==========================================================================
   4. FILTROS E PESQUISA
   ========================================================================== */
function pesquisarProdutos() {
    const termo = document.getElementById('search').value.toLowerCase();

    produtosParaExibir = listaProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termo) ||
        (produto.categoria && produto.categoria.toLowerCase().includes(termo))
    );

    paginaAtual = 1;
    renderizarLoja(1);
}

// Funções da Sidebar (Categorias)
function gerarCategorias() {
    const listaUl = document.getElementById('lista-categorias');
    if (!listaUl) return;

    const categoriasSet = new Set(listaProdutos.map(p => p.categoria || 'Outros'));
    const categoriasUnicas = Array.from(categoriasSet).sort();

    listaUl.innerHTML = `<li onclick="filtrarPorCategoria('todas')" class="ativo">Todos os Produtos</li>`;

    categoriasUnicas.forEach(cat => {
        const qtd = listaProdutos.filter(p => (p.categoria || 'Outros') === cat).length;
        listaUl.innerHTML += `
            <li onclick="filtrarPorCategoria('${cat}')">
                ${cat} <small style="opacity:0.6">(${qtd})</small>
            </li>
        `;
    });
}

function filtrarPorCategoria(categoria) {
    const itens = document.querySelectorAll('#lista-categorias li');
    itens.forEach(li => {
        li.classList.remove('ativo');
        if (li.innerText.includes(categoria) || (categoria === 'todas' && li.innerText.includes('Todos'))) {
            li.classList.add('ativo');
        }
    });

    if (categoria === 'todas') {
        produtosParaExibir = listaProdutos;
    } else {
        produtosParaExibir = listaProdutos.filter(p => (p.categoria || 'Outros') === categoria);
    }

    paginaAtual = 1;
    renderizarLoja(1);

    // Fecha menu no mobile
    if (window.innerWidth < 800) toggleSidebar();
}

function toggleSidebar() {
    const body = document.querySelector('.body2');
    const btnAbrir = document.getElementById('btn-abrir-sidebar');
    const isMobile = window.innerWidth < 800;

    if (isMobile) {
        // No celular, usa a classe que criamos para o efeito gaveta
        body.classList.toggle('mobile-menu-aberto');

        // Simples: Se abriu, esconde o botão. Se fechou, mostra.
        if (body.classList.contains('mobile-menu-aberto')) {
            btnAbrir.style.display = 'none';
        } else {
            // Usa setAttribute para garantir prioridade sobre CSS inline
            btnAbrir.setAttribute('style', 'display: flex !important');
        }
    } else {
        // No PC
        body.classList.toggle('sidebar-fechada');
    }

}
