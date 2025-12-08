/* ==========================================================================
   1. INICIALIZAÇÃO SEGURA E VARIÁVEIS
   ========================================================================== */
const itensPorPagina = 12; 
let paginaAtual = 1;
let produtosParaExibir = [];
let carrinho = [];

// Recupera carrinho com segurança
try {
    const salvo = localStorage.getItem('carrinho_olivi');
    carrinho = salvo ? JSON.parse(salvo) : [];
} catch (e) {
    carrinho = [];
}

/* ==========================================================================
   2. FUNÇÃO MENU MOBILE (A "Mágica" que faz abrir)
   ========================================================================== */
function toggleSidebar() {
    console.log("--> Clicou no botão filtro!"); 

    const sidebar = document.getElementById('sidebar');
    const backdrop = document.querySelector('.backdrop-menu');
    const btn = document.getElementById('btn-abrir-sidebar');

    if (!sidebar) {
        console.error("Erro: Sidebar não encontrada no HTML");
        return;
    }

    // LÓGICA DIRETA: Se não tem estilo definido ou está escondido (-100%), ABRE (0).
    if (sidebar.style.transform === '' || sidebar.style.transform === 'translateX(-100%)') {
        // ABRIR
        sidebar.style.transform = 'translateX(0)';
        if(backdrop) backdrop.style.display = 'block';
        if(btn) btn.style.display = 'none'; // Esconde o botão amarelo pra não atrapalhar
    } else {
        // FECHAR
        sidebar.style.transform = 'translateX(-100%)';
        if(backdrop) backdrop.style.display = 'none';
        if(btn) btn.style.display = 'flex'; // Volta o botão amarelo
    }
}

/* ==========================================================================
   3. CARREGAMENTO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se produtos.js carregou
    if (typeof listaProdutos !== 'undefined') {
        produtosParaExibir = listaProdutos;
        gerarCategorias();
        renderizarLoja(paginaAtual);
    } else {
        console.error("ERRO: listaProdutos não definida.");
    }
    
    atualizarVisualCarrinho();
});

/* ==========================================================================
   4. RENDERIZAÇÃO DA LOJA
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
            // Ajuste o caminho da imagem se necessário
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

    if (paginaAtual > 1) container.innerHTML += `<button class="seta" onclick="renderizarLoja(${paginaAtual - 1})">&laquo;</button>`;

    let inicio = Math.max(1, paginaAtual - 2);
    let fim = Math.min(totalPaginas, paginaAtual + 2);

    if (inicio > 1) container.innerHTML += `<button class="pagina" onclick="renderizarLoja(1)">1</button><span>...</span>`;
    for (let i = inicio; i <= fim; i++) {
        const ativo = i === paginaAtual ? 'ativa' : '';
        container.innerHTML += `<button class="pagina ${ativo}" onclick="renderizarLoja(${i})">${i}</button>`;
    }
    if (fim < totalPaginas) container.innerHTML += `<span>...</span><button class="pagina" onclick="renderizarLoja(${totalPaginas})">${totalPaginas}</button>`;

    if (paginaAtual < totalPaginas) container.innerHTML += `<button class="seta" onclick="renderizarLoja(${paginaAtual + 1})">&raquo;</button>`;
}

/* ==========================================================================
   5. CARRINHO E ZAP
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

    const telefone = "5511999999999"; // SEU NÚMERO
    let texto = "*Olá! Gostaria de um orçamento:*\n\n";
    const contagem = {};
    
    carrinho.forEach(item => contagem[item] = (contagem[item] || 0) + 1);

    for (let item in contagem) {
        texto += `- ${item} (${contagem[item]}x)\n`;
    }
    texto += "\n*Aguardo retorno!*";

    // 1. LIMPA TUDO
    carrinho = [];
    localStorage.removeItem('carrinho_olivi');
    atualizarVisualCarrinho();

    // 2. ENVIA
    window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`, '_blank');
}

/* ==========================================================================
   6. CATEGORIAS E BUSCA
   ========================================================================== */
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
    
    // Fecha o menu se estiver no celular
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.querySelector('.backdrop-menu');
    const btn = document.getElementById('btn-abrir-sidebar');

    if (window.innerWidth < 800 && sidebar) {
        sidebar.style.transform = 'translateX(-100%)';
        if(backdrop) backdrop.style.display = 'none';
        if(btn) btn.style.display = 'flex';
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
