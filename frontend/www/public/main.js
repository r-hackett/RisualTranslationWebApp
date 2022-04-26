// Speech SDK presence check

// On document load resolve the Speech SDK dependency
function Initialize(onComplete) {
    if (!!window.SpeechSDK) {
        onComplete(window.SpeechSDK);
    }
}



var loremIpsumRun = true;
var speechTranslationConfig = undefined;
var recognizer = undefined;
var audioFile = undefined;
var textBoxCount = 0;
var lorumIpsumTimer;
var textBoxDetails = {};
var filePicker = document.getElementById("file-picker");
var audioPlayer = document.getElementById("audio-player");
var audioSnippetEndTime = audioPlayer.duration;
var realTimeTextBox = document.getElementById("real-time-transcript-box");
var stopTranslationButton = document.getElementById("stop-translation-button");
var startTranslationButton = document.getElementById("start-translation-button");
var translationProgress = document.getElementById("translation-progress");
var saveChangesButton = document.getElementById("save-changes-button");
var saveTranscriptButton = document.getElementById("save-transcript-button");

// Search the URL parameters for "lorem" where it equals true. If found, enable lorem ipsum mode, where
// clicking the "start translation" button will ignore the input file and subscription key, and will 
// not access the Speech SDK. Instead, it will output a new editable box with lorem ipsum text at set 
// time intervals. This is useful for testing the program without without having to pay for access 
// to the Speech SDK. 
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams) {
    const lorem = urlParams.get('lorem')
    if (lorem == "true") {
        loremIpsumRun = true;
        console.log("Simulation lorem ipsum run enabled");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    var SpeechSDK;

    Initialize(function (speechSdk) {
        SpeechSDK = speechSdk;
    });
});



/* 
    Appends an "editable-text-box" in the "text-boxes" div in the following format.

    <div class="editable-text-box">
        <textarea class="editable-textarea" name="editable-text" rows="4" cols="50"></textarea>
        <div class="play-snippet-wrapper">
            <img class="play-snippet-button" src="images/play-snippet.jpg" alt="play snippet">
        </div>
    </div>
*/
function appendEditableTextBox(text, textAreaID, playButtonID) {
    var textBox = document.createElement("div");
    textBox.className = "editable-text-box";

    var editableTextArea = document.createElement("textarea");
    editableTextArea.className = "editable-textarea";
    editableTextArea.id = textAreaID;
    editableTextArea.value = text;
    editableTextArea.rows = "4";
    editableTextArea.cols = "50";
    textBox.appendChild(editableTextArea);

    var playSnippetWrapper = document.createElement("div");
    playSnippetWrapper.className = "play-snippet-wrapper";
    textBox.appendChild(playSnippetWrapper);

    var playSnippetImg = document.createElement("img");
    playSnippetImg.className = "play-snippet-button";
    playSnippetImg.alt = "play snippet";
    playSnippetImg.src = "images/play-snippet.jpg";
    playSnippetImg.id = playButtonID;
    playSnippetWrapper.appendChild(playSnippetImg);

    document.getElementsByClassName('text-boxes')[0].appendChild(textBox);
}



class EditableTextBoxDetails {
    constructor(textAreaID, audioOffsetInTicks, audioDurationInTicks) {
        this.textAreaID = textAreaID;
        this.audioOffsetInTicks = audioOffsetInTicks;
        this.audioDurationInTicks = audioDurationInTicks;

        /* A single tick represents one hundred nanoseconds or one ten-millionth of a second.
           There's 1e9 nanoseconds in a second, and there's 100 nanoseconds per tick, so dividing by
           1e7 gives the time in seconds. */
        this.audioOffsetInSecs = audioOffsetInTicks / 10000000;
        this.audioDurationInSecs = audioDurationInTicks / 10000000;
    }
}

// The timeupdate event is called whenever currentTime is updated. This is used to stop audio
// when it has passed the end of the a snippet, but this is also called whenever the audio file 
// is playing..
audioPlayer.addEventListener("timeupdate", function () {
    if (this.currentTime >= audioSnippetEndTime) {
        // The user may play the file using the audio player, so audioSnippetEndTime should
        // not cause the audio to pause early. We set it to the full duration of the file to 
        // prevent this.
        audioSnippetEndTime = audioPlayer.duration;
        this.pause();
    }
});

// The change event is triggered when the user selects an input file. Since Javascript
// does not know about the user's directory structure (for security reasons), URL.createObjectURL
// is used.
filePicker.addEventListener("change", function () {
    audioFile = filePicker.files[0];
    audioPlayer.src = URL.createObjectURL(audioFile);
    audioPlayer.onend = function (e) {
        URL.revokeObjectURL(this.src);
    }
});

function playInterval(start, stop) {
    audioPlayer.currentTime = start;
    audioSnippetEndTime = stop;
    audioPlayer.play();
}

function playSnippetClick(event) {
    details = textBoxDetails[event.target.id];
    console.log(event.target.id +
        `' clicked: playing audio at offset ${details.audioOffsetInSecs}s for ${details.audioDurationInSecs}s`);
    playInterval(details.audioOffsetInSecs, details.audioOffsetInSecs + details.audioDurationInSecs);
}

function intToPlayButtonID(n) {
    return "play-button-" + n.toString() + "-id";
}

function intToTextAreaID(n) {
    return "text-area-" + n.toString() + "-id";
}

