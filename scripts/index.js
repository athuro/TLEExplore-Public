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

// generates a random starlink for user exploration
const starlinkGenerator = () => {
    load()
    fetch(queryURL+'?search=starlink&page-size=100')
    .then(data => data.json())
    .then(data => {
        let random = Math.floor(Math.random()*data.member.length)
        currentSat = new Sat(data.member[random])
        resultBuilder(currentSat) 
    })
    .then(()=> load(0))
}

const search = () => {
    // take user input to build search
    let searchTerm = document.querySelector('.searchTerm')
    userInput = searchTerm.value.toUpperCase();
    let search = `?search=${userInput}&api_key=${apiKey}&page-size=100`;

    // fetch
    load()
    fetch(queryURL+search)
        .then(data => result = data.json())
        .then(data => output(data))
        .then(()=> load(0)) // hide loading spinner

}

// intermediate function to process data
const output = (data) => {
    if(data.member.length === 0) { // if the fetch cannot find the object
        notFound() //popup
    } else if (data.member.length > 1) { // if the fetch returns more than one object
        let example = document.querySelector('#specificityPopup');
        if(data.member.length >= 100) { // filled an entire page so there is not an accurate count
            example.innerHTML=`Over ${data.member.length} objects found, please be more specific, e.g. ${data.member[0].name} or ${data.member[1].satelliteId}`
        } else { // return number of objects found
            example.innerHTML=`${data.member.length} objects found, please be more specific, e.g. ${data.member[0].name} or ${data.member[1].satelliteId}`
        }
        notSpecific() //popup
    } else { 
        currentSat = new Sat(data.member[0]) //load data into Sat class
        resultBuilder(currentSat)
    }
}

// function to fill out result panel
const resultBuilder = (sat) => {
    let satName = document.querySelector('#satName');
    satName.innerHTML = sat.getName();
    let satID = document.querySelector('#satID');
    satID.innerHTML = 'Object ID: ' + sat.getSatID();
    let tle = document.querySelector('#TLE');
    tle.innerHTML = sat.getTLE1() + '<br>' + sat.getTLE2();

    // fill table
    tableAppender('a', sat.getA())
    tableAppender('e', sat.getE())
    tableAppender('i', sat.getI())
    tableAppender('m', sat.getM())
    tableAppender('omega', sat.getOmega())
    tableAppender('raan', sat.getRAAN())
    tableAppender('epoch', sat.getEpoch())
    tableAppender('T', sat.getT())
    tableAppender('launch', sat.getLaunch())
    tableAppender('orbits', sat.getOrbitTotal())

    // create orbit view
    numPaths = 1;
    astrogator(sat)
}



///// FUNCTION CALLS /////
// Initialize the Cesium viewer.
let satellitePoint;
let satelliteTrack;
let satellitePointAnimation;
let positionsOverTime = [];
const viewer = initView();

let queryURL = `https://tle.ivanstanojevic.me/api/tle/`;
const apiKey = 'yQrsAQ1t2CLdGTfnEAiyAnwiPVT6COX7Ap9DTTVU'; //not needed

// daily starlink
let currentSat
starlinkGenerator()

// searches
let submitButton = document.querySelector('.searchButton');
submitButton.addEventListener('click', () => {
    search()
})
let submitKey = document.querySelector('.searchTerm');
submitKey.addEventListener('keypress', (event) => {
    if (event.key === 'Enter'){
        search()
    }
})
let randomButton = document.querySelector('#randomStarlink')
randomButton.addEventListener('click', () => {
    starlinkGenerator()
})

// clear viewer
let paths2remove = [];
let numPaths = 1;
let callNum = 1;
let clearButton = document.querySelector('#clearGlobe')
clearButton.addEventListener('click', () => {
    if(satellitePoint !== 'undefined'){
        viewer.entities.removeAll()
        numPaths = 0;
        callNum = 1;
    }
})

// add path to viewer
let addButton = document.querySelector('#addPath')
addButton.addEventListener('click', () => {
    numPaths++ 
    viewer.entities.remove(satelliteTrack)
    astrogator(currentSat, numPaths)
})



///// HELPER FUNCTIONS /////
//error popups
function notFound() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}
function notSpecific() {
    var popup = document.getElementById("specificityPopup");
    popup.classList.toggle("show");
}
function noOrbit() {
    var popup = document.getElementById("orbitPopup");
    popup.classList.toggle("show");
}

