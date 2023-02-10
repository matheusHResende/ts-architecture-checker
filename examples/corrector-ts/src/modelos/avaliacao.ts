import { Gabarito } from "./gabarito"
import { Prova } from "./prova"

export interface Avaliacao {
    turma?: string
    gabarito: Gabarito
    provas: Prova[]
}