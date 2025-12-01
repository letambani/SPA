// scripts-demo.js - Versão standalone para GitHub Pages
// Funciona completamente no frontend sem necessidade de backend

// util
const qs = id => document.getElementById(id);
const showError = msg => alert(msg);
const showSuccess = msg => {
  const alert = document.createElement('div');
  alert.className = 'alert alert-success alert-dismissible fade show';
  alert.innerHTML = `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.insertBefore(alert, document.body.firstChild);
  setTimeout(() => alert.remove(), 3000);
};

// Armazenamento de CSVs carregados
const csvCache = new Map();

// Lista de arquivos CSV disponíveis
const availableFiles = [
  'uploads/teste2.csv',
  'uploads/Cópia de Editado Perfil dos Acadêmicos da FMP (respostas) - 14.05.2024 - Respostas ao formulário 1.csv'
];

// Inicializar lista de arquivos
function initFileList() {
  const select = qs('arquivoSelect');
  const compareSelect = qs('arquivoCompare');
  
  // Limpar opções existentes (exceto a primeira)
  select.innerHTML = '<option value="">Selecione um CSV</option>';
  compareSelect.innerHTML = '<option value="">(nenhum)</option>';
  
  availableFiles.forEach(file => {
    const name = file.split('/').pop();
    const opt1 = document.createElement('option');
    opt1.value = file;
    opt1.textContent = name;
    select.appendChild(opt1);
    
    const opt2 = opt1.cloneNode(true);
    compareSelect.appendChild(opt2);
  });
}

// Carregar CSV usando PapaParse
function loadCSV(url) {
  return new Promise((resolve, reject) => {
    // Verificar cache
    if (csvCache.has(url)) {
      resolve(csvCache.get(url));
      return;
    }
    
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: function(results) {
        if (results.errors.length > 0) {
          console.warn('Erros ao parsear CSV:', results.errors);
        }
        const df = results.data;
        csvCache.set(url, df);
        resolve(df);
      },
      error: function(error) {
        reject(error);
      }
    });
  });
}

// Analisar colunas do DataFrame
function analyzeColumns(df) {
  const columns = [];
  if (df.length === 0) return columns;
  
  const firstRow = df[0];
  Object.keys(firstRow).forEach(colName => {
    const colData = df.map(row => row[colName]).filter(v => v != null && v !== '');
    const uniqueValues = [...new Set(colData)];
    const isNumeric = colData.every(v => !isNaN(parseFloat(v)) && isFinite(v));
    
    columns.push({
      name: colName,
      is_numeric: isNumeric,
      unique_values_count: uniqueValues.length,
      sample_values: uniqueValues.slice(0, 10)
    });
  });
  
  return columns;
}

// Aplicar filtros
function applyFilters(df, filtros) {
  if (!filtros || Object.keys(filtros).length === 0) return df;
  
  let filtered = [...df];
  Object.entries(filtros).forEach(([col, values]) => {
    if (!values || values.length === 0) return;
    filtered = filtered.filter(row => {
      const val = String(row[col] || '');
      return values.includes(val);
    });
  });
  return filtered;
}

// Contar valores por categoria
function countValues(df, coluna) {
  const counts = {};
  df.forEach(row => {
    const val = String(row[coluna] || 'N/A');
    counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

// Gerar gráfico Plotly
function generateChart(data, tipo, title) {
  const categories = Object.keys(data);
  const values = Object.values(data);
  
  // Ordenar por valor decrescente
  const sorted = categories.map((cat, i) => ({cat, val: values[i]}))
    .sort((a, b) => b.val - a.val);
  
  const sortedCats = sorted.map(s => s.cat);
  const sortedVals = sorted.map(s => s.val);
  
  let trace;
  const layout = {
    title: title,
    xaxis: { title: 'Categoria' },
    yaxis: { title: 'Quantidade' },
    responsive: true
  };
  
  switch(tipo) {
    case 'pie':
      trace = {
        type: 'pie',
        labels: sortedCats,
        values: sortedVals
      };
      break;
    case 'line':
      trace = {
        type: 'scatter',
        mode: 'lines+markers',
        x: sortedCats,
        y: sortedVals,
        line: { shape: 'linear' }
      };
      break;
    case 'histogram':
      trace = {
        type: 'histogram',
        x: sortedCats,
        y: sortedVals
      };
      break;
    default: // bar
      trace = {
        type: 'bar',
        x: sortedCats,
        y: sortedVals
      };
  }
  
  return { data: [trace], layout };
}

// Quando muda o arquivo base
qs('arquivoSelect')?.addEventListener('change', async () => {
  const filename = qs('arquivoSelect').value;
  qs('colunaSelect').innerHTML = '<option value="">Selecione um arquivo primeiro</option>';
  qs('colunaGroupBy').innerHTML = '<option value="">Nenhum agrupamento</option>';
  qs('filtersArea').innerHTML = '';
  
  if (!filename) return;
  
  try {
    showSuccess('Carregando arquivo...');
    const df = await loadCSV(filename);
    const columns = analyzeColumns(df);
    
    // Popular selects
    qs('colunaSelect').innerHTML = '<option value="">-- escolha --</option>';
    qs('colunaGroupBy').innerHTML = '<option value="">Nenhum agrupamento</option>';
    
    columns.forEach(c => {
      const o = document.createElement('option');
      o.value = c.name;
      o.textContent = c.name;
      qs('colunaSelect').appendChild(o);
      
      const o2 = o.cloneNode(true);
      qs('colunaGroupBy').appendChild(o2);
    });
    
    // Criar filtros
    const filtersDiv = qs('filtersArea');
    filtersDiv.innerHTML = '<div class="small mb-2 text-muted">Filtros rápidos (marque valores)</div>';
    
    columns.forEach(c => {
      if (!c.is_numeric && c.unique_values_count <= 40 && c.unique_values_count > 0) {
        const box = document.createElement('div');
        box.className = 'mb-2';
        box.innerHTML = `<strong class="small">${c.name}</strong><div class="small mt-1" id="filter_${safeId(c.name)}"></div>`;
        filtersDiv.appendChild(box);
        const container = box.querySelector('div');
        
        c.sample_values.forEach(v => {
          const id = `cb_${safeId(c.name)}_${safeId(String(v))}`;
          const html = `<div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="${id}" data-col="${c.name}" value="${v}">
            <label class="form-check-label small" for="${id}">${v}</label>
          </div>`;
          container.insertAdjacentHTML('beforeend', html);
        });
      }
    });
    
    showSuccess('Arquivo carregado com sucesso!');
  } catch (error) {
    showError('Erro ao carregar arquivo: ' + error.message);
    console.error(error);
  }
});

function safeId(s) {
  return String(s).replace(/\s+/g, '_').replace(/[^\w_-]/g, '');
}

// Gather filters
function gatherFilters() {
  const checked = document.querySelectorAll('#filtersArea input[type=checkbox]:checked');
  const filtros = {};
  checked.forEach(cb => {
    const col = cb.dataset.col;
    if (!filtros[col]) filtros[col] = [];
    filtros[col].push(cb.value);
  });
  return filtros;
}

// Render graphs
function renderGraphs(graphs) {
  const container = qs('graficoContainer');
  container.innerHTML = '';
  
  if (!graphs || graphs.length === 0) {
    container.innerHTML = '<p class="text-center text-secondary">Nenhum gráfico gerado.</p>';
    return;
  }
  
  graphs.forEach((graph, idx) => {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    
    const header = document.createElement('div');
    header.className = 'card-header d-flex justify-content-between align-items-center';
    header.innerHTML = `
      <div><strong>${graph.title || ('Gráfico ' + (idx + 1))}</strong></div>
      <button class="btn btn-sm btn-outline-secondary" onclick="downloadPlotlyPNG('chart_${idx}')">📥 PNG</button>
    `;
    card.appendChild(header);
    
    const body = document.createElement('div');
    body.className = 'card-body';
    const plot = document.createElement('div');
    plot.id = `chart_${idx}`;
    plot.style.height = '420px';
    body.appendChild(plot);
    card.appendChild(body);
    container.appendChild(card);
    
    try {
      Plotly.newPlot(plot.id, graph.data, graph.layout, { responsive: true });
    } catch (e) {
      plot.innerHTML = `<pre class="text-danger">Erro ao renderizar: ${String(e)}</pre>`;
    }
  });
  
  qs('btnSalvarTodos')?.classList.remove('d-none');
}

// Download helper
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
    .catch(() => showError('Erro ao gerar imagem'));
}

// Gerar gráfico simples
qs('btnGerar')?.addEventListener('click', async () => {
  const filename = qs('arquivoSelect').value;
  const coluna = qs('colunaSelect').value;
  const tipo = qs('tipoSelect').value;
  const groupby = qs('colunaGroupBy').value || null;
  const filtros = gatherFilters();
  
  if (!filename || !coluna) {
    showError('Escolha arquivo e coluna');
    return;
  }
  
  try {
    showSuccess('Gerando gráfico...');
    const df = await loadCSV(filename);
    let filtered = applyFilters(df, filtros);
    
    const graphs = [];
    
    if (groupby) {
      // Agrupar por categoria
      const grupos = [...new Set(filtered.map(row => String(row[groupby] || 'N/A')))];
      
      grupos.forEach(grupo => {
        const subDf = filtered.filter(row => String(row[groupby] || 'N/A') === grupo);
        const counts = countValues(subDf, coluna);
        const chart = generateChart(counts, tipo, `${coluna} - ${groupby}: ${grupo}`);
        graphs.push({ title: `${coluna} (${groupby}: ${grupo})`, ...chart });
      });
    } else {
      const counts = countValues(filtered, coluna);
      const chart = generateChart(counts, tipo, coluna);
      graphs.push({ title: coluna, ...chart });
    }
    
    renderGraphs(graphs);
    showSuccess('Gráfico gerado com sucesso!');
  } catch (error) {
    showError('Erro ao gerar gráfico: ' + error.message);
    console.error(error);
  }
});

// Gerar e comparar
qs('btnGerarComparar')?.addEventListener('click', async () => {
  const filename = qs('arquivoSelect').value;
  const compare = qs('arquivoCompare').value;
  const coluna = qs('colunaSelect').value;
  const tipo = qs('tipoSelect').value;
  const groupby = qs('colunaGroupBy').value || null;
  const filtros = gatherFilters();
  
  if (!filename || !coluna) {
    showError('Escolha arquivo base e coluna');
    return;
  }
  if (!compare) {
    showError('Escolha o arquivo para comparar');
    return;
  }
  if (compare === filename) {
    showError('Escolha um arquivo diferente para comparar');
    return;
  }
  
  try {
    showSuccess('Gerando comparação...');
    const df1 = await loadCSV(filename);
    const df2 = await loadCSV(compare);
    
    let filtered1 = applyFilters(df1, filtros);
    let filtered2 = applyFilters(df2, filtros);
    
    const graphs = [];
    const grupos = groupby ? [...new Set([...filtered1, ...filtered2].map(row => String(row[groupby] || 'N/A')))] : [null];
    
    grupos.forEach(grupo => {
      let sub1 = grupo ? filtered1.filter(row => String(row[groupby] || 'N/A') === grupo) : filtered1;
      let sub2 = grupo ? filtered2.filter(row => String(row[groupby] || 'N/A') === grupo) : filtered2;
      
      const c1 = countValues(sub1, coluna);
      const c2 = countValues(sub2, coluna);
      
      // Gráfico base
      const chart1 = generateChart(c1, tipo, `Base - ${coluna}${grupo ? ` (${groupby}: ${grupo})` : ''}`);
      graphs.push({ title: `Base — ${filename.split('/').pop()}${grupo ? ` (${groupby}: ${grupo})` : ''}`, ...chart1 });
      
      // Gráfico comparador
      const chart2 = generateChart(c2, tipo, `Comparador - ${coluna}${grupo ? ` (${groupby}: ${grupo})` : ''}`);
      graphs.push({ title: `Comparador — ${compare.split('/').pop()}${grupo ? ` (${groupby}: ${grupo})` : ''}`, ...chart2 });
      
      // Gráfico de variação percentual
      const allCats = [...new Set([...Object.keys(c1), ...Object.keys(c2)])];
      const pctData = {};
      allCats.forEach(cat => {
        const v1 = c1[cat] || 0;
        const v2 = c2[cat] || 0;
        const pct = v1 === 0 ? (v2 > 0 ? 100 : 0) : ((v2 - v1) / v1) * 100;
        pctData[cat] = pct;
      });
      
      const pctChart = generateChart(pctData, 'bar', `Variação %${grupo ? ` (${groupby}: ${grupo})` : ''}`);
      pctChart.layout.yaxis.title = 'Variação (%)';
      graphs.push({ title: `Variação % — Comparação${grupo ? ` (${groupby}: ${grupo})` : ''}`, ...pctChart });
    });
    
    renderGraphs(graphs);
    showSuccess('Comparação gerada com sucesso!');
  } catch (error) {
    showError('Erro ao comparar: ' + error.message);
    console.error(error);
  }
});

// Upload de arquivo local
qs('uploadBtnModal')?.addEventListener('click', () => {
  const input = qs('csvFile');
  const file = input.files[0];
  if (!file) {
    showError('Selecione um CSV.');
    return;
  }
  
  if (!file.name.toLowerCase().endsWith('.csv')) {
    showError('Envie apenas arquivos CSV');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    Papa.parse(e.target.result, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (results.errors.length > 0) {
          console.warn('Erros ao parsear CSV:', results.errors);
        }
        
        // Criar URL de objeto para cache
        const objectUrl = URL.createObjectURL(file);
        csvCache.set(objectUrl, results.data);
        
        // Adicionar à lista
        const name = file.name;
        if (!availableFiles.includes(objectUrl)) {
          availableFiles.push(objectUrl);
          
          const select = qs('arquivoSelect');
          const compareSelect = qs('arquivoCompare');
          
          const opt1 = document.createElement('option');
          opt1.value = objectUrl;
          opt1.textContent = name + ' (uploaded)';
          select.appendChild(opt1);
          
          const opt2 = opt1.cloneNode(true);
          compareSelect.appendChild(opt2);
        }
        
        showSuccess('Arquivo carregado com sucesso!');
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(qs('uploadModal').closest('.modal'));
        if (modal) modal.hide();
      },
      error: function(error) {
        showError('Erro ao processar CSV: ' + error.message);
      }
    });
  };
  reader.readAsText(file);
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
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay entre downloads
    } catch (e) {
      console.warn('Erro ao salvar', id, e);
    }
  }
});

// Recarregar
qs('refreshFilesBtn')?.addEventListener('click', () => {
  initFileList();
  showSuccess('Lista de arquivos atualizada');
});

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
  initFileList();
});

