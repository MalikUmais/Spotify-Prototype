let currentSong = new Audio();
let songs;
let currFolder;
function convertSecondsToMinutes(seconds) {
    // If input is in milliseconds, convert to seconds
    const second = Math.floor(seconds); // Assumes input is in seconds, not milliseconds

    // Calculate the number of minutes
    const minutes = Math.floor(second / 60);

    // Calculate the remaining seconds
    const remainingSeconds = second % 60;

    // Format the remaining seconds to always have two digits
    const formattedSeconds =
        remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

    // Return the formatted time string
    return minutes + ":" + formattedSeconds;
}
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/assets/songs/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    //show all the songs
    let songUL = document
        .querySelector(".songList")
        .getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML =
            songUL.innerHTML +
            `<li>
                         <img   src="assets/music.svg" alt="">
                         <div class="info">
                             <div>${song.replaceAll("%20", " ")} </div>
                             <div></div>
                         </div>
                         <div class="playNow">
                             <span>Play Now</span>
                             <img src="assets/button.svg" alt="">
                         </div></li>`;
    }
    //  Attach event listner to each song
    Array.from(
        document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
        e.addEventListener("click", (element) => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs
}
const playMusic = (track, pause = false) => {
    // let audio=new Audio("/assets/songs/"+ track)
    currentSong.src = `/assets/songs/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "assets/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".time").innerHTML = "00:00/00:00";
    
};

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/assets/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/assets/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            //get metadata of folder
            let a = await fetch(
                `http://127.0.0.1:3000/assets/songs/${folder}/info.json`
            );
            let response = await a.json();

            cardContainer.innerHTML =
                cardContainer.innerHTML +
                ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="assets/button.svg" alt="" />
                        </div>
                        <img src="assets/songs/${folder}/cover.jpeg" alt="" />

                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
        }
    }
    //load playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        });
    });
}
async function main() {
    //Display all the albums on page
    displayAlbums();
    //get the list of all songs
    await getSongs("cs");
    playMusic(songs[0], true);

    //Attach event listner to play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/pause.svg";
        } else {
            currentSong.pause();
            play.src = "assets/play.svg";
        }
    });

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".time").innerHTML = `${convertSecondsToMinutes(
            currentSong.currentTime
        )}/${convertSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
    //listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });
    // listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    // listner for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    //listner for previous and next
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if (index + 1 <= songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });
    //listner for volume
    document
        .querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100;
            if(currentSong.volume){
                document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace(
                    "assets/mute.svg",
                    "assets/volume.svg")
            }
        });

    //listner to mute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        
        if (e.target.src.includes("assets/volume.svg")) {
            e.target.src = e.target.src.replace(
                "assets/volume.svg",
                "assets/mute.svg"
            );
            currentSong.volume = 0;
            document
            .querySelector(".range")
            .getElementsByTagName("input")[0].value=0
        } else {
            e.target.src = e.target.src.replace(
                "assets/mute.svg",
                "assets/volume.svg"
            );
            currentSong.volume = 0.1;
            document
            .querySelector(".range")
            .getElementsByTagName("input")[0].value=10
        }
    });
}
main();

// //play the first song
// var audio=new Audio(songs[0]);
// audio.play()
// audio.addEventListner("ontimeupdate",()=>{
//     let duration=audio.duration
//     console.log(audio.duration,audio.currentSrc,audio.currentTime)
// })
