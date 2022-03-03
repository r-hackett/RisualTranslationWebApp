

document.addEventListener("click", saveChangesClick);

function editableTextBoxClick(event) {
    window.alert("Clicked on editable text box '" + event.target.id + "'");
}

function playButtonClick(event) {
    //window.alert("Clicked on play button '" + event.target.id + "'");
}

function saveChangesClick(event) {
    const speechTranslationConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription("1d5068b2bdb44a909d3df19ed63187c5", "westeurope");
    const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput("classroom-gern.wav");
    console.log("success");
}

function startTranslation() {
    var SpeechSDK = window.SpeechSDK;

    const speechTranslationConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription("1d5068b2bdb44a909d3df19ed63187c5", "westeurope");
    console.log("1");
    const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput("classroom-german.wav");
    console.log("2");
    const recognizer = new SpeechSDK.TranslationRecognizer(speechTranslationConfig, audioConfig);
    console.log("3");
    speechTranslationConfig.speechRecognitionLanguage = "de-DE";
    speechTranslationConfig.addTargetLanguage("en-US");

    recognizer.recognizing = (s, e) => {
        console.log(`TRANSLATING: Text=${e.result.text}`);
    };
    recognizer.recognized = (s, e) => {
        if (e.result.reason == ResultReason.RecognizedSpeech) {
            console.log(`TRANSLATED: Text=${e.result.text}`);
        }
        else if (e.result.reason == ResultReason.NoMatch) {
            console.log("NOMATCH: Speech could not be translated.");
        }
    };
    recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);
        if (e.reason == CancellationReason.Error) {
            console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
            console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
            console.log("CANCELED: Did you update the subscription info?");
        }
        recognizer.stopContinuousRecognitionAsync();
    };
    recognizer.sessionStopped = (s, e) => {
        console.log("\n    Session stopped event.");
        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync();
}


initialise();

/* 
    Dynamically appends an "editable-text-box" in the "text-boxes" div in the following format.

    <div class="editable-text-box">
        <div class="editable-text-wrapper">
            <div class="editable-text" contentEditable="true" tabindex="0">
                text here
            </div>
        </div>
        <div class="play-snippet-wrapper">
            <img class="play-snippet-button" src="images/play-snippet.jpg" alt="play snippet">
        </div>
    </div>
*/
function appendEditableTextBox(text, textAreaID, textWrapperID, playButtonID) {
    var textBox=document.createElement("div");
    textBox.className = "editable-text-box";

    var textWrapper=document.createElement("div");
    textWrapper.className = "editable-text-wrapper"; 
    textWrapper.id = textWrapperID;
    textBox.appendChild(textWrapper);

    var editableText=document.createElement("div");
    editableText.className = "editable-text"; 
    editableText.id = textAreaID;
    editableText.innerText = text;
    editableText.contentEditable = "true";
    editableText.tabIndex = "0";
    textWrapper.appendChild(editableText);

    var playSnippetWrapper=document.createElement("div");
    playSnippetWrapper.className = "play-snippet-wrapper"; 
    textBox.appendChild(playSnippetWrapper);    

    var playSnippetImg=document.createElement("img");
    playSnippetImg.className = "play-snippet-button";
    playSnippetImg.alt = "play snippet";
    playSnippetImg.src = "images/play-snippet.jpg";
    playSnippetImg.id = playButtonID;
    playSnippetWrapper.appendChild(playSnippetImg);

    document.getElementsByClassName('text-boxes')[0].appendChild(textBox);
}


function initialise() {

    // for (let i = 0; i < 100; i++) {
    //     let textAreaID = "text-area-" + i.toString() + "-id";
    //     let textWrapperID = "text-wrapper-" + i.toString() + "-id";
    //     let playButtonID = "play-button-" + i.toString() + "-id";
    //     appendEditableTextBox("Text box created dynamically in JS: " + i.toString(), textAreaID, textWrapperID, playButtonID);

    //     // Create callbacks
    //     //document.getElementById(textAreaID).addEventListener("click", editableTextBoxClick);  // Don't need to add events for both wrapper and text area
    //     document.getElementById(textWrapperID).addEventListener("click", editableTextBoxClick);
    //     document.getElementById(playButtonID).addEventListener("click", playButtonClick);
    // }

    //startTranslation();

    console.log("initialised");
}

