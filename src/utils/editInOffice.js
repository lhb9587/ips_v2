/* eslint-disable */

import { getToken } from '@/utils/auth'
export function getProgID(fileName) {
     var ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

     switch (ext) {
         case "ppt":
         case "pptx":
         case "ppsx":
         case "pot":
         case "potx":
         case "pptm":
             return "PowerPoint.Show";
         case "doc":
         case "docx":
         case "dot":
         case "dotx":
             return "Word.Document";
         case "xls":
         case "xlt":
         case "xlsx":
         case "xlst":
         case "xlsm":
         case "xltx":
             return "Excel.Sheet";
         default:
             return ''
     }
 }

 function filterPath(urlPath, success, onerror) {

     if (getToken()) {
       var newPath  = window.location.protocol + '//' + window.location.host + "/webdav/"
      // var newPath = bdyGlobal.bdy_webdav_base;
       newPath = newPath + 'tokenID_' + getToken() +'/'+ urlPath;
       // newPath = newPath + 'tokenID_' + 'dc_ba_98_76' +'/'+ urlPath;
       success(newPath);
     } else {
         onerror('Unable to retrieve a temporary auth token. Check your server logs.');
     }



 }


 function handleTokenError(msg) {
     alert(msg);
 }

export function doEditInOffice(webDavUrl, progID) {
     //var baseUrl = bdyGlobal.bdy_webdav_base;
     var isFirefox = typeof window.InstallTrigger !== 'undefined';
     if (typeof window.ActiveXObject !== 'undefined' || "ActiveXObject" in window) { // IE
         var ed;
         try {
             ed = new ActiveXObject('SharePoint.OpenDocuments.1');
         } catch (err) {
             window.alert('Unable to create an ActiveX object to open the document. This is most likely because of the security settings for your browser.');
             return false;
         }
         if (ed) {

             filterPath(webDavUrl, function (newUrl) {
                 ed.EditDocument(newUrl, progID);
             }, handleTokenError);
             return false;
         } else {
             window.alert('Cannot instantiate the required ActiveX control to open the document. This is most likely because you do not have Office installed or you have an older version of Office.');
             return false;
         }
     } else if (!isFirefox) { //all browsers except for IE and Firefox.

         editWithMicrosoftOffice(webDavUrl);
     } else { //Firefox
         alert('Firefox')
         if (window.URLLauncher) { // this means the OC firefox plugin is installed
             if (isMicrosoftOffice(webDavUrl)) {
                 alert('Firefox1')
                 editWithMicrosoftOffice(webDavUrl);
             } else {
                 alert('Firefox2')
                 editWithNonMicrosoftOffice(webDavUrl);
             }
         } else {
             alert('Firefox3')
             //Even the customer could edit the document without installing the Firefox addon, however,
             //We still need to ask the customer to install it because we need to support other office softwares,
             //such as OpenOffice, and we are not able to detect whether the customer has Microsoft Office installed,
             //so we have to depend on the Firefox addon to check. If we support the Microsoft Office only,
             //then we don't need this addon at all.
             if (window.confirm('A plugin is required to use this feature. Would you like to download it?')) {
                 InstallTrigger.install({
                     'WebDAV Launcher': 'https://update.atlassian.com/office-connector/URLLauncher/latest/webdavloader.xpi'
                 });
             }
         }
     }
     return false;
 }

 function editWithMicrosoftOffice(webDavUrl) {
     // Always launch Microsoft Office with token regardless of whether the token is enabled.
     // Alternatively, we need to ask the customer to enable the authentication via Basic Auth by updating
     // the registry, please see the details at https://support.microsoft.com/en-us/kb/2123563
     filterPath(webDavUrl, launchWithOFE, handleTokenError);
 }

 function isMicrosoftOffice(url) {
     var extension = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
     return new URLLauncher().isMicrosoftOfficeInstalled(extension);
 }

 function launchWithFF(url) {
     try {
         var wdFile = new URLLauncher();
         // check and see if they have the function we want.
         if (wdFile.open2) {
             //grok the webdav root path and the remaining path after the root
             var regex = new RegExp(contextPath + '/plugins/servlet/[^\/]+/');
             var rootPath = url.match(regex);
             var remainingPath = url.substring(rootPath[0].length);
             alert(123123)
             wdFile.open2(encodeURI(rootPath[0]), encodeURI(remainingPath));
         } else {
             wdFile.open(url);
         }
     } catch (anError) {
         window.alert("Unable to open your Office file. Have you installed MS Office yet?. Read more detail at https://confluence.atlassian.com/display/DOC/Installing+the+Firefox+Add-On+for+the+Office+Connector");
     }
 }

 function editWithNonMicrosoftOffice(usePathAuth, webDavUrl) {
     var isMac = navigator.appVersion.indexOf("Mac") != -1;

     if (usePathAuth && !isMac) {
         webDavUrl = filterPath(webDavUrl, launchWithFF, handleTokenError);
     } else {
         launchWithFF(webDavUrl);
     }
 }
 /**
  * The protocol used for the Microsoft Office document.
  * @param href - the URI of the office resource
  * @returns the protocol name.
  */
 function getMicrosoftProtocol(href) {
     var ext = href.substring(href.lastIndexOf('.') + 1).toLowerCase();

     switch (ext) {
         case "ppt":
         case "pptx":
         case "ppsx":
         case "pot":
         case "potx":
         case "pptm":
             return "ms-powerpoint";
         case "doc":
         case "docx":
         case "dot":
         case "dotx":
             return "ms-word";
         case "xls":
         case "xlt":
         case "xlsx":
         case "xlst":
         case "xlsm":
         case "xltx":
             return "ms-excel";
         default:
             return '';
     }
 }

 /**
  * Launches the Microsoft Office to edit the specified document.
  * Finds the details of Office URI at https://msdn.microsoft.com/en-us/library/office/dn906146.aspx.
  *
  * @param url - the location of document
  */
 function launchWithOFE(url) {

     try {
         var officeUrl = getMicrosoftProtocol(url) + ':ofe|u|' + url;

         window.location = officeUrl;
     } catch (anError) {
         window.alert('Unable to open your Office file. Have you installed MS Office yet?. Read more detail at' +
             ' https://confluence.atlassian.com/display/DOC/Installing+the+Firefox+Add-On+for+the+Office+Connector');
     }
 }

 // The AMD check and shim are done to preserve backwards compatibility
 // (as other things may be dependent on these functions being global).
 if (typeof windowdefine !== "undefined") {
     define('office-connector/edit-in-office', [], function () {
         return {
             getProgID: getProgID,
             doEditInOffice: doEditInOffice
         };
     });
 }
