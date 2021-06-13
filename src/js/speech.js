import { choice } from './utils';

// index utterances by message so they can be reused for faster delivery
const utterances = {};

// main voice used to say the message
let voice;

// voices are loaded asynchronously, but the API doesn't return a promise
// so attempt to load voices for 1 second before giving up
const getVoices = () => new Promise((resolve, reject) => {
  let attempts = 0;

  let id = setInterval(() => {
    attempts += 1;
    if (speechSynthesis.getVoices().length) {
      resolve(speechSynthesis.getVoices());
      clearInterval(id);
    }
    else if (attempts >= 100) {
      reject([]);
      clearInterval(id);
    }
  }, 10);
});

function createUtterance(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.rate = 1.5;
  return utterances[text] = utterance;
}

// Speech Synthesis wrapper API

/**
 * Initialize speech synthesis voices and return a function to speak text
 * using a random voice from the ones matching the navigator's language value
 * @return function to pronounce a text using a random voice from the ones matching the navigator's language value
 */
export async function initSpeech(texts) {
  // find all suitable voices
  const allVoices = await getVoices();
  let localVoices = allVoices.filter(voice => (
    // exact match of language and country variant
    navigator.language === voice.lang
    // or partial match on the language, regardless of the country variant
    || (new RegExp(`^${navigator.language.split('-')[0]}`)).test(voice.lang)
  ));

  if (localVoices.length) {
    // choose a voice randomly
    voice = choice(localVoices);

    // cache all messages utterance for faster delivery
    texts.forEach(createUtterance);

    // return a function to speak a message in that voice
    return function(text) {
      // speak a cached utterance of this message, or a newly created one
      speechSynthesis.speak(utterances[text] || createUtterance(text));
    }
  } else {
    return function() {
      // no-op since no suitable voice is available
    }
  }
}