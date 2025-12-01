// prototipo.js - Protótipo de Alta Fidelidade para Aprovação
// Demonstra todas as funcionalidades com dados mock

const qs = id => document.getElementById(id);

// Dados mock para demonstração
const mockData = {
  cursos: {
    'Medicina': 245,
    'Enfermagem': 180,
    'Fisioterapia': 120,
    'Psicologia': 95,
    'Nutrição': 78,
    'Farmácia': 65,
    'Odontologia': 52
  },
  cursosPorCampus: {
    'Florianópolis': {
      'Medicina': 120,
      'Enfermagem': 85,
      'Fisioterapia': 60,
      'Psicologia': 45
    },
    'Blumenau': {
      'Medicina': 80,
      'Enfermagem': 60,
      'Fisioterapia': 40,
      'Nutrição': 50
    },
    'Joinville': {
      'Medicina': 45,
      'Enfermagem': 35,
      'Fisioterapia': 20,
      'Farmácia': 40
    }
  },
  comparacao: {
    '2024': {
      'Medicina': 245,
      'Enfermagem': 180,
      'Fisioterapia': 120,
      'Psicologia': 95
    },
    '2023': {
      'Medicina': 220,
      'Enfermagem': 165,
      'Fisioterapia': 110,
      'Psicologia': 88
    }
  }
};

