import { PRESET_LIST, getPreset } from '../audio/presets/presets';
import { GetStatusMessage, StartCaptureMessage, StopCaptureMessage, UpdateSettingsMessage } from '../messaging/protocol';
import { AudioLevels, ErrorState, ExtensionStatus, PresetId, StoredSettings } from '../types';

class PopupController {
  private status: ExtensionStatus | null = null;
  private animFrameId: number | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  // DOM elements
  private masterToggleBtn!: HTMLButtonElement;
  private masterStatusText!: HTMLElement;
  private heroTrackTitle!: HTMLElement;
  private siteBadge!: HTMLElement;
  private siteName!: HTMLElement;
  private abCompareBtn!: HTMLButtonElement;
  private presetsContainer!: HTMLElement;
  private presetTagline!: HTMLElement;
  private intensitySlider!: HTMLInputElement;
  private intensityValueBadge!: HTMLElement;
  private errorBanner!: HTMLElement;
  private errorTitle!: HTMLElement;
  private errorMsg!: HTMLElement;
  private errorRetryBtn!: HTMLButtonElement;
  private meterFill!: HTMLElement;
  private canvas!: HTMLCanvasElement;

  // Trims elements
  private trimBassSlider!: HTMLInputElement;
  private trimBassVal!: HTMLElement;
  private trimClaritySlider!: HTMLInputElement;
  private trimClarityVal!: HTMLElement;
  private trimWidthSlider!: HTMLInputElement;
  private trimWidthVal!: HTMLElement;
  private resetTrimsBtn!: HTMLButtonElement;
  private trimsCard!: HTMLElement;
  private trimsToggle!: HTMLButtonElement;

  // Advanced EQ elements
  private advancedCard!: HTMLElement;
  private advancedToggle!: HTMLButtonElement;
  private eqB1Slider!: HTMLInputElement;
  private eqB1Val!: HTMLElement;
  private eqB2Slider!: HTMLInputElement;
  private eqB2Val!: HTMLElement;
  private eqB3Slider!: HTMLInputElement;
  private eqB3Val!: HTMLElement;
  private eqB4Slider!: HTMLInputElement;
  private eqB4Val!: HTMLElement;
  private eqB5Slider!: HTMLInputElement;
  private eqB5Val!: HTMLElement;
  private resetEqBtn!: HTMLButtonElement;
  private compStatusText!: HTMLElement;

  public init(): void {
    this.cacheElements();
    this.renderPresets();
    this.bindEvents();
    this.initCanvas();
    this.fetchStatus();
  }

