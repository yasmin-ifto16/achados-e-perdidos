import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/objetos';

export default function App() {
  const [objetos, setObjetos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    local: '',
    data: '',
    status: 'PERDIDO'
  });

  const carregarObjetos = async () => {
    try {
      setCarregando(true);
      const res = await fetch(API_URL);
      const dados = await res.json();
      // Mostra os mais recentes primeiro
      setObjetos(dados.reverse());
    } catch (err) {
      console.error("Erro ao buscar objetos:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarObjetos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ titulo: '', descricao: '', local: '', data: '', status: 'PERDIDO' });
        carregarObjetos();
      }
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
    }
  };

  const marcarComoDevolvido = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/devolver`, {
        method: 'PATCH'
      });
      if (res.ok) {
        carregarObjetos();
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const removerObjeto = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        carregarObjetos();
      }
    } catch (err) {
      console.error("Erro ao remover objeto:", err);
    }
  };

  // Lógica de filtragem (Status + Texto)
  const objetosFiltrados = objetos.filter((item) => {
    const bateStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
    const termo = busca.toLowerCase();
    const bateTexto =
      item.titulo.toLowerCase().includes(termo) ||
      item.local.toLowerCase().includes(termo) ||
      (item.descricao && item.descricao.toLowerCase().includes(termo));

    return bateStatus && bateTexto;
  });

  return (
    <div className="app-wrapper">
      <header className="navbar">
        <div className="container">
          <h1>📦 Achados & Perdidos</h1>
          <p>Central de registro e recuperação de objetos</p>
        </div>
      </header>

      <main className="container main-layout">
        {/* Coluna da Esquerda: Formulário */}
        <aside className="form-section">
          <div className="card-form">
            <h2>Novo Registro</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Situação</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="PERDIDO">🔴 Perdi este objeto</option>
                  <option value="ENCONTRADO">🟢 Encontrei este objeto</option>
                </select>
              </div>

              <div className="input-group">
                <label>O que é o objeto? *</label>
                <input
                  type="text"
                  placeholder="Ex: Chave de carro, Garrafa, Caderno..."
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Local *</label>
                <input
                  type="text"
                  placeholder="Ex: Biblioteca, Bloco A, Cantina..."
                  value={form.local}
                  onChange={(e) => setForm({ ...form, local: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Data *</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Detalhes adicionais</label>
                <textarea
                  rows="3"
                  placeholder="Cor, marca, adesivos ou onde foi deixado..."
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-submit">
                Publicar Registro
              </button>
            </form>
          </div>
        </aside>

        {/* Coluna da Direita: Filtros e Listagem em Cards */}
        <section className="list-section">
          <div className="filters-bar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Buscar por objeto ou local..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <div className="filter-buttons">
              <button
                className={filtroStatus === 'TODOS' ? 'active' : ''}
                onClick={() => setFiltroStatus('TODOS')}
              >
                Todos ({objetos.length})
              </button>
              <button
                className={filtroStatus === 'PERDIDO' ? 'active perdido' : ''}
                onClick={() => setFiltroStatus('PERDIDO')}
              >
                Perdidos
              </button>
              <button
                className={filtroStatus === 'ENCONTRADO' ? 'active encontrado' : ''}
                onClick={() => setFiltroStatus('ENCONTRADO')}
              >
                Encontrados
              </button>
              <button
                className={filtroStatus === 'DEVOLVIDO' ? 'active devolvido' : ''}
                onClick={() => setFiltroStatus('DEVOLVIDO')}
              >
                Devolvidos
              </button>
            </div>
          </div>

          {carregando ? (
            <p className="empty-state">Carregando registros...</p>
          ) : objetosFiltrados.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum objeto encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {objetosFiltrados.map((item) => (
                <article key={item.id} className={`item-card ${item.status.toLowerCase()}`}>
                  <div className="card-header">
                    <span className={`badge ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                    <span className="card-date">📅 {item.data}</span>
                  </div>

                  <h3>{item.titulo}</h3>
                  {item.descricao && <p className="card-desc">{item.descricao}</p>}
                  <div className="card-footer">
                    <span className="card-location">📍 {item.local}</span>

                    <div className="card-actions">
                      {item.status !== 'DEVOLVIDO' && (
                        <button
                          type="button"
                          className="btn-action btn-devolver"
                          onClick={() => marcarComoDevolvido(item.id)}
                          title="Marcar como devolvido ao dono"
                        >
                          ✓ Devolvido
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-action btn-remover"
                        onClick={() => removerObjeto(item.id)}
                        title="Excluir registro"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}