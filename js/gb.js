


class GBEmulator {

    constructor(debugging = false) {
        this.debugging = debugging
        this.cpu = new CPU(debugging)
    }

    start() {
        let count = 0
        while (count < 1000) {
            this.cpu.step()
            count++
        }
        console.log("DONE")
    }
}