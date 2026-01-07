// ATENÇÃO NA LINHA ABAIXO: Adicionamos o "/services"
import { FuncionarioService } from './services/funcionario.service';

async function teste() {
  const servico = new FuncionarioService();

  console.log("⏳ Calculando e salvando funcionários...");

  try {
    // Simulando o cadastro do "Marlon"
    await servico.criarFuncionario({
      nome: "Marlon Teste Node",
      salarioBase: 4000.00,
      epi: 40.00
    });

    // Simulando o "João Paulo"
    await servico.criarFuncionario({
      nome: "João Paulo Teste",
      salarioBase: 2600.00,
      epi: 40.00
    });

    console.log("🏁 Tudo pronto! Funcionários cadastrados.");
  } catch (erro) {
    console.error("Algo deu errado no teste:", erro);
  } finally {
    // Encerra o processo para o terminal não ficar travado
    process.exit();
  }
}

teste();