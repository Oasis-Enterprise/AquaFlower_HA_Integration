class AquaFlowerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._rendered = false;
  }

  setConfig(config) {
    this._config = config;
    if (this._hass && !this._rendered) {
      this.render();
      this._rendered = true;
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this.render();
      this._rendered = true;
    }
  }

  configChanged(newConfig) {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  getAquaFlowerDevices() {
    if (!this._hass) return [];

    // Find all switch entities that end with _zone_1, _zone_2, etc.
    // and group them by device
    const zonePattern = /_zone_[1-6]$/;
    const deviceMap = new Map();

    Object.keys(this._hass.states)
      .filter(entityId => entityId.startsWith('switch.') && zonePattern.test(entityId))
      .forEach(entityId => {
        // Extract device prefix: switch.front_yard_zone_1 -> front_yard
        const devicePrefix = entityId.replace('switch.', '').replace(/_zone_[1-6]$/, '');

        if (!deviceMap.has(devicePrefix)) {
          const state = this._hass.states[entityId];
          // Get friendly name and remove "Zone X" suffix
          let friendlyName = state?.attributes?.friendly_name || devicePrefix;
          friendlyName = friendlyName.replace(/\s*[-_]?\s*[Zz]one\s*\d+$/i, '').trim();

          deviceMap.set(devicePrefix, {
            id: devicePrefix,
            entityId: entityId,
            friendlyName: friendlyName || devicePrefix,
          });
        }
      });

    return Array.from(deviceMap.values());
  }

  render() {
    if (!this._hass) return;

    const devices = this.getAquaFlowerDevices();
    const selectedDevice = this._config.device || '';
    const showSchedules = this._config.show_schedules !== false;

    this.shadowRoot.innerHTML = `
      <style>
        .card-config {
          padding: 16px;
        }
        .config-row {
          margin-bottom: 20px;
        }
        .config-row label {
          display: block;
          font-weight: 500;
          color: var(--primary-text-color);
          margin-bottom: 8px;
        }
        .config-row .description {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-bottom: 8px;
        }
        select {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 8px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #000);
          font-size: 14px;
          cursor: pointer;
        }
        select:focus {
          outline: none;
          border-color: var(--primary-color, #03a9f4);
        }
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
        }
        .toggle-row label {
          margin-bottom: 0;
        }
        .toggle-switch {
          position: relative;
          width: 48px;
          height: 24px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--disabled-color, #ccc);
          transition: 0.3s;
          border-radius: 24px;
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }
        .toggle-switch input:checked + .toggle-slider {
          background-color: var(--primary-color, #03a9f4);
        }
        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }
        .no-devices {
          padding: 20px;
          text-align: center;
          color: var(--secondary-text-color);
          background: var(--secondary-background-color, #f5f5f5);
          border-radius: 8px;
        }
      </style>
      <div class="card-config">
        ${devices.length === 0 ? `
          <div class="no-devices">
            No AquaFlower devices found.<br>
            Make sure your AquaFlower integration is set up correctly.
          </div>
        ` : `
          <div class="config-row">
            <label for="device-select">AquaFlower Device</label>
            <div class="description">Select which AquaFlower device to display on this card</div>
            <select id="device-select">
              <option value="" ${!selectedDevice ? 'selected' : ''}>-- Select a device --</option>
              ${devices.map(device => `
                <option value="${device.id}" ${selectedDevice === device.id ? 'selected' : ''}>
                  ${device.friendlyName}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="config-row">
            <div class="toggle-row">
              <div>
                <label>Show Schedules</label>
                <div class="description">Display irrigation schedules section</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="show-schedules" ${showSchedules ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        `}
      </div>
    `;

    // Add event listeners
    const deviceSelect = this.shadowRoot.getElementById('device-select');
    if (deviceSelect) {
      deviceSelect.addEventListener('change', (e) => this._deviceChanged(e));
    }

    const schedulesToggle = this.shadowRoot.getElementById('show-schedules');
    if (schedulesToggle) {
      schedulesToggle.addEventListener('change', (e) => this._schedulesToggled(e));
    }
  }

  _deviceChanged(e) {
    const device = e.target.value;
    if (device) {
      // Set entity to zone_1 of selected device
      const entity = `switch.${device}_zone_1`;
      this._config = {
        ...this._config,
        device: device,
        entity: entity
      };
    } else {
      this._config = {
        ...this._config,
        device: '',
        entity: ''
      };
    }
    this.configChanged(this._config);
  }

  _schedulesToggled(e) {
    this._config = {
      ...this._config,
      show_schedules: e.target.checked
    };
    this.configChanged(this._config);
  }
}

customElements.define('aquaflower-card-editor', AquaFlowerCardEditor);
