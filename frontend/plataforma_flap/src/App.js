import React, { useState } from "react";
import Login from "./Components/Login";
import Cadastro from "./Components/Cadastro";
import RecuperarSenha from "./Components/RecuperarSenha";

function App() {
  const [tela, setTela] = useState("login");

  return (
    <>
      {tela === "login" && (
        <Login
          onSwitchCadastro={() => setTela("cadastro")}
          onSwitchRecuperar={() => setTela("recuperar")}
        />
      )}
      {tela === "cadastro" && (
        <Cadastro
          onSwitchLogin={() => setTela("login")}
        />
      )}
      {tela === "recuperar" && (
        <RecuperarSenha
          onSwitchLogin={() => setTela("login")}
        />
      )}
    </>
  );
}

export default App;