// Gerar gráfico Plotly
function generateChart(data, tipo, title, subtitle = '') {
  const categories = Object.keys(data);
  const values = Object.values(data);
  
  // Ordenar por valor decrescente
  const sorted = categories.map((cat, i) => ({cat, val: values[i]}))
    .sort((a, b) => b.val - a.val);
  
  const sortedCats = sorted.map(s => s.cat);
  const sortedVals = sorted.map(s => s.val);
  
  const colors = ['#0B3353', '#E78E74', '#4A90E2', '#50C878', '#FFB347', '#9B59B6', '#E74C3C'];
  
  let trace;
  const layout = {
    title: {
      text: title + (subtitle ? `<br><sub>${subtitle}</sub>` : ''),
      font: { size: 16, color: '#0B3353' }
    },
    xaxis: { 
      title: 'Categoria',
      tickangle: -45
    },
    yaxis: { title: 'Quantidade' },
    responsive: true,
    showlegend: false,
    margin: { t: 80, b: 80, l: 60, r: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
  };
  
  switch(tipo) {
    case 'pie':
      trace = {
        type: 'pie',
        labels: sortedCats,
        values: sortedVals,
        marker: { colors: colors.slice(0, sortedCats.length) },
        textinfo: 'label+percent',
        textposition: 'outside',
        hole: 0.4
      };
      break;
    case 'line':
      trace = {
        type: 'scatter',
        mode: 'lines+markers',
        x: sortedCats,
        y: sortedVals,
        line: { 
          shape: 'linear',
          color: '#0B3353',
          width: 3
        },
        marker: {
          color: '#E78E74',
          size: 10
        }
      };
      break;
    case 'histogram':
      trace = {
        type: 'histogram',
        x: sortedCats,
        y: sortedVals,
        marker: { color: '#0B3353' }
      };
      break;
    default: // bar
      trace = {
        type: 'bar',
        x: sortedCats,
        y: sortedVals,
        marker: {
          color: sortedVals.map((_, i) => colors[i % colors.length]),
          line: { color: '#fff', width: 1 }
        },
        text: sortedVals.map(v => v.toString()),
        textposition: 'outside'
      };
  }
  
  return { data: [trace], layout };
}

// Renderizar gráficos
function renderGraphs(graphs) {
  const container = qs('graficoContainer');
  container.innerHTML = '';
  
  if (!graphs || graphs.length === 0) {
    container.innerHTML = '<p class="text-center text-secondary">Nenhum gráfico gerado ainda.</p>';
    return;
  }
  
  graphs.forEach((graph, idx) => {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.style.border = '1px solid rgba(11,51,83,0.1)';
    
    const header = document.createElement('div');
    header.className = 'card-header d-flex justify-content-between align-items-center';
    header.style.background = '#f8f9fa';
    header.innerHTML = `
      <div><strong>${graph.title || ('Gráfico ' + (idx + 1))}</strong></div>
      <button class="btn btn-sm btn-outline-secondary" onclick="downloadPlotlyPNG('chart_${idx}')">📥 PNG</button>
    `;
    card.appendChild(header);
    
    const body = document.createElement('div');
    body.className = 'card-body';
    const plot = document.createElement('div');
    plot.id = `chart_${idx}`;
    plot.style.height = '450px';
    body.appendChild(plot);
    card.appendChild(body);
    container.appendChild(card);
    
    try {
      Plotly.newPlot(plot.id, graph.data, graph.layout, { 
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
      });
    } catch (e) {
      plot.innerHTML = `<pre class="text-danger">Erro ao renderizar: ${String(e)}</pre>`;
    }
  });
  
  qs('btnSalvarTodos')?.classList.remove('d-none');
}

// Download PNG
function downloadPlotlyPNG(divId) {
  Plotly.toImage(divId, { format: 'png', width: 1200, height: 700 })
    .then(dataUrl => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = divId + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(() => alert('Erro ao gerar imagem'));
}

// Gerar gráfico simples
qs('btnGerar')?.addEventListener('click', () => {
  const coluna = qs('colunaSelect').value;
  const tipo = qs('tipoSelect').value;
  const groupby = qs('colunaGroupBy').value || null;
  
  if (!coluna) {
    alert('Selecione uma coluna para análise');
    return;
  }
  
  const graphs = [];
  
  if (groupby && groupby === 'Campus') {
    // Gráficos agrupados por campus
    Object.entries(mockData.cursosPorCampus).forEach(([campus, cursos]) => {
      const chart = generateChart(
        cursos, 
        tipo, 
        coluna, 
        `${groupby}: ${campus}`
      );
      graphs.push({
        title: `${coluna} — ${groupby}: ${campus}`,
        ...chart
      });
    });
  } else {
    // Gráfico geral
    const chart = generateChart(mockData.cursos, tipo, coluna);
    graphs.push({ title: coluna, ...chart });
  }
  
  renderGraphs(graphs);
});

// Gerar e comparar
qs('btnGerarComparar')?.addEventListener('click', () => {
  const coluna = qs('colunaSelect').value;
  const tipo = qs('tipoSelect').value;
  const groupby = qs('colunaGroupBy').value || null;
  
  if (!coluna) {
    alert('Selecione uma coluna para análise');
    return;
  }
  
  const graphs = [];
  
  // Gráfico base (2024)
  const chart1 = generateChart(mockData.comparacao['2024'], tipo, `Base — Perfil Acadêmicos 2024`);
  graphs.push({ title: `Base — Perfil Acadêmicos 2024`, ...chart1 });
  
  // Gráfico comparador (2023)
  const chart2 = generateChart(mockData.comparacao['2023'], tipo, `Comparador — Perfil Acadêmicos 2023`);
  graphs.push({ title: `Comparador — Perfil Acadêmicos 2023`, ...chart2 });
  
  // Gráfico de variação percentual
  const pctData = {};
  Object.keys(mockData.comparacao['2024']).forEach(cat => {
    const v1 = mockData.comparacao['2024'][cat];
    const v2 = mockData.comparacao['2023'][cat];
    const pct = v1 === 0 ? (v2 > 0 ? 100 : 0) : ((v2 - v1) / v1) * 100;
    pctData[cat] = pct;
  });
  
  const pctChart = generateChart(pctData, 'bar', 'Variação Percentual');
  pctChart.layout.yaxis.title = 'Variação (%)';
  pctChart.layout.shapes = [{
    type: 'line',
    x0: 0,
    x1: 1,
    y0: 0,
    y1: 0,
    xref: 'paper',
    yref: 'y',
    line: { color: 'gray', width: 2, dash: 'dash' }
  }];
  graphs.push({ title: 'Variação % — Comparação 2023 vs 2024', ...pctChart });
  
  renderGraphs(graphs);
});

// Salvar todos
qs('btnSalvarTodos')?.addEventListener('click', async () => {
  const charts = document.querySelectorAll('#graficoContainer [id^="chart_"]');
  for (let i = 0; i < charts.length; i++) {
    const id = charts[i].id;
    try {
      const dataUrl = await Plotly.toImage(id, { format: 'png', width: 1200, height: 700 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      console.warn('Erro ao salvar', id, e);
    }
  }
  alert('Todos os gráficos foram baixados!');
});

// Upload (simulação)
qs('uploadBtnModal')?.addEventListener('click', () => {
  const input = qs('csvFile');
  if (!input.files[0]) {
    alert('Selecione um arquivo CSV');
    return;
  }
  alert('Upload simulado! No sistema real, o arquivo seria enviado ao servidor.');
  const modal = bootstrap.Modal.getInstance(qs('uploadModal').closest('.modal'));
  if (modal) modal.hide();
});

// Recarregar
qs('refreshFilesBtn')?.addEventListener('click', () => {
  alert('Lista de arquivos atualizada!');
});

// Carregar gráficos de exemplo ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  // Gerar gráfico de exemplo automaticamente
  setTimeout(() => {
    const chart = generateChart(mockData.cursos, 'bar', 'Curso', 'Distribuição de alunos por curso');
    renderGraphs([{ title: 'Curso — Exemplo de Visualização', ...chart }]);
  }, 500);
});

// Tutorial (Shepherd.js)
document.addEventListener('DOMContentLoaded', () => {
  const btnTutorial = qs('btnTutorial');
  if (btnTutorial && typeof Shepherd !== 'undefined') {
    btnTutorial.addEventListener('click', () => {
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'shadow-lg bg-white p-3 rounded',
          scrollTo: true,
          cancelIcon: { enabled: true }
        }
      });
      
      tour.addStep({
        id: 'welcome',
        title: 'Bem-vindo ao SPA 📊',
        text: 'Este é o protótipo de alta fidelidade do Sistema de Perfil Discente. Explore todas as funcionalidades!',
        buttons: [{ text: 'Próximo', action: tour.next }]
      });
      
      tour.addStep({
        id: 'files',
        title: 'Arquivos CSV',
        text: 'Selecione um arquivo base para análise. Você pode comparar com outro arquivo também.',
        attachTo: { element: '#arquivoSelect', on: 'bottom' },
        buttons: [
          { text: 'Voltar', action: tour.back },
          { text: 'Próximo', action: tour.next }
        ]
      });
      
      tour.addStep({
        id: 'config',
        title: 'Configuração',
        text: 'Escolha a coluna principal, tipo de gráfico e filtros. Use "Agrupar por" para análises segmentadas.',
        attachTo: { element: '#colunaSelect', on: 'right' },
        buttons: [
          { text: 'Voltar', action: tour.back },
          { text: 'Próximo', action: tour.next }
        ]
      });
      
      tour.addStep({
        id: 'generate',
        title: 'Gerar Gráfico',
        text: 'Clique aqui para gerar visualizações interativas dos seus dados.',
        attachTo: { element: '#btnGerar', on: 'top' },
        buttons: [
          { text: 'Voltar', action: tour.back },
          { text: 'Concluir', action: tour.complete }
        ]
      });
      
      tour.start();
    });
  }
});

