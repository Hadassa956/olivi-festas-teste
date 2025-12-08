/* ==========================================================================
   1. INICIALIZAÇÃO SEGURA (BLINDADA CONTRA ERROS)
   ========================================================================== */
const itensPorPagina = 12; 
let paginaAtual = 1;
let produtosParaExibir = [];
let carrinho = [];

// Tenta recuperar o carrinho. Se der erro (lixo na memória), cria um novo vazio.
try {
    const salvo = localStorage.getItem('carrinho_olivi');
    carrinho = salvo ? JSON.parse(salvo) : [];
} catch (e) {
    console.error("Erro ao ler carrinho, resetando:", e);
    carrinho = [];
    localStorage.removeItem('carrinho_olivi');
}

/* ==========================================================================
   2. FUNÇÃO MENU MOBILE (Topo para garantir acesso)
   ========================================================================== */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.querySelector('.backdrop-menu');
    const btn = document.getElementById('btn-abrir-sidebar');

    if (!sidebar) return;

    // Lógica simples: Se não tem estilo ou está -100%, ABRE. Senão, FECHA.
    if (sidebar.style.transform === '' || sidebar.style.transform === 'translateX(-100%)') {
        sidebar.style.transform = 'translateX(0)';
        if(backdrop) backdrop.style.display = 'block';
        if(btn) btn.style.display = 'none';
    } else {
        sidebar.style.transform = 'translateX(-100%)';
        if(backdrop) backdrop.style.display = 'none';
        if(btn) btn.style.display = 'flex';
    }
}

/* ==========================================================================
   3. CARREGAMENTO DA PÁGINA
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o arquivo de produtos carregou
    if (typeof listaProdutos !== 'undefined' && Array.isArray(listaProdutos)) {
        produtosParaExibir = listaProdutos;
        
        // Inicia tudo
        gerarCategorias();
        renderizarLoja(paginaAtual);
        atualizarVisualCarrinho();
    } else {
        // Se deu erro, avisa na tela para você saber
        document.getElementById('grade-produtos').innerHTML = 
            '<h3 style="padding:20px; color:red">Erro: O arquivo produtos.js não foi carregado. Verifique se o nome está correto no HTML.</h3>';
    }
});

/* ==========================================================================
   4. RENDERIZAÇÃO DA LOJA
   ========================================================================== */
function renderizarLoja(pagina) {
    const container = document.getElementById('grade-produtos');
    const containerPaginacao = document.getElementById('paginacao');

    if (!container) return;

    // Validação da página
    const totalPaginas = Math.ceil(produtosParaExibir.length / itensPorPagina);
    if (pagina < 1) pagina = 1;
    if (pagina > totalPaginas && totalPaginas > 0) pagina = totalPaginas;
    
    paginaAtual = pagina;
    container.innerHTML = '';

    // Fatiar
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosDaVez = produtosParaExibir.slice(inicio, fim);

    if (produtosDaVez.length === 0) {
        container.innerHTML = '<div style="padding:30px; text-align:center; width:100%"><h3>Nenhum produto encontrado.</h3></div>';
    } else {
        produtosDaVez.forEach(produto => {
            // Proteção contra aspas no nome
            const nomeSeguro = produto.nome.replace(/"/g, '&quot;').replace(/'/g, "\\'");
            const imagemSrc = produto.imagem ? produto.imagem : 'img/sem-foto.jpg';

            container.innerHTML += `
                <div class="card-produto">
                    <img src="${imagemSrc}" alt="${nomeSeguro}" loading="lazy">
                    <div class="info-produto">
                        <h3>${produto.nome}</h3>
                        <p class="categoria-tag" style="color:#888; font-size:0.8rem; margin-bottom:5px;">
                            ${produto.categoria || 'Geral'}
                        </p>
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

    // Anterior
    if (paginaAtual > 1) {
        container.innerHTML += `<button class="seta" onclick="renderizarLoja(${paginaAtual - 1})">&laquo;</button>`;
    }

    // Números (1 ... 4 5 6 ... 10)
    let inicio = Math.max(1, paginaAtual - 2);
    let fim = Math.min(totalPaginas, paginaAtual + 2);

    if (inicio > 1) container.innerHTML += `<button class="pagina" onclick="renderizarLoja(1)">1</button><span>...</span>`;
    
    for (let i = inicio; i <= fim; i++) {
        const ativo = i === paginaAtual ? 'ativa' : '';
        container.innerHTML += `<button class="pagina ${ativo}" onclick="renderizarLoja(${i})">${i}</button>`;
    }

    if (fim < totalPaginas) container.innerHTML += `<span>...</span><button class="pagina" onclick="renderizarLoja(${totalPaginas})">${totalPaginas}</button>`;

    // Próximo
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

    // 1. Limpa o carrinho
    carrinho = [];
    localStorage.removeItem('carrinho_olivi');
    atualizarVisualCarrinho();

    // 2. Abre o zap
    window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`, '_blank');
}

/* ==========================================================================
   6. FILTROS (CATEGORIAS E BUSCA)
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
    // 1. Atualiza visual do menu
    const itens = document.querySelectorAll('#lista-categorias li');
    itens.forEach(li => {
        li.classList.remove('ativo');
        if (li.innerText.includes(categoria) || (categoria === 'todas' && li.innerText.includes('Todos'))) {
            li.classList.add('ativo');
        }
    });

    // 2. Filtra os dados (CORRIGIDO AQUI)
    if (categoria === 'todas') {
        produtosParaExibir = listaProdutos;
    } else {
        produtosParaExibir = listaProdutos.filter(p => (p.categoria || 'Outros') === categoria);
    }

    // 3. Renderiza e Fecha menu
    paginaAtual = 1;
    renderizarLoja(1);
    
    if (window.innerWidth < 800) toggleSidebar();
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
