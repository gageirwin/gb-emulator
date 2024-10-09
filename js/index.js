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
    document.getElementById("reg-A").textContent = e.detail.A
    document.getElementById("reg-B").textContent = e.detail.B
    document.getElementById("reg-C").textContent = e.detail.C
    document.getElementById("reg-D").textContent = e.detail.D
    document.getElementById("reg-E").textContent = e.detail.E
    document.getElementById("reg-H").textContent = e.detail.H
    document.getElementById("reg-L").textContent = e.detail.L
    document.getElementById("reg-F").textContent = `Z:${+ e.detail.F.zero} N:${+ e.detail.F.subtract} H:${+ e.detail.F.halfCarry} C:${+ e.detail.F.carry}`
    document.getElementById("reg-SP").textContent = e.detail.SP
    document.getElementById("reg-PC").textContent = e.detail.PC
})