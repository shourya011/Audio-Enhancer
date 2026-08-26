export class MockAudioParam {
  public value: number;
  public defaultValue: number;
  public minValue: number;
  public maxValue: number;

  constructor(initialValue = 0) {
    this.value = initialValue;
    this.defaultValue = initialValue;
    this.minValue = -1000;
    this.maxValue = 1000;
  }

  public setValueAtTime(value: number, _time: number): void {
    this.value = value;
  }

  public linearRampToValueAtTime(value: number, _time: number): void {
    this.value = value;
  }

  public setTargetAtTime(value: number, _time: number, _timeConstant: number): void {
    this.value = value;
  }

  public cancelScheduledValues(_time: number): void {}
}

export class MockAudioNode {
  public context: MockAudioContext;
  public numberOfInputs = 1;
  public numberOfOutputs = 1;

  constructor(context: MockAudioContext) {
    this.context = context;
  }

  public connect(destination: MockAudioNode | AudioNode, _outputIndex = 0, _inputIndex = 0): MockAudioNode | AudioNode {
    return destination;
  }

  public disconnect(): void {}
}

export class MockGainNode extends MockAudioNode {
  public gain = new MockAudioParam(1.0);
}

export class MockBiquadFilterNode extends MockAudioNode {
  public type: BiquadFilterType = 'peaking';
  public frequency = new MockAudioParam(1000);
  public gain = new MockAudioParam(0);
  public Q = new MockAudioParam(1);
}

export class MockDynamicsCompressorNode extends MockAudioNode {
  public threshold = new MockAudioParam(-24);
  public knee = new MockAudioParam(30);
  public ratio = new MockAudioParam(12);
  public attack = new MockAudioParam(0.003);
  public release = new MockAudioParam(0.25);
}

export class MockAnalyserNode extends MockAudioNode {
  public fftSize = 64;
  public frequencyBinCount = 32;
  public minDecibels = -100;
  public maxDecibels = -30;
  public smoothingTimeConstant = 0.8;

  public getByteFrequencyData(array: Uint8Array): void {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 128);
    }
  }

  public getByteTimeDomainData(array: Uint8Array): void {
    for (let i = 0; i < array.length; i++) {
      array[i] = 128 + Math.floor((Math.random() - 0.5) * 60);
    }
  }
}

export class MockChannelSplitterNode extends MockAudioNode {
  constructor(context: MockAudioContext, numberOfOutputs = 2) {
    super(context);
    this.numberOfOutputs = numberOfOutputs;
  }
}

export class MockChannelMergerNode extends MockAudioNode {
  constructor(context: MockAudioContext, numberOfInputs = 2) {
    super(context);
    this.numberOfInputs = numberOfInputs;
  }
}

export class MockMediaStreamAudioSourceNode extends MockAudioNode {
  public mediaStream: MediaStream;
  constructor(context: MockAudioContext, stream: MediaStream) {
    super(context);
    this.mediaStream = stream;
  }
}

export class MockAudioContext {
  public currentTime = 0;
  public state: AudioContextState = 'running';
  public destination: MockAudioNode;

  constructor(_options?: AudioContextOptions) {
    this.destination = new MockAudioNode(this);
  }

  public createGain(): MockGainNode {
    return new MockGainNode(this);
  }

  public createBiquadFilter(): MockBiquadFilterNode {
    return new MockBiquadFilterNode(this);
  }

  public createDynamicsCompressor(): MockDynamicsCompressorNode {
    return new MockDynamicsCompressorNode(this);
  }

  public createAnalyser(): MockAnalyserNode {
    return new MockAnalyserNode(this);
  }

  public createChannelSplitter(numberOfOutputs = 2): MockChannelSplitterNode {
    return new MockChannelSplitterNode(this, numberOfOutputs);
  }

  public createChannelMerger(numberOfInputs = 2): MockChannelMergerNode {
    return new MockChannelMergerNode(this, numberOfInputs);
  }

  public createMediaStreamSource(stream: MediaStream): MockMediaStreamAudioSourceNode {
    return new MockMediaStreamAudioSourceNode(this, stream);
  }

  public async resume(): Promise<void> {
    this.state = 'running';
  }

  public async suspend(): Promise<void> {
    this.state = 'suspended';
  }

  public async close(): Promise<void> {
    this.state = 'closed';
  }
}

export function setupWebAudioMocks(): void {
  // @ts-ignore
  global.AudioContext = MockAudioContext;
  // @ts-ignore
  global.window = global.window || {};
  // @ts-ignore
  global.window.AudioContext = MockAudioContext;
}
