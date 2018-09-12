/* Variables globales */
var numver = "0.1.0";
var curver = "";
/* IndexDB */
var itemDB = {};
var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

// Handle the prefix to IDBTransaction/IDBKeyRange.
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

itemDB.indexedDB = {};
itemDB.indexedDB.db = null;

itemDB.indexedDB.onerror = function(e) {
	console.log(e);
};

itemDB.indexedDB.open = new Promise( function(resolve,reject){
	console.log("opdenDB : Début");
	var request = indexedDB.open("testPOC");
	request.onerror = function(event) {
	  console.error("openDb:", event.target.errorCode);
	};
	request.onsuccess = function(event) {
		itemDB.indexedDB.db = this.result;
		console.log("openDb DONE");
		resolve(itemDB.indexedDB.db)
	};
	request.onupgradeneeded = function(event) { 
	  console.log("openDb Upgrade");
	  itemDB.indexedDB.db = this.result;
	  // Crée un objet de stockage pour cette base de données
	  var objectStore = itemDB.indexedDB.db.createObjectStore("version", { keyPath: "numver" });
		objectStore.transaction.oncomplete = function(evt) {
		// Stocker les valeurs dans le nouvel objet de stockage.
		var verObjectStore = itemDB.indexedDB.db.transaction("version", "readwrite").objectStore("version");
		verObjectStore.add({numver : numver});
	  }
	};
	console.log("opdenDB : Fin");
});

//Ouverture de la base
function init() {
	itemDB.indexedDB.open.then(loaded).catch(function(){console.log("erreur de chargement");});
}
window.addEventListener("DOMContentLoaded", init, false);
/* Fonctions */
function updateOnlineStatus() {
   var etat = navigator.onLine ? "online" : "offline";
   var status = document.getElementById("status");
   var lnkup = document.getElementById("upgrade");
   status.src="/POC/images/icon/"+etat+".png";
   status.alt=etat;
   if(lnkup){
	   if(etat == "offline"){
			lnkup.style.display = "none";
	   }
	   else{
			lnkup.style.display = "";
	   }
   }
   console.log(etat);
}
 
function loaded(db) {
	console.log("Loaded : Début");
	var version;
	var objectStore = db.transaction("version").objectStore("version");
	objectStore.openCursor().onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			curver = cursor.value.numver;
			console.log("récupération version : " + curver);
		}
		else{
			console.log("pas de version courante");
			curver = numver;
			var verObjectStore = db.transaction("version", "readwrite").objectStore("version");
			verObjectStore.add({numver : numver});
		}
		document.getElementsByTagName("footer")[0].innerHTML="Version : " + curver;
		if (curver!=numver) {
			if ("serviceWorker" in navigator) {
				navigator.serviceWorker.controller.postMessage(false);
			}
			console.log("nouvelle version disponible :  "+curver+" -> "+numver);
			document.getElementsByTagName("footer")[0].insertAdjacentHTML("beforeend", "<a href='#' id='upgrade' onclick='upgrade(); return false;'> Cliquez ici pour passer à la version " + numver + "</a>");
			updateOnlineStatus();
		}
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.controller.postMessage(curver==numver);
		}
	};
   updateOnlineStatus();
   window.addEventListener("offline",updateOnlineStatus);
   window.addEventListener("online",updateOnlineStatus);
   console.log("Loaded : Fin");
}

function upgrade(){
	curver = numver;			
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.controller.postMessage(true);
	}
	var objectStore = itemDB.indexedDB.db.transaction("version", "readwrite").objectStore("version");
	var objectStoreRequest = objectStore.clear(); 
	objectStoreRequest.onsuccess = function(event) { 
		window.location.reload();
	}; 
}
	 
