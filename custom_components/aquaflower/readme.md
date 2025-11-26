# AquaFlower Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub Release](https://img.shields.io/github/release/theaquaflower/AquaFlower_HA_Integration.svg)](https://github.com/theaquaflower/AquaFlower_HA_Integration/releases)

A beautiful and powerful Home Assistant integration for AquaFlower smart irrigation systems. Control your 6-zone drip irrigation system with an elegant UI and comprehensive automation capabilities.

## Features

### 🎨 Beautiful Custom UI Card
- Modern, responsive design that works on desktop and mobile
- Real-time zone status indicators with color-coded states
- Daily runtime tracking for each zone
- Expandable schedules view showing backend-managed schedules
- Smooth animations and transitions
- Automatic theme integration

### 🌊 Complete Device Support
- Full device registry integration
- Each AquaFlower controller appears as a single device
- All entities grouped under their parent device
- 6 irrigation zone switches (Zone 1-6)
- 6 daily on-time sensors (per zone)
- 6 timer number entities (per zone)
- Schedule sensors showing backend-managed schedules

### 🔄 Real-time Updates
- Webhook-based status updates
- Instant zone state changes
- Live daily runtime tracking
- Backend schedule synchronization

### 🤖 Home Assistant Integration
- Full automation support
- Service calls for all zone operations
- Device triggers and conditions
- State-based automations
- Timer controls for timed watering

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click on "Integrations"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/theaquaflower/AquaFlower_HA_Integration`
6. Select category "Integration"
7. Click "Add"
8. Find "AquaFlower" in the integration list
9. Click "Download"
10. Restart Home Assistant

### Manual Installation

1. Download the latest release from GitHub
2. Copy the `custom_components/aquaflower` folder to your Home Assistant's `custom_components` directory
3. Restart Home Assistant

## Configuration

### Initial Setup

1. Go to **Settings** → **Devices & Services**
2. Click **Add Integration**
3. Search for "AquaFlower"
4. Enter your AquaFlower account credentials:
   - **Email Address**: Your AquaFlower app login email
   - **Password**: Your AquaFlower app password
   - **Home Assistant IP**: Your HA instance IP address (for webhooks)
5. Select which devices to add
6. Complete the setup

The integration will automatically:
- Discover all your AquaFlower devices
- Create 6 zone switches for each device
- Set up daily on-time sensors for each zone
- Configure timer controls for each zone
- Register webhooks for real-time updates
- Create device entries in your device registry

## Using the Custom Card

The AquaFlower custom card provides a stunning interface for controlling your irrigation system.

### Adding the Card

1. Go to your dashboard
2. Click **Edit Dashboard**
3. Click **Add Card**
4. Search for "AquaFlower Card"
5. Select your AquaFlower device from the dropdown
6. Save

### Card Configuration (YAML)

```yaml
type: custom:aquaflower-card
entity: switch.your_device_zone_1  # Any zone switch from your device
```

The card will automatically:
- Detect all 6 zones for the selected device
- Display zone states with color indicators
- Show daily runtime for each zone
- List backend-managed schedules
- Enable one-tap zone control

### Card Features

- **Zone Cards**: Click any zone card to toggle that zone on/off
- **Status Indicators**: Green = running, Gray = off
- **Runtime Display**: Shows today's total runtime per zone in minutes
- **Schedules Section**: Expandable section showing active schedules from your AquaFlower app
- **Responsive Grid**: Automatically adjusts layout for mobile and desktop

## Entities

Each AquaFlower device creates the following entities:

### Switches (6 per device)
- `switch.{device_name}_zone_1` through `switch.{device_name}_zone_6`
- Control irrigation zones (on/off)
- Icons change based on state (water-pump / water-pump-off)

### Sensors (6 per device + schedules)
- `sensor.{device_name}_zone_1_daily_on_time` through `sensor.{device_name}_zone_6_daily_on_time`
- Shows daily runtime in minutes
- Resets at midnight
- Additional schedule sensors for backend-managed schedules

### Number Entities (6 per device)
- `number.{device_name}_zone_1_timer` through `number.{device_name}_zone_6_timer`
- Set timer duration (0-120 minutes)
- Starts zone for specified duration

## Automations

### Example: Schedule-based Watering

```yaml
automation:
  - alias: "Morning Watering - Zone 1"
    trigger:
      - platform: time
        at: "06:00:00"
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.backyard_zone_1
```

### Example: Timer-based Watering

```yaml
automation:
  - alias: "Water Zone 1 for 15 minutes"
    trigger:
      - platform: state
        entity_id: input_boolean.water_zone_1
        to: "on"
    action:
      - service: number.set_value
        target:
          entity_id: number.backyard_zone_1_timer
        data:
          value: 15
```

### Example: Runtime Tracking

```yaml
automation:
  - alias: "Notify if Zone 1 runs over 2 hours"
    trigger:
      - platform: numeric_state
        entity_id: sensor.backyard_zone_1_daily_on_time
        above: 120
    action:
      - service: notify.mobile_app
        data:
          message: "Zone 1 has been running for over 2 hours today"
```

## Backend Schedule Management

Schedules are managed through the AquaFlower mobile app and displayed as read-only sensors in Home Assistant. This allows you to:
- View active schedules in the custom card
- Monitor schedule status
- Use schedule states in automations
- Keep schedule management centralized in your AquaFlower app

Alternatively, you can create schedules directly in Home Assistant using automations for more flexibility and integration with other HA features.

## Troubleshooting

### Devices Not Appearing

1. Ensure you have devices registered in the AquaFlower app
2. Check your credentials are correct
3. Verify network connectivity to iot.theaquaflower.com
4. Check Home Assistant logs for errors

### Webhooks Not Working

1. Verify your Home Assistant IP address is correct
2. Check if your HA instance is accessible from the internet/AquaFlower backend
3. Ensure no firewall is blocking incoming webhook calls
4. Check the integration logs for webhook registration status

### Custom Card Not Loading

1. Clear your browser cache
2. Ensure the integration is properly installed
3. Check browser console for JavaScript errors
4. Verify the card files exist in `custom_components/aquaflower/www/`

### Zone States Not Updating

1. Check webhook configuration
2. Verify device is online in the AquaFlower app
3. Review Home Assistant logs for API errors
4. Test manual zone control through the card

## Support

- **Issues**: [GitHub Issues](https://github.com/theaquaflower/AquaFlower_HA_Integration/issues)
- **Documentation**: [GitHub Repository](https://github.com/theaquaflower/AquaFlower_HA_Integration)
- **Website**: [theaquaflower.com](https://theaquaflower.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Developed with ❤️ for the AquaFlower smart irrigation community.

---

**Note**: This integration requires an active AquaFlower account and at least one AquaFlower smart irrigation controller device.

