/**
 * CSI COCHIN DIOCESE CHOIR FEST 2026 - GOOGLE APPS SCRIPT BACKEND
 * 
 * Instructions:
 * 1. Open Google Sheets (create a new sheet or use an existing one).
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any existing code in Code.gs and paste this entire script.
 * 4. Replace DRIVE_FOLDER_ID below with your Google Drive Folder ID (or leave blank to create automatically).
 * 5. Click "Deploy" -> "New deployment".
 * 6. Select type: "Web app".
 * 7. Set:
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (Crucial for receiving parish submissions)
 * 8. Copy the Web App URL and paste it into the Registration Portal settings.
 */

// CONFIGURATION:
// 1. SPREADSHEET_ID: (Optional) If you have a specific Google Sheet, paste its ID here.
//    If left blank, it will use the active sheet or search for "CSI_Cochin_Choir_Fest_2026_Registrations" in your Drive.
var SPREADSHEET_ID = "";

// 2. DRIVE_FOLDER_ID: (Optional) If you have a specific Drive Folder ID, paste it here.
//    If left blank, a folder named "CSI_Cochin_Choir_Fest_2026_Uploads" will be used.
var DRIVE_FOLDER_ID = "";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000); // 30 second lock to prevent race conditions

  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // 1. Get or Create Google Sheets and Sheets Tabs
    var ss = null;
    if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!ss) {
      var files = DriveApp.getFilesByName("CSI_Cochin_Choir_Fest_2026_Registrations");
      if (files.hasNext()) {
        ss = SpreadsheetApp.open(files.next());
      } else {
        ss = SpreadsheetApp.create("CSI_Cochin_Choir_Fest_2026_Registrations");
      }
    }

    var mainSheet = getOrCreateSheet(ss, "Parish Registrations", [
      "Timestamp",
      "Church / Parish Name",
      "District / Area",
      "Location / Place",
      "Vicar / Presbyter Name",
      "Vicar Contact",
      "Parish Email",
      "Choir Master Name",
      "Choir Master Phone",
      "Choir Master Email",
      "Choir Master Yrs Service",
      "Choir Master Voice/Role",
      "Choir Secretary Name",
      "Choir Secretary Phone",
      "Choir Secretary Email",
      "Choir Secretary Voice",
      "Total Choristers Count",
      "Senior Choristers (>40 Yrs) Count",
      "Church History / Overview",
      "Choir Milestones & Achievements",
      "Church Photo Drive Link",
      "Choir Photo Drive Link",
      "Souvenir Doc Drive Link",
      "Submission ID"
    ]);

    var membersSheet = getOrCreateSheet(ss, "Choristers Directory", [
      "Timestamp",
      "Parish Name",
      "District",
      "Member Index",
      "Chorister Name",
      "Voice Part",
      "Years in Choir",
      "Contact Number"
    ]);

    var seniorSheet = getOrCreateSheet(ss, "Senior Honors (>40 Yrs)", [
      "Timestamp",
      "Parish Name",
      "District",
      "Senior Chorister Name",
      "Continuous Years in Choir",
      "Contact Phone",
      "Diocesan / NKD Service History"
    ]);

    // 2. Setup Google Drive Folder for Church Files
    var targetFolder = getTargetDriveFolder(data.parish.churchName);

    // 3. Upload Attached Files to Google Drive
    var churchPhotoUrls = [];
    var choirPhotoUrl = "";
    var historyDocUrl = "";

    if (data.files) {
      // Handle multiple church photos (up to 10)
      if (data.files.churchPhotos && data.files.churchPhotos.length > 0) {
        for (var p = 0; p < data.files.churchPhotos.length; p++) {
          var singlePhoto = data.files.churchPhotos[p];
          if (singlePhoto && singlePhoto.dataUrl) {
            var url = saveBase64ToDrive(targetFolder, singlePhoto, "Church_Photo_" + (p + 1) + "_" + sanitizeFileName(data.parish.churchName));
            churchPhotoUrls.push(url);
          }
        }
      } else if (data.files.churchPhoto && data.files.churchPhoto.dataUrl) {
        var url = saveBase64ToDrive(targetFolder, data.files.churchPhoto, "Church_Photo_" + sanitizeFileName(data.parish.churchName));
        churchPhotoUrls.push(url);
      }

      if (data.files.choirPhoto && data.files.choirPhoto.dataUrl) {
        choirPhotoUrl = saveBase64ToDrive(targetFolder, data.files.choirPhoto, "Choir_Group_" + sanitizeFileName(data.parish.churchName));
      }
      if (data.files.historyDoc && data.files.historyDoc.dataUrl) {
        historyDocUrl = saveBase64ToDrive(targetFolder, data.files.historyDoc, "Souvenir_Doc_" + sanitizeFileName(data.parish.churchName));
      }
    }

    var churchPhotoUrlString = churchPhotoUrls.join("\n");

    var submissionId = "CSI-CF26-" + new Date().getTime().toString().substr(-6);
    var timestamp = new Date();

    // 4. Append to Main Parish Registrations Sheet
    mainSheet.appendRow([
      timestamp,
      data.parish.churchName || "",
      data.parish.districtArea || "",
      data.parish.churchLocation || "",
      data.parish.vicarName || "",
      data.parish.vicarContact || "",
      data.parish.parishEmail || "",
      data.leadership.choirMaster.name || "",
      data.leadership.choirMaster.phone || "",
      data.leadership.choirMaster.email || "",
      data.leadership.choirMaster.years || "",
      data.leadership.choirMaster.voice || "",
      data.leadership.choirSecretary.name || "",
      data.leadership.choirSecretary.phone || "",
      data.leadership.choirSecretary.email || "",
      data.leadership.choirSecretary.voice || "",
      data.choristersCount || (data.choristers ? data.choristers.length : 0),
      data.seniorMembersCount || (data.seniorMembers ? data.seniorMembers.length : 0),
      data.heritage.history || "",
      data.heritage.milestones || "",
      churchPhotoUrlString,
      choirPhotoUrl,
      historyDocUrl,
      submissionId
    ]);

    // 5. Append individual Choristers to Choristers Directory Sheet
    if (data.choristers && data.choristers.length > 0) {
      for (var i = 0; i < data.choristers.length; i++) {
        var m = data.choristers[i];
        membersSheet.appendRow([
          timestamp,
          data.parish.churchName,
          data.parish.districtArea,
          i + 1,
          m.name || "",
          m.voice || "",
          m.years || "",
          m.contact || ""
        ]);
      }
    }

    // 6. Append Senior Choristers (>40 Years) to Senior Honors Sheet
    if (data.seniorMembers && data.seniorMembers.length > 0) {
      for (var j = 0; j < data.seniorMembers.length; j++) {
        var sm = data.seniorMembers[j];
        seniorSheet.appendRow([
          timestamp,
          data.parish.churchName,
          data.parish.districtArea,
          sm.name || "",
          sm.years || "",
          sm.phone || "",
          sm.history || ""
        ]);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Registration successfully recorded for " + data.parish.churchName,
        submissionId: submissionId,
        driveFolderUrl: targetFolder.getUrl()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      service: "CSI Cochin Diocese Choir Fest 2026 API",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: Get or Create Sheet Tab with Headers and Styling
function getOrCreateSheet(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#8c2424");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Helper: Setup Church specific Drive Folder inside Root Diocesan Folder
function getTargetDriveFolder(churchName) {
  var rootFolder;
  if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID.trim() !== "") {
    rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } else {
    var folders = DriveApp.getFoldersByName("CSI_Cochin_Choir_Fest_2026_Uploads");
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder("CSI_Cochin_Choir_Fest_2026_Uploads");
    }
  }

  // Create or retrieve subfolder for this specific church
  var folderName = sanitizeFileName(churchName || "Parish_Submissions");
  var churchFolders = rootFolder.getFoldersByName(folderName);
  if (churchFolders.hasNext()) {
    return churchFolders.next();
  } else {
    return rootFolder.createFolder(folderName);
  }
}

// Helper: Save Base64 file string to Drive
function saveBase64ToDrive(folder, fileObj, filePrefix) {
  try {
    var dataUrl = fileObj.dataUrl;
    var base64Content = dataUrl.split(",")[1];
    var mimeType = fileObj.type || "application/octet-stream";
    var ext = getExtensionFromMime(mimeType, fileObj.name);

    var decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Content), mimeType, filePrefix + "_" + new Date().getTime() + "." + ext);
    var file = folder.createFile(decodedBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    Logger.log("Error saving file to Drive: " + err);
    return "Error uploading: " + err.toString();
  }
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9_\-\s]/g, "").replace(/\s+/g, "_");
}

function getExtensionFromMime(mimeType, originalName) {
  if (originalName && originalName.lastIndexOf(".") !== -1) {
    return originalName.split(".").pop();
  }
  if (mimeType.indexOf("image/jpeg") !== -1) return "jpg";
  if (mimeType.indexOf("image/png") !== -1) return "png";
  if (mimeType.indexOf("application/pdf") !== -1) return "pdf";
  if (mimeType.indexOf("word") !== -1) return "docx";
  return "dat";
}
