// Variáveis globais
let orders = [];
let currentEditId = null;

// Aguardar o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Sistema iniciando...');
    initializeApp();
});

// Inicializar aplicação
function initializeApp() {
    // Carregar dados do localStorage
    loadOrdersFromStorage();

    // Configurar event listeners
    setupEventListeners();

    // Renderizar interface
    renderOrders();
    updateStats();

    console.log('✅ Sistema inicializado com sucesso!');
}

// Configurar todos os event listeners
function setupEventListeners() {
    // Botão principal - Adicionar Nova Ordem
    const addBtn = document.getElementById('addNewOrderBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('🔥 Botão Adicionar Nova Ordem clicado!');
            openModal();
        });
        console.log('✅ Event listener do botão principal configurado');
    } else {
        console.error('❌ ERRO: Botão addNewOrderBtn não encontrado!');
    }

    // Botão fechar modal (X)
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            closeModal();
        });
    }

    // Botão cancelar
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function (e) {
            e.preventDefault();
            closeModal();
        });
    }

    // Formulário
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleFormSubmit();
        });
    }

    // Filtro de status
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function () {
            renderOrders();
        });
    }

    // Fechar modal clicando fora
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    console.log('✅ Todos os event listeners configurados');
}

// Abrir modal
function openModal(orderId = null) {
    console.log('🚀 Abrindo modal...', orderId ? `Editando ordem ${orderId}` : 'Nova ordem');

    const modal = document.getElementById('orderModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('orderForm');

    if (!modal || !modalTitle || !form) {
        console.error('❌ ERRO: Elementos do modal não encontrados!');
        alert('Erro: Não foi possível abrir o formulário!');
        return;
    }

    currentEditId = orderId;

    if (orderId) {
        // Modo edição
        modalTitle.textContent = 'Editar Ordem de Reparo';
        const order = orders.find(o => o.id === orderId);
        if (order) {
            populateForm(order);
        }
    } else {
        // Modo criação
        modalTitle.textContent = 'Adicionar Nova Ordem';
        form.reset();
        // Definir valores padrão
        document.getElementById('priority').value = 'medium';
        document.getElementById('orderStatus').value = 'pending';
    }

    // Mostrar modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll da página

    // Focar no primeiro campo
    setTimeout(() => {
        const firstInput = document.getElementById('customerName');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);

    console.log('✅ Modal aberto com sucesso!');
}

// Fechar modal
function closeModal() {
    console.log('Fechando modal...');

    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaurar scroll da página
        currentEditId = null;

        // Limpar formulário
        const form = document.getElementById('orderForm');
        if (form) {
            form.reset();
        }

        console.log('✅ Modal fechado');
    }
}

// Preencher formulário para edição
function populateForm(order) {
    const fields = {
        'customerName': order.customerName,
        'customerPhone': order.customerPhone,
        'deviceType': order.deviceType,
        'deviceModel': order.deviceModel,
        'problemDescription': order.problemDescription,
        'estimatedCost': order.estimatedCost,
        'priority': order.priority,
        'orderStatus': order.status
    };

    Object.keys(fields).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element && fields[fieldId] !== undefined) {
            element.value = fields[fieldId];
        }
    });
}

// Processar envio do formulário
function handleFormSubmit() {
    console.log('📝 Processando formulário...');

    // Coletar dados do formulário
    const formData = {
        customerName: document.getElementById('customerName').value.trim(),
        customerPhone: document.getElementById('customerPhone').value.trim(),
        deviceType: document.getElementById('deviceType').value,
        deviceModel: document.getElementById('deviceModel').value.trim(),
        problemDescription: document.getElementById('problemDescription').value.trim(),
        estimatedCost: parseFloat(document.getElementById('estimatedCost').value) || 0,
        priority: document.getElementById('priority').value,
        status: document.getElementById('orderStatus').value
    };

    // Validar dados obrigatórios
    if (!validateForm(formData)) {
        return;
    }

    // Salvar ordem
    if (currentEditId) {
        updateOrder(currentEditId, formData);
        showNotification('Ordem atualizada com sucesso!', 'success');
    } else {
        addNewOrder(formData);
        showNotification('Nova ordem adicionada com sucesso!', 'success');
    }

    // Fechar modal
    closeModal();
}

// Validar formulário
function validateForm(data) {
    if (!data.customerName) {
        alert('Por favor, informe o nome do cliente.');
        document.getElementById('customerName').focus();
        return false;
    }

    if (!data.customerPhone) {
        alert('Por favor, informe o telefone do cliente.');
        document.getElementById('customerPhone').focus();
        return false;
    }

    if (!data.deviceType) {
        alert('Por favor, selecione o tipo de aparelho.');
        document.getElementById('deviceType').focus();
        return false;
    }

    if (!data.deviceModel) {
        alert('Por favor, informe o modelo do aparelho.');
        document.getElementById('deviceModel').focus();
        return false;
    }

    if (!data.problemDescription) {
        alert('Por favor, descreva o problema.');
        document.getElementById('problemDescription').focus();
        return false;
    }

    return true;
}

