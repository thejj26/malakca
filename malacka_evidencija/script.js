let clanovi = [], izleti = [], _izlet = null, _clan = null

//firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { getFirestore, collection, addDoc, getDocs, Timestamp, deleteDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyBhHaQUyDa567aU9K9UrKtwwRLZPr2VuL0",
    authDomain: "malacka-a420d.firebaseapp.com",
    projectId: "malacka-a420d",
    storageBucket: "malacka-a420d.firebasestorage.app",
    messagingSenderId: "111728081660",
    appId: "1:111728081660:web:89cd12c797d03de904f579"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const collection_clanovi = collection(db, "clanovi")
const collection_izleti = collection(db, "izleti")

//klase
class Clan {
    constructor(ime, prezime, rod, id) {
        this.ime = ime
        this.prezime = prezime
        this.rod = rod
        this.id = id
        this.izleti = []
    }
    generate() {
        return `
        <div class="clan" id=${this.id} ondblclick="editClan('${this.id}')">
            <p class="ime">${this.ime} ${this.prezime}</p>
            <p class="br-izleta">${this.izleti.length}</p>
        </div>`
    }
}

window.editClan = function (clan) { }
window.editIzlet = function (izlet) { }
window.showSelectedIzlet = function (id) { }
window.showSelectedClan = function (id) { }

class Izlet {
    constructor(naziv, datum, sudionici, vodic, id) {
        this.naziv = naziv
        this.datum = datum
        this.sudionici = sudionici
        this.vodic = vodic
        this.id = id
    }
    generate() {
        return `
        <div class="izlet" id=${this.id} ondblclick="editIzlet('${this.id}')">
            <p class="naziv">${this.naziv}</p>
            <p class="datum">${new Date(this.datum).toLocaleDateString("de-DE")}</p>
            <p class="br-sudionika">${this.sudionici.length}</p>
        </div>`
    }
}

//DOM
let clanoviDiv = document.querySelector("#list-clanovi")
let izletiDiv = document.querySelector("#list-izleti")
let selectedDiv = document.querySelector("#card-selected")
let searchClanovi = document.querySelector("#search-clanovi")
let searchIzleti = document.querySelector("#search-izleti")
let modalClan = document.querySelector("#modal-clan")
let modalClan_edit = document.querySelector("#modal-clan-edit")
let modalIzlet = document.querySelector("#modal-izlet")
let modalIzlet_edit = document.querySelector("#modal-izlet-edit")
let searchSudionici = document.querySelector("#search-sudionici")
let searchSudionici_edit = document.querySelector("#search-sudionici-edit")
let ulSudionici = document.querySelector("#sudionici")
let ulSudionici_edit = document.querySelector("#sudionici-edit")

//funckije (firebase)
function formatClan(clan_obj) {
    return new Clan(clan_obj.data().ime, clan_obj.data().prezime, clan_obj.data().rod.seconds * 1000, clan_obj.id)
}

function formatIzlet(izlet_obj) {
    return new Izlet(izlet_obj.data().naziv, izlet_obj.data().datum.seconds * 1000, izlet_obj.data().sudionici, izlet_obj.data().vodic, izlet_obj.id)
}

async function getClanovi() {
    const querySnapshot = await getDocs(collection_clanovi)

    querySnapshot.forEach((doc) => {
        clanovi.push(formatClan(doc))
    })
}

async function getIzleti() {
    const querySnapshot = await getDocs(collection_izleti)

    querySnapshot.forEach((doc) => {
        izleti.push(formatIzlet(doc))
    })
}

function addClan() {
    let ime = document.querySelector("#input-ime").value
    let prezime = document.querySelector("#input-prezime").value
    let rod = Timestamp.fromDate(new Date(document.querySelector("#input-rod").value))

    addDoc(collection_clanovi, {
        "ime": ime,
        "prezime": prezime,
        "rod": rod
    })
        .then(() => location.reload())
        .catch(() => alert("Greska pri zapisivanju u bazu podataka"))
}

function deleteClan(clan) {
    let valid = false
    try {
        izleti.forEach(iz => {
            let sud_map = iz.sudionici.map(a => a[1])
            if (sud_map.includes(clan.id)) throw 0
        })
        valid = true
    } catch (e) {
        if (e === 0) {
            valid = false
            alert("Potrebno je člana izbrisati sa svih izleta!")
            return
        }
    }
    if (!confirm(`Jeste li sigurni da želite izbrisati člana "${clan.ime} ${clan.prezime}"`) && valid) return
    deleteDoc(doc(collection_clanovi, clan.id))
        .then(() => location.reload())
        .catch(() => alert("Greska pri brisanju"))
}

