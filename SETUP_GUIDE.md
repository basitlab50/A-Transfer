# A Transfer (Africa Transfer) - Initial Setup Guide

Welcome to the **A Transfer** project! To build and run this cross-platform (Android/iOS) fintech application, follow the steps below to prepare your computer.

## 1. Install Essential Tools
Before you can run the code, you must install these three core components:

*   **Node.js (LTS Version)**: 
    *   Download from: [https://nodejs.org/](https://nodejs.org/)
    *   *Why*: This provides `npm` and `npx`, which run the development server.
*   **Git**: 
    *   Download from: [https://git-scm.com/](https://git-scm.com/)
    *   *Why*: Required for managing the code and dependencies.
*   **Expo Go (On your phone)**: 
    *   Download from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) or [iOS App Store](https://apps.apple.com/app/expo-go/id982107779).
    *   *Why*: This allows you to test the app on your physical device instantly.

---

## 2. Setting Up the Mobile Environment
Depending on your computer, follow these steps to see the app on your screen:

### For Android (Windows/Mac/Linux)
1.  Download and install **[Android Studio](https://developer.android.com/studio)**.
2.  Open Android Studio, go to `Tools` -> `SDK Manager`.
3.  In the `SDK Platforms` tab, ensure **Android 13 (Tiramisu)** or later is installed.
4.  In the `SDK Tools` tab, ensure **Android SDK Build-Tools** and **Android Emulator** are checked.
5.  Set up a "Virtual Device" (Emulator) via the `Device Manager`.

### For iOS (Mac ONLY)
1.  Install **Xcode** from the Mac App Store.
2.  Open Xcode, go to `Settings` -> `Platforms` and download the latest iOS Simulator.

---

## 3. Launching the App
Once you have installed Node.js, follow these steps in your terminal:

1.  **Open the project folder** in your terminal or VS Code.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  **Open the app**:
    *   Scan the **QR Code** with your phone (using the Expo Go app).
    *   Press `a` to open the Android Emulator.
    *   Press `i` to open the iOS Simulator (Mac only).

---

## 4. Next Steps
I have already initialized the core project structure for you (see the files in this folder). Once you run `npm run dev`, you will see a premium "A Transfer" landing page.

*   **KYC**: We will be using **SmileID** for identity verification.
*   **Database**: **Supabase** will handle your wallets and escrow system.
