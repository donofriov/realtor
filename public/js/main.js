'use strict';

//create global variables - data?
var url, addressInput, addressInputParse, cityInput, cityInputParse,
	stateInput, zipInput, csz, xml, zpid, decodedUrl, error,
	addresses;

var zwsid = 'X1-ZWz1ewbzi4jpqj_9iqqv';
var addProperty = document.getElementById("add");
var localStorageAddresses = [{}];
var displayLocalStorage = document.getElementById("displaylocal");

//focuses on the address label on page load
document.getElementById('number').focus();

//tabbed navigation
var maplink = document.getElementById('maptabb');
var calclink = document.getElementById('calctabb');
var compslink = document.getElementById('compstabb');
var map = document.getElementById('maptab');
var calc = document.getElementById('calctab');
var comps = document.getElementById('compstab');


maplink.onclick = function(){
	document.getElementById('maptabb').parentNode.blur();
	maplink.className = "active";
	calclink.className = "disabled";
	compslink.className = "disabled";
	map.className = "show";
	calc.className = "hide";
	comps.className = "hide";
};

calclink.onclick = function(){
	maplink.className = "disabled";
	calclink.className = "active";
	compslink.className = "disabled";
	map.className = "hide";
	calc.className = "show";
	comps.className = "hide";

	document.getElementById('loanAmount').focus();
	document.getElementById('calcForm1').reset();
	document.getElementById('calculate').innerHTML = "";
	document.getElementById('error1').innerHTML = "";
	document.getElementById('error2').innerHTML = "";
	document.getElementById('error3').innerHTML = "";
};

compslink.onclick = function(){
	document.getElementById('compstabb').parentNode.blur();
	maplink.className = "disabled";
	calclink.className = "disabled";
	compslink.className = "active";
	map.className = "hide";
	calc.className = "hide";
	comps.className = "show";
};

function init() {
	if (window.localStorage.getItem("addresses")) {
		addresses = JSON.parse(window.localStorage.getItem("addresses"));
		//the true is passed for local storage loading.
			displayLocal();
	}
}
init();

//saving info from form and converting it to api capable text
document.getElementById('getZillowData').onclick = saveInput;

function saveInput() {
	maplink.click();
	addressInput = document.getElementById('number').value;
	addressInputParse = document.getElementById('number').value.split(' ').join('+');
	cityInput = document.getElementById('city').value;
	cityInputParse = document.getElementById('city').value.split(' ').join('+');
	stateInput = document.getElementById('state').value;
	zipInput = document.getElementById('zip').value;
	csz = cityInputParse+'+'+stateInput+'+'+zipInput;
	if (addressInputParse == '' || cityInputParse == '' || stateInput == '' || zipInput == '') {
		return true;
	}
	else {
		getData();
		// no refresh
		return false;
	}
}

function saveLocal(){
	addProperty.disabled = true;
	localStorageAddresses = [{"address":addressInput,"city":cityInput,"state":stateInput,"zip":zipInput}];
	var newLocal = {"address":addressInput,"city":cityInput,"state":stateInput,"zip":zipInput};
	if(localStorage.getItem('addresses')){
		var existingLocal = localStorage.getItem('addresses');
		var parseExisting = JSON.parse(existingLocal);
		parseExisting.push(newLocal);
		localStorage.setItem('addresses', JSON.stringify(parseExisting));
	} else {
		localStorage.setItem('addresses', JSON.stringify(localStorageAddresses));
	}
	document.getElementById('addressform1').reset();
	document.getElementById('number').focus();
	displayLocal();
}

function displayLocal(){
	if(localStorage.getItem('addresses')){
		var localObject = localStorage.getItem('addresses');
		var parsedObject = JSON.parse(localObject);
		var len = parsedObject.length;
		var localAddress = '';
		displayLocalStorage.innerHTML = "";
		for(var i = 0; i < len; i++){
			localAddress = parsedObject[i]['address']+' '+parsedObject[i]['city']+' '+parsedObject[i]['state']+' '+parsedObject[i]['zip'];
			displayLocalStorage.innerHTML += "<p>[</p><a onclick='deleteLocal(this);' href='javascript:void(0);'>remove</a><p>]" +
			"[</p><a onclick='viewLocal(this);' href='javascript:void(0);'>view</a><p>] "+localAddress+"</p>"+"<p id='unique'>"+i+"</p><br>";
		}
	}
}

function viewLocal(thisLocal){
	var identifier = thisLocal.nextSibling.nextSibling.innerHTML;
	var localObject = localStorage.getItem('addresses');
	var parsedObject = JSON.parse(localObject);
	document.getElementById('number').value = parsedObject[identifier]['address'];
	document.getElementById('city').value = parsedObject[identifier]['city'];
	document.getElementById('state').value = parsedObject[identifier]['state'];
	document.getElementById('zip').value = parsedObject[identifier]['zip'];
	document.getElementById('getZillowData').click();
	addProperty.disabled = true;

}

