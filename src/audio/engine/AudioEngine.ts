import { AudioLevels, StoredSettings } from '../../types';
import { GraphBuilder } from './GraphBuilder';

export interface AudioEngineCallbacks {
  onError?: (error: Error) => void;
  onStreamEnded?: () => void;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  // Graph nodes
  private inputGainNode: GainNode | null = null;
  private eqBandNodes: BiquadFilterNode[] = [];
  private bassShelfNode: BiquadFilterNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;

  // Mid/Side stereo matrix nodes
  private splitterNode: ChannelSplitterNode | null = null;
  private midSumNode: GainNode | null = null;
  private sideDiffNode: GainNode | null = null;
  private sideDiffInvertNode: GainNode | null = null;
  private midGainNode: GainNode | null = null;
  private sideGainNode: GainNode | null = null;
  private leftSumNode: GainNode | null = null;
  private rightSumNode: GainNode | null = null;
  private sideInvertNode: GainNode | null = null;
  private mergerNode: ChannelMergerNode | null = null;

  // Output & Limiter nodes
  private outputGainNode: GainNode | null = null;
  private limiterCompressorNode: DynamicsCompressorNode | null = null;
  private safetyCeilingNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // Visualizer / Meter buffers
  private freqDataBuffer: Uint8Array | null = null;
  private timeDataBuffer: Uint8Array | null = null;

  private isRunning = false;
  private callbacks: AudioEngineCallbacks;

  // Smooth ramp time constant in seconds (25ms)
  private readonly TIME_CONSTANT = 0.025;

  constructor(callbacks: AudioEngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public get running(): boolean {
    return this.isRunning;
  }

  /**
   * Initializes and starts the audio engine from a captured MediaStream.
   */
  public async start(stream: MediaStream, initialSettings: StoredSettings): Promise<void> {
    if (this.isRunning) {
      await this.stop();
    }

    try {
      this.mediaStream = stream;

      // Handle stream end event (e.g. tab closed or navigation)
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found in captured MediaStream.');
      }

      for (const track of audioTracks) {
        track.onended = () => {
          this.callbacks.onStreamEnded?.();
        };
      }

      // Create AudioContext
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx({ latencyHint: 'interactive' });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Build Graph
      this.buildGraph(stream);

      // Apply initial DSP parameters
      this.applySettings(initialSettings, true);

      this.isRunning = true;
    } catch (err) {
      await this.stop();
      const error = err instanceof Error ? err : new Error(String(err));
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  /**
   * Constructs the full Web Audio DSP processing graph.
   */
  private buildGraph(stream: MediaStream): void {
    if (!this.audioContext) return;
    const ctx = this.audioContext;

    // 1. Source Node from captured tab stream
    this.sourceNode = ctx.createMediaStreamSource(stream);

    // 2. Headroom Pre-Gain Node
    this.inputGainNode = ctx.createGain();

    // 3. 5-Band Equalizer Filters
    this.eqBandNodes = [];
    for (let i = 0; i < 5; i++) {
      const filter = ctx.createBiquadFilter();
      this.eqBandNodes.push(filter);
    }

    // 4. Bass Enhancement Shelf Filter
    this.bassShelfNode = ctx.createBiquadFilter();
    this.bassShelfNode.type = 'lowshelf';

    // 5. Dynamics Compressor
    this.compressorNode = ctx.createDynamicsCompressor();

    // 6. Mid/Side Stereo Processing Matrix
    this.splitterNode = ctx.createChannelSplitter(2);
    this.midSumNode = ctx.createGain();
    this.midSumNode.gain.value = 0.5;

    this.sideDiffNode = ctx.createGain();
    this.sideDiffNode.gain.value = 0.5;

    this.sideDiffInvertNode = ctx.createGain();
    this.sideDiffInvertNode.gain.value = -0.5;

    this.midGainNode = ctx.createGain();
    this.midGainNode.gain.value = 1.0;

    this.sideGainNode = ctx.createGain();
    this.sideGainNode.gain.value = 1.0;

    this.leftSumNode = ctx.createGain();
    this.leftSumNode.gain.value = 1.0;

    this.rightSumNode = ctx.createGain();
    this.rightSumNode.gain.value = 1.0;

    this.sideInvertNode = ctx.createGain();
    this.sideInvertNode.gain.value = -1.0;

    this.mergerNode = ctx.createChannelMerger(2);

    // 7. Output Makeup Gain Node
    this.outputGainNode = ctx.createGain();

    // 8. Limiter / Peak Protection Stage (Fast Compressor + Safety Ceiling)
    this.limiterCompressorNode = ctx.createDynamicsCompressor();
    this.limiterCompressorNode.threshold.value = -1.0;
    this.limiterCompressorNode.knee.value = 0.0;
    this.limiterCompressorNode.ratio.value = 20.0;
    this.limiterCompressorNode.attack.value = 0.001;
    this.limiterCompressorNode.release.value = 0.050;

    this.safetyCeilingNode = ctx.createGain();
    this.safetyCeilingNode.gain.value = 0.95; // -0.45 dB true safety margin

    // 9. Analyser Tap (Parallel tap for visualizer and metering)
    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 64; // Produces 32 frequency bins
    this.analyserNode.smoothingTimeConstant = 0.8;
    this.freqDataBuffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.timeDataBuffer = new Uint8Array(this.analyserNode.fftSize);

    // Connect graph in series:
    // Source -> Input PreGain
    this.sourceNode.connect(this.inputGainNode);

    // Input PreGain -> 5-Band EQ chain
    let prevNode: AudioNode = this.inputGainNode;
    for (const filter of this.eqBandNodes) {
      prevNode.connect(filter);
      prevNode = filter;
    }

    // 5-Band EQ -> Bass Shelf -> Compressor
    prevNode.connect(this.bassShelfNode);
    this.bassShelfNode.connect(this.compressorNode);

    // Compressor -> Stereo M/S Splitter
    this.compressorNode.connect(this.splitterNode);

    // Splitter Ch 0 (Left) -> midSum (+0.5) & sideDiff (+0.5)
    this.splitterNode.connect(this.midSumNode, 0);
    this.splitterNode.connect(this.sideDiffNode, 0);

    // Splitter Ch 1 (Right) -> midSum (+0.5) & sideDiffInvert (-0.5)
    this.splitterNode.connect(this.midSumNode, 1);
    this.splitterNode.connect(this.sideDiffInvertNode, 1);
    this.sideDiffInvertNode.connect(this.sideDiffNode);

    // midSum -> midGain; sideDiff -> sideGain
    this.midSumNode.connect(this.midGainNode);
    this.sideDiffNode.connect(this.sideGainNode);

    // Recombine M/S to Left and Right:
    // Left = Mid + Side
    this.midGainNode.connect(this.leftSumNode);
    this.sideGainNode.connect(this.leftSumNode);

    // Right = Mid - Side
    this.midGainNode.connect(this.rightSumNode);
    this.sideGainNode.connect(this.sideInvertNode);
    this.sideInvertNode.connect(this.rightSumNode);

    // Left -> Merger Ch 0; Right -> Merger Ch 1
    this.leftSumNode.connect(this.mergerNode, 0, 0);
    this.rightSumNode.connect(this.mergerNode, 0, 1);

    // Merger -> Output Makeup Gain -> Limiter -> Safety Ceiling
    this.mergerNode.connect(this.outputGainNode);
    this.outputGainNode.connect(this.limiterCompressorNode);
    this.limiterCompressorNode.connect(this.safetyCeilingNode);

    // Safety Ceiling -> Analyser & Destination
    this.safetyCeilingNode.connect(this.analyserNode);
    this.safetyCeilingNode.connect(ctx.destination);
  }

  /**
   * Updates all DSP nodes based on stored settings with zero-click parameter smoothing.
   */
  public applySettings(settings: StoredSettings, immediate = false): void {
    if (!this.audioContext || !this.isRunning) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const params = GraphBuilder.buildParams(settings);

    // Helper for smooth param update
    const setParam = (param: AudioParam, targetValue: number) => {
      if (immediate) {
        param.cancelScheduledValues(now);
        param.setValueAtTime(targetValue, now);
      } else {
        param.setTargetAtTime(targetValue, now, this.TIME_CONSTANT);
      }
    };

    // 1. Input Gain
    if (this.inputGainNode) {
      setParam(this.inputGainNode.gain, params.preGainLinear);
    }

    // 2. 5-Band EQ
    for (let i = 0; i < this.eqBandNodes.length && i < params.eqGands.length; i++) {
      const node = this.eqBandNodes[i];
      const spec = params.eqGands[i];
      if (node && spec) {
        node.type = spec.type;
        setParam(node.frequency, spec.frequency);
        setParam(node.gain, spec.gain);
        setParam(node.Q, spec.q);
      }
    }

    // 3. Bass Shelf
    if (this.bassShelfNode) {
      this.bassShelfNode.type = params.bassShelf.type;
      setParam(this.bassShelfNode.frequency, params.bassShelf.frequency);
      setParam(this.bassShelfNode.gain, params.bassShelf.gain);
      setParam(this.bassShelfNode.Q, params.bassShelf.q);
    }

    // 4. Compressor
    if (this.compressorNode) {
      setParam(this.compressorNode.threshold, params.compressor.threshold);
      setParam(this.compressorNode.ratio, params.compressor.ratio);
      setParam(this.compressorNode.attack, params.compressor.attack);
      setParam(this.compressorNode.release, params.compressor.release);
      setParam(this.compressorNode.knee, params.compressor.knee);
    }

    // 5. Stereo Side Gain
    if (this.sideGainNode) {
      setParam(this.sideGainNode.gain, params.stereoSideGainLinear);
    }

    // 6. Output Makeup Gain
    if (this.outputGainNode) {
      setParam(this.outputGainNode.gain, params.outputMakeupGainLinear);
    }

    // 7. Limiter Threshold
    if (this.limiterCompressorNode) {
      setParam(this.limiterCompressorNode.threshold, params.limiterThresholdDb);
    }
  }

  /**
   * Retrieves current audio metering and spectrum levels for visualizer.
   */
  public getAudioLevels(): AudioLevels {
    if (!this.analyserNode || !this.freqDataBuffer || !this.timeDataBuffer || !this.isRunning) {
      return {
        rms: 0,
        peak: 0,
        frequencyData: new Array(32).fill(0)
      };
    }

    // Frequency data (32 bins)
    const freqBuf = this.freqDataBuffer;
    this.analyserNode.getByteFrequencyData(freqBuf as unknown as Uint8Array<ArrayBuffer>);
    const frequencyData = Array.from(freqBuf);

    // Time domain data for RMS and Peak calculation
    const timeBuf = this.timeDataBuffer;
    this.analyserNode.getByteTimeDomainData(timeBuf as unknown as Uint8Array<ArrayBuffer>);
    let sumSquares = 0;
    let peak = 0;

    for (let i = 0; i < timeBuf.length; i++) {
      const sample = ((timeBuf[i] ?? 128) - 128) / 128.0;
      const absSample = Math.abs(sample);
      if (absSample > peak) {
        peak = absSample;
      }
      sumSquares += sample * sample;
    }

    const rms = Math.sqrt(sumSquares / timeBuf.length);

    return {
      rms: Math.min(1.0, rms * 1.5), // Normalized for visual meter
      peak: Math.min(1.0, peak),
      frequencyData
    };
  }

  /**
   * Stops processing, stops media tracks, disconnects nodes, and closes AudioContext.
   */
  public async stop(): Promise<void> {
    this.isRunning = false;

    // Stop MediaStream tracks to release tab audio back to standard Chrome output
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }

    // Disconnect and release all nodes
    try {
      this.sourceNode?.disconnect();
      this.inputGainNode?.disconnect();
      for (const node of this.eqBandNodes) {
        node.disconnect();
      }
      this.bassShelfNode?.disconnect();
      this.compressorNode?.disconnect();
      this.splitterNode?.disconnect();
      this.midSumNode?.disconnect();
      this.sideDiffNode?.disconnect();
      this.sideDiffInvertNode?.disconnect();
      this.midGainNode?.disconnect();
      this.sideGainNode?.disconnect();
      this.leftSumNode?.disconnect();
      this.rightSumNode?.disconnect();
      this.sideInvertNode?.disconnect();
      this.mergerNode?.disconnect();
      this.outputGainNode?.disconnect();
      this.limiterCompressorNode?.disconnect();
      this.safetyCeilingNode?.disconnect();
      this.analyserNode?.disconnect();
    } catch {
      // Ignore disconnection errors during teardown
    }

    this.sourceNode = null;
    this.inputGainNode = null;
    this.eqBandNodes = [];
    this.bassShelfNode = null;
    this.compressorNode = null;
    this.splitterNode = null;
    this.midSumNode = null;
    this.sideDiffNode = null;
    this.sideDiffInvertNode = null;
    this.midGainNode = null;
    this.sideGainNode = null;
    this.leftSumNode = null;
    this.rightSumNode = null;
    this.sideInvertNode = null;
    this.mergerNode = null;
    this.outputGainNode = null;
    this.limiterCompressorNode = null;
    this.safetyCeilingNode = null;
    this.analyserNode = null;

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close();
      } catch {
        // Ignore close errors
      }
      this.audioContext = null;
    }
  }
}
