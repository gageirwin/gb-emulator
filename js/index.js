const gb = new GBEmulator(debugging = true)

const startButton = document.getElementById("start-emulation")
startButton.addEventListener("click", function () {
    gb.start()
})

const pauseButton = document.getElementById("pause-emulation")
pauseButton.addEventListener("click", function () {

})

const stepButton = document.getElementById("step-emulation")
stepButton.addEventListener("click", function () {
    gb.cpu.step()
})

document.addEventListener('CPU-debug', function (e) {
    console.log('CPU State:', e.detail)
    document.getElementById("reg-A").textContent = to8BitBinary(e.detail.A)
    document.getElementById("reg-B").textContent = to8BitBinary(e.detail.B)
    document.getElementById("reg-C").textContent = to8BitBinary(e.detail.C)
    document.getElementById("reg-D").textContent = to8BitBinary(e.detail.D)
    document.getElementById("reg-E").textContent = to8BitBinary(e.detail.E)
    document.getElementById("reg-H").textContent = to8BitBinary(e.detail.H)
    document.getElementById("reg-L").textContent = to8BitBinary(e.detail.L)

    document.getElementById("reg-zero").textContent = + e.detail.F.zero
    document.getElementById("reg-subtract").textContent = + e.detail.F.subtract
    document.getElementById("reg-halfCarry").textContent = + e.detail.F.halfCarry
    document.getElementById("reg-carry").textContent = + e.detail.F.carry

    document.getElementById("reg-AF").textContent = to16BitBinary(e.detail.AF)
    document.getElementById("reg-BC").textContent = to16BitBinary(e.detail.BC)
    document.getElementById("reg-DE").textContent = to16BitBinary(e.detail.DE)
    document.getElementById("reg-HL").textContent = to16BitBinary(e.detail.HL)

    document.getElementById("reg-SP").textContent = to16BitBinary(e.detail.SP)
    document.getElementById("reg-PC").textContent = to16BitBinary(e.detail.PC)
})

function to8BitBinary(num) {
    return (num & 0xFF).toString(2).padStart(8, '0')
}

function to16BitBinary(num) {
    return (num & 0xFFFF).toString(2).padStart(16, '0')
}

function from8BitBinary(binaryStr) {
    return parseInt(binaryStr, 2) & 0xFF
}

function from16BitBinary(binaryStr) {
    return parseInt(binaryStr, 2) & 0xFFFF
}

function intToHex(num) {
    return num.toString(16).toUpperCase()
}

function hexToInt(hexString) {
    return parseInt(hexString, 16)
}

// Testing
const cpu = new CPU(true)

cpu._AF(from16BitBinary("0000000110100000"))
cpu.debugger()
cpu.execute(hexToInt("0xFF"))
cpu._AF
