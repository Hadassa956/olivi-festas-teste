/* ==========================================================================
   CONFIGURAÇÕES GERAIS
   ========================================================================== */
const itensPorPagina = 12; 
let paginaAtual = 1;
// Recupera o carrinho ou cria uma lista vazia
let carrinho = JSON.parse(localStorage.getItem('carrinho_olivi')) || [];
let produtosParaExibir = [];

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // Carrega produtos se a variável existir
    if (typeof listaProdutos !== 'undefined') {
        produtosParaExibir = listaProdutos;
        if(typeof gerarCategorias === 'function') gerarCategorias();
        renderizarLoja(paginaAtual);
    } else {
        console.error("ERRO CRÍTICO: listaProdutos não encontrada. Verifique o arquivo produtos.js");
    }
    
    // Atualiza o botão do carrinho (se já tiver itens salvos de antes)
    atualizarVisualCarrinho();
});

/* ==========================================================================
   LÓGICA DA LOJA (Mostrar Produtos)
   ========================================================================== */
function renderizarLoja(pagina) {
    const container = document.getElementById('grade-produtos');
    const containerPaginacao = document.getElementById('paginacao');

    if (!container) return;

    // Garante que a página é válida
    const totalPaginas = Math.ceil(produtosParaExibir.length / itensPorPagina);
    if (pagina < 1) pagina = 1;
    if (pagina > totalPaginas && totalPaginas > 0) pagina = totalPaginas;
    
    paginaAtual = pagina;
    container.innerHTML = ''; // Limpa tela

    // Fatia os produtos
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosDaVez = produtosParaExibir.slice(inicio, fim);

    if (produtosDaVez.length === 0) {
        container.innerHTML = '<div style="padding:40px; text-align:center; width:100%"><h3>Nenhum produto encontrado.</h3></div>';
    } else {
        produtosDaVez.forEach(produto => {
            const nomeSeguro = produto.nome.replace(/"/g, '&quot;').replace(/'/g, "\\'");
            // Fallback para imagem
            const imagemSrc = produto.imagem ? produto.imagem : 'img/sem-foto.jpg';

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

    // Botão Anterior
    if (paginaAtual > 1) {
        container.innerHTML += `<button class="seta" onclick="renderizarLoja(${paginaAtual - 1})">&laquo;</button>`;
    }

    // Números inteligentes
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
   MENU MOBILE / FILTROS (SIMPLIFICADO)
   ========================================================================== */
function toggleSidebar() {
    console.log("Botão de filtro clicado!"); // Para teste
    const body = document.querySelector('.body2');
    
    // Troca a classe no body
    body.classList.toggle('mobile-menu-aberto');
    
    // No PC, também usa a lógica de sidebar fechada
    body.classList.toggle('sidebar-fechada');
}

// Lógica de Filtros
function gerarCategorias() {
    const listaUl = document.getElementById('lista-categorias');
    if (!listaUl) return;

    const categoriasSet = new Set(listaProdutos.map(p => p.categoria || 'Outros'));
    const categoriasUnicas = Array.from(categoriasSet).sort();

    listaUl.innerHTML = `<li onclick="filtrarPorCategoria('todas')" class="ativo">Todos os Produtos</li>`;

    categoriasUnicas.forEach(cat => {
        const qtd = listaProdutos.filter(p => (p.categoria || 'Outros') === cat).length;
        listaUl.innerHTML += `<li onclick="filtrarPorCategoria('${cat}')">${cat} <small>(${qtd})</small></li>`;
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

    // Fecha o menu automaticamente no celular ao clicar em uma categoria
    if (window.innerWidth < 800) {
        const body = document.querySelector('.body2');
        body.classList.remove('mobile-menu-aberto');
    }
}

/* ==========================================================================
   CARRINHO E WHATSAPP (CORRIGIDO)
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
        // Remove display:none e força aparecer
        btnFloat.style.display = 'flex';
        // Força visibilidade caso o CSS esteja escondendo
        btnFloat.style.visibility = 'visible'; 
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

    // --- SEU NÚMERO ---
    const telefone = "5511999999999"; 
    // ------------------

    let texto = "*Olá! Gostaria de um orçamento:*\n\n";
    const contagem = {};
    
    // Conta itens repetidos
    carrinho.forEach(item => {
        contagem[item] = (contagem[item] || 0) + 1;
    });

    for (let item in contagem) {
        texto += `- ${item} (${contagem[item]}x)\n`;
    }
    texto += "\n*Aguardo retorno!*";

    const link = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;

    // 1. ZERA TUDO ANTES DE ABRIR (Para garantir)
    carrinho = []; // Zera a memória RAM
    localStorage.removeItem('carrinho_olivi'); // Zera o HD do navegador
    localStorage.setItem('carrinho_olivi', '[]'); // Força vazio
    atualizarVisualCarrinho(); // Atualiza o botão (ele vai sumir)

    // 2. Abre o WhatsApp
    window.open(link, '_blank');
}



// Pesquisa
function pesquisarProdutos() {
    const termo = document.getElementById('search').value.toLowerCase();
    
    produtosParaExibir = listaProdutos.filter(produto => 
        produto.nome.toLowerCase().includes(termo) || 
        (produto.categoria && produto.categoria.toLowerCase().includes(termo))
    );

    paginaAtual = 1;
    renderizarLoja(1);
}
