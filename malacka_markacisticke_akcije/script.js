let clanovi = [], akcije = [], _akcija = null

//firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { getFirestore, collection, addDoc, getDocs, Timestamp, deleteDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'
import key from '../key.js'

const app = initializeApp(key)
const db = getFirestore(app)
const collection_clanovi = collection(db, "clanovi")
const collection_akcije = collection(db, "m_akcije")

//klase
class Clan {
    constructor(ime, prezime, rod, id) {
        this.ime = ime
        this.prezime = prezime
        this.rod = rod
        this.id = id
        this.akcije = []
    }
    generate() {
        return `
        <div class="clan" id="${this.id}">
            <p class="ime">${this.ime} ${this.prezime}</p>
            <p class="br-akcije">${this.akcije.length}</p>
        </div>`
    }
}

window.editAkcija = function (akcija) { }
window.showSelectedAkcija = function (id) { }
window.showSelectedClan = function (id) { }

class Akcija {
    constructor(naziv, datum, sudionici, opis, id) {
        this.naziv = naziv
        this.datum = datum
        this.sudionici = sudionici
        this.opis = opis
        this.id = id
    }
    generate() {
        return `
        <div class="akcija" id=${this.id} ondblclick="editAkcija('${this.id}')">
            <p class="naziv">${this.naziv}</p>
            <p class="datum">${new Date(this.datum).toLocaleDateString("de-DE")}</p>
            <p class="br-sudionika">${this.sudionici.length}</p>
        </div>`
    }
}

//DOM
let clanoviDiv = document.querySelector("#list-clanovi")
let akcijeDiv = document.querySelector("#list-akcije")
let selectedDiv = document.querySelector("#card-selected")
let searchClanovi = document.querySelector("#search-clanovi")
let searchAkcije = document.querySelector("#search-akcije")
let modalAkcija = document.querySelector("#modal-akcija")
let modalAkcija_edit = document.querySelector("#modal-akcija-edit")
let searchSudionici = document.querySelector("#search-sudionici")
let searchSudionici_edit = document.querySelector("#search-sudionici-edit")
let ulSudionici = document.querySelector("#sudionici")
let ulSudionici_edit = document.querySelector("#sudionici-edit")
let btnPrint = document.querySelector("#btnPrint")

//funckije (firebase)
function formatClan(clan_obj) {
    return new Clan(clan_obj.data().ime, clan_obj.data().prezime, clan_obj.data().rod.seconds * 1000, clan_obj.id)
}

function formatAkcija(akcija_obj) {
    return new Akcija(akcija_obj.data().naziv, akcija_obj.data().datum.seconds * 1000, akcija_obj.data().sudionici, akcija_obj.data().opis, akcija_obj.id)
}

async function getClanovi() {
    const querySnapshot = await getDocs(collection_clanovi)

    querySnapshot.forEach((doc) => {
        clanovi.push(formatClan(doc))
    })
}

async function getAkcije() {
    const querySnapshot = await getDocs(collection_akcije)

    querySnapshot.forEach((doc) => {
        akcije.push(formatAkcija(doc))
    })
}

function addAkcija() {
    let naziv = document.querySelector("#input-naziv").value
    let opis = document.querySelector("#input-opis").value
    let datum = Timestamp.fromDate(new Date(document.querySelector("#input-datum").value))
    let sudionici = [];
    [...ulSudionici.children].forEach(child => {
        if (child.querySelector("input").checked == true) {
            sudionici.push(child.id.split("-")[1])
        }
    })
    addDoc(collection_akcije, {
        "naziv": naziv,
        "opis": opis,
        "datum": datum,
        "sudionici": sudionici
    })
        .then(() => location.reload())
        .catch(() => alert("Greska pri zapisivanju u bazu podataka"))
}

function deleteAkcija(akcija) {
    if (!confirm(`Jeste li sigurni da želite izbrisati akciju "${akcija.naziv}"`)) return
    deleteDoc(doc(collection_akcije, akcija.id))
        .then(() => location.reload())
        .catch(() => alert("Greska pri brisanju"))
}

function updateAkcija(id) {
    let naziv = document.querySelector("#input-naziv-edit").value.trim()
    let opis = document.querySelector("#input-opis-edit").value.trim()
    let datum = Timestamp.fromDate(new Date(document.querySelector("#input-datum-edit").value))
    let sudionici = [];
    [...ulSudionici_edit.children].forEach(child => {
        if (child.querySelector("input").checked == true) {
            sudionici.push(child.id.split("_")[1])
        }
    })
    updateDoc(doc(collection_akcije, id), {
        "naziv": naziv,
        "opis": opis,
        "datum": datum,
        "sudionici": sudionici
    })
        .then(() => location.reload())
        .catch(() => alert("Greska pri zapisivanju u bazu podataka"))
}