// Adicionar nova ordem
function addNewOrder(orderData) {
    const newOrder = {
        id: generateOrderId(),
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);
    saveOrdersToStorage();
    renderOrders();
    updateStats();

    console.log('✅ Nova ordem adicionada:', newOrder);
}

// Atualizar ordem existente
function updateOrder(orderId, orderData) {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex] = {
            ...orders[orderIndex],
            ...orderData,
            updatedAt: new Date().toISOString()
        };

        saveOrdersToStorage();
        renderOrders();
        updateStats();

        console.log('✅ Ordem atualizada:', orders[orderIndex]);
    }
}

// Deletar ordem
function deleteOrder(orderId) {
    if (confirm('Tem certeza que deseja excluir esta ordem?')) {
        orders = orders.filter(o => o.id !== orderId);
        saveOrdersToStorage();
        renderOrders();
        updateStats();
        showNotification('Ordem excluída com sucesso!', 'success');

        console.log('✅ Ordem excluída:', orderId);
    }
}

// Gerar ID único para ordem
function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Renderizar lista de ordens
function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    const statusFilter = document.getElementById('statusFilter');

    if (!ordersList) {
        console.error('❌ ERRO: Lista de ordens não encontrada!');
        return;
    }

    // Filtrar ordens
    let filteredOrders = orders;
    if (statusFilter && statusFilter.value !== 'all') {
        filteredOrders = orders.filter(order => order.status === statusFilter.value);
    }

    // Verificar se há ordens
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <h3>Nenhuma ordem encontrada</h3>
                <p>Clique em "Adicionar Nova Ordem" para começar</p>
            </div>
        `;
        return;
    }

    // Renderizar ordens
    ordersList.innerHTML = filteredOrders.map(order => createOrderCard(order)).join('');

    console.log(`✅ ${filteredOrders.length} ordens renderizadas`);
}

// Criar card de ordem
function createOrderCard(order) {
    const createdDate = new Date(order.createdAt).toLocaleDateString('pt-BR');
    const statusText = getStatusText(order.status);
    const priorityText = getPriorityText(order.priority);

    return `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">${order.id}</div>
                <div class="order-date">${createdDate}</div>
            </div>
            
            <div class="order-info">
                <div class="info-item">
                    <div class="info-label">Cliente</div>
                    <div class="info-value">${order.customerName}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Telefone</div>
                    <div class="info-value">${order.customerPhone}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Aparelho</div>
                    <div class="info-value">${order.deviceType} - ${order.deviceModel}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Problema</div>
                    <div class="info-value">${order.problemDescription}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Custo Estimado</div>
                    <div class="info-value">R$ ${order.estimatedCost.toFixed(2)}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">
                        <span class="status-badge status-${order.status}">${statusText}</span>
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Prioridade</div>
                    <div class="info-value priority-${order.priority}">${priorityText}</div>
                </div>
            </div>
            
            <div class="order-actions">
                <button class="btn btn-success" onclick="openModal('${order.id}')">
                    ✏️ Editar
                </button>
                <button class="btn btn-danger" onclick="deleteOrder('${order.id}')">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `;
}

// Obter texto do status
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'approved': 'Aprovado',
        'in-progress': 'Em Andamento',
        'completed': 'Concluído'
    };
    return statusMap[status] || status;
}

// Obter texto da prioridade
function getPriorityText(priority) {
    const priorityMap = {
        'low': 'Baixa',
        'medium': 'Média',
        'high': 'Alta'
    };
    return priorityMap[priority] || priority;
}

// Atualizar estatísticas
function updateStats() {
    const totalCount = document.getElementById('totalCount');
    const pendingCount = document.getElementById('pendingCount');
    const inProgressCount = document.getElementById('inProgressCount');
    const completedCount = document.getElementById('completedCount');

    if (totalCount) totalCount.textContent = orders.length;
    if (pendingCount) pendingCount.textContent = orders.filter(o => o.status === 'pending').length;
    if (inProgressCount) inProgressCount.textContent = orders.filter(o => o.status === 'in-progress').length;
    if (completedCount) completedCount.textContent = orders.filter(o => o.status === 'completed').length;
}

// Salvar no localStorage
function saveOrdersToStorage() {
    try {
        localStorage.setItem('cialoja_orders', JSON.stringify(orders));
        console.log('✅ Dados salvos no localStorage');
    } catch (error) {
        console.error('❌ Erro ao salvar no localStorage:', error);
    }
}

// Carregar do localStorage
function loadOrdersFromStorage() {
    try {
        const savedOrders = localStorage.getItem('cialoja_orders');
        if (savedOrders) {
            orders = JSON.parse(savedOrders);
            console.log(`✅ ${orders.length} ordens carregadas do localStorage`);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar do localStorage:', error);
        orders = [];
    }
}

// Mostrar notificação
function showNotification(message, type = 'success') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove
    };
}