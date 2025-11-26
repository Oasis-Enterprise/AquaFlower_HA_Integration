class AquaFlowerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  configChanged(newConfig) {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  render() {
    if (!this._hass) return;

    // Get all AquaFlower switch entities (zone switches)
    const aquaflowerEntities = Object.keys(this._hass.states)
      .filter(entityId => {
        const state = this._hass.states[entityId];
        return entityId.startsWith('switch.') && 
               entityId.includes('zone') &&
               state.attributes.unique_id && 
               state.attributes.unique_id.includes('aquaflower');
      });

    // Group by device - use the first zone of each device
    const deviceEntities = aquaflowerEntities.filter(entityId => entityId.includes('zone_1'));

    this.shadowRoot.innerHTML = `
      <style>
        .card-config {
          padding: 16px;
        }
        .option {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .option label {
          flex: 1;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        ha-select {
          width: 100%;
        }
        .description {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
        .info-box {
          background: var(--info-color, #2196f3);
          color: white;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
      </style>
      <div class="card-config">
        <div class="info-box">
          <strong>AquaFlower Card Configuration</strong><br>
          Select any zone switch from your AquaFlower device. The card will automatically detect and display all 6 zones.
        </div>
        
        <div class="option">
          <label for="entity-select">
            Device Entity
            <div class="description">Select any zone switch from your AquaFlower device</div>
          </label>
        </div>
        
        <ha-select
          id="entity-select"
          .label=${'Entity'}
          .value=${this._config.entity || ''}
          @selected=${this._valueChanged}
          @closed=${(e) => e.stopPropagation()}
        >
          ${deviceEntities.length === 0 ? 
            '<ha-list-item value="">No AquaFlower devices found</ha-list-item>' :
            deviceEntities.map(entityId => {
              const state = this._hass.states[entityId];
              const deviceName = this.getDeviceNameFromEntity(entityId);
              return `
                <ha-list-item value="${entityId}">
                  ${deviceName}
                </ha-list-item>
              `;
            }).join('')
          }
        </ha-select>
      </div>
    `;
  }

  getDeviceNameFromEntity(entityId) {
    const state = this._hass.states[entityId];
    if (!state) return entityId;
    
    const friendlyName = state.attributes.friendly_name || entityId;
    // Remove "Zone X" or "- Zone X" from the name
    return friendlyName.replace(/\s*-?\s*Zone\s+\d+.*$/i, '').trim() || entityId;
  }

  _valueChanged(e) {
    if (!this._config || !this._hass) return;
    
    const target = e.target;
    const newValue = target.value;
    
    if (this._config.entity !== newValue) {
      this._config = { ...this._config, entity: newValue };
      this.configChanged(this._config);
    }
  }
}

customElements.define('aquaflower-card-editor', AquaFlowerCardEditor);