//funkcije (DOM)
function loadData() {
    akcije.forEach(akcija => {
        akcija.sudionici = akcija.sudionici.map(el => {
            let sudionik = clanovi.find(a => a.id == el)
            clanovi.find(a => a.id == el).akcije.push(akcija)
            return [`${sudionik.ime} ${sudionik.prezime}`, sudionik.id]
        })
    })
}

function showClanovi() {
    let html = ""
    clanovi.forEach(clan => html += clan.generate())
    clanoviDiv.innerHTML += html
    clanovi.forEach(clan => document.getElementById(clan.id).addEventListener("click", () => showSelectedClan(clan.id)))
}

function showAkcije() {
    let html = ""
    akcije.forEach(akcija => html += akcija.generate())
    akcijeDiv.innerHTML += html
    akcije.forEach(akcija => document.getElementById(akcija.id).addEventListener("click", () => showSelectedAkcija(akcija.id)))

}

function filterClanovi(filter) {
    [...clanoviDiv.children].forEach(child => {
        let _ime = child.children[0]
        if (_ime.innerHTML.toLowerCase().includes(filter.toLowerCase())) child.style.display = "flex"
        else child.style.display = "none"
    })
}

function filterAkcije(filter) {
    [...akcijeDiv.children].forEach(child => {
        let _naziv = child.children[0]
        let _datum = child.children[1]
        if (_naziv.innerHTML.toLowerCase().includes(filter.toLowerCase()) || _datum.innerHTML.includes(filter)) child.style.display = "flex"
        else child.style.display = "none"
    })
}

window.showSelectedClan = function (id) {
    let selectedClan = clanovi.filter(el => el.id == id)[0]

    btnPrint.style.display="none"

    let _akcije = ""
    selectedClan.akcije.forEach(akcija => {
        _akcije += `<li class="selected iz" onclick="showSelectedAkcija('${akcija.id}')"><p>${akcija.naziv}</p><p>${new Date(akcija.datum).toLocaleDateString("de-DE")}</p></li>`
    })

    selectedDiv.innerHTML = `
    <h2>ODABRANI ČLAN</h2>
    <div class="selected-id">
        <p>${selectedClan.id}</p>
    </div>
    <div class="selected-ime">
        <span>IME</span>
        <p>${selectedClan.ime} ${selectedClan.prezime}</p>
    </div>
    <div class="selected-datum">
        <span>DATUM ROĐENJA</span>
        <p>${new Date(selectedClan.rod).toLocaleDateString("de-DE")}</p>
    </div>
    <div class="selected-akcije">
        <span>MARKACISTIČE AKCIJE</span>
        <ul>${_akcije}</ul>
    </div>
    `
}

window.showSelectedAkcija = function (id) {
    let selectedAkcija = akcije.filter(el => el.id == id)[0]
    _akcija = selectedAkcija

    btnPrint.style.display="block"

    let _sudionici = ""
    selectedAkcija.sudionici.forEach(sudionik => {
        _sudionici += `<li class="selected" onclick="showSelectedClan('${sudionik[1]}')"><p>${sudionik[0]}<p></li>`
    })
    selectedDiv.innerHTML = `
    <button class="edit-btn" onclick="editAkcija('${id}')">
    <span class="material-symbols-outlined">edit</span>
    </button>
    <h2>ODABRANA MARKACISTIČKA AKCIJA</h2>
     <div class="selected-id">
        <p>${selectedAkcija.id}</p>
    </div>
    <div class="selected-naziv">
        <span>NAZIV</span>
        <p>${selectedAkcija.naziv}</p>
    </div>
    <div class="selected-opis">
        <span>OPIS</span>
        <p>${selectedAkcija.opis}</p>
    </div>
    <div class="selected-datum">
        <span>DATUM</span>
        <p>${new Date(selectedAkcija.datum).toLocaleDateString("de-DE")}</p>
    </div>
    <div class="selected-sudionici">
        <span>SUDIONICI</span>
        <ul>${_sudionici}</ul>
    </div>
    `
}