  private cacheElements(): void {
    this.masterToggleBtn = document.getElementById('master-toggle-btn') as HTMLButtonElement;
    this.masterStatusText = document.getElementById('master-status-text') as HTMLElement;
    this.heroTrackTitle = document.getElementById('hero-track-title') as HTMLElement;
    this.siteBadge = document.getElementById('site-badge') as HTMLElement;
    this.siteName = document.getElementById('site-name') as HTMLElement;
    this.abCompareBtn = document.getElementById('ab-compare-btn') as HTMLButtonElement;
    this.presetsContainer = document.getElementById('presets-container') as HTMLElement;
    this.presetTagline = document.getElementById('preset-tagline') as HTMLElement;
    this.intensitySlider = document.getElementById('intensity-slider') as HTMLInputElement;
    this.intensityValueBadge = document.getElementById('intensity-value-badge') as HTMLElement;
    this.errorBanner = document.getElementById('error-banner') as HTMLElement;
    this.errorTitle = document.getElementById('error-title') as HTMLElement;
    this.errorMsg = document.getElementById('error-msg') as HTMLElement;
    this.errorRetryBtn = document.getElementById('error-retry-btn') as HTMLButtonElement;
    this.meterFill = document.getElementById('meter-fill') as HTMLElement;
    this.canvas = document.getElementById('spectrum-canvas') as HTMLCanvasElement;

    // Trims
    this.trimBassSlider = document.getElementById('trim-bass') as HTMLInputElement;
    this.trimBassVal = document.getElementById('trim-bass-val') as HTMLElement;
    this.trimClaritySlider = document.getElementById('trim-clarity') as HTMLInputElement;
    this.trimClarityVal = document.getElementById('trim-clarity-val') as HTMLElement;
    this.trimWidthSlider = document.getElementById('trim-width') as HTMLInputElement;
    this.trimWidthVal = document.getElementById('trim-width-val') as HTMLElement;
    this.resetTrimsBtn = document.getElementById('reset-trims-btn') as HTMLButtonElement;
    this.trimsCard = document.getElementById('trims-card') as HTMLElement;
    this.trimsToggle = document.getElementById('trims-toggle') as HTMLButtonElement;

    // Advanced EQ
    this.advancedCard = document.getElementById('advanced-card') as HTMLElement;
    this.advancedToggle = document.getElementById('advanced-toggle') as HTMLButtonElement;
    this.eqB1Slider = document.getElementById('eq-b1') as HTMLInputElement;
    this.eqB1Val = document.getElementById('eq-b1-val') as HTMLElement;
    this.eqB2Slider = document.getElementById('eq-b2') as HTMLInputElement;
    this.eqB2Val = document.getElementById('eq-b2-val') as HTMLElement;
    this.eqB3Slider = document.getElementById('eq-b3') as HTMLInputElement;
    this.eqB3Val = document.getElementById('eq-b3-val') as HTMLElement;
    this.eqB4Slider = document.getElementById('eq-b4') as HTMLInputElement;
    this.eqB4Val = document.getElementById('eq-b4-val') as HTMLElement;
    this.eqB5Slider = document.getElementById('eq-b5') as HTMLInputElement;
    this.eqB5Val = document.getElementById('eq-b5-val') as HTMLElement;
    this.resetEqBtn = document.getElementById('reset-eq-btn') as HTMLButtonElement;
    this.compStatusText = document.getElementById('comp-status-text') as HTMLElement;
  }

  private renderPresets(): void {
    this.presetsContainer.innerHTML = '';
    for (const p of PRESET_LIST) {
      const btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.dataset.presetId = p.id;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-label', `${p.name} preset: ${p.tagline}`);
      btn.setAttribute('aria-checked', 'false');

      btn.innerHTML = `
        <span class="preset-btn-icon">${p.icon}</span>
        <span class="preset-btn-name">${p.name}</span>
      `;

      btn.addEventListener('click', () => {
        this.selectPreset(p.id);
      });

      this.presetsContainer.appendChild(btn);
    }
  }

  private initCanvas(): void {
    if (this.canvas) {
      this.canvasCtx = this.canvas.getContext('2d');
    }
  }

