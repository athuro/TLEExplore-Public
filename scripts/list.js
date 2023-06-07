// Class to load fetched objects into
class Sat {
     // Everything in the TLE should be restricted
    #name; #satID; #tle1; #tle2; #epoch; #mu
    constructor(fetchedObject){
        this.#name = fetchedObject.name;
        this.#satID = fetchedObject.satelliteId;
        this.#tle1 = fetchedObject.line1;
        this.#tle2 = fetchedObject.line2;
        this.#epoch = fetchedObject.date;
        this.#mu = 3.986004418*1e14;
    }

    // Access methods
    getName() {
        return this.#name
    }
    getSatID() {
        return this.#satID
    }
    getTLE1() {
        return this.#tle1
    }
    getTLE2() {
        return this.#tle2
    }
    getEpoch() {
        return this.#epoch
    }
    getA() {
        let meanMotion = this.#tle2.slice(52,63)
        // convert mean motion to semi-major axis
        let a = (this.#mu**(1/3))/(((2*meanMotion*Math.PI)/86400)**(2/3)); //deg to radians
        return (Math.round((a/10))/100).toString(); //km
    }
    getI() {
        let i = this.#tle2.slice(8,16)
        return i.toString()
    }
    getE() {
        let e = this.#tle2.slice(26,33)
        return `0.${e.toString()}`
    }
    getM() {
        let M = this.#tle2.slice(43,51)
        return M.toString()
    }
    getOmega() {
        let omega = this.#tle2.slice(34,42)
        return omega.toString()
    }
    getRAAN() {
        let RAAN = this.#tle2.slice(17,25)
        return RAAN.toString()
    }
    getT() {
        let T = 2*Math.PI*(((Number(this.getA())*1000)**3)/this.#mu)**(1/2);
        return (Math.round(100*(T/60))/100).toString()
    }
    getLaunch() {
        let launch = this.#tle1.slice(9,11);
        return launch.toString()
    }
    getOrbitTotal() {
        let orbits = this.#tle2.slice(63,68);
        return orbits.toString()
    }
}

// same search as main page, but it takes in page number, sort direction, and sort type
const search = (type, direction = 'desc', page = 1) => {
    // take user input
    let searchTerm = document.querySelector(`#search${type}in`)
    userInput = searchTerm.value.toUpperCase();
    lastType = type;
    lastPage = page;
    pageNum.innerHTML=1
    // searches over inclination, eccentricity, or period are available w/ api
    let search;
    if(type === 'I') { //search inclination
        let param = userInput.slice(1) //everything after sign
        if(userInput[0] === '<') {
            search = `?inclination[lt]=${param}&api_key=${apiKey}&page=${page}&sort=inclination&sort-dir=${direction}`;
        } else if (userInput[0] === '>') {
            search = `?inclination[gt]=${param}&api_key=${apiKey}&page=${page}&sort=inclination&sort-dir=${direction}`;
        } else {
            tryAgain() // failed to use > or < sign
            return
        }
    } else if(type === 'E') { //search eccentricity
        let param = userInput.slice(1) 
        if(userInput[0] === '<') {
            search = `?eccentricity[lte]=${param}&api_key=${apiKey}&page=${page}&sort=eccentricity&sort-dir=${direction}`;
        } else if (userInput[0] === '>') {
            search = `?eccentricity[gte]=${param}&api_key=${apiKey}&page=${page}&sort=eccentricity&sort-dir=${direction}`;
        } else {
            tryAgain()
            return
        }
    } else if(type === "T") { //search period
        let param = Number(userInput.slice(1))*60
        param.toString();
        if(userInput[0] === '<') {
            search = `?period[lt]=${param}&api_key=${apiKey}&page=${page}&sort=period&sort-dir=${direction}`;
        } else if (userInput[0] === '>') {
            search = `?period[gt]=${param}&api_key=${apiKey}&page=${page}&sort=period&sort-dir=${direction}`;
        } else {
            tryAgain()
            return
        }
    } 

    // fetch
    load()
    fetch(queryURL+search)
        .then(data => result = data.json())
        .then(data => output(data, type, userInput))
        .then(()=> load(0))

}

// similar output to main, build one large table without view
const output = (data, type, userInput) => {
    if(data.member.length === 0) { // if the fetch cannot find the satellite
        notFound()
    } else { 
        // remove everything from last search
        let toDelete = document.querySelectorAll('#currentSearch')
        if (toDelete.length !== 0){
            toDelete.forEach(element =>{
                element.remove()
            })
        }
        // build page
        let sortTitle = document.querySelector('#sortTitle')
        if(type === 'I') {
            sortTitle.innerHTML = `Objects with an inclination ${userInput} degrees`
        } else if(type === 'E') {
            sortTitle.innerHTML = `Objects with an eccentricity ${userInput}`
        } else {
            sortTitle.innerHTML = `Objects with a period ${userInput} minutes`
        }
        // fill out next row for each object
        data.member.forEach(element => {
            let obj = new Sat(element);
            resultBuilder(obj)
        })
    }
}

// table filling function by row
const resultBuilder = (sat) => {
    let row = document.createElement('tr')
    row.setAttribute('id','currentSearch')
    let body= document.querySelector(`.el`)
    body.appendChild(row)
    tableAppender(row, sat.getName())
    tableAppender(row, sat.getSatID())
    tableAppender(row, sat.getA())
    tableAppender(row, sat.getI())
    tableAppender(row, sat.getE())
    tableAppender(row, sat.getM())
    tableAppender(row, sat.getOmega())
    tableAppender(row, sat.getRAAN())
    tableAppender(row, sat.getEpoch())
    tableAppender(row, sat.getT())
    tableAppender(row, sat.getLaunch())
    tableAppender(row, sat.getOrbitTotal())
}



///// FUNCTION CALLS /////
load(0) //hide spinner for some reason

let queryURL = `https://tle.ivanstanojevic.me/api/tle/`;
const apiKey = 'yQrsAQ1t2CLdGTfnEAiyAnwiPVT6COX7Ap9DTTVU';

// search
let submitButtonI = document.querySelector('#searchI');
submitButtonI.addEventListener('click', () => {
    search('I')
})
let submitKeyI = document.querySelector('#searchIin');
submitKeyI.addEventListener('keypress', (event) => {
    if (event.key === 'Enter'){
        search('I')
    }
})
let submitButtonE = document.querySelector('#searchE');
submitButtonE.addEventListener('click', () => {
    search('E')
})
let submitKeyE = document.querySelector('#searchEin');
submitKeyE.addEventListener('keypress', (event) => {
    if (event.key === 'Enter'){
        search('E')
    }
})
let submitButtonT = document.querySelector('#searchT');
submitButtonT.addEventListener('click', () => {
    search('T')
})
let submitKeyT = document.querySelector('#searchTin');
submitKeyT.addEventListener('keypress', (event) => {
    if (event.key === 'Enter'){
        search('T')
    }
})

// change sort order
let lastType;
let ascendOrder = document.querySelector('#ascend');
ascendOrder.addEventListener('click', () => {
    search(lastType, 'asc')
})
let descendOrder = document.querySelector('#descend');
descendOrder.addEventListener('click', () => {
    search(lastType, 'desc')
})

// change page
let lastPage;
let pageNum = document.querySelector('#pageNumber')
let nextPage = document.querySelector('#nextPage');
nextPage.addEventListener('click', () => {
    search(lastType, 'desc' ,lastPage+1)
    pageNum.innerHTML = lastPage;
})
let previousPage = document.querySelector('#lastPage');
previousPage.addEventListener('click', () => {
    if (lastPage >= 2){
        search(lastType, 'desc' ,lastPage-1)
        pageNum.innerHTML = lastPage;
    }
})



///// HELPER FUNCTIONS /////
// error handling
function notFound() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}
function tryAgain() {
    var popup = document.getElementById("wrongOp");
    popup.classList.toggle("show");
}

// add element to row
function tableAppender(row, value) {
    let element = document.createElement('td')
    element.innerHTML = value;
    row.appendChild(element)
}

// loading spinner
function load(status = 1) {
    let loader1 = document.getElementById('loaderRight')
    
    if(!status){
        loader1.style.visibility = 'hidden'
    } else {
        loader1.style.visibility = 'visible'
    } 
}