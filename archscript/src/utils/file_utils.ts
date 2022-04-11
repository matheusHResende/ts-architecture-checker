import { lstatSync, readdirSync } from "fs"

function getFiles(path: string): Array<string> {
    const filesAndDirs = readdirSync(path)
    let files: Array<string> = []

    for (const file in filesAndDirs) {
        const subPath = `${path}/${filesAndDirs[file]}`
        if (subPath.endsWith("node_modules")) continue
        if (lstatSync(subPath).isDirectory()) {
            files.push(...getFiles(subPath))
        }
        else {
            files.push(subPath)
        }
    }
    return files
}

export { getFiles }