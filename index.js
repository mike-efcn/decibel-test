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

const getUserMedia = async () => new Promise((resolve) => {
  window.navigator.getUserMedia(
    {
      audio: true,
      // video: {
      //   width: 320,
      //   height: 240,
      // },
    },
    (stream) => resolve(stream),
    console.error,
  );
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
    const stream = await getUserMedia();
    const audio = new AudioContext();
    const source = audio.createMediaStreamSource(stream);
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
