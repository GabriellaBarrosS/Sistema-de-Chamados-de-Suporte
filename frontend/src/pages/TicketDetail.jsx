import React, { useState } from 'react';
import '../styles/TicketDetail.css';

export default function TicketDetail() {
  // Simulador de perfil logado (facilita testar as regras de permissão)
  const [perfilLogado, setPerfilLogado] = useState('ANALISTA');

  const usuariosSimulados = {
    CLIENTE: { nome: 'Ana Silva', perfil: 'CLIENTE' },
    ANALISTA: { nome: 'Carlos Souza', perfil: 'ANALISTA' },
    ADMINISTRADOR: { nome: 'Admin Sistema', perfil: 'ADMINISTRADOR' },
  };

  // Estado principal do Chamado (Dados iniciais da Paloma)
  const [chamado, setChamado] = useState({
    id: 1042,
    titulo: 'Erro no Sistema de Login',
    descricao: 'Usuários relatam falha ao tentar autenticar na página principal após a última atualização.',
    status: 'EM_ANDAMENTO',
    prioridade: 'Alta',
  });

  // Estado da Timeline (Pessoa 1)
  const [historico, setHistorico] = useState([
    {
      id: 1,
      acao: 'Chamado criado',
      usuario: 'Ana Silva',
      data: '13/11/2026 às 08:30',
    },
    {
      id: 2,
      acao: 'Status alterado para "Em Andamento"',
      usuario: 'Carlos Souza',
      data: '13/11/2026 às 10:15',
    },
  ]);

  // Estado dos Anexos (Pessoa 2)
  const [anexos, setAnexos] = useState([
    {
      id: 1,
      nome: 'print_erro_login.png',
      tamanho: '420 KB',
      url: 'https://via.placeholder.com/600x400.png?text=Print+Erro+Login',
      enviadoPor: 'Ana Silva',
    },
  ]);

  // Estado dos Comentários (Pessoa 2)
  const [comentarios, setComentarios] = useState([
    {
      id: 1,
      autor: 'Ana Silva',
      perfil: 'CLIENTE',
      mensagem: 'Segue em anexo o print da tela travada no momento do login.',
      data: '13/11/2026 às 08:32',
    },
    {
      id: 2,
      autor: 'Carlos Souza',
      perfil: 'ANALISTA',
      mensagem: 'Olá Ana, já identifiquei a falha na autenticação e estou aplicando a correção.',
      data: '13/11/2026 às 10:16',
    },
  ]);

  const [novoComentario, setNovoComentario] = useState('');

  // Função auxiliar de data/hora atual formatada
  const getDataAtual = () => {
    const agora = new Date();
    return agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // --- FUNÇÕES DA PESSOA 1 (Status, Prioridade e Timeline) ---
  const handleAlterarStatus = (novoStatus, labelStatus) => {
    setChamado((prev) => ({ ...prev, status: novoStatus }));
    setHistorico((prev) => [
      ...prev,
      {
        id: Date.now(),
        acao: `Status alterado para "${labelStatus}"`,
        usuario: usuariosSimulados[perfilLogado].nome,
        data: getDataAtual(),
      },
    ]);
  };

  const handleAlterarPrioridade = (novaPrioridade) => {
    setChamado((prev) => ({ ...prev, prioridade: novaPrioridade }));
    setHistorico((prev) => [
      ...prev,
      {
        id: Date.now(),
        acao: `Prioridade alterada para "${novaPrioridade}"`,
        usuario: usuariosSimulados[perfilLogado].nome,
        data: getDataAtual(),
      },
    ]);
  };

  // --- FUNÇÕES DA PESSOA 2 (Anexos e Comentários) ---
  const handleUploadAnexo = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const novoAnexo = {
      id: Date.now(),
      nome: arquivo.name,
      tamanho: (arquivo.size / 1024).toFixed(1) + ' KB',
      url: URL.createObjectURL(arquivo),
      enviadoPor: usuariosSimulados[perfilLogado].nome,
    };

    setAnexos((prev) => [...prev, novoAnexo]);
    e.target.value = '';
  };

  const handleEnviarComentario = (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    const comentarioObj = {
      id: Date.now(),
      autor: usuariosSimulados[perfilLogado].nome,
      perfil: perfilLogado,
      mensagem: novoComentario,
      data: getDataAtual(),
    };

    setComentarios((prev) => [...prev, comentarioObj]);
    setNovoComentario('');
  };

  // Cor da prioridade
  const corPrioridade = {
    Baixa: '#28a745',
    Média: '#ffc107',
    Alta: 'red',
  };

  return (
    <div className="ticket-detail-wrapper">
      {/* Barra para testar os perfis exigidos no trabalho */}
      <div className="perfil-simulador">
        <span>
          <strong>Simular Perfil Logado:</strong> ({usuariosSimulados[perfilLogado].nome})
        </span>
        <select value={perfilLogado} onChange={(e) => setPerfilLogado(e.target.value)} style={{ padding: '4px 8px' }}>
          <option value="CLIENTE">Cliente</option>
          <option value="ANALISTA">Analista</option>
          <option value="ADMINISTRADOR">Administrador</option>
        </select>
      </div>

      <div className="container">
        {/* === PESSOA 1: Cabeçalho e Informações Gerais === */}
        <h2>
          Chamado #{chamado.id}: {chamado.titulo}
        </h2>

        <div className="info-grupo">
          <label>Descrição:</label>
          <p>{chamado.descricao}</p>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div className="info-grupo">
            <label>Status Atual:</label>
            <span style={{ fontWeight: 'bold', color: '#007bff' }}>{chamado.status.replace('_', ' ')}</span>
          </div>

          <div className="info-grupo">
            <label>Prioridade Atual:</label>
            {perfilLogado === 'ANALISTA' || perfilLogado === 'ADMINISTRADOR' ? (
              <select
                value={chamado.prioridade}
                onChange={(e) => handleAlterarPrioridade(e.target.value)}
                style={{ padding: '4px 8px', fontWeight: 'bold', color: corPrioridade[chamado.prioridade] }}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            ) : (
              <span style={{ color: corPrioridade[chamado.prioridade], fontWeight: 'bold' }}>{chamado.prioridade}</span>
            )}
          </div>
        </div>

        {/* === PESSOA 1: Controles de Status (Fluxo e Permissões) === */}
        <div className="acoes">
          <label style={{ marginBottom: '8px', display: 'block', fontWeight: 'bold' }}>
            Ações Disponíveis ({perfilLogado}):
          </label>

          {/* Regras para Analista e Administrador */}
          {(perfilLogado === 'ANALISTA' || perfilLogado === 'ADMINISTRADOR') && (
            <>
              {chamado.status === 'ABERTO' && (
                <button className="btn btn-andamento" onClick={() => handleAlterarStatus('EM_ANDAMENTO', 'Em Andamento')}>
                  Iniciar Atendimento (Em Andamento)
                </button>
              )}
              {chamado.status === 'EM_ANDAMENTO' && (
                <button className="btn btn-resolvido" onClick={() => handleAlterarStatus('RESOLVIDO', 'Resolvido')}>
                  Marcar como Resolvido
                </button>
              )}
              {chamado.status === 'RESOLVIDO' && (
                <button className="btn btn-fechado" onClick={() => handleAlterarStatus('FECHADO', 'Fechado')}>
                  Encerrar Chamado (Fechado)
                </button>
              )}
              {chamado.status === 'FECHADO' && (
                <button className="btn btn-aberto" onClick={() => handleAlterarStatus('ABERTO', 'Aberto')}>
                  Reabrir Chamado
                </button>
              )}
            </>
          )}

          {/* Regras para Cliente */}
          {perfilLogado === 'CLIENTE' && (
            <>
              {chamado.status === 'RESOLVIDO' && (
                <>
                  <button className="btn btn-fechado" onClick={() => handleAlterarStatus('FECHADO', 'Fechado')}>
                    Confirmar Solução e Fechar
                  </button>
                  <button className="btn btn-aberto" onClick={() => handleAlterarStatus('ABERTO', 'Aberto')}>
                    Problema Persiste (Reabrir)
                  </button>
                </>
              )}
              {chamado.status !== 'RESOLVIDO' && chamado.status !== 'FECHADO' && (
                <span style={{ fontSize: '13px', color: '#666' }}>
                  Aguardando atendimento do analista para liberar ações de encerramento.
                </span>
              )}
              {chamado.status === 'FECHADO' && (
                <span style={{ fontSize: '13px', color: '#666' }}>Este chamado já foi finalizado.</span>
              )}
            </>
          )}
        </div>

        {/* === PESSOA 2: Seção de Anexos === */}
        <h3>Anexos ({anexos.length})</h3>
        <div className="anexos-box">
          <label className="upload-label">
            + Anexar Arquivo (Imagem / PDF)
            <input type="file" accept="image/*,.pdf" onChange={handleUploadAnexo} style={{ display: 'none' }} />
          </label>

          {anexos.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Nenhum anexo enviado.</p>
          ) : (
            anexos.map((anexo) => (
              <div key={anexo.id} className="anexo-item">
                <div>
                  <strong style={{ fontSize: '14px' }}>{anexo.nome}</strong>
                  <div style={{ fontSize: '12px', color: '#777' }}>
                    {anexo.tamanho} • Enviado por {anexo.enviadoPor}
                  </div>
                </div>
                <div className="anexo-links">
                  <a href={anexo.url} target="_blank" rel="noopener noreferrer">
                    Visualizar
                  </a>
                  <a href={anexo.url} download={anexo.nome}>
                    Download
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* === PESSOA 2: Seção de Comentários === */}
        <h3>Comentários ({comentarios.length})</h3>
        <div className="comentarios-lista">
          {comentarios.map((c) => (
            <div key={c.id} className={`comentario-card ${c.perfil === 'ANALISTA' ? 'analista' : ''}`}>
              <div className="comentario-header">
                <span>
                  <strong>{c.autor}</strong>
                  <span className="badge-perfil">{c.perfil}</span>
                </span>
                <span>{c.data}</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px' }}>{c.mensagem}</p>
            </div>
          ))}
        </div>

        <form className="comentario-form" onSubmit={handleEnviarComentario}>
          <textarea
            rows="3"
            placeholder="Escreva um comentário..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Enviar Comentário
          </button>
        </form>

        {/* === PESSOA 1: Histórico de Alterações (Timeline) === */}
        <h3>Histórico de Alterações (Timeline)</h3>
        <div className="timeline">
          {historico.map((item) => (
            <div key={item.id} className="timeline-item">
              <strong>{item.acao}</strong> por {item.usuario}
              <div className="timeline-data">{item.data}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}