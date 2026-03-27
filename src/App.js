import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

const usuarios = [
  {
    id: 1,
    nome: "Jonas",
    email: "jonas@teste.com",
    senha: "123",
    perfil: "tecnico",
  },
  {
    id: 2,
    nome: "Central",
    email: "central@teste.com",
    senha: "123",
    perfil: "central",
  },
];

const STORAGE_KEY = "atendimentos_app_local_v2";

export default function App() {
  const [email, setEmail] = useState("");
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
    const usuario = usuarios.find(
      (u) => u.email === email && u.senha === senha
    );

    if (usuario) {
      setUsuarioLogado(usuario);
      setErroLogin("");
      setMensagem("");
      setForm((prev) => ({
        ...prev,
        tecnico: usuario.nome,
      }));
    } else {
      setErroLogin("E-mail ou senha inválidos");
    }
  }

  function sair() {
    setUsuarioLogado(null);
    setEmail("");
    setSenha("");
    setErroLogin("");
    setMensagem("");
    setBusca("");
    setAbaCentral("atendimentos");
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

  const atendimentosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    let lista = central;

    if (usuarioLogado && usuarioLogado.perfil === "tecnico") {
      lista = central.filter((item) => item.tecnico === usuarioLogado.nome);
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
  }, [central, busca, usuarioLogado]);

  const resumoFinanceiro = useMemo(() => {
    return central.reduce(
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
  }, [central]);

  if (!usuarioLogado) {
    return (
      <div className="page">
        <div className="loginBox">
          <h2>Login do Sistema</h2>
          <p>Entre como técnico ou central</p>

          <input
            className="input"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <div className="credenciais">
            <p><strong>Login técnico:</strong> jonas@teste.com</p>
            <p><strong>Senha:</strong> 123</p>
            <p><strong>Login central:</strong> central@teste.com</p>
            <p><strong>Senha:</strong> 123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="topo">
          <div>
            <h1>Sistema de Atendimento</h1>
            <p>
              Usuário logado: <strong>{usuarioLogado.nome}</strong> | Perfil:{" "}
              <strong>{usuarioLogado.perfil}</strong>
            </p>
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
                    placeholder="Hora início"
                    required
                  />
                  <input
                    className="input"
                    type="time"
                    name="horaTermino"
                    value={form.horaTermino}
                    onChange={alterarCampo}
                    placeholder="Hora término"
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {abaCentral === "financeiro" && (
              <div className="card">
                <h2>Financeiro</h2>

                <div className="financeiroBox">
                  <p><strong>Total de atendimentos:</strong> {resumoFinanceiro.quantidade}</p>
                  <p><strong>Soma de todos os recebimentos:</strong> {formatarMoeda(resumoFinanceiro.total)}</p>
                  <p><strong>Total em Pix:</strong> {formatarMoeda(resumoFinanceiro.pix)}</p>
                  <p><strong>Total em Cartão:</strong> {formatarMoeda(resumoFinanceiro.cartao)}</p>
                  <p><strong>Total em Dinheiro:</strong> {formatarMoeda(resumoFinanceiro.dinheiro)}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
