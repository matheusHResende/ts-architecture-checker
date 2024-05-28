import { Questao } from "./questao"
import { Gabarito } from "./gabarito"

export class Prova {
    nome: string
    respostas: Questao[]
    nota: number

    constructor(nome: string, respostas: string[]) {
        this.nome = nome
        this.respostas = respostas.map(resposta => { return { resposta } })
        this.nota = 0
    }

    corrigir(gabarito: Gabarito) {
        this.respostas.forEach((resposta, i) => {
            if (resposta.resposta === gabarito.respostas[i]) {
                resposta.acertou = true
                this.nota++
            }
            else {
                resposta.acertou = false
            }
        })
    }
}
