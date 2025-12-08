/* ==========================================================================
   CONFIGURAÇÕES E INICIALIZAÇÃO
   ========================================================================== */
const itensPorPagina = 12; 
let paginaAtual = 1;
let carrinho = JSON.parse(localStorage.getItem('carrinho_olivi')) || [];
let produtosParaExibir = [];

document.addEventListener('DOMContentLoaded', () => {
    // Carrega produtos
    if (typeof listaProdutos !== 'undefined') {
        produtosParaExibir = listaProdutos;
        if(typeof gerarCategorias === 'function') gerarCategorias();
        renderizarLoja(paginaAtual);
    } else {
        console.error("ERRO: O arquivo produtos.js não carregou.");
    }
    
    // Atualiza o carrinho visualmente
    atualizarVisualCarrinho();
});

/* ==========================================================================
   LÓGICA DA LOJA
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
        container.innerHTML = '<p style="padding:20px; text-align:center;">Nenhum produto encontrado.</p>';
    } else {
        produtosDaVez.forEach(produto => {
            const nomeSeguro = produto.nome.replace(/"/g, '&quot;').replace(/'/g, "\\'");
            const imagemSrc = produto.imagem ? produto.imagem : 'https://via.placeholder.com/300x300?text=Sem+Foto';

            container.innerHTML += `
                <div class="card-produto">
                    <img src="${imagemSrc}" alt="${nomeSeguro}" loading="lazy">
                    <div class="info-produto">
                        <h3>${produto.nome}</h3>
                        <p class="categoria-tag" style="color:#888; font-size:0.8rem; margin-bottom:5px;">${produto.categoria || ''}</p>
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
   LÓGICA DO CARRINHO (WHATSAPP) - CORRIGIDA
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
    
    // Só mexe no display se for PC. No mobile o CSS controla com !important.
    // Mas garantimos que se tiver vazio, some pra todo mundo.
    if (carrinho.length > 0) {
        btnFloat.style.display = 'flex';
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

    // --- SEU NÚMERO AQUI ---
    const telefone = "5533991781075"; 
    // -----------------------

    let texto = "*Olá! Gostaria de um orçamento:*\n\n";
    const contagem = {};
    carrinho.forEach(item => contagem[item] = (contagem[item] || 0) + 1);

    for (let item in contagem) {
        texto += `- ${item} (${contagem[item]}x)\n`;
    }
    texto += "\n*Aguardo retorno!*";

    const link = `https://wa.me/${5533991781075}?text=${encodeURIComponent(texto)}`;
    
    // 1. Abre o WhatsApp
    window.open(link, '_blank');

    // 2. LIMPA O CARRINHO (A CORREÇÃO ESTÁ AQUI)
    carrinho = []; 
    localStorage.removeItem('carrinho_olivi'); // Limpa a memória
    atualizarVisualCarrinho(); // Atualiza o botão verde (vai sumir)
}

/* ==========================================================================
   LÓGICA DO MENU / SIDEBAR (CORRIGIDA E SIMPLIFICADA)
   ========================================================================== */
function toggleSidebar() {
    // SELETORES DIRETOS
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.querySelector('.backdrop-menu');
    const btn = document.getElementById('btn-abrir-sidebar');

    // 1. CHECAGEM DE SEGURANÇA
    if (!sidebar) {
        console.error("Erro: Sidebar não encontrada!");
        return;
    }

    // 2. LÓGICA DE ABRIR/FECHAR (Direto no estilo, sem depender de classes do body)
    // Se a barra estiver escondida (ou não tiver estilo definido ainda)...
    if (sidebar.style.transform === '' || sidebar.style.transform === 'translateX(-100%)') {
        
        // ABRIR
        sidebar.style.transform = 'translateX(0)';
        if (backdrop) backdrop.style.display = 'block';
        if (btn) btn.style.display = 'none'; // Esconde o botão pra não ficar em cima
        
    } else {
        
        // FECHAR
        sidebar.style.transform = 'translateX(-100%)';
        if (backdrop) backdrop.style.display = 'none';
        if (btn) btn.style.display = 'flex'; // Mostra o botão de volta
    }
}

function pesquisarProdutos() {
    const termo = document.getElementById('search').value.toLowerCase();
    produtosParaExibir = listaProdutos.filter(produto => 
        produto.nome.toLowerCase().includes(termo) || 
        (produto.categoria && produto.categoria.toLowerCase().includes(termo))
    );
    paginaAtual = 1;
    renderizarLoja(1);
}

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



