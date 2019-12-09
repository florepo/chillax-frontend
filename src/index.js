// URLs
const API_ENDPOINT = "http://localhost:3000"
const URL_COMPOSITIONS = `${API_ENDPOINT}/compositions`
const URL_SOUNDS = `${API_ENDPOINT}/sounds`

// DOM ELEMENTS
const soundContainer = document.querySelector("#sound-container")
const soundList = document.querySelector("#sound-list")
const compositionList = document.querySelector("#composition-list")
const compSoundContainer = document.querySelector("#composition-sound-container")
const compForm = document.querySelector(".form")
const playCompBtn = document.querySelector("#playCompBtn")
const pauseCompBtn = document.querySelector("#pauseCompBtn")
const stopCompBtn = document.querySelector("#stopCompBtn")
const clearAllBtn = document.querySelector("#clearAllBtn")
const currentCompName = document.querySelector("#current-comp-name")

// API
const apiHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

const get = (url) => {
    return fetch(url)
        .then(response => response.json())
}

const post = (url, data) => {
    const configObject =  {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify(data)
    }
    return fetch(url, configObject)
}

const destroy = (instance_url) => {
    const configObject = {
        method: "DELETE"
      }
    return fetch(instance_url, configObject)
}

// EVENT LISTENERS
compForm.addEventListener("submit", (event) => {
    submitHandler(event)
})

playCompBtn.addEventListener("click", () => {
    playComposition()
})

pauseCompBtn.addEventListener("click", () => {
    pauseComposition()
})

stopCompBtn.addEventListener("click", () => {
    stopComposition()
})

clearAllBtn.addEventListener("click", () => {
    clearComposition()
})

// EVENT HANDLER
const addHandler = (event, sound, volume) => {
    renderSoundCard(sound, volume)
}

const delCompHandler = (event, composition) => {
    deleteComposition(event, composition.id)
}

const submitHandler = (event) => {
    event.preventDefault()
    prepareCompositionData()
}

const playComposition = () => {
    const compSoundList = compSoundContainer.querySelectorAll("audio")  
    return compSoundList.forEach((compSound) => {
        compSound.play()
    })
}

const pauseComposition = () => {
    const compSoundList = compSoundContainer.querySelectorAll("audio")
    return compSoundList.forEach((compSound) => {
        compSound.pause()
    })
}

const stopComposition = () => {
    const compSoundList = compSoundContainer.querySelectorAll("audio")
    return compSoundList.forEach((compSound) => {
        compSound.pause()
        compSound.currentTime = 0
    })
}

const clearComposition = () => {
    while (compSoundContainer.firstChild) compSoundContainer.removeChild(compSoundContainer.firstChild);
}

const loadSoundCompositionHandler = (event, composition) =>{
    let soundsArray = []
    composition.composition_sounds.forEach(cs =>{
        let id = cs["sound_id"]
        let result  = null
        let sounds = composition.sounds.filter(obj => {return obj.id === id})
        result = sounds[0]
        result["volume"]=cs.volume
        soundsArray.push(result)
    }) 
    renderCompositionSounds(soundsArray)
    currentCompName.innerText = composition.name
}

const sliderHandler = (event, input) => {
    event.target.parentNode.parentNode.querySelector("audio").volume = input.value/100
    event.target.parentNode.parentNode.querySelector("audio").play()
}

const playSoundHandler = (event) => {
    let player = event.target.parentNode.parentNode.parentElement.querySelector("audio")
    player.play()
}

const pauseSoundHandler = (event) => {
    let player = event.target.parentNode.parentNode.parentElement.querySelector("audio")
    player.pause()
}

const stopSoundHandler = (event) => {
    let player = event.target.parentNode.parentNode.parentElement.querySelector("audio")
    player.pause()
    player.currentTime = 0;
}

const removeSoundHandler = (event, composition) => {
    event.target.parentNode.parentNode.parentNode.parentNode.remove()
}

//DATA HANDLING

const getSounds = () => {
    let url = URL_SOUNDS
    return get(url)
}

const getCompositions = () => {
    let url = URL_COMPOSITIONS
    return get(url)
}

const deleteComposition = (event, composition_id) => {
    let instance_url = URL_COMPOSITIONS + `/${composition_id}`
    return destroy(instance_url).then(event.target.parentElement.remove())
}

const extractData = (soundCard) => {
    const volume = soundCard.querySelector("audio").volume
    const id = parseInt(soundCard.id)
    return {id: id, volume: volume}
}

const createComposition = (data) => {
    let url = URL_COMPOSITIONS
    return post(url, data)
}

const prepareCompositionData = () => {
    const name = compForm.querySelector("input[name=name]").value
    const soundCardNodes = compSoundContainer.childNodes
    let soundCards = []
    const data = {}

    for(let i = 0; i < soundCardNodes.length; i++) {
        let scn = soundCardNodes[i]
        soundCards.push(scn)
    }
    soundCards.forEach((soundCard, index) => {
        data[index] = extractData(soundCard)
    })
    data[Object.keys(data).length] = name     // composition name
    data[Object.keys(data).length] = 1        // user_id should login functionality be implemented
    
    return createComposition(data).then(response => response.json()).then(json => renderCompositionListElement(json))
        .then(currentCompName.innerText = name)
}

const prepareCompositionForRender = () => {

}

// RENDER SOUNDS