function printAllPhraseDetails() {
    for (let i = 0; i < textBoxCount; i++) {
        let playButtonID = intToPlayButtonID(i);
        details = textBoxDetails[playButtonID];
        let text = document.getElementById(details.textAreaID).value;
        console.log(`${i}\n${details.audioOffsetInSecs}s -> ${details.audioOffsetInSecs + details.audioDurationInSecs}s\n${text}\n\n`);
    }
}

// Add a text box without using up our Azure credits.
function addLoremIpsum() {
    if (textBoxCount > 10)
        clearInterval(lorumIpsumTimer);

    let textAreaID = intToTextAreaID(textBoxCount);
    let playButtonID = intToPlayButtonID(textBoxCount);
    let ipsum = new LoremIpsum();
    let sentence = ipsum.sentence(8, 12);

    textBoxDetails[playButtonID] = new EditableTextBoxDetails(textAreaID, textBoxCount * 10000000, 10000000);
    appendEditableTextBox(sentence, textAreaID, playButtonID);

    document.getElementById(playButtonID).addEventListener("click", playSnippetClick);
    realTimeTextBox.innerHTML += sentence + "<br>";
    textBoxCount++;
}

// Add a text box with the result of a translation from the Speech SDK.
function addTranslation(result) {
    let textAreaID = intToTextAreaID(textBoxCount);
    let playButtonID = intToPlayButtonID(textBoxCount);

    let translation = result.translations.get(document.getElementById("output-language-options").value);
    textBoxDetails[playButtonID] = new EditableTextBoxDetails(textAreaID, result.offset, result.duration);
    let d = textBoxDetails[playButtonID];
    let progress = ((d.audioOffsetInSecs + d.audioDurationInSecs) / audioPlayer.duration) * 100;
    translationProgress.innerText = progress.toFixed(1).toString();
    appendEditableTextBox(translation, textAreaID, playButtonID);

    document.getElementById(playButtonID).addEventListener("click", playSnippetClick);
    realTimeTextBox.innerHTML += translation + "<br>";
    textBoxCount++;
}

saveChangesButton.addEventListener("click", function () {
    realTimeTextBox.innerHTML = "";

    for (let i = 0; i < textBoxCount; i++) {
        let playButtonID = intToPlayButtonID(i);
        details = textBoxDetails[playButtonID];
        realTimeTextBox.innerHTML += document.getElementById(
            details.textAreaID
        ).value.replaceAll("\n","<br>");
        realTimeTextBox.innerHTML += "<br>";
    }
});

saveTranscriptButton.addEventListener("click", function () {
    const textToBLOB = new Blob([realTimeTextBox.innerHTML.replaceAll("<br>", "\n")], {
        type: "text/plain",
    });
    const sFileName = "transcript.txt";

    let newLink = document.createElement("a");
    newLink.download = sFileName;

    if (window.webkitURL != null) {
        newLink.href = window.webkitURL.createObjectURL(textToBLOB);
    } else {
        newLink.href = window.URL.createObjectURL(textToBLOB);
        newLink.style.display = "none";
        document.body.appendChild(newLink);
    }
    newLink.click();
});

stopTranslationButton.addEventListener("click", function () {
    if (recognizer)
        recognizer.stopContinuousRecognitionAsync();

    if (loremIpsumRun)
        clearInterval(lorumIpsumTimer);
});

startTranslationButton.addEventListener("click", function () {
    // If loremIpsumRun is true, execute lorem ipsum run. The Speech SDK is not used.
    if (loremIpsumRun) {
        lorumIpsumTimer = setInterval(addLoremIpsum, 2000);
        addLoremIpsum();
        return;
    }

    if (!audioFile) {
        alert("Please select an audio file");
        return;
    }

    let subscriptionKeyText = document.getElementById("subscription-key-text");

    if (subscriptionKeyText.value.length == 0) {
        alert("Please enter a subscription key");
        return;
    }

    let regionOptions = document.getElementById("region-options");
    speechTranslationConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(
        subscriptionKeyText.value, regionOptions.value);

    speechTranslationConfig.outputFormat = SpeechSDK.OutputFormat.Detailed;

    const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioFile);

    speechTranslationConfig.addTargetLanguage(document.getElementById("output-language-options").value);
    speechTranslationConfig.speechRecognitionLanguage = document.getElementById("language-options").value;

    recognizer = new SpeechSDK.TranslationRecognizer(speechTranslationConfig, audioConfig);

    recognizer.recognizing = (s, e) => {
        console.log(`TRANSLATING: Text=${e.result.text}`);
    };
    recognizer.recognized = (s, e) => {
        if (e.result.reason == SpeechSDK.ResultReason.TranslatedSpeech) {
            console.log(`TRANSLATED: Text=${e.result.text}`);

            if (e.result.translations) {
                addTranslation(e.result);
            }
        }
        else if (e.result.reason == SpeechSDK.ResultReason.NoMatch) {
            console.log("NOMATCH: Speech could not be translated.");
        }
    };
    recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);
        if (e.reason == SpeechSDK.CancellationReason.Error) {
            console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
            console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
            console.log("CANCELED: Did you update the subscription info?");
        }
        recognizer.stopContinuousRecognitionAsync();
    };
    recognizer.sessionStopped = (s, e) => {
        translationProgress.innerText = "100";
        console.log("\n    Session stopped event.");
        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync();
});



topbutton = document.getElementById("top-btn");

window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 600 || document.documentElement.scrollTop > 600 && screen.width < 700) {
        topbutton.style.display = "block";
    } else {
        topbutton.style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}