  private bindEvents(): void {
    // Master Power Toggle
    this.masterToggleBtn.addEventListener('click', () => {
      this.toggleMasterEnhancement();
    });

    // A/B Bypass Compare Toggle
    this.abCompareBtn.addEventListener('click', () => {
      this.toggleAbBypass();
    });

    // Intensity Slider
    this.intensitySlider.addEventListener('input', () => {
      const val = parseInt(this.intensitySlider.value, 10);
      this.intensityValueBadge.textContent = `${val}%`;
      this.intensitySlider.setAttribute('aria-valuenow', String(val));
      this.updateSettingsFromUi(false);
    });

    this.intensitySlider.addEventListener('change', () => {
      this.updateSettingsFromUi(true);
    });

    // Trims Accordion Toggle
    this.trimsToggle.addEventListener('click', () => {
      const isCollapsed = this.trimsCard.classList.toggle('collapsed');
      this.trimsToggle.setAttribute('aria-expanded', String(!isCollapsed));
    });

    // Advanced EQ Accordion Toggle
    this.advancedToggle.addEventListener('click', () => {
      const isCollapsed = this.advancedCard.classList.toggle('collapsed');
      this.advancedToggle.setAttribute('aria-expanded', String(!isCollapsed));
    });

    // Quick Trims inputs
    const bindTrim = (slider: HTMLInputElement, valElem: HTMLElement) => {
      slider.addEventListener('input', () => {
        const v = parseFloat(slider.value);
        valElem.textContent = `${v > 0 ? '+' : ''}${v.toFixed(1)} dB`;
        this.updateSettingsFromUi(false);
      });
      slider.addEventListener('change', () => {
        this.updateSettingsFromUi(true);
      });
    };

    bindTrim(this.trimBassSlider, this.trimBassVal);
    bindTrim(this.trimClaritySlider, this.trimClarityVal);
    bindTrim(this.trimWidthSlider, this.trimWidthVal);

    // Reset Trims Button
    this.resetTrimsBtn.addEventListener('click', () => {
      this.trimBassSlider.value = '0';
      this.trimBassVal.textContent = '0.0 dB';
      this.trimClaritySlider.value = '0';
      this.trimClarityVal.textContent = '0.0 dB';
      this.trimWidthSlider.value = '0';
      this.trimWidthVal.textContent = '0.0 dB';
      this.updateSettingsFromUi(true);
    });

    // Advanced EQ inputs
    const bindEq = (slider: HTMLInputElement, valElem: HTMLElement) => {
      slider.addEventListener('input', () => {
        const v = parseFloat(slider.value);
        valElem.textContent = `${v > 0 ? '+' : ''}${v.toFixed(1)} dB`;
        this.updateSettingsFromUi(false);
      });
      slider.addEventListener('change', () => {
        this.updateSettingsFromUi(true);
      });
    };

    bindEq(this.eqB1Slider, this.eqB1Val);
    bindEq(this.eqB2Slider, this.eqB2Val);
    bindEq(this.eqB3Slider, this.eqB3Val);
    bindEq(this.eqB4Slider, this.eqB4Val);
    bindEq(this.eqB5Slider, this.eqB5Val);

    // Reset EQ Overrides
    this.resetEqBtn.addEventListener('click', () => {
      this.eqB1Slider.value = '0';
      this.eqB1Val.textContent = '0 dB';
      this.eqB2Slider.value = '0';
      this.eqB2Val.textContent = '0 dB';
      this.eqB3Slider.value = '0';
      this.eqB3Val.textContent = '0 dB';
      this.eqB4Slider.value = '0';
      this.eqB4Val.textContent = '0 dB';
      this.eqB5Slider.value = '0';
      this.eqB5Val.textContent = '0 dB';
      this.updateSettingsFromUi(true);
    });

    // Retry Error Button
    this.errorRetryBtn.addEventListener('click', () => {
      this.hideError();
      if (this.status?.activeTab?.id) {
        this.startCapture(this.status.activeTab.id);
      } else {
        this.fetchStatus();
      }
    });

    // Stop visualizer when window unloads
    window.addEventListener('beforeunload', () => {
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    });
  }

  private async fetchStatus(): Promise<void> {
    const msg: GetStatusMessage = { type: 'GET_STATUS' };
    try {
      const response = await chrome.runtime.sendMessage(msg);
      if (response) {
        this.updateUI(response as ExtensionStatus);
      }
    } catch (err) {
      console.warn('Could not communicate with background service worker:', err);
    }
  }

