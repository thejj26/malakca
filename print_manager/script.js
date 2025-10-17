let title_type = document.querySelector('#type-title')
let title_main = document.querySelector('#main-title')
let date = document.querySelector('#date')
let desc = document.querySelector('#desc')
let list = document.querySelector('#list')

function loadData(data) {
    title_type.innerHTML = data.type
    title_main.innerHTML = data.title
    date.innerHTML = data.date
    desc.innerHTML = data.desc
    list.innerHTML += data.html
}

window.onload = () => {
    const data = JSON.parse(sessionStorage.getItem("print"))
    loadData(data)

    if (list.scrollHeight > 1400) {
        list.style.columns = 3
    }else if(list.scrollHeight > 800){
        list.style.columns = 2
    }

    window.print()
}
