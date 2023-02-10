import { Avaliacao } from "../modelos/avaliacao"
import { calcular } from "../estatisticas/avaliacao"

export function corrigir(avaliacao: Avaliacao) {
    avaliacao.provas.forEach(prova => {
        prova.corrigir(avaliacao.gabarito)
        console.log(prova)
    })
    calcular(avaliacao)
}
