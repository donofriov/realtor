'use strict';

function loanCalculator() {
	var loanAmount = document.getElementById('loanAmount').value;
	var interest = document.getElementById('interest').value;
	var numberOfMonths = document.getElementById('months').value;
	var error1 = document.getElementById("error1");
	var error2 = document.getElementById("error2");
	var error3 = document.getElementById("error3");

		if (loanAmount == "" || loanAmount < 1 || isNaN(loanAmount)) {
			error1.innerHTML="<div style='color:red;float: right;position: relative;width: 200px;top: -145px;left: 199px;'><--You must enter a positive whole number greater than zero.</div>";
		}
		else {
			error1.innerHTML="";
		}

		if (interest == "" || interest < .1 || isNaN(interest)) {
			error2.innerHTML="<div style='color:red;float: right;position: relative;width: 200px;top: -138px;left: 199px;'><--You must enter a number greater than or equal to .1</div>";
		}
		else {
			error2.innerHTML="";
		}

		if (numberOfMonths == "" || numberOfMonths < 1 || isNaN(numberOfMonths)) {
			error3.innerHTML="<div style='color:red;float: right;position: relative;width: 200px;top: -131px;left: 199px;'><--You must enter a positive whole number greater than zero.</div>";
		}
		else {
			error3.innerHTML="";
		}

		if(moneyFormat!==""){
			document.getElementById('calculate').innerHTML="<div style='float:right;color:blue;  position:relative; left:210px; width:200px;top:-147px;line-height:20px;'></div>"
		}
		
		if (error1.innerHTML==="" && error2.innerHTML==="" && error3.innerHTML==="" ) {
		var t = eval(1.0 / (Math.pow((1+(interest/1200)),numberOfMonths)));
		var payment = eval(((loanAmount*(interest/1200))/(1-t)).toFixed(2));
		var moneyFormat = '$' + payment.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		document.getElementById('calculate').innerHTML="<div style='float:right;color:blue;  position:relative; left:210px; width:200px;top:-147px;line-height:20px;'>Your monthly payment is: "+moneyFormat+"</div>"
		} else {
		}
	}

	//this keeps the page from refreshing
	//return false;