function updateClan(id) {
    let ime = document.querySelector("#input-ime-edit").value.trim()
    let prezime = document.querySelector("#input-prezime-edit").value.trim()
    let rod = Timestamp.fromDate(new Date(document.querySelector("#input-rod-edit").value))
    updateDoc(doc(collection_clanovi, id), {
        "ime": ime,
        "prezime": prezime,
        "rod": rod,
    })
        .then(() => location.reload())
        .catch(() => alert("Greska pri zapisivanju u bazu podataka"))
}

function addIzlet() {
    let naziv = document.querySelector("#input-naziv").value
    let vodic = document.querySelector("#input-vodic").value
    let datum = Timestamp.fromDate(new Date(document.querySelector("#input-datum").value))
    let sudionici = [];
    [...ulSudionici.children].forEach(child => {
        if (child.querySelector("input").checked == true) {
            sudionici.push(child.id.split("-")[1])
        }
    })
    addDoc(collection_izleti, {
        "naziv": naziv,
        "vodic": vodic,
        "datum": datum,
        "sudionici": sudionici
    })
        .then(() => location.reload())
        .catch(() => alert("Greska pri zapisivanju u bazu podataka"))
}

function deleteIzlet(izlet) {
    if (!confirm(`Jeste li sigurni da želite izbrisati izlet "${izlet.naziv}"`)) return
    deleteDoc(doc(collection_izleti, izlet.id))
        .then(() => location.reload())
        .catch(() => alert("Greska pri brisanju"))
}

function updateIzlet(id) {
    let naziv = document.querySelector("#input-naziv-edit").value.trim()
    let vodic = document.querySelector("#input-vodic-edit").value.trim()
    let datum = Timestamp.fromDate(new Date(document.querySelector("#input-datum-edit").value))
    let sudionici = [];
    [...ulSudionici_edit.children].forEach(child => {
        if (child.querySelector("input").checked == true) {
            sudionici.push(child.id.split("_")[1])
        }
    })
    updateDoc(doc(collection_izleti, id), {
        "naziv": naziv,
        "vodic": vodic,
        "datum": datum,
        "sudionici": sudionici
    })
        .then(() => location.reload())
        .catch(() => alert("Greska pri zapisivanju u bazu podataka"))
}

