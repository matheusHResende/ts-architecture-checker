#!/usr/bin / env node
/*
Entrada de dados por CLI -> Command line interface
Corrigir a prova -> resultados num json
Gerar estatísticas sobre a prova -> resultados num json
Com base nas estatísticas gerar gráficos -> imagens jpeg;
*/

// CLI -> Corretor -> Estatísticas -> Gráficos

// corretor --provas PROVAS.CSV --gabarito GABARITO.TXT --turma TURMA

// Adapter -> converte uma entrada para outra

import { run } from "./cli"

run()