function deleteLocal(thisLocal){
	// lol this is bad but I ran out of time...
	var identifier = thisLocal.nextSibling.nextSibling.nextSibling.nextSibling.innerHTML;
	var localObject = localStorage.getItem('addresses');
	var parsedObject = JSON.parse(localObject);
	var len = parsedObject.length;
	//removes item from local storage object
	for(var i=0; i<len; i++){
		if (parsedObject[i] == parsedObject[identifier]){
			console.log(parsedObject);
			parsedObject.splice(i,1);
			console.log(parsedObject);
		}
	}
	localStorage.setItem('addresses', JSON.stringify(parsedObject));
	displayLocalStorage.innerHTML = "";
	displayLocal();

}

function getData(){
	addProperty.disabled = false;
	//create url string to get xml data.  This string will be sent to the server.
	decodedUrl = 'http://www.zillow.com/webservice/GetSearchResults.htm?zws-id='+zwsid+'&address='+addressInputParse+'&citystatezip='+csz;
	url = encodeURIComponent(decodedUrl);
	//send xml request
	//NOTE: JavaScript does not allow you to do cross domain requests so we have to make the 
	//request to the server then use the request module to get the data.x
	Ajax.sendRequest('/rest', handleRequest, url);
	document.getElementById('googleMap').innerHTML='Getting Information Please Wait...';
	//}
}

	function handleRequest(req){
        //usually when getting xml data you would use req.responseXML
        //however in this case I had to use req.responseText and then
        //covert it to an xml object.
        xml = req.responseText;
        xml = textToXML(xml);
        error = xml.getElementsByTagName('code')[0].firstChild.nodeValue;
        if (error !== '0') {
        	document.getElementById('googleMap').innerHTML='We are sorry there is no map information for the address you entered.';
        	comps.innerHTML='<div id="message">We are sorry there is no comparison information for the address you entered.</div>';
        } else {
        
        var latitude = xml.getElementsByTagName('latitude')[0].firstChild.nodeValue;
        var longitude = xml.getElementsByTagName('longitude')[0].firstChild.nodeValue;
        
        
        // setting google map to the lat/lng retrieved from Zillow
          var mapProp = {
            center:new google.maps.LatLng(latitude,longitude),
            zoom:13,
            mapTypeId:google.maps.MapTypeId.ROADMAP
          };

          var map=new google.maps.Map(document.getElementById('googleMap'),mapProp);

          var marker = new google.maps.Marker({
                  position: new google.maps.LatLng(latitude,longitude)
                });

          marker.setMap(map);
        }

        zpid = xml.getElementsByTagName('zpid')[0].firstChild.nodeValue;
        if (zpid !== undefined) {getCompData();}
    }

function getCompData() {
	//send additional request for comps with zpid    
	decodedUrl = 'http://www.zillow.com/webservice/GetComps.htm?zws-id='+zwsid+'&zpid='+zpid+'&count=25';
	url = encodeURIComponent(decodedUrl);
	Ajax.sendRequest('/rest', handleCompRequest, url);
}

	function handleCompRequest(req){
		xml = req.responseText;
		xml = textToXML(xml);
		error = xml.getElementsByTagName('code')[0].firstChild.nodeValue;
		if (error !== '0') {
			comps.innerHTML='<div id="message">We are sorry there is no comparison information for the address you entered.</div>';
		} else {

				var address = xml.getElementsByTagName('address');
				var zEstimate = xml.getElementsByTagName('zestimate');
				
				
				//get the length of the path same as title
				var len = address.length;
				
				//put output into table
				var output = '<table><thead><tr><th>Address</th><th>City</th><th>State</th><th>Zip</th><th>Amount</th></tr></thead><tbody>';
				for (var i = 0; i < len; i++){
					output += '<tr>';
					//get data of elements
					output += '<td>'+address[i].getElementsByTagName('street')[0].firstChild.nodeValue+'</td>';
					output += '<td>'+address[i].getElementsByTagName('city')[0].firstChild.nodeValue+'</td>';
					output += '<td>'+address[i].getElementsByTagName('state')[0].firstChild.nodeValue+'</td>';
					output += '<td>'+address[i].getElementsByTagName('zipcode')[0].firstChild.nodeValue+'</td>';
					var moneyTransfer = zEstimate[i].getElementsByTagName('amount')[0].innerHTML;
					//regex below adds a comma in every three characters
					var currencyFormat = moneyTransfer.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
					output += '<td>'+'$'+currencyFormat+'.00'+'</td>';
					output += '</tr>';
				}
				output += '</tbody></table>';
				//output result in response div
				comps.innerHTML = output;
			}
		
		
	}

      function textToXML (text) {
        try {
          var xml = null;
          if ( window.DOMParser ) {
            var parser = new DOMParser();
            xml = parser.parseFromString( text, 'text/xml' );
            var found = xml.getElementsByTagName( 'parsererror' );
            if ( !found || !found.length || !found[ 0 ].childNodes.length ) {
              return xml;
            }
            return null;
          } else {
            xml = new ActiveXObject( 'Microsoft.XMLDOM' );
            xml.async = false;
            xml.loadXML( text );
            return xml;
          }
        } catch (e) {
          console.log(e.error);
        }
      }