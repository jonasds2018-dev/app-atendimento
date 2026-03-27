type Usuario = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  perfil: string;
};

import React, { useMemo, useState } from "react";

const usuarios: Usuario[] = [
  {
    id: 1,
    nome: "Jonas",
    email: "jonas@teste.com",
    senha: "123",
    perfil: "tecnico"
  },
  {
    id: 2,
    nome: "Central",
    email: "central@teste.com",
    senha: "123",
    perfil: "central"
  }
];

export default function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);

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

  const [central, setCentral] = useState<any[]>([]);
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
      <div style={styles.page}>
        <div style={styles.loginBox}>
          <h2>Login do Sistema</h2>
          <p>Entre como técnico ou central</p>

          <input
            style={styles.input}
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button style={styles.button} onClick={fazerLogin}>
            Entrar
          </button>

          {erroLogin && <p style={styles.error}>{erroLogin}</p>}

          <div style={{ marginTop: 20, fontSize: 14 }}>
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
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topo}>
          <div>
            <h1>App de Atendimento Técnico</h1>
            <p>
              Usuário logado: <strong>{usuarioLogado.nome}</strong> | Perfil:{" "}
              <strong>{usuarioLogado.perfil}</strong>
            </p>
          </div>

          <button style={styles.logoutButton} onClick={sair}>
            Sair
          </button>
        </div>

        <div style={styles.grid}>
          {usuarioLogado.perfil === "tecnico" && (
            <div style={styles.card}>
              <h2>Novo atendimento</h2>

              <form onSubmit={enviarRelatorio}>
                <div style={styles.row}>
                  <input
                    style={styles.input}
                    name="cliente"
                    value={form.cliente}
                    onChange={alterarCampo}
                    placeholder="Nome do cliente"
                    required
                  />
                  <input
                    style={styles.input}
                    name="telefone"
                    value={form.telefone}
                    onChange={alterarCampo}
                    placeholder="Telefone"
                    required
                  />
                </div>

                <div style={styles.row}>
                  <input
                    style={styles.input}
                    name="endereco"
                    value={form.endereco}
                    onChange={alterarCampo}
                    placeholder="Endereço"
                    required
                  />
                  <input
                    style={styles.input}
                    name="bairro"
                    value={form.bairro}
                    onChange={alterarCampo}
                    placeholder="Bairro"
                  />
                </div>

                <div style={styles.row}>
                  <input
                    style={styles.input}
                    name="cidade"
                    value={form.cidade}
                    onChange={alterarCampo}
                    placeholder="Cidade/UF"
                  />
                  <input
                    style={styles.input}
                    type="date"
                    name="data"
                    value={form.data}
                    onChange={alterarCampo}
                  />
                  <input
                    style={styles.input}
                    type="time"
                    name="hora"
                    value={form.hora}
                    onChange={alterarCampo}
                  />
                </div>

                <div style={styles.row}>
                  <select
                    style={styles.input}
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
                    style={styles.input}
                    name="equipamento"
                    value={form.equipamento}
                    onChange={alterarCampo}
                    placeholder="Equipamento"
                  />

                  <input
                    style={styles.input}
                    name="marcaModelo"
                    value={form.marcaModelo}
                    onChange={alterarCampo}
                    placeholder="Marca / modelo"
                  />
                </div>

                <textarea
                  style={styles.textarea}
                  name="defeitoRelatado"
                  value={form.defeitoRelatado}
                  onChange={alterarCampo}
                  placeholder="Defeito relatado"
                  required
                />

                <textarea
                  style={styles.textarea}
                  name="servicoRealizado"
                  value={form.servicoRealizado}
                  onChange={alterarCampo}
                  placeholder="Serviço realizado"
                  required
                />

                <textarea
                  style={styles.textarea}
                  name="observacoes"
                  value={form.observacoes}
                  onChange={alterarCampo}
                  placeholder="Observações"
                />

                <div style={styles.row}>
                  <input
                    style={styles.input}
                    name="valor"
                    value={form.valor}
                    onChange={alterarCampo}
                    placeholder="Valor ex: 190,00"
                    required
                  />

                  <select
                    style={styles.input}
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
                    style={styles.input}
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

                <div style={styles.row}>
                  <select
                    style={styles.input}
                    name="retornoNecessario"
                    value={form.retornoNecessario}
                    onChange={alterarCampo}
                  >
                    <option>Não</option>
                    <option>Sim</option>
                  </select>

                  <input
                    style={styles.input}
                    name="tecnico"
                    value={form.tecnico}
                    onChange={alterarCampo}
                    placeholder="Técnico responsável"
                    readOnly
                  />
                </div>

                <div style={{ marginBottom: 12, fontWeight: "bold" }}>
                  Valor: {formatarMoeda(form.valor)}
                </div>

                <button style={styles.button} type="submit">
                  Finalizar e enviar para a central
                </button>
              </form>

              {mensagem && <p style={styles.success}>{mensagem}</p>}
            </div>
          )}

          <div style={styles.card}>
            <h2>
              {usuarioLogado.perfil === "central"
                ? "Central de recebimento"
                : "Meus atendimentos"}
            </h2>

            <input
              style={styles.input}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar atendimento"
            />

            <div style={{ marginTop: 16 }}>
              {atendimentosFiltrados.length === 0 ? (
                <p>Nenhum atendimento recebido.</p>
              ) : (
                atendimentosFiltrados.map((item) => (
                  <div key={item.protocolo} style={styles.item}>
                    <h3>
                      {item.cliente} - {item.protocolo}
                    </h3>
                    <p>
                      <strong>Telefone:</strong> {item.telefone}
                    </p>
                    <p>
                      <strong>Endereço:</strong> {item.endereco}
                    </p>
                    <p>
                      <strong>Tipo:</strong> {item.tipoServico}
                    </p>
                    <p>
                      <strong>Equipamento:</strong> {item.equipamento}
                    </p>
                    <p>
                      <strong>Marca/Modelo:</strong> {item.marcaModelo}
                    </p>
                    <p>
                      <strong>Defeito:</strong> {item.defeitoRelatado}
                    </p>
                    <p>
                      <strong>Serviço:</strong> {item.servicoRealizado}
                    </p>
                    <p>
                      <strong>Observações:</strong> {item.observacoes || "-"}
                    </p>
                    <p>
                      <strong>Valor:</strong> {item.valorFormatado}
                    </p>
                    <p>
                      <strong>Pagamento:</strong> {item.pagamento}
                    </p>
                    <p>
                      <strong>Status:</strong> {item.status}
                    </p>
                    <p>
                      <strong>Retorno:</strong> {item.retornoNecessario}
                    </p>
                    <p>
                      <strong>Técnico:</strong> {item.tecnico}
                    </p>
                    <p>
                      <strong>Recebido em:</strong> {item.enviadoEm}
                    </p>
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

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    background: "#f3f4f6",
    minHeight: "100vh",
    padding: 20,
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  loginBox: {
    maxWidth: 420,
    margin: "60px auto",
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  topo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  row: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 150,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 10,
  },
  textarea: {
    width: "100%",
    minHeight: 90,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 10,
  },
  button: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
  logoutButton: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
  success: {
    marginTop: 12,
    color: "green",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  item: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    background: "#fafafa",
  },
};