//funkcije (DOM)
function loadData() {
    izleti.forEach(izlet => {
        izlet.sudionici = izlet.sudionici.map(el => {
            let sudionik = clanovi.find(a => a.id == el)
            clanovi.find(a => a.id == el).izleti.push(izlet)
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

function showIzleti() {
    let html = ""
    izleti.forEach(izlet => html += izlet.generate())
    izletiDiv.innerHTML += html
    izleti.forEach(izlet => document.getElementById(izlet.id).addEventListener("click", () => showSelectedIzlet(izlet.id)))

}

function filterClanovi(filter) {
    [...clanoviDiv.children].forEach(child => {
        let _ime = child.children[0]
        if (_ime.innerHTML.toLowerCase().includes(filter.toLowerCase())) child.style.display = "flex"
        else child.style.display = "none"
    })
}

function filterIzleti(filter) {
    [...izletiDiv.children].forEach(child => {
        let _naziv = child.children[0]
        let _datum = child.children[1]
        if (_naziv.innerHTML.toLowerCase().includes(filter.toLowerCase()) || _datum.innerHTML.includes(filter)) child.style.display = "flex"
        else child.style.display = "none"
    })
}

window.showSelectedClan = function (id) {
    let selectedClan = clanovi.filter(el => el.id == id)[0]

    let _izleti = ""
    selectedClan.izleti.forEach(izlet => {
        _izleti += `<li class="selected iz" onclick="showSelectedIzlet('${izlet.id}')"><p>${izlet.naziv}</p><p>${new Date(izlet.datum).toLocaleDateString("de-DE")}</p></li>`
    })

    selectedDiv.innerHTML = `
    <button class="edit-btn" onclick="editClan('${id}')">
    <span class="material-symbols-outlined">edit</span>
    </button>
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
    <div class="selected-izleti">
        <span>IZLETI</span>
        <ul>${_izleti}</ul>
    </div>
    `
}

window.showSelectedIzlet = function (id) {
    let selectedIzlet = izleti.filter(el => el.id == id)[0]

    let _sudionici = ""
    selectedIzlet.sudionici.forEach(sudionik => {
        _sudionici += `<li class="selected" onclick="showSelectedClan('${sudionik[1]}')"><p>${sudionik[0]}<p></li>`
    })
    selectedDiv.innerHTML = `
    <button class="edit-btn" onclick="editIzlet('${id}')">
    <span class="material-symbols-outlined">edit</span>
    </button>
    <h2>ODABRANI IZLET</h2>
     <div class="selected-id">
        <p>${selectedIzlet.id}</p>
    </div>
    <div class="selected-naziv">
        <span>NAZIV</span>
        <p>${selectedIzlet.naziv}</p>
    </div>
    <div class="selected-vodic">
        <span>GLAVNI VODIČ</span>
        <p>${selectedIzlet.vodic}</p>
    </div>
    <div class="selected-datum">
        <span>DATUM</span>
        <p>${new Date(selectedIzlet.datum).toLocaleDateString("de-DE")}</p>
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

function listSudionici_edit(izlet) {
    let html = ""
    let checked
    let _sudionici = izlet.sudionici.map(a => a[1])
    clanovi.forEach(clan => {
        checked = _sudionici.includes(clan.id) ? "checked" : ""
        html += `<li id="_${clan.id}"><input type="checkbox" ${checked}><div class="f"><p>${clan.ime} ${clan.prezime}</p><p class="rod">${new Date(clan.rod).toLocaleDateString("de-DE")}</p></div></li>`
    })
    ulSudionici_edit.innerHTML = html
}

function filterSudionici(filter) {
    [...ulSudionici.querySelectorAll("li")].forEach(child => {
        let _ime = child.querySelector("p")
        if (_ime.innerHTML.toLowerCase().includes(filter.toLowerCase())) child.style.setProperty("display","flex","important")
        else child.style.setProperty("display","none","important")
    })
}

function filterSudionici_edit(filter) {
    [...ulSudionici_edit.querySelectorAll("li")].forEach(child => {
        let _ime = child.querySelector("p")
        if (_ime.innerHTML.toLowerCase().includes(filter.toLowerCase())) child.style.setProperty("display","flex","important")
        else child.style.setProperty("display","none","important")
    })
}

window.editClan = function (clan) {
    clan = clanovi.find(a => a.id == clan)
    _clan = clan
    openModal(modalClan_edit)
    document.querySelector("#input-ime-edit").value = clan.ime
    document.querySelector("#input-prezime-edit").value = clan.prezime
    document.querySelector("#input-rod-edit").value = new Date(clan.rod).toISOString().slice(0, 10)
    document.querySelector("#delete-clan").onclick = () => deleteClan(clan)
}

window.editIzlet = function (izlet) {
    izlet = izleti.find(a => a.id == izlet)
    _izlet = izlet
    openModal(modalIzlet_edit)
    listSudionici_edit(izlet)
    document.querySelector("#input-naziv-edit").value = izlet.naziv
    document.querySelector("#input-vodic-edit").value = izlet.vodic
    document.querySelector("#input-datum-edit").value = new Date(izlet.datum).toISOString().slice(0, 10)
    document.querySelector("#delete-izlet").onclick = () => deleteIzlet(izlet)
}

//run after loading
getClanovi().then(() => {
    getIzleti().then(() => {
        clanovi.sort((a, b) => (`${a.prezime} ${a.ime}`).localeCompare(`${b.prezime} ${b.ime}`))
        izleti.sort((a, b) => b.datum - a.datum)
        loadData()
        showClanovi()
        showIzleti()
        listSudionici()
    })
})

searchClanovi.addEventListener("input", () => filterClanovi(searchClanovi.value.trim()))
searchIzleti.addEventListener("input", () => filterIzleti(searchIzleti.value.trim()))
searchSudionici.addEventListener("input", () => filterSudionici(searchSudionici.value.trim()))
searchSudionici_edit.addEventListener("input", () => filterSudionici_edit(searchSudionici_edit.value.trim()))

document.querySelector("#add-clan").addEventListener("click", () => { openModal(modalClan) })
document.querySelector("#close-clan").addEventListener("click", () => { closeModal(modalClan) })
document.querySelector("#confirm-clan").addEventListener("click", addClan)

document.querySelector("#close-clan-edit").addEventListener("click", () => { closeModal(modalClan_edit) })
document.querySelector("#confirm-clan-edit").addEventListener("click", () => updateClan(_clan.id))

document.querySelector("#add-izlet").addEventListener("click", () => { openModal(modalIzlet) })
document.querySelector("#close-izlet").addEventListener("click", () => { closeModal(modalIzlet) })
document.querySelector("#confirm-izlet").addEventListener("click", addIzlet)

document.querySelector("#close-izlet-edit").addEventListener("click", () => { closeModal(modalIzlet_edit) })
document.querySelector("#confirm-izlet-edit").addEventListener("click", () => updateIzlet(_izlet.id))

document.querySelector("#cr").innerHTML = `© ${new Date().getFullYear()} Jakov Jozić`