import { corrigir } from "../corretor/corretor"
import { Prova } from "../modelos/prova"
import { readFileSync } from "fs"

export function corrigir_csv(arquivoProva: string, arquivoGabarito: string, turma?: string, headers?: boolean) {
    const provaLinhas = readFileSync(arquivoProva).toString().replace(/\r\n/g, '\n').split('\n');
    const gabaritoLinhas = readFileSync(arquivoGabarito).toString().replace(/\r\n/g, '\n').split('\n');

    let provas: Prova[] = []

    provaLinhas.forEach(linha => {
        let dados = linha.split(',')
        provas.push(new Prova(dados[0].trim(), dados.slice(1).map(dado => dado.trim())))
    })
    if (headers) {
        provas = provas.slice(1)
    }
    const gabarito = { respostas: gabaritoLinhas.join(',').split(',') }

    corrigir({ provas, gabarito, turma })
}
