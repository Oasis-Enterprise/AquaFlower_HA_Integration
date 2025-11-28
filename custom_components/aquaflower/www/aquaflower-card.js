class AquaFlowerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._zones = [];
  }

  setConfig(config) {
    if (!config.device && !config.entity) {
      throw new Error('You need to select an AquaFlower device');
    }
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateZones();
    this.render();
  }

  updateZones() {
    if (!this._hass || !this._config) return;

    // Get device prefix from config (or extract from entity for backwards compatibility)
    const devicePrefix = this._config.device || this.getDevicePrefixFromEntity(this._config.entity);
    if (!devicePrefix) return;

    this._zones = [];
    for (let i = 1; i <= 6; i++) {
      // Find switch entity for this zone
      const switchEntity = this.findZoneEntity(devicePrefix, i, 'switch');
      // Find sensor entity for daily on time
      const sensorEntity = this.findOnTimeSensor(devicePrefix, i);

      const switchState = switchEntity ? this._hass.states[switchEntity] : null;
      const sensorState = sensorEntity ? this._hass.states[sensorEntity] : null;

      this._zones.push({
        number: i,
        switchEntity: switchEntity,
        sensorEntity: sensorEntity,
        state: switchState ? switchState.state : 'unavailable',
        onTime: sensorState ? sensorState.state : '0',
      });
    }
  }

  getDevicePrefixFromEntity(entityId) {
    if (!entityId) return null;
    // Extract device prefix from entity like "switch.front_yard_zone_1" -> "front_yard"
    const match = entityId.match(/^switch\.(.+)_zone_\d+$/);
    return match ? match[1] : null;
  }

  findZoneEntity(devicePrefix, zoneNumber, domain) {
    // Try exact match first: switch.front_yard_zone_1
    const exactMatch = `${domain}.${devicePrefix}_zone_${zoneNumber}`;
    if (this._hass.states[exactMatch]) {
      return exactMatch;
    }
    // Fallback: search for entity containing device prefix and zone number
    const pattern = new RegExp(`^${domain}\\..*${devicePrefix}.*zone.*${zoneNumber}$`, 'i');
    const found = Object.keys(this._hass.states).find(id => pattern.test(id));
    return found || null;
  }

  findOnTimeSensor(devicePrefix, zoneNumber) {
    // Look for daily on time sensor: sensor.front_yard_zone_1_daily_on_time
    const patterns = [
      `sensor.${devicePrefix}_zone_${zoneNumber}_daily_on_time`,
      `sensor.${devicePrefix}_zone_${zoneNumber}_on_time`,
    ];

    for (const pattern of patterns) {
      if (this._hass.states[pattern]) {
        return pattern;
      }
    }

    // Fallback: search for any matching sensor
    const regex = new RegExp(`^sensor\\..*${devicePrefix}.*zone.*${zoneNumber}.*on.?time`, 'i');
    const found = Object.keys(this._hass.states).find(id => regex.test(id));
    return found || null;
  }

  toggleZone(zoneNumber) {
    const zone = this._zones[zoneNumber - 1];
    if (!zone || !zone.switchEntity) return;

    const service = zone.state === 'on' ? 'turn_off' : 'turn_on';
    this._hass.callService('switch', service, {
      entity_id: zone.switchEntity,
    });
  }

  render() {
    if (!this._hass || !this._config) return;

    const deviceName = this.getDeviceName();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          padding: 16px;
          background: var(--card-background-color);
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--primary-color);
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-icon {
          width: 40px;
          height: 40px;
          color: var(--primary-color);
        }
        .device-name {
          font-size: 24px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin: 0;
        }
        .zones-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .zone-card {
          background: var(--card-background-color);
          border: 2px solid var(--divider-color);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .zone-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .zone-card.on {
          border-color: var(--success-color, #4caf50);
          background: linear-gradient(135deg, var(--success-color, #4caf50) 0%, rgba(76, 175, 80, 0.1) 100%);
        }
        .zone-card.off {
          border-color: var(--divider-color);
          background: var(--card-background-color);
        }
        .zone-card.unavailable {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .zone-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .zone-number {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .zone-icon {
          width: 24px;
          height: 24px;
          transition: color 0.3s ease;
        }
        .zone-card.on .zone-icon {
          color: var(--success-color, #4caf50);
          animation: pulse 2s infinite;
        }
        .zone-card.off .zone-icon {
          color: var(--disabled-text-color);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .zone-status {
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .zone-card.on .zone-status {
          color: var(--success-color, #4caf50);
        }
        .zone-card.off .zone-status {
          color: var(--disabled-text-color);
        }
        .zone-time {
          font-size: 12px;
          color: var(--secondary-text-color);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .time-icon {
          width: 14px;
          height: 14px;
        }
        .schedules-section {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--divider-color);
        }
        .schedules-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s ease;
        }
        .schedules-header:hover {
          background: var(--secondary-background-color);
        }
        .schedules-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chevron {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }
        .chevron.expanded {
          transform: rotate(180deg);
        }
        .schedules-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .schedules-content.expanded {
          max-height: 500px;
        }
        .schedule-item {
          padding: 12px;
          margin: 8px 0;
          background: var(--secondary-background-color);
          border-radius: 8px;
          border-left: 4px solid var(--success-color, #4caf50);
        }
        .schedule-item.inactive {
          border-left-color: var(--disabled-color, #9e9e9e);
          opacity: 0.7;
        }
        .schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .schedule-name {
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .schedule-status {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
        }
        .schedule-status.active {
          background: var(--success-color, #4caf50);
          color: white;
        }
        .schedule-status.inactive {
          background: var(--disabled-color, #9e9e9e);
          color: white;
        }
        .schedule-details {
          font-size: 13px;
          color: var(--primary-text-color);
          margin-bottom: 4px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .schedule-time {
          font-weight: 500;
        }
        .schedule-rain {
          color: var(--info-color, #2196f3);
        }
        .schedule-meta {
          font-size: 12px;
          color: var(--secondary-text-color);
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .no-schedules {
          text-align: center;
          padding: 20px;
          color: var(--secondary-text-color);
          font-style: italic;
        }
        @media (max-width: 600px) {
          .zones-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
      <ha-card>
        <div class="header">
          <div class="header-title">
            <svg class="header-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,3.77L11.25,4.61C11.25,4.61 9.97,6.06 8.68,7.94C7.39,9.82 6,12.07 6,14.23A6,6 0 0,0 12,20.23A6,6 0 0,0 18,14.23C18,12.07 16.61,9.82 15.32,7.94C14.03,6.06 12.75,4.61 12.75,4.61L12,3.77M12,6.9C12.44,7.42 12.84,7.85 13.68,9.07C14.89,10.83 16,12.72 16,14.23C16,16.45 14.22,18.23 12,18.23C9.78,18.23 8,16.45 8,14.23C8,12.72 9.11,10.83 10.32,9.07C11.16,7.85 11.56,7.42 12,6.9Z" />
            </svg>
            <h2 class="device-name">${deviceName}</h2>
          </div>
        </div>
        
        <div class="zones-grid">
          ${this._zones.map(zone => this.renderZone(zone)).join('')}
        </div>

        ${this._config.show_schedules !== false ? this.renderSchedules() : ''}
      </ha-card>
    `;

    // Add event listeners
    this._zones.forEach((zone, index) => {
      const card = this.shadowRoot.querySelector(`.zone-card[data-zone="${index + 1}"]`);
      if (card && zone.state !== 'unavailable') {
        card.addEventListener('click', () => this.toggleZone(index + 1));
      }
    });

    const schedulesHeader = this.shadowRoot.querySelector('.schedules-header');
    if (schedulesHeader) {
      schedulesHeader.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSchedules();
      });
    }
  }

  renderZone(zone) {
    const stateClass = zone.state === 'on' ? 'on' : zone.state === 'off' ? 'off' : 'unavailable';
    const statusText = zone.state === 'on' ? 'Running' : zone.state === 'off' ? 'Off' : 'Unavailable';
    
    return `
      <div class="zone-card ${stateClass}" data-zone="${zone.number}">
        <div class="zone-header">
          <span class="zone-number">Zone ${zone.number}</span>
          <svg class="zone-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="${zone.state === 'on' ? 'M19,14C19,15.78 18.23,17.36 17,18.42V20A1,1 0 0,1 16,21H8A1,1 0 0,1 7,20V18.42C5.77,17.36 5,15.78 5,14C5,11.34 7.45,9.45 10.5,8.55V6A1.5,1.5 0 0,1 12,4.5A1.5,1.5 0 0,1 13.5,6V8.55C16.55,9.45 19,11.34 19,14M16,14C16,11.5 13.5,10 12,10C10.5,10 8,11.5 8,14C8,15.71 9.29,17 11,17V18H13V17C14.71,17 16,15.71 16,14Z' : 'M12,4.5A1.5,1.5 0 0,1 13.5,6V8.5A1.5,1.5 0 0,1 12,10A1.5,1.5 0 0,1 10.5,8.5V6A1.5,1.5 0 0,1 12,4.5M17,14C17,16.22 15.46,18.11 13.35,18.73L14.35,20.86L12.71,21.5L11.71,19.37C11.47,19.39 11.24,19.4 11,19.4V21.5H9V19.4C6.17,19.21 4,16.88 4,14C4,11.86 5.28,10.06 7.14,9.14L6.14,7L7.78,6.36L8.78,8.5C9.47,8.33 10.22,8.24 11,8.24V6.12H13V8.24C15.83,8.43 18,10.76 18,13.9L17,14Z'}" />
          </svg>
        </div>
        <div class="zone-status">${statusText}</div>
        <div class="zone-time">
          <svg class="time-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
          </svg>
          Today: ${zone.onTime} min
        </div>
      </div>
    `;
  }

  renderSchedules() {
    const scheduleEntities = this.getScheduleEntities();
    
    return `
      <div class="schedules-section">
        <div class="schedules-header">
          <div class="schedules-title">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
            </svg>
            Schedules (${scheduleEntities.length})
          </div>
          <svg class="chevron" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </div>
        <div class="schedules-content">
          ${scheduleEntities.length > 0 ? scheduleEntities.map(entity => this.renderScheduleItem(entity)).join('') : '<div class="no-schedules">No schedules configured. Manage schedules in the AquaFlower app.</div>'}
        </div>
      </div>
    `;
  }

  getScheduleEntities() {
    if (!this._hass || !this._config) return [];

    const devicePrefix = this._config.device || this.getDevicePrefixFromEntity(this._config.entity);
    if (!devicePrefix) return [];

    // Get the device_id from one of the zone switches to find related schedules
    const zone1Entity = this.findZoneEntity(devicePrefix, 1, 'switch');
    if (!zone1Entity) return [];

    const zone1State = this._hass.states[zone1Entity];
    if (!zone1State) return [];

    // Find all sensors that:
    // 1. Are NOT zone on-time sensors (don't match pattern *_zone_*_daily_on_time or *_zone_*_timer)
    // 2. Have schedule-like attributes (Is active, Start time, Duration, Zones, Days)
    return Object.keys(this._hass.states)
      .filter(entityId => {
        if (!entityId.startsWith('sensor.')) return false;

        // Exclude zone on-time and timer sensors
        if (/_zone_\d+_(daily_on_time|timer)$/.test(entityId)) return false;
        if (entityId.includes(devicePrefix) && entityId.includes('zone')) return false;

        const state = this._hass.states[entityId];
        if (!state || !state.attributes) return false;

        // Check if this sensor has schedule attributes
        const attrs = state.attributes;
        const hasScheduleAttrs = (
          attrs.hasOwnProperty('is_active') ||
          attrs.hasOwnProperty('IsActive') ||
          attrs.hasOwnProperty('start_time') ||
          attrs.hasOwnProperty('StartTime') ||
          attrs.hasOwnProperty('duration') ||
          attrs.hasOwnProperty('Duration')
        );

        if (!hasScheduleAttrs) return false;

        // Check if this schedule belongs to the same device by DeviceId attribute
        const scheduleDeviceId = attrs.DeviceId || attrs.device_id;
        const zone1DeviceId = zone1State.attributes?.device_id;

        // If we can match by device ID, use that
        if (scheduleDeviceId && zone1DeviceId) {
          return scheduleDeviceId === zone1DeviceId;
        }

        // Otherwise include any sensor with schedule attributes (user can filter later)
        return hasScheduleAttrs;
      })
      .map(entityId => this._hass.states[entityId]);
  }

  renderScheduleItem(entity) {
    const attrs = entity.attributes;

    // Handle both snake_case and PascalCase attribute names
    const zonesArr = attrs.zones || attrs.Zones;
    const daysArr = attrs.days || attrs.Days;
    const startTime = attrs.start_time || attrs.StartTime || attrs['Start time'];
    const duration = attrs.duration || attrs.Duration;
    const isActive = attrs.is_active ?? attrs.IsActive ?? attrs['Is active'];
    const rainMode = attrs.rain_mode ?? attrs.RainMode ?? attrs['Rain mode'];
    const name = attrs.Name || attrs.friendly_name || entity.state;

    // Format zones (convert to readable format)
    const zonesText = zonesArr ? `Zones: ${Array.isArray(zonesArr) ? zonesArr.join(', ') : zonesArr}` : '';

    // Format days (convert numbers to day names if needed)
    const dayNames = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let daysText = '';
    if (daysArr) {
      if (Array.isArray(daysArr)) {
        const daysList = daysArr.map(d => dayNames[d] || d).join(', ');
        daysText = daysArr.length === 7 ? 'Every day' : daysList;
      } else {
        daysText = daysArr;
      }
    }

    const timeText = startTime ? `${startTime}` : '';
    const durationText = duration ? `${duration} min` : '';
    const activeText = isActive ? 'Active' : 'Inactive';
    const activeClass = isActive ? 'active' : 'inactive';
    const rainIcon = rainMode ? ' · Rain skip on' : '';

    return `
      <div class="schedule-item ${activeClass}">
        <div class="schedule-header">
          <span class="schedule-name">${name}</span>
          <span class="schedule-status ${activeClass}">${activeText}</span>
        </div>
        <div class="schedule-details">
          ${timeText ? `<span class="schedule-time">${timeText}</span>` : ''}
          ${durationText ? `<span class="schedule-duration">${durationText}</span>` : ''}
          ${rainIcon ? `<span class="schedule-rain">${rainIcon}</span>` : ''}
        </div>
        <div class="schedule-meta">
          ${zonesText ? `<span>${zonesText}</span>` : ''}
          ${daysText ? `<span>${daysText}</span>` : ''}
        </div>
      </div>
    `;
  }

  toggleSchedules() {
    const content = this.shadowRoot.querySelector('.schedules-content');
    const chevron = this.shadowRoot.querySelector('.chevron');
    
    if (content.classList.contains('expanded')) {
      content.classList.remove('expanded');
      chevron.classList.remove('expanded');
    } else {
      content.classList.add('expanded');
      chevron.classList.add('expanded');
    }
  }

  getDeviceName() {
    if (!this._config || !this._hass) return 'AquaFlower';

    // Get device prefix from config
    const devicePrefix = this._config.device || this.getDevicePrefixFromEntity(this._config.entity);
    if (!devicePrefix) return 'AquaFlower';

    // Try to get friendly name from zone_1 entity
    const zone1Entity = this.findZoneEntity(devicePrefix, 1, 'switch');
    if (!zone1Entity) return devicePrefix.replace(/_/g, ' ');

    const state = this._hass.states[zone1Entity];
    if (!state) return devicePrefix.replace(/_/g, ' ');

    // Get friendly name and remove "Zone 1" suffix
    const friendlyName = state.attributes.friendly_name || devicePrefix;
    return friendlyName.replace(/\s*[-_]?\s*[Zz]one\s*\d+$/i, '').trim() || devicePrefix.replace(/_/g, ' ');
  }

  getCardSize() {
    return 5;
  }

  static getConfigElement() {
    return document.createElement("aquaflower-card-editor");
  }

  static getStubConfig() {
    return {
      device: "",
      show_schedules: true
    };
  }
}

customElements.define('aquaflower-card', AquaFlowerCard);

// ============================================
// Card Editor
// ============================================
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
      // Prevent click from bubbling up and closing the dialog
      deviceSelect.addEventListener('click', (e) => e.stopPropagation());
      deviceSelect.addEventListener('mousedown', (e) => e.stopPropagation());
      deviceSelect.addEventListener('pointerdown', (e) => e.stopPropagation());
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

// ============================================
// Register the card
// ============================================
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'aquaflower-card',
  name: 'AquaFlower Card',
  description: 'A beautiful card for controlling AquaFlower irrigation zones',
  preview: true,
  documentationURL: 'https://github.com/theaquaflower/AquaFlower_HA_Integration',
});

console.info(
  '%c AQUAFLOWER-CARD %c 2.0.2 ',
  'color: white; background: #4caf50; font-weight: 700;',
  'color: #4caf50; background: white; font-weight: 700;'
);