function openModal(modal) {
    modal.style.display = "flex"
    document.querySelector("section").style.filter = "blur(1px) grayscale(0.3)"
}

function closeModal(modal) {
    modal.querySelectorAll("input").value = ""
    modal.style.display = "none"
    document.querySelector("section").style.filter = "none"
}

function listSudionici() {
    let html = ""
    clanovi.forEach(clan => {
        html += `<li id="-${clan.id}"><input type="checkbox"><div class="f"><p>${clan.ime} ${clan.prezime}</p><p class="rod">${new Date(clan.rod).toLocaleDateString("de-DE")}</p></div></li>`
    })
    ulSudionici.innerHTML = html
}

function listSudionici_edit(akcija) {
    let html = ""
    let checked
    let _sudionici = akcija.sudionici.map(a => a[1])
    clanovi.forEach(clan => {
        checked = _sudionici.includes(clan.id) ? "checked" : ""
        html += `<li id="_${clan.id}"><input type="checkbox" ${checked}><div class="f"><p>${clan.ime} ${clan.prezime}</p><p class="rod">${new Date(clan.rod).toLocaleDateString("de-DE")}</p></div></li>`
    })
    ulSudionici_edit.innerHTML = html
}

function filterSudionici(filter) {
    [...ulSudionici.querySelectorAll("li")].forEach(child => {
        let _ime = child.querySelector("p")
        if (_ime.innerHTML.toLowerCase().includes(filter.toLowerCase())) child.style.setProperty("display", "flex", "important")
        else child.style.setProperty("display", "none", "important")
    })
}

function filterSudionici_edit(filter) {
    [...ulSudionici_edit.querySelectorAll("li")].forEach(child => {
        let _ime = child.querySelector("p")
        if (_ime.innerHTML.toLowerCase().includes(filter.toLowerCase())) child.style.setProperty("display", "flex", "important")
        else child.style.setProperty("display", "none", "important")
    })
}

window.editAkcija = function (akcija) {
    akcija = akcije.find(a => a.id == akcija)
    _akcija = akcija
    openModal(modalAkcija_edit)
    listSudionici_edit(akcija)
    document.querySelector("#input-naziv-edit").value = akcija.naziv
    document.querySelector("#input-opis-edit").value = akcija.opis
    document.querySelector("#input-datum-edit").value = new Date(akcija.datum).toISOString().slice(0, 10)
    document.querySelector("#delete-akcija").onclick = () => deleteAkcija(akcija)
}

//print funkcija
function storePrintData(akcija) {

    function formatHTML(list) {
        let html = ''
        list.forEach(el => {
            html += `<li>${el[0]}</li>`
        })
        return html
    }

    const data = {
        type: "MARKACISTIČKA AKCIJA",
        title: akcija.naziv,
        date: new Date(akcija.datum).toLocaleDateString("de-DE"),
        desc: akcija.opis,
        html: formatHTML(akcija.sudionici)
    }

    sessionStorage.clear()
    sessionStorage.setItem("print", JSON.stringify(data))

    window.open("../print_manager/print.html")
}

//run after loading
getClanovi().then(() => {
    getAkcije().then(() => {
        clanovi.sort((a, b) => (`${a.prezime} ${a.ime}`).localeCompare(`${b.prezime} ${b.ime}`))
        akcije.sort((a, b) => b.datum - a.datum)
        loadData()
        showClanovi()
        showAkcije()
        listSudionici()
    })
})

searchClanovi.addEventListener("input", () => filterClanovi(searchClanovi.value.trim()))
searchAkcije.addEventListener("input", () => filterAkcije(searchAkcije.value.trim()))
searchSudionici.addEventListener("input", () => filterSudionici(searchSudionici.value.trim()))
searchSudionici_edit.addEventListener("input", () => filterSudionici_edit(searchSudionici_edit.value.trim()))

document.querySelector("#add-akcija").addEventListener("click", () => { openModal(modalAkcija) })
document.querySelector("#close-akcija").addEventListener("click", () => { closeModal(modalAkcija) })
document.querySelector("#confirm-akcija").addEventListener("click", addAkcija)

document.querySelector("#close-akcija-edit").addEventListener("click", () => { closeModal(modalAkcija_edit) })
document.querySelector("#confirm-akcija-edit").addEventListener("click", () => updateAkcija(_akcija.id))

btnPrint.addEventListener("click", ()=>{storePrintData(_akcija)})

document.querySelector("#cr").innerHTML = `© ${new Date().getFullYear()} Jakov Jozić`