const renderCompositionSounds = (sounds) => {
    while (compSoundContainer.firstChild) compSoundContainer.removeChild(compSoundContainer.firstChild);
    sounds = Array.from(sounds)
    return sounds.forEach((sound) => {
        renderSoundCard(sound)
    })
}

const renderSoundCard = (sound) => {
    const card = document.createElement("div");
    card.setAttribute("class", "card");
    card.setAttribute("id", `${sound.id}`);

    const imageContainer = document.createElement("div");
    imageContainer.setAttribute("class", "img-container");

    const image = document.createElement("img");
    image.setAttribute("class", "card-img-top");
    image.setAttribute("alt", "Sound Image");
    image.src = sound.image_url;
    image.addEventListener("click", ()=> imageHandler(event)) 

    const body = document.createElement("div");
    body.setAttribute("class", "card-body");
    body.setAttribute("id", `${sound.id}`);

    const title = document.createElement("h5");
    title.setAttribute("class", "card-title");
    title.innerText = sound.name;

    const p = document.createElement("p");
    p.setAttribute("class", "card-text");
    p.innerText = sound.description

    const controls = document.createElement("span")

    const playBtn = document.createElement("button");
    playBtn.setAttribute("class", "play btn btn-outline-primary");
    const iPlay = document.createElement("i")
    iPlay.setAttribute("class", "fa fa-play")
    playBtn.append(iPlay)
    playBtn.addEventListener("click", () => playSoundHandler(event, sound))
   
    const pauseBtn = document.createElement("button");
    pauseBtn.setAttribute("class", "pause btn btn-outline-primary");
    const iPause = document.createElement("i")
    iPause.setAttribute("class", "fa fa-pause")
    pauseBtn.append(iPause)
    pauseBtn.addEventListener("click", () => pauseSoundHandler(event, sound))

    const stopBtn = document.createElement("button");
    stopBtn.setAttribute("class", "stop btn btn-outline-secondary");
    const iStop = document.createElement("i")
    iStop.setAttribute("class", "fa fa-stop")
    stopBtn.append(iStop)
    stopBtn.addEventListener("click", () => stopSoundHandler(event, sound))

    const removeBtn = document.createElement("button");
    removeBtn.setAttribute("class", "remove btn btn-secondary");
    const iClose = document.createElement("i")
    iClose.setAttribute("class", "fas fa-times")
    iClose.style.color = "red"
    removeBtn.append(iClose)
    removeBtn.addEventListener("click", () => removeSoundHandler(event, sound))

    controls.append(playBtn, pauseBtn, stopBtn, removeBtn);

    const player = renderAudioPlayer(sound)
    const slider = renderSlider(sound)

    card.append(image)
    body.append(title, slider, player, controls);
    card.append(imageContainer, body);
    compSoundContainer.append(card);

    return sound
}

const renderSoundList = (soundArray) => {
    let result = soundArray.map((sound) => {
        return renderSoundListElement(sound)
    })
    return result
}

const renderSoundListElement = (sound) => {
    const li = document.createElement("li")
    const p = document.createElement("p")
    p.innerText = sound.name

    const addBtn = document.createElement("button")
    addBtn.setAttribute("class", "btn btn-primary")
    
    const i = document.createElement("i")
    i.setAttribute("class", "fas fa-plus")
    addBtn.append(i)
    addBtn.addEventListener("click", () => addHandler(event, sound))

    const emptyP = document.createElement("p")
    
    li.append(p, addBtn, emptyP)
    soundList.append(li)
    return sound
}

const renderCompositionList = (compositions) =>{
        compositions.forEach(composition =>{
            renderCompositionListElement(composition)
        })
}

const renderCompositionListElement = (composition) => {
    const li = document.createElement("li")
    li.setAttribute("is",`comp-${composition.id}`)

    const p = document.createElement("p")
    p.innerText = composition.name

    const loadBtn = document.createElement("button")
    loadBtn.setAttribute("class", "btn btn-primary")
    loadBtn.innerText = "Load"
    loadBtn.addEventListener("click", () => loadSoundCompositionHandler(event, composition))
    
    const delBtn = document.createElement("button")
    delBtn.setAttribute("class", "btn btn-danger")
    delBtn.innerText = "Delete"
    delBtn.addEventListener("click", () => delCompHandler(event, composition))

    const emptyP = document.createElement("p")

    li.append(p, loadBtn, delBtn, emptyP)
    compositionList.append(li)
}

// SITE INITIALIZATION

getSounds().then(data => renderSoundList(data)).then(data=>renderCompositionSounds(data))
getCompositions().then(data => renderCompositionList(data))


// RENDER AUDIO ELEMENTS

const renderSlider = (sound) =>{
    const div = document.createElement("div")
    div.setAttribute("class", "slider-container")

    const span = document.createElement("span")
    span.setAttribute("id", "val")

    const input = document.createElement("input")
    input.setAttribute("id", "slide")
    input.setAttribute("type", "range")
    input.setAttribute("min", "0")
    input.setAttribute("max", "100")

    if (!!!sound.volume) {
        input.value = 100
    } else {
        input.value = sound.volume * 100
    }

    input.addEventListener("change", () => sliderHandler(event,input))
    div.append(span, input)
    return div
}

const renderAudioPlayer = (sound) => {
    const soundPlayer = document.createElement("audio")
    soundPlayer.src = sound.sound_url
    soundPlayer.className = "player"
    soundPlayer.setAttribute("loop", "")

    return soundPlayer
}
