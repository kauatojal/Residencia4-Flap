import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiUsers, FiShield } from "react-icons/fi";
import "./GestaoEquipe.css";
import userService from "../services/userService";
import roleService from "../services/roleService";
import permissionService from "../services/permissionService";
import { EditarUsuario } from "./EditarUsuario";
import { ModalCargo } from "./ModalCargo";
import { CardUsuario } from "./CardUsuario";
import { CardCargo } from "./CardCargo";

export default function GestaoEquipe() {
  const [abaAtiva, setAbaAtiva] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ tipo: "", mensagem: "" });

  // Modais
  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalCargo, setModalCargo] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [cargoSelecionado, setCargoSelecionado] = useState(null);

  // ======== CARREGA DADOS ========
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      
      const [usersData, rolesData, permsData] = await Promise.all([
        userService.list(),
        roleService.list(), 
        permissionService.list()
      ]);
      
      console.log("Usuários carregados:", usersData);
      console.log("Cargos carregados:", rolesData);
      console.log("Permissões carregadas:", permsData);
      
      setUsuarios(usersData || []);
      setCargos(rolesData || []);
      setPermissoes(permsData || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setFeedback({ tipo: "erro", mensagem: `Erro ao carregar dados: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  // ======== FEEDBACK AUTO-CLOSE ========
  useEffect(() => {
    if (feedback.mensagem) {
      const timer = setTimeout(() => setFeedback({ tipo: "", mensagem: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // ======== FILTROS ========
  const usuariosFiltrados = usuarios.filter(user =>
    user.name?.toLowerCase().includes(busca.toLowerCase()) ||
    user.email?.toLowerCase().includes(busca.toLowerCase())
  );

  const cargosFiltrados = cargos.filter(cargo =>
    cargo.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  // ======== HANDLERS USUÁRIOS ========
  function abrirNovoUsuario() {
    setUsuarioSelecionado({
      name: "",
      email: "",
      celular: "",
      password: "",
      cargosIds: []
    });
    setModalUsuario(true);
  }

  function abrirEditarUsuario(usuario) {
    setUsuarioSelecionado(usuario);
    setModalUsuario(true);
  }

  async function handleSalvarUsuario(dadosAtualizados) {
    try {
      if (usuarioSelecionado?.id) {
        await userService.update(usuarioSelecionado.id, dadosAtualizados);
        setFeedback({ tipo: "sucesso", mensagem: "Usuário atualizado!" });
      } else {
        await userService.create(dadosAtualizados);
        setFeedback({ tipo: "sucesso", mensagem: "Usuário criado!" });
      }
      setModalUsuario(false);
      setUsuarioSelecionado(null);
      await carregarDados();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      throw err;
    }
  }

  async function handleDeletarUsuario(id) {
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await userService.remove(id);
      setFeedback({ tipo: "sucesso", mensagem: "Usuário removido!" });
      await carregarDados();
    } catch (err) {
      console.error("Erro ao remover usuário:", err);
      setFeedback({ tipo: "erro", mensagem: "Erro ao remover usuário" });
    }
  }

  // ======== HANDLERS CARGOS ========
  function abrirNovoCargo() {
    setCargoSelecionado({
      nome: "",
      permissoesIds: []
    });
    setModalCargo(true);
  }

  function abrirEditarCargo(cargo) {
    setCargoSelecionado(cargo);
    setModalCargo(true);
  }

  async function handleSalvarCargo(dadosCargo) {
    try {
      if (cargoSelecionado?.id) {
        await roleService.update(cargoSelecionado.id, dadosCargo);
        setFeedback({ tipo: "sucesso", mensagem: "Cargo atualizado!" });
      } else {
        await roleService.create(dadosCargo);
        setFeedback({ tipo: "sucesso", mensagem: "Cargo criado!" });
      }
      setModalCargo(false);
      setCargoSelecionado(null);
      await carregarDados();
    } catch (err) {
      console.error("Erro ao salvar cargo:", err);
      throw err;
    }
  }

  async function handleDeletarCargo(id) {
    if (!window.confirm("Deseja realmente excluir este cargo?")) return;
    try {
      await roleService.remove(id);
      setFeedback({ tipo: "sucesso", mensagem: "Cargo removido!" });
      await carregarDados();
    } catch (err) {
      console.error("Erro ao remover cargo:", err);
      setFeedback({ tipo: "erro", mensagem: "Erro ao remover cargo" });
    }
  }

  return (
    <div className="gestao-equipe">
      {/* ======== HEADER ======== */}
      <div className="ge-header">
        <div className="ge-header-left">
          <div>
            <h1>Sua Equipe</h1>
            <p>Gerencie sua equipe e cargos da plataforma</p>
          </div>
        </div>
      </div>

      {/* ======== BUSCA E ABAS ======== */}
      <div className="ge-controls">
        <div className="ge-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="ge-tabs">
          <button
            className={`tab-btn ${abaAtiva === "usuarios" ? "active" : ""}`}
            onClick={() => setAbaAtiva("usuarios")}
          >
            <FiUsers /> Usuários ({usuarios.length})
          </button>
          <button
            className={`tab-btn ${abaAtiva === "cargos" ? "active" : ""}`}
            onClick={() => setAbaAtiva("cargos")}
          >
            <FiShield /> Cargos ({cargos.length})
          </button>
        </div>

        <button
          className="btn-novo"
          onClick={abaAtiva === "usuarios" ? abrirNovoUsuario : abrirNovoCargo}
        >
          <FiPlus />
          {abaAtiva === "usuarios" ? "Novo Usuário" : "Novo Cargo"}
        </button>
      </div>

      {/* ======== FEEDBACK ======== */}
      {feedback.mensagem && (
        <div className={`ge-feedback ${feedback.tipo}`}>
          {feedback.mensagem}
        </div>
      )}

      {/* ======== CONTEÚDO ======== */}
      {loading ? (
        <div className="ge-loading">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      ) : (
        <div className="ge-content">
          {/* ABA USUÁRIOS */}
          {abaAtiva === "usuarios" && (
            <div className="ge-grid">
              {usuariosFiltrados.length === 0 ? (
                <div className="ge-empty">
                  <FiUsers size={48} />
                  <p>Nenhum usuário encontrado</p>
                </div>
              ) : (
                usuariosFiltrados.map(usuario => (
                  <CardUsuario
                    key={usuario.id}
                    usuario={usuario}
                    onEdit={() => abrirEditarUsuario(usuario)}
                    onDelete={() => handleDeletarUsuario(usuario.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* ABA CARGOS */}
          {abaAtiva === "cargos" && (
            <div className="ge-list">
              {cargosFiltrados.length === 0 ? (
                <div className="ge-empty">
                  <FiShield size={48} />
                  <p>Nenhum cargo encontrado</p>
                </div>
              ) : (
                cargosFiltrados.map(cargo => (
                  <CardCargo
                    key={cargo.id}
                    cargo={cargo}
                    permissoes={permissoes}
                    onEdit={() => abrirEditarCargo(cargo)}
                    onDelete={() => handleDeletarCargo(cargo.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ======== MODAIS ======== */}
      {modalUsuario && (
        <EditarUsuario
          usuario={usuarioSelecionado}
          onSave={handleSalvarUsuario}
          onCancel={() => {
            setModalUsuario(false);
            setUsuarioSelecionado(null);
          }}
        />
      )}

      {modalCargo && (
        <ModalCargo
          cargo={cargoSelecionado}
          permissoes={permissoes}
          onSave={handleSalvarCargo}
          onCancel={() => {
            setModalCargo(false);
            setCargoSelecionado(null);
          }}
        />
      )}
    </div>
  );
}

// ✅ IMPORTANTE: Exportação default explícita
