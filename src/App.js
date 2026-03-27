import React, { useMemo, useState } from "react";
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

export default function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const [form, setForm] = useState({
    cliente: "",
    telefone: "",
    endereco: "",
    bairro: "",
    cidade: "",
    data: new Date().toISOString().slice(0, 10),
    hora: new Date().toTimeString().slice(0, 5),
    tipoServico: "Alarme",
    equipamento: "",
    marcaModelo: "",
    defeitoRelatado: "",
    servicoRealizado: "",
    observacoes: "",
    valor: "",
    pagamento: "Pix",
    status: "Concluído",
    retornoNecessario: "Não",
    tecnico: "",
  });

  const [central, setCentral] = useState([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");

  function fazerLogin() {
    const usuario = usuarios.find(
      (u) => u.email === email && u.senha === senha
    );

    if (usuario) {
      setUsuarioLogado(usuario);
      setErroLogin("");
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

  function formatarMoeda(valor) {
    const numero = Number(
      String(valor)
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "")
    );

    if (isNaN(numero)) return "R$ 0,00";

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

    const novo = {
      ...form,
      tecnico: tecnicoNome,
      protocolo: gerarProtocolo(),
      valorFormatado: formatarMoeda(form.valor),
      enviadoEm: new Date().toLocaleString("pt-BR"),
    };

    setCentral((prev) => [novo, ...prev]);
    setMensagem(`Relatório ${novo.protocolo} enviado para a central.`);

    setForm((prev) => ({
      ...prev,
      cliente: "",
      telefone: "",
      endereco: "",
      bairro: "",
      cidade: "",
      tipoServico: "Alarme",
      equipamento: "",
      marcaModelo: "",
      defeitoRelatado: "",
      servicoRealizado: "",
      observacoes: "",
      valor: "",
      pagamento: "Pix",
      status: "Concluído",
      retornoNecessario: "Não",
      tecnico: tecnicoNome,
      data: new Date().toISOString().slice(0, 10),
      hora: new Date().toTimeString().slice(0, 5),
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
        item.telefone,
        item.endereco,
        item.tipoServico,
        item.tecnico,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [central, busca, usuarioLogado]);

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
            <p>
              <strong>Login técnico:</strong> jonas@teste.com
            </p>
            <p>
              <strong>Senha:</strong> 123
            </p>
            <p>
              <strong>Login central:</strong> central@teste.com
            </p>
            <p>
              <strong>Senha:</strong> 123
            </p>
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
            <h1>App de Atendimento Técnico</h1>
            <p>
              Usuário logado: <strong>{usuarioLogado.nome}</strong> | Perfil:{" "}
              <strong>{usuarioLogado.perfil}</strong>
            </p>
          </div>

          <button className="logoutButton" onClick={sair}>
            Sair
          </button>
        </div>

        <div className="grid">
          {usuarioLogado.perfil === "tecnico" && (
            <div className="card">
              <h2>Novo atendimento</h2>

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
                  <input
                    className="input"
                    name="telefone"
                    value={form.telefone}
                    onChange={alterarCampo}
                    placeholder="Telefone"
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
                    name="bairro"
                    value={form.bairro}
                    onChange={alterarCampo}
                    placeholder="Bairro"
                  />
                </div>

                <div className="row">
                  <input
                    className="input"
                    name="cidade"
                    value={form.cidade}
                    onChange={alterarCampo}
                    placeholder="Cidade/UF"
                  />
                  <input
                    className="input"
                    type="date"
                    name="data"
                    value={form.data}
                    onChange={alterarCampo}
                  />
                  <input
                    className="input"
                    type="time"
                    name="hora"
                    value={form.hora}
                    onChange={alterarCampo}
                  />
                </div>

                <div className="row">
                  <select
                    className="input"
                    name="tipoServico"
                    value={form.tipoServico}
                    onChange={alterarCampo}
                  >
                    <option>Alarme</option>
                    <option>Portão eletrônico</option>
                    <option>Câmeras</option>
                    <option>Interfone</option>
                    <option>Cerca elétrica</option>
                    <option>Controle de acesso</option>
                    <option>Outro</option>
                  </select>

                  <input
                    className="input"
                    name="equipamento"
                    value={form.equipamento}
                    onChange={alterarCampo}
                    placeholder="Equipamento"
                  />

                  <input
                    className="input"
                    name="marcaModelo"
                    value={form.marcaModelo}
                    onChange={alterarCampo}
                    placeholder="Marca / modelo"
                  />
                </div>

                <textarea
                  className="textarea"
                  name="defeitoRelatado"
                  value={form.defeitoRelatado}
                  onChange={alterarCampo}
                  placeholder="Defeito relatado"
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

                <textarea
                  className="textarea"
                  name="observacoes"
                  value={form.observacoes}
                  onChange={alterarCampo}
                  placeholder="Observações"
                />

                <div className="row">
                  <input
                    className="input"
                    name="valor"
                    value={form.valor}
                    onChange={alterarCampo}
                    placeholder="Valor ex: 190,00"
                    required
                  />

                  <select
                    className="input"
                    name="pagamento"
                    value={form.pagamento}
                    onChange={alterarCampo}
                  >
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão de débito</option>
                    <option>Cartão de crédito</option>
                    <option>Boleto</option>
                    <option>A faturar</option>
                  </select>

                  <select
                    className="input"
                    name="status"
                    value={form.status}
                    onChange={alterarCampo}
                  >
                    <option>Concluído</option>
                    <option>Pendente</option>
                    <option>Necessita retorno</option>
                    <option>Aguardando peça</option>
                  </select>
                </div>

                <div className="row">
                  <select
                    className="input"
                    name="retornoNecessario"
                    value={form.retornoNecessario}
                    onChange={alterarCampo}
                  >
                    <option>Não</option>
                    <option>Sim</option>
                  </select>

                  <input
                    className="input"
                    name="tecnico"
                    value={form.tecnico}
                    onChange={alterarCampo}
                    placeholder="Técnico responsável"
                    readOnly
                  />
                </div>

                <div className="valorTexto">
                  Valor: {formatarMoeda(form.valor)}
                </div>

                <button className="button" type="submit">
                  Finalizar e enviar para a central
                </button>
              </form>

              {mensagem && <p className="success">{mensagem}</p>}
            </div>
          )}

          <div className="card">
            <h2>
              {usuarioLogado.perfil === "central"
                ? "Central de recebimento"
                : "Meus atendimentos"}
            </h2>

            <input
              className="input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar atendimento"
            />

            <div className="lista">
              {atendimentosFiltrados.length === 0 ? (
                <p>Nenhum atendimento recebido.</p>
              ) : (
                atendimentosFiltrados.map((item) => (
                  <div key={item.protocolo} className="item">
                    <h3>
                      {item.cliente} - {item.protocolo}
                    </h3>
                    <p><strong>Telefone:</strong> {item.telefone}</p>
                    <p><strong>Endereço:</strong> {item.endereco}</p>
                    <p><strong>Tipo:</strong> {item.tipoServico}</p>
                    <p><strong>Equipamento:</strong> {item.equipamento}</p>
                    <p><strong>Marca/Modelo:</strong> {item.marcaModelo}</p>
                    <p><strong>Defeito:</strong> {item.defeitoRelatado}</p>
                    <p><strong>Serviço:</strong> {item.servicoRealizado}</p>
                    <p><strong>Observações:</strong> {item.observacoes || "-"}</p>
                    <p><strong>Valor:</strong> {item.valorFormatado}</p>
                    <p><strong>Pagamento:</strong> {item.pagamento}</p>
                    <p><strong>Status:</strong> {item.status}</p>
                    <p><strong>Retorno:</strong> {item.retornoNecessario}</p>
                    <p><strong>Técnico:</strong> {item.tecnico}</p>
                    <p><strong>Recebido em:</strong> {item.enviadoEm}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
