# CSI Cochin Diocese Choir Fest 2026 - Registration Web App

A web application built specifically for the **Church of South India (CSI) Cochin Diocese Choir Fest 2026**. This app collects comprehensive church, choir leadership, chorister directories, senior chorister honor roll (>40 years of continuous service), parish heritage write-ups, and media files, storing everything into **Google Sheets** and organized **Google Drive** folders.

---

## 🌟 Key Features

1. **Parish / Church Details**:
   - Church/Parish name, District / Area (Kottayam, Ernakulam, Thrissur, Palakkad, Malabar, High Range, etc.), Location.
   - Presbyter-in-Charge / Vicar details (Name, Contact, Parish Email).

2. **Choir Leadership Section**:
   - **Choir Master / Director**: Full Name, Mobile / WhatsApp, Email, Years of Service, Voice part/role.
   - **Choir Secretary**: Full Name, Mobile / WhatsApp, Email, Residence, Voice part.

3. **Dynamic Choristers Directory**:
   - **Total Member Count Controller**: Specify the number of choristers (e.g. 25), click **"Generate Slots"**, and the form creates exact input slots for each chorister.
   - Collects Chorister Name, Voice Part (Soprano, Alto, Tenor, Bass, Instrumentalist), Years in choir, and WhatsApp number.
   - Live Voice Part distribution counters (Soprano, Alto, Tenor, Bass totals).
   - Add/Remove individual members dynamically without losing previously typed data.

4. **Senior Choir Members Felicitation (>40 Years Service)**:
   - Special diocesan recognition section for choir veterans with **40+ continuous years of service** in CSI Cochin Diocese or former North Kerala Diocese (NKD).
   - Collects Name, exact years of service (validated $\ge 40$), contact, and choir history across parishes.

5. **Parish Photos, History & Milestones**:
   - High-resolution **Church Exterior/Interior Photo** upload (with instant image preview).
   - **Choir Group Photo** upload (in robes/uniform).
   - **Parish & Choir History / Overview** writeup.
   - **Key Milestones & Musical Achievements** (souvenirs, albums, awards).
   - Optional PDF/DOCX writeup upload.
   - Diocesan verification declaration checkbox.

6. **Automated Google Sheets & Google Drive Integration**:
   - **3 Dedicated Sheet Tabs** auto-generated:
     1. `Parish Registrations`: High-level summary of every church and leadership with Google Drive file links.
     2. `Choristers Directory`: Granular row-by-row directory of every single choir singer.
     3. `Senior Honors (>40 Yrs)`: Filtered honor roll of veteran choristers for Diocesan award felicitations.
   - **Google Drive Auto-organization**: Creates a subfolder for each registered Parish (e.g. `Holy_Trinity_Cathedral`) and uploads the photos and documents directly with shareable links.

---

## 🚀 How to Set Up Google Sheets & Google Drive Backend (5 Minutes)

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name the sheet: `CSI Cochin Diocese Choir Fest 2026 Registrations`.

### Step 2: Add the Google Apps Script
1. In Google Sheets menu, click **Extensions** &rarr; **Apps Script**.
2. Delete any existing code in the editor (`Code.gs`).
3. Copy the entire contents of [`Code.gs`](./Code.gs) from this repository and paste it into the editor.
4. *(Optional)* If you want all photos saved to a specific Google Drive Folder, paste your Drive folder ID in `DRIVE_FOLDER_ID = "YOUR_FOLDER_ID"`. If left blank, it automatically creates a root folder named `CSI_Cochin_Choir_Fest_2026_Uploads`.
5. Click the **Save** icon (diskette).

### Step 3: Deploy as Web App
1. Click the blue **Deploy** button (top right) &rarr; **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the fields:
   - **Description**: `CSI Choir Fest 2026 Webhook`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: Allows the website form to submit data without login hurdles)*.
4. Click **Deploy**.
5. Grant necessary permissions (Click *Advanced* &rarr; *Go to CSI Cochin Choir Fest Script (unsafe)* &rarr; *Allow*).
6. Copy the **Web App URL** (it looks like: `https://script.google.com/macros/s/AKfycbx.../exec`).

### Step 4: Connect the Web App
1. Open `index.html` in your browser.
2. Click the **"Backend Webhook: Ready"** pill at the top hero section.
3. Paste your copied Google Apps Script Web App URL into the modal and click **Save Endpoint**.
4. The system is now live and will automatically save submissions to your Google Sheet and Google Drive!

---

## 💻 Running the App Locally

Simply open `index.html` in any web browser, or serve it with any local static server:

```powershell
# Using Python
python -m http.server 8080

# Or using Node / npx
npx serve .
```

Then visit `http://localhost:8080`.

---

## 📁 Project Structure

```text
├── index.html     # Responsive Multi-Step Web Application UI with TailwindCSS & Lucide icons
├── app.js         # Client-side validation, dynamic member generators, Base64 file converter & API dispatcher
├── Code.gs        # Complete Google Apps Script backend for Google Sheets & Google Drive
└── README.md      # Documentation and step-by-step setup guide
```

---

## 🛡️ Privacy and Data Security
- Files are converted safely to Base64 in client memory and written securely to Google Drive using Google's official DriveApp API.
- All Google Sheet rows are timestamped and tagged with a unique Diocesan submission tracking ID (e.g. `CSI-CF26-XXXXXX`).