//fill out html table
function tableAppender(id, value) {
    let element = document.querySelector(`#${id}`)
    element.innerHTML = value;
}

// load spinner
function load(status = 1) {
    let loader1 = document.getElementById('loaderRight')
    
    if(!status){
        loader1.style.visibility = 'hidden'
    } else {
        loader1.style.visibility = 'visible'
    } 
}



///// THIS IS MOSTLY FROM CESIUM & SATELLITE.JS DOCUMENTATION RETROFITTED FOR USE AS MY OBJECT VIEWER /////
///// Tutorial: https://dev.to/omar4ur/create-a-satellite-tracker-from-scratch-in-30-lines-of-javascript-32gk /////
///// You can generally distinguish things I wrote by the use of 'let' /////
function initView () {
    let viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: new Cesium.TileMapServiceImageryProvider({
        url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
        }),
        baseLayerPicker: true, geocoder: false, homeButton: false, infoBox: false,
        navigationHelpButton: false, sceneModePicker: true
    });
    viewer.scene.globe.enableLighting = true;
    return viewer
}

// propogate object position from epoch
function astrogator (sat, numPaths = 1) {
    // color creater to distinguish paths
    let colorList = [Cesium.Color.PINK, Cesium.Color.BLUEVIOLET, Cesium.Color.BROWN, Cesium.Color.RED, Cesium.Color.AQUA, Cesium.Color.GOLD, Cesium.Color.GREEN]
    if(colorList.length+1 === callNum) {
        callNum = 1;
    }
    let currentColor = colorList[callNum-1];
    callNum++;

    // get TLEs from object
    let tle1 = sat.getTLE1();
    let tle2 = sat.getTLE2();
    let satrec = satellite.twoline2satrec(tle1, tle2)

    // Initial point
    let date = new Date(); //today
    let positionAndVelocity = satellite.propagate(satrec, date);
    // TLE error handeling
    if(typeof positionAndVelocity.position === 'undefined'){
        noOrbit()
        return
    }

    /// SINGLE POINT FUNCTIONALITY REMOVED ///
    // let gmst = satellite.gstime(date);
    // let position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
    
    // Add point to globe
    // satellitePoint = viewer.entities.add({
    //     position: Cesium.Cartesian3.fromRadians(
    //       position.longitude, position.latitude, position.height * 1000
    //     ),
    //     point: { pixelSize: 8, color: Cesium.Color.RED},
    //     label: {text: `${sat.getName()}`}
    //   });
    // satellitePoint.label.scale = .5;
    // satellitePoint.label.show = true;


    ///// START OF TUTORIAL CODE /////
    // Add single orbit track
    positionsOverTime = []; //clear position array
    const start = Cesium.JulianDate.fromDate(new Date());
    const totalSeconds = Math.floor(60 * Number(sat.getT()))*numPaths; //1 period multiplied by the number of orbits requested
    const timestepInSeconds = 100;
    for (let i = 0; i < totalSeconds; i+= timestepInSeconds) {
        const time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
        const jsDate = Cesium.JulianDate.toDate(time);
        const positionAndVelocity = satellite.propagate(satrec, jsDate);
        const gmst = satellite.gstime(jsDate);
        const p = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        const position = Cesium.Cartesian3.fromRadians(p.longitude, p.latitude, p.height * 1000);
        positionsOverTime.push(position);
    }
    satelliteTrack = viewer.entities.add({
        name: "orbit line",
        polyline: {
            positions: positionsOverTime,
            material: currentColor,
            width: 1,
        }
    });

    // Add object animation over one orbit
    positionsOverTime = new Cesium.SampledPositionProperty();
    for (let i = -timestepInSeconds; i < totalSeconds; i+= timestepInSeconds) {
        const time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
        const jsDate = Cesium.JulianDate.toDate(time);
        const positionAndVelocity = satellite.propagate(satrec, jsDate);
        const gmst = satellite.gstime(jsDate);
        const p = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        const position = Cesium.Cartesian3.fromRadians(p.longitude, p.latitude, p.height * 1000);
        positionsOverTime.addSample(time, position);
    } 
    satellitePointAnimation = viewer.entities.add({
        position: positionsOverTime,
        point: { pixelSize: 8, color: currentColor },
        label: {text: `${sat.getName()}`} //added a label for clarity
    });
    satellitePointAnimation.label.scale = .5;
    satellitePointAnimation.label.show = true;
}

