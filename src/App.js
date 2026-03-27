import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

const usuarios = [
  {
    id: 1,
    nome: "Jonas",
    usuario: "jonas",
    senha: "123",
    perfil: "tecnico",
  },
  {
    id: 2,
    nome: "Central Grupo ON",
    usuario: "grupoon",
    senha: "protege1234",
    perfil: "central",
  },
];

const STORAGE_KEY = "atendimentos_grupoon_local_v3";

export default function App() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [abaCentral, setAbaCentral] = useState("atendimentos");

  const [form, setForm] = useState({
    cliente: "",
    endereco: "",
    numeroResidencia: "",
    bairro: "",
    data: new Date().toISOString().slice(0, 10),
    horaInicio: "",
    horaTermino: "",
    defeitoApresentado: "",
    servicoRealizado: "",
    valor: "",
    pagamento: "Pix",
    tecnico: "",
  });

  const [central, setCentral] = useState(() => {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  });

  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [dataInicioFiltro, setDataInicioFiltro] = useState("");
  const [dataFimFiltro, setDataFimFiltro] = useState("");

  useEffect(() => {
    const agora = new Date();
    const noventaDiasMs = 90 * 24 * 60 * 60 * 1000;

    const filtrados = central.filter((item) => {
      if (!item.criadoEmTimestamp) return true;
      return agora.getTime() - item.criadoEmTimestamp <= noventaDiasMs;
    });

    if (filtrados.length !== central.length) {
      setCentral(filtrados);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(central));
    }
  }, [central]);

  function fazerLogin() {
    const usuarioEncontrado = usuarios.find(
      (u) => u.usuario === usuario && u.senha === senha
    );

    if (usuarioEncontrado) {
      setUsuarioLogado(usuarioEncontrado);
      setErroLogin("");
      setMensagem("");
      setForm((prev) => ({
        ...prev,
        tecnico: usuarioEncontrado.nome,
      }));
    } else {
      setErroLogin("Usuário ou senha inválidos");
    }
  }

  function sair() {
    setUsuarioLogado(null);
    setUsuario("");
    setSenha("");
    setErroLogin("");
    setMensagem("");
    setBusca("");
    setAbaCentral("atendimentos");
    setDataInicioFiltro("");
    setDataFimFiltro("");
  }

  function alterarCampo(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function gerarProtocolo() {
    const ano = new Date().getFullYear();
    const numero = Math.floor(1000 + Math.random() * 9000);
    return `AT-${ano}-${numero}`;
  }

  function valorParaNumero(valor) {
    const numero = Number(
      String(valor || "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "")
    );

    return isNaN(numero) ? 0 : numero;
  }

  function formatarMoeda(valor) {
    const numero = typeof valor === "number" ? valor : valorParaNumero(valor);

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function enviarRelatorio(e) {
    e.preventDefault();

    const tecnicoNome =
      usuarioLogado && usuarioLogado.perfil === "tecnico"
        ? usuarioLogado.nome
        : form.tecnico;

    const agora = new Date();

    const novo = {
      ...form,
      tecnico: tecnicoNome,
      protocolo: gerarProtocolo(),
      valorFormatado: formatarMoeda(form.valor),
      enviadoEm: agora.toLocaleString("pt-BR"),
      criadoEmTimestamp: agora.getTime(),
      criadoEmDataISO: agora.toISOString(),
    };

    setCentral((prev) => [novo, ...prev]);
    setMensagem(`Atendimento ${novo.protocolo} salvo com sucesso.`);

    setForm((prev) => ({
      ...prev,
      cliente: "",
      endereco: "",
      numeroResidencia: "",
      bairro: "",
      data: new Date().toISOString().slice(0, 10),
      horaInicio: "",
      horaTermino: "",
      defeitoApresentado: "",
      servicoRealizado: "",
      valor: "",
      pagamento: "Pix",
      tecnico: tecnicoNome,
    }));
  }

  function apagarAtendimento(protocolo) {
    const confirmar = window.confirm("Deseja realmente apagar este atendimento?");
    if (!confirmar) return;

    setCentral((prev) => prev.filter((item) => item.protocolo !== protocolo));
  }

  function dentroDoFiltroData(item) {
    if (!dataInicioFiltro && !dataFimFiltro) return true;

    const dataItem = item.data || "";

    if (dataInicioFiltro && dataItem < dataInicioFiltro) return false;
    if (dataFimFiltro && dataItem > dataFimFiltro) return false;

    return true;
  }

  const atendimentosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    let lista = central;

    if (usuarioLogado && usuarioLogado.perfil === "tecnico") {
      lista = central.filter((item) => item.tecnico === usuarioLogado.nome);
    }

    if (usuarioLogado && usuarioLogado.perfil === "central") {
      lista = lista.filter((item) => dentroDoFiltroData(item));
    }

    return lista.filter((item) =>
      [
        item.protocolo,
        item.cliente,
        item.endereco,
        item.numeroResidencia,
        item.bairro,
        item.data,
        item.horaInicio,
        item.horaTermino,
        item.defeitoApresentado,
        item.servicoRealizado,
        item.pagamento,
        item.tecnico,
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [central, busca, usuarioLogado, dataInicioFiltro, dataFimFiltro]);

  const atendimentosFinanceiro = useMemo(() => {
    return central.filter((item) => dentroDoFiltroData(item));
  }, [central, dataInicioFiltro, dataFimFiltro]);

  const resumoFinanceiro = useMemo(() => {
    return atendimentosFinanceiro.reduce(
      (acc, item) => {
        const valor = valorParaNumero(item.valor);

        acc.quantidade += 1;
        acc.total += valor;

        if (item.pagamento === "Pix") acc.pix += valor;
        else if (item.pagamento === "Cartão") acc.cartao += valor;
        else if (item.pagamento === "Dinheiro") acc.dinheiro += valor;

        return acc;
      },
      {
        quantidade: 0,
        total: 0,
        pix: 0,
        cartao: 0,
        dinheiro: 0,
      }
    );
  }, [atendimentosFinanceiro]);

  const hojeISO = new Date().toISOString().slice(0, 10);

  const fechamentoDoDia = useMemo(() => {
    const listaHoje = central.filter((item) => item.data === hojeISO);

    const resultado = {
      quantidade: 0,
      total: 0,
      pix: 0,
      cartao: 0,
      dinheiro: 0,
      porTecnico: {},
    };

    listaHoje.forEach((item) => {
      const valor = valorParaNumero(item.valor);
      resultado.quantidade += 1;
      resultado.total += valor;

      if (item.pagamento === "Pix") resultado.pix += valor;
      else if (item.pagamento === "Cartão") resultado.cartao += valor;
      else if (item.pagamento === "Dinheiro") resultado.dinheiro += valor;

      if (!resultado.porTecnico[item.tecnico]) {
        resultado.porTecnico[item.tecnico] = {
          quantidade: 0,
          total: 0,
        };
      }

      resultado.porTecnico[item.tecnico].quantidade += 1;
      resultado.porTecnico[item.tecnico].total += valor;
    });

    return resultado;
  }, [central, hojeISO]);

  function exportarPdfFinanceiro() {
    const conteudo = `
      <html>
        <head>
          <title>Relatório Financeiro - Grupo ON</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1, h2 { margin-bottom: 8px; }
            .bloco { border: 1px solid #ddd; border-radius: 10px; padding: 12px; margin-bottom: 12px; }
            p { margin: 6px 0; }
          </style>
        </head>
        <body>
          <h1>Grupo ON</h1>
          <h2>Relatório Financeiro</h2>
          <div class="bloco">
            <p><strong>Período:</strong> ${dataInicioFiltro || "Início"} até ${dataFimFiltro || "Hoje"}</p>
            <p><strong>Total de atendimentos:</strong> ${resumoFinanceiro.quantidade}</p>
            <p><strong>Total geral:</strong> ${formatarMoeda(resumoFinanceiro.total)}</p>
            <p><strong>Pix:</strong> ${formatarMoeda(resumoFinanceiro.pix)}</p>
            <p><strong>Cartão:</strong> ${formatarMoeda(resumoFinanceiro.cartao)}</p>
            <p><strong>Dinheiro:</strong> ${formatarMoeda(resumoFinanceiro.dinheiro)}</p>
          </div>

          <h2>Fechamento do dia</h2>
          <div class="bloco">
            <p><strong>Data:</strong> ${hojeISO}</p>
            <p><strong>Quantidade:</strong> ${fechamentoDoDia.quantidade}</p>
            <p><strong>Total:</strong> ${formatarMoeda(fechamentoDoDia.total)}</p>
            <p><strong>Pix:</strong> ${formatarMoeda(fechamentoDoDia.pix)}</p>
            <p><strong>Cartão:</strong> ${formatarMoeda(fechamentoDoDia.cartao)}</p>
            <p><strong>Dinheiro:</strong> ${formatarMoeda(fechamentoDoDia.dinheiro)}</p>
          </div>

          <h2>Fechamento por técnico</h2>
          ${Object.entries(fechamentoDoDia.porTecnico)
            .map(
              ([tecnico, dados]) => `
                <div class="bloco">
                  <p><strong>Técnico:</strong> ${tecnico}</p>
                  <p><strong>Quantidade:</strong> ${dados.quantidade}</p>
                  <p><strong>Total:</strong> ${formatarMoeda(dados.total)}</p>
                </div>
              `
            )
            .join("")}
        </body>
      </html>
    `;

    const janela = window.open("", "_blank");
    if (!janela) return;

    janela.document.write(conteudo);
    janela.document.close();
    janela.focus();

    setTimeout(() => {
      janela.print();
    }, 500);
  }

  if (!usuarioLogado) {
    return (
      <div className="page loginPage">
        <div className="loginBox">
          <div className="logoArea">
            <div className="logoTexto">GRUPO ON</div>
            <h2>Grupo ON</h2>
            <p>Ligados em sua Segurança</p>
          </div>

          <div className="loginForm">
            <input
              className="input"
              type="text"
              placeholder="Usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />

            <input
              className="input"
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <button className="button" onClick={fazerLogin}>
              Entrar
            </button>

            {erroLogin && <p className="error">{erroLogin}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="topo">
          <div className="topoEsquerda">
            <div className="logoTopoTexto">ON</div>
            <div>
              <h1>Grupo ON</h1>
              <p>
                Usuário logado: <strong>{usuarioLogado.nome}</strong> | Perfil:{" "}
                <strong>{usuarioLogado.perfil}</strong>
              </p>
            </div>
          </div>

          <button className="logoutButton" onClick={sair}>
            Sair
          </button>
        </div>

        {usuarioLogado.perfil === "tecnico" && (
          <div className="grid">
            <div className="card">
              <h2>Novo Atendimento</h2>

              <form onSubmit={enviarRelatorio}>
                <div className="row">
                  <input
                    className="input"
                    name="cliente"
                    value={form.cliente}
                    onChange={alterarCampo}
                    placeholder="Nome do cliente"
                    required
                  />
                </div>

                <div className="row">
                  <input
                    className="input"
                    name="endereco"
                    value={form.endereco}
                    onChange={alterarCampo}
                    placeholder="Endereço"
                    required
                  />
                  <input
                    className="input"
                    name="numeroResidencia"
                    value={form.numeroResidencia}
                    onChange={alterarCampo}
                    placeholder="Número da residência"
                    required
                  />
                </div>

                <div className="row">
                  <input
                    className="input"
                    name="bairro"
                    value={form.bairro}
                    onChange={alterarCampo}
                    placeholder="Bairro"
                    required
                  />
                  <input
                    className="input"
                    type="date"
                    name="data"
                    value={form.data}
                    onChange={alterarCampo}
                    required
                  />
                </div>

                <div className="row">
                  <input
                    className="input"
                    type="time"
                    name="horaInicio"
                    value={form.horaInicio}
                    onChange={alterarCampo}
                    required
                  />
                  <input
                    className="input"
                    type="time"
                    name="horaTermino"
                    value={form.horaTermino}
                    onChange={alterarCampo}
                    required
                  />
                </div>

                <textarea
                  className="textarea"
                  name="defeitoApresentado"
                  value={form.defeitoApresentado}
                  onChange={alterarCampo}
                  placeholder="Defeito apresentado"
                  required
                />

                <textarea
                  className="textarea"
                  name="servicoRealizado"
                  value={form.servicoRealizado}
                  onChange={alterarCampo}
                  placeholder="Serviço realizado"
                  required
                />

                <div className="row">
                  <input
                    className="input"
                    name="valor"
                    value={form.valor}
                    onChange={alterarCampo}
                    placeholder="Valor"
                    required
                  />

                  <select
                    className="input"
                    name="pagamento"
                    value={form.pagamento}
                    onChange={alterarCampo}
                  >
                    <option>Pix</option>
                    <option>Cartão</option>
                    <option>Dinheiro</option>
                  </select>
                </div>

                <div className="valorTexto">
                  Valor: {formatarMoeda(form.valor)}
                </div>

                <button className="button" type="submit">
                  Salvar atendimento
                </button>
              </form>

              {mensagem && <p className="success">{mensagem}</p>}
            </div>

            <div className="card">
              <h2>Meus Atendimentos</h2>

              <input
                className="input"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar atendimento"
              />

              <div className="lista">
                {atendimentosFiltrados.length === 0 ? (
                  <p>Nenhum atendimento encontrado.</p>
                ) : (
                  atendimentosFiltrados.map((item) => (
                    <div key={item.protocolo} className="item">
                      <h3>
                        {item.cliente} - {item.protocolo}
                      </h3>
                      <p><strong>Endereço:</strong> {item.endereco}</p>
                      <p><strong>Número:</strong> {item.numeroResidencia}</p>
                      <p><strong>Bairro:</strong> {item.bairro}</p>
                      <p><strong>Data:</strong> {item.data}</p>
                      <p><strong>Hora início:</strong> {item.horaInicio}</p>
                      <p><strong>Hora término:</strong> {item.horaTermino}</p>
                      <p><strong>Defeito:</strong> {item.defeitoApresentado}</p>
                      <p><strong>Serviço:</strong> {item.servicoRealizado}</p>
                      <p><strong>Valor:</strong> {item.valorFormatado}</p>
                      <p><strong>Pagamento:</strong> {item.pagamento}</p>
                      <p><strong>Técnico:</strong> {item.tecnico}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {usuarioLogado.perfil === "central" && (
          <>
            <div className="abasCentral">
              <button
                className={abaCentral === "atendimentos" ? "abaBtn ativa" : "abaBtn"}
                onClick={() => setAbaCentral("atendimentos")}
              >
                Atendimentos
              </button>

              <button
                className={abaCentral === "financeiro" ? "abaBtn ativa" : "abaBtn"}
                onClick={() => setAbaCentral("financeiro")}
              >
                Financeiro
              </button>
            </div>

            <div className="card filtroCard">
              <h2>Filtro por data</h2>
              <div className="row">
                <input
                  className="input"
                  type="date"
                  value={dataInicioFiltro}
                  onChange={(e) => setDataInicioFiltro(e.target.value)}
                />
                <input
                  className="input"
                  type="date"
                  value={dataFimFiltro}
                  onChange={(e) => setDataFimFiltro(e.target.value)}
                />
              </div>
            </div>

            {abaCentral === "atendimentos" && (
              <div className="card">
                <h2>Todos os Atendimentos</h2>

                <input
                  className="input"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar atendimento"
                />

                <div className="lista">
                  {atendimentosFiltrados.length === 0 ? (
                    <p>Nenhum atendimento encontrado.</p>
                  ) : (
                    atendimentosFiltrados.map((item) => (
                      <div key={item.protocolo} className="item">
                        <h3>
                          {item.cliente} - {item.protocolo}
                        </h3>
                        <p><strong>Endereço:</strong> {item.endereco}</p>
                        <p><strong>Número:</strong> {item.numeroResidencia}</p>
                        <p><strong>Bairro:</strong> {item.bairro}</p>
                        <p><strong>Data:</strong> {item.data}</p>
                        <p><strong>Hora início:</strong> {item.horaInicio}</p>
                        <p><strong>Hora término:</strong> {item.horaTermino}</p>
                        <p><strong>Defeito apresentado:</strong> {item.defeitoApresentado}</p>
                        <p><strong>Serviço realizado:</strong> {item.servicoRealizado}</p>
                        <p><strong>Valor:</strong> {item.valorFormatado}</p>
                        <p><strong>Forma de pagamento:</strong> {item.pagamento}</p>
                        <p><strong>Técnico:</strong> {item.tecnico}</p>
                        <p><strong>Salvo em:</strong> {item.enviadoEm}</p>

                        <div className="acoesItem">
                          <button
                            className="deleteButton"
                            onClick={() => apagarAtendimento(item.protocolo)}
                          >
                            Apagar atendimento
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {abaCentral === "financeiro" && (
              <>
                <div className="card">
                  <h2>Financeiro</h2>

                  <div className="financeiroBox">
                    <p><strong>Total de atendimentos:</strong> {resumoFinanceiro.quantidade}</p>
                    <p><strong>Soma de todos os recebimentos:</strong> {formatarMoeda(resumoFinanceiro.total)}</p>
                    <p><strong>Total em Pix:</strong> {formatarMoeda(resumoFinanceiro.pix)}</p>
                    <p><strong>Total em Cartão:</strong> {formatarMoeda(resumoFinanceiro.cartao)}</p>
                    <p><strong>Total em Dinheiro:</strong> {formatarMoeda(resumoFinanceiro.dinheiro)}</p>
                  </div>

                  <div className="acoesFinanceiro">
                    <button className="button" onClick={exportarPdfFinanceiro}>
                      Exportar relatório em PDF
                    </button>
                  </div>
                </div>

                <div className="card">
                  <h2>Fechamento do dia</h2>

                  <div className="financeiroBox">
                    <p><strong>Data:</strong> {hojeISO}</p>
                    <p><strong>Quantidade de atendimentos:</strong> {fechamentoDoDia.quantidade}</p>
                    <p><strong>Total do dia:</strong> {formatarMoeda(fechamentoDoDia.total)}</p>
                    <p><strong>Pix:</strong> {formatarMoeda(fechamentoDoDia.pix)}</p>
                    <p><strong>Cartão:</strong> {formatarMoeda(fechamentoDoDia.cartao)}</p>
                    <p><strong>Dinheiro:</strong> {formatarMoeda(fechamentoDoDia.dinheiro)}</p>
                  </div>
                </div>

                <div className="card">
                  <h2>Fechamento por técnico</h2>

                  <div className="lista">
                    {Object.keys(fechamentoDoDia.porTecnico).length === 0 ? (
                      <p>Nenhum atendimento encontrado no dia.</p>
                    ) : (
                      Object.entries(fechamentoDoDia.porTecnico).map(([tecnico, dados]) => (
                        <div key={tecnico} className="item">
                          <h3>{tecnico}</h3>
                          <p><strong>Quantidade:</strong> {dados.quantidade}</p>
                          <p><strong>Total:</strong> {formatarMoeda(dados.total)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
