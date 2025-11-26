# AquaFlower Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub Release](https://img.shields.io/github/release/theaquaflower/AquaFlower_HA_Integration.svg)](https://github.com/theaquaflower/AquaFlower_HA_Integration/releases)

Transform your AquaFlower smart irrigation system into a seamless Home Assistant experience with our **completely redesigned integration**. Control your 6-zone drip irrigation system with an elegant, modern UI that showcases the power of smart home automation.

> **Important:** You must set up and pair your AquaFlower device to the **AquaFlower Cloud** using the **AquaFlower App** before configuring this integration in Home Assistant.

## ✨ What's New

### 🎨 Stunning Custom UI Card
Experience irrigation control like never before with our beautiful custom Lovelace card:
- **Modern Design**: Sleek, responsive interface that works flawlessly on mobile and desktop
- **Visual Feedback**: Color-coded zone status with smooth animations
- **One-Tap Control**: Toggle zones instantly with visual confirmation
- **Runtime Tracking**: See daily watering time for each zone at a glance
- **Smart Schedules**: View backend-managed schedules in an expandable section
- **Theme Integration**: Automatically adapts to your Home Assistant theme

### 🏠 Proper Device Integration
- **Device Registry**: Each AquaFlower controller appears as a proper device
- **Organized Entities**: All 6 zones, sensors, and timers grouped under their parent device
- **Clean UI**: No more cluttered entity lists - everything is beautifully organized
- **Device Cards**: View all entities for a device in one place

### 🌊 Comprehensive Control
- **6 Zone Switches**: Individual control for each irrigation zone
- **Daily Runtime Sensors**: Track water usage per zone per day
- **Timer Controls**: Set automatic shutoff timers (0-120 minutes)
- **Schedule Visibility**: See all backend-managed schedules
- **Real-time Updates**: Instant status changes via webhooks

---

## Installation

### **Step 1: Install via HACS (Recommended)**
1. Go to **HACS > Integrations** in Home Assistant.
2. Click **"Explore & Download Repositories"**.
3. Search for **AquaFlower** and click **"Download"**.
4. Restart Home Assistant.

### **Step 2: Manual Installation (Use Only If You Skipped Step 1)**
1. Download the latest release from [GitHub Releases](https://github.com/theaquaflower/aquaflower-home-assistant).
2. Extract and copy the `aquaflower` folder into:/config/custom_components/
3. Restart Home Assistant.

---

## Configuration

1. **Go to Home Assistant > Integrations** and click **"Add Integration"**.
2. Search for **AquaFlower** and select it.
3. Enter your **AquaFlower account email and password** (the same credentials used in the AquaFlower mobile app).
4. Enter your **Home Assistant server IP address** (e.g., `192.168.X.X`).
5. Click **Submit** to complete the setup.

---

## Device Selection  

Once you've entered your credentials and Home Assistant server IP:  

1. **Select the devices** you want to import from the list that appears.  
2. Click **Submit** to create the corresponding entities in Home Assistant.  
3. Your selected AquaFlower devices will now be available for control and monitoring within Home Assistant.  

---

## 🎯 Quick Start: Adding the Custom Card

After installation, add the beautiful AquaFlower card to your dashboard:

1. Edit your dashboard
2. Click **Add Card**
3. Search for "**AquaFlower Card**"
4. Select your AquaFlower device
5. Save and enjoy!

**That's it!** The card automatically discovers all zones and displays:
- ✅ Zone status with color indicators
- ⏱️ Daily runtime for each zone
- 📅 Your backend-managed schedules
- 🎛️ One-tap zone control

---

## Features  

- 🌱 **6 Zone Control**: Individual switches for each irrigation zone with beautiful icons
- ⏳ **Smart Timers**: Set automatic shutoff timers (0-120 minutes per zone)
- 📊 **Runtime Tracking**: Monitor daily water usage per zone
- 🎨 **Custom UI Card**: Stunning interface with real-time visual feedback
- 🔄 **Real-time Sync**: Instant updates via webhooks between app and Home Assistant
- 🏠 **Device Integration**: Proper device registry with organized entity grouping
- 📅 **Schedule Visibility**: View backend-managed schedules in Home Assistant
- 🤖 **Automation Ready**: Full support for HA automations and scripts

---

## Troubleshooting  

### **1. Authentication Failed**  
- Ensure you’re using the **same email and password** as in the **AquaFlower mobile app**.  
- If you forgot your password, reset it through the app.  

### **2. Device Not Found**  
- Double-check that your AquaFlower device is **on and showing a green light**.  
- If the light is not green, hold the **reset button for 10 seconds**, then **re-pair the device through the AquaFlower App**.  
- Ensure that your Home Assistant **server IP** is entered correctly.  

### **3. Logs & Debugging**  
If you're experiencing issues, check the logs:  
1. Go to **Settings > System > Logs**.  
2. Search for `"aquaflower"` errors.  
3. If needed, enable **debug logging** through the integration page.  

---

## Reporting Issues  

If you encounter any issues or need help, please report them using the **GitHub Issue Tracker**:  
➡️ [AquaFlower Home Assistant Integration Issues](https://github.com/theaquaflower/AquaFlower_HA_Integration/issues)  

### **When submitting an issue, please include:**  
- A clear description of the problem.  
- Steps to reproduce the issue.  
- Any relevant Home Assistant logs.  
- Your Home Assistant version and integration version.  

Your feedback helps improve the integration! 🚀
