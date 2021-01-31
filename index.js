// root mean square
const rms = (arr = []) =>
  Math.sqrt(arr.reduce((acc, val) => acc + val * val, 0) / arr.length);
// decibel formula
const decibel = (arr = []) => Math.round(20 * Math.log10(rms(arr)));
// normalize bytes
const normalize = (arr = []) => {
  const floats = [];
  arr.forEach((val) => floats.push(Number(val) / 128.0 - 1.0));
  return floats;
};

const init = async () => new Promise((resolve) => {
  (async () => {
    if (window.navigator.getUserMedia) {
      window.navigator.getUserMedia(
        { audio: true },
        (stream) => resolve({ userMedia: stream, audioContext: new AudioContext() }),
        console.error,
      );
    } else {
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      resolve({ userMedia: stream, audioContext: new webkitAudioContext() });
    }
  })();
});

const App = {
  template: `<div>
  <div>{{audioValue}}dB</div>
  <div>Quiet: -50dB</div>
  <div>Environment soundy: -40dB</div>
  <div>Human voice hearable: -20dB</div>
</div>`,
  data() {
    return {
      audioValue: 0,
      interval: null,
    };
  },
  async mounted() {
    const { userMedia, audioContext: audio } = await init();
    const source = audio.createMediaStreamSource(userMedia);
    const filter = audio.createBiquadFilter();
    source.connect(filter)
    const analyser = audio.createAnalyser();
    filter.connect(analyser);
    this.interval = setInterval(() => {
      const bytes = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(bytes);
      this.audioValue = decibel(normalize(bytes.slice()))
    }, 100);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
};

Promise.resolve().then(async () => {
  const $vue = new window.Vue({
    render: (h) => h(App)
  });
  window.$vue = $vue;
  $vue.$mount('#root');
});
