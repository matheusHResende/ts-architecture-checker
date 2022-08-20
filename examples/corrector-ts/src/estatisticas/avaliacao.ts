import { Avaliacao } from "../models/avaliacao";

function calcularMediaTurma(avaliacao: Avaliacao) {
    let media = 0
    avaliacao.provas.forEach(prova => media += prova.nota)
    return media / avaliacao.provas.length
}

function calcularMediaPorQuestao(avaliacao: Avaliacao) {
    let mediaQuestoes = new Array<number>(avaliacao.gabarito.respostas.length).fill(0)
    avaliacao.provas.forEach(prova => prova.respostas.forEach((questao, indice) => {
        if (questao.acertou) mediaQuestoes[indice] += 1
    }))
    return mediaQuestoes.map(questao => questao / avaliacao.provas.length * 100)
}

function calcularMediaAluno(avaliacao: Avaliacao) {
    return avaliacao.provas.map(prova => {
        return {
            nome: prova.nome,
            media: prova.nota / avaliacao.gabarito.respostas.length * 100
        }
    })
}

export function calcular(avaliacao: Avaliacao) {
    const mediaTurma = calcularMediaTurma(avaliacao)
    const mediaQuestoes = calcularMediaPorQuestao(avaliacao)
    const mediaAluno = calcularMediaAluno(avaliacao)

    console.log(mediaTurma)
    console.log(mediaQuestoes)
    console.log(mediaAluno)
}