  private updateUI(status: ExtensionStatus): void {
    this.status = status;
    const { enabled, activeTab, settings, error } = status;

    // 1. Site / Active Tab indicator
    if (activeTab) {
      this.heroTrackTitle.textContent = activeTab.title || 'YouTube Tab';
      this.heroTrackTitle.title = activeTab.title || '';

      if (activeTab.isSupported) {
        this.siteBadge.className = 'header-status-pill supported';
        this.siteName.textContent = activeTab.siteName === 'youtubemusic' ? 'YouTube Music' : 'YouTube';
        this.masterToggleBtn.disabled = false;
      } else {
        this.siteBadge.className = 'header-status-pill unsupported';
        this.siteName.textContent = 'Unsupported';
        this.heroTrackTitle.textContent = 'Open YouTube or YouTube Music';
        this.masterToggleBtn.disabled = true;
      }
    } else {
      this.heroTrackTitle.textContent = 'No active YouTube tab found';
      this.siteBadge.className = 'header-status-pill unsupported';
      this.siteName.textContent = 'Inactive';
      this.masterToggleBtn.disabled = true;
    }

    // 2. Master Power Button State
    if (enabled) {
      this.masterToggleBtn.classList.add('active');
      this.masterToggleBtn.setAttribute('aria-pressed', 'true');
      this.masterStatusText.textContent = 'Enhancing Audio';
      this.masterStatusText.classList.add('active');
      this.startVisualizerLoop();
    } else {
      this.masterToggleBtn.classList.remove('active');
      this.masterToggleBtn.setAttribute('aria-pressed', 'false');
      this.masterStatusText.textContent = 'Enhancement Inactive';
      this.masterStatusText.classList.remove('active');
      this.stopVisualizerLoop();
      this.clearVisualizer();
    }

    // 3. A/B Bypass Button
    if (settings.bypassCompare) {
      this.abCompareBtn.classList.add('active');
      this.abCompareBtn.setAttribute('aria-pressed', 'true');
      this.abCompareBtn.title = 'Bypass Active: Listening to dry Original audio';
    } else {
      this.abCompareBtn.classList.remove('active');
      this.abCompareBtn.setAttribute('aria-pressed', 'false');
      this.abCompareBtn.title = 'Instant A/B Bypass Comparison';
    }

    // 4. Presets
    const currentPreset = getPreset(settings.selectedPreset);
    this.presetTagline.textContent = currentPreset.tagline;

    const presetButtons = this.presetsContainer.querySelectorAll<HTMLButtonElement>('.preset-btn');
    presetButtons.forEach((btn) => {
      const isSelected = btn.dataset.presetId === settings.selectedPreset;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-checked', String(isSelected));
    });

    // 5. Intensity
    this.intensitySlider.value = String(settings.intensity);
    this.intensityValueBadge.textContent = `${settings.intensity}%`;
    this.intensitySlider.setAttribute('aria-valuenow', String(settings.intensity));

    // 6. Trims
    this.trimBassSlider.value = String(settings.trims.bass);
    this.trimBassVal.textContent = `${settings.trims.bass > 0 ? '+' : ''}${settings.trims.bass.toFixed(1)} dB`;

    this.trimClaritySlider.value = String(settings.trims.clarity);
    this.trimClarityVal.textContent = `${settings.trims.clarity > 0 ? '+' : ''}${settings.trims.clarity.toFixed(1)} dB`;

    this.trimWidthSlider.value = String(settings.trims.width);
    this.trimWidthVal.textContent = `${settings.trims.width > 0 ? '+' : ''}${settings.trims.width.toFixed(1)} dB`;

    // 7. Advanced EQ
    this.eqB1Slider.value = String(settings.advancedEQ.band1Gain);
    this.eqB1Val.textContent = `${settings.advancedEQ.band1Gain > 0 ? '+' : ''}${settings.advancedEQ.band1Gain.toFixed(1)} dB`;

    this.eqB2Slider.value = String(settings.advancedEQ.band2Gain);
    this.eqB2Val.textContent = `${settings.advancedEQ.band2Gain > 0 ? '+' : ''}${settings.advancedEQ.band2Gain.toFixed(1)} dB`;

    this.eqB3Slider.value = String(settings.advancedEQ.band3Gain);
    this.eqB3Val.textContent = `${settings.advancedEQ.band3Gain > 0 ? '+' : ''}${settings.advancedEQ.band3Gain.toFixed(1)} dB`;

    this.eqB4Slider.value = String(settings.advancedEQ.band4Gain);
    this.eqB4Val.textContent = `${settings.advancedEQ.band4Gain > 0 ? '+' : ''}${settings.advancedEQ.band4Gain.toFixed(1)} dB`;

    this.eqB5Slider.value = String(settings.advancedEQ.band5Gain);
    this.eqB5Val.textContent = `${settings.advancedEQ.band5Gain > 0 ? '+' : ''}${settings.advancedEQ.band5Gain.toFixed(1)} dB`;

    this.compStatusText.textContent = `${currentPreset.compressor.ratio}:1 (${currentPreset.compressor.threshold} dB)`;

    // 8. Errors
    if (error) {
      this.showError(error);
    } else {
      this.hideError();
    }
  }

  private async toggleMasterEnhancement(): Promise<void> {
    if (!this.status?.activeTab?.id) return;

    if (this.status.enabled) {
      const msg: StopCaptureMessage = { type: 'STOP_CAPTURE', tabId: this.status.activeTab.id };
      const res = await chrome.runtime.sendMessage(msg);
      if (res) this.updateUI(res as ExtensionStatus);
    } else {
      await this.startCapture(this.status.activeTab.id);
    }
  }

  private async startCapture(tabId: number): Promise<void> {
    const msg: StartCaptureMessage = { type: 'START_CAPTURE', tabId };
    try {
      const res = await chrome.runtime.sendMessage(msg);
      if (res) this.updateUI(res as ExtensionStatus);
    } catch (err) {
      this.showError({
        code: 'CAPTURE_FAILED',
        message: 'Could not connect to extension audio service.',
        recoverable: true,
        details: String(err)
      });
    }
  }

  private toggleAbBypass(): void {
    if (!this.status) return;
    this.status.settings.bypassCompare = !this.status.settings.bypassCompare;
    this.updateSettingsFromUi(true);
  }

  private selectPreset(presetId: PresetId): void {
    if (!this.status) return;
    this.status.settings.selectedPreset = presetId;
    this.updateSettingsFromUi(true);
  }

  private updateSettingsFromUi(immediate: boolean): void {
    if (!this.status) return;

    const updatedSettings: StoredSettings = {
      schemaVersion: 1,
      selectedPreset: this.status.settings.selectedPreset,
      intensity: parseInt(this.intensitySlider.value, 10),
      trims: {
        bass: parseFloat(this.trimBassSlider.value),
        clarity: parseFloat(this.trimClaritySlider.value),
        width: parseFloat(this.trimWidthSlider.value)
      },
      advancedEQ: {
        band1Gain: parseFloat(this.eqB1Slider.value),
        band2Gain: parseFloat(this.eqB2Slider.value),
        band3Gain: parseFloat(this.eqB3Slider.value),
        band4Gain: parseFloat(this.eqB4Slider.value),
        band5Gain: parseFloat(this.eqB5Slider.value)
      },
      bypassCompare: this.status.settings.bypassCompare
    };

    this.status.settings = updatedSettings;
    this.updateUI(this.status);

    const msg: UpdateSettingsMessage = {
      type: 'UPDATE_SETTINGS',
      settings: updatedSettings,
      immediate
    };

    chrome.runtime.sendMessage(msg).catch(() => {});
  }

  private showError(err: ErrorState): void {
    this.errorBanner.classList.remove('hidden');
    this.errorTitle.textContent = err.code.replace(/_/g, ' ');
    this.errorMsg.textContent = err.message;
    this.errorRetryBtn.style.display = err.recoverable ? 'block' : 'none';
  }

  private hideError(): void {
    this.errorBanner.classList.add('hidden');
  }

  // Visualizer loop (only runs while popup is open and active)
  private startVisualizerLoop(): void {
    if (this.animFrameId !== null) return;

    const draw = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_AUDIO_LEVELS' });
        if (response && response.levels) {
          this.renderVisualizer(response.levels as AudioLevels);
        }
      } catch {
        // Tab capture might be suspended or closed
      }

      if (this.status?.enabled) {
        this.animFrameId = requestAnimationFrame(draw);
      }
    };

    this.animFrameId = requestAnimationFrame(draw);
  }

  private stopVisualizerLoop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private renderVisualizer(levels: AudioLevels): void {
    // 1. Update peak meter
    const peakPercent = Math.min(100, Math.round(levels.peak * 100));
    this.meterFill.style.width = `${peakPercent}%`;

    // 2. Render spectrum canvas bars
    if (!this.canvasCtx || !this.canvas) return;
    const ctx = this.canvasCtx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    const bins = levels.frequencyData;
    const count = bins.length || 32;
    const barWidth = Math.floor(width / count) - 1.5;

    for (let i = 0; i < count; i++) {
      const val = (bins[i] ?? 0) / 255;
      const barHeight = Math.max(2, val * (height - 4));
      const x = i * (barWidth + 1.5);
      const y = height - barHeight;

      // Color gradient from cyan to emerald
      const hue = 195 + (i / count) * 40; // 195 (sky blue) to 235
      ctx.fillStyle = `hsl(${hue}, 90%, 55%)`;

      // Rounded bar top
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
      ctx.fill();
    }
  }

  private clearVisualizer(): void {
    this.meterFill.style.width = '0%';
    if (this.canvasCtx && this.canvas) {
      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const popup = new PopupController();
  popup.init();
});
