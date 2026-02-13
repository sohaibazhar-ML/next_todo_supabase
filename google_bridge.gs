/**
 * GOOGLE DRIVE BRIDGE FOR APP
 * This script runs as YOU, bypassing the Service Account storage limits.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to script.google.com and click 'New Project'.
 * 2. Name it 'DriveBridge'.
 * 3. Delete all existing code and paste this entire file.
 * 4. Click the '+' next to 'Services' on the left and add the 'Drive API'.
 * 5. Click 'Deploy' -> 'New Deployment'.
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click 'Deploy', authorize the permissions, and COPY THE WEB APP URL.
 */

const SECRET_KEY = "NextJsBridge_74281"; 

/**
 * 💡 PERMISSION FIX: If you see "You do not have permission to call UrlFetchApp",
 * click the "Run" button at the top for the 'triggerPermissions' function 
 * and follow the authorization prompts.
 */
function triggerPermissions() {
  UrlFetchApp.fetch("https://google.com");
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Security Check
    if (data.key !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var result;
    
    // Helper to handle Drive V2 vs V3 differences
    const driveService = {
      createFile: function(resource, blob) {
        if (typeof Drive.Files.insert === 'function') {
          // Drive API V2
          return Drive.Files.insert(resource, blob);
        } else {
          // Drive API V3
          // V3 uses 'name' instead of 'title' and 'create' instead of 'insert'
          resource.name = resource.title;
          delete resource.title;
          return Drive.Files.create(resource, blob);
        }
      },
      copyFile: function(fileId, resource) {
        if (typeof Drive.Files.copy === 'function') {
          // Both V2 and V3 have copy, but V3 might need 'name' mapping
          if (typeof Drive.Files.insert !== 'function') {
             resource.name = resource.title;
             delete resource.title;
          }
          return Drive.Files.copy(resource, fileId);
        }
      },
      addPermission: function(fileId, resource) {
        if (typeof Drive.Permissions.insert === 'function') {
          return Drive.Permissions.insert(resource, fileId);
        } else {
          return Drive.Permissions.create(resource, fileId);
        }
      },
      exportDoc: function(fileId, mimeType) {
        // Using UrlFetchApp directly is more stable for binary exports in Apps Script
        var url = "https://www.googleapis.com/drive/v3/files/" + fileId + "/export?mimeType=" + encodeURIComponent(mimeType);
        var response = UrlFetchApp.fetch(url, {
          method: "get",
          headers: {
            "Authorization": "Bearer " + ScriptApp.getOAuthToken()
          },
          muteHttpExceptions: true
        });
        
        if (response.getResponseCode() !== 200) {
          throw new Error("Export failed (" + response.getResponseCode() + "): " + response.getContentText());
        }
        
        return response.getBlob();
      }
    };

    // ACTION: UPLOAD AND CONVERT
    if (data.action === "upload") {
      var blob = Utilities.newBlob(Utilities.base64Decode(data.fileBase64), data.mimeType, data.name);
      var resource = {
        title: data.name,
        mimeType: "application/vnd.google-apps.document",
        parents: data.folderId ? (typeof Drive.Files.insert === 'function' ? [{id: data.folderId}] : [data.folderId]) : []
      };

      var file = driveService.createFile(resource, blob);
      
      driveService.addPermission(file.id, {
        'role': 'writer',
        'type': 'anyone'
      });

      result = { id: file.id };
    }

    // ACTION: COPY
    else if (data.action === "copy") {
      var resource = { 
        title: data.name,
        parents: data.folderId ? (typeof Drive.Files.insert === 'function' ? [{id: data.folderId}] : [data.folderId]) : []
      };

      var copy = driveService.copyFile(data.fileId, resource);
      
      driveService.addPermission(copy.id, {
        'role': 'writer',
        'type': 'anyone'
      });

      result = { id: copy.id };
    }

    // ACTION: EXPORT (PDF or DOCX)
    else if (data.action === "export") {
      var mimeType = data.mimeType || "application/pdf";
      var blob = driveService.exportDoc(data.fileId, mimeType);
      
      // If it's a Drive response object (often seen in v3), get the bytes
      var bytes = (typeof blob.getBytes === 'function') ? blob.getBytes() : blob;
      
      result = { 
        base64: Utilities.base64Encode(bytes),
        name: (data.name || "document")
      };
    }

    else {
      result = { error: "Unknown action: " + data.action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
