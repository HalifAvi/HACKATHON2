
//** Get 'isUserAlreadyExist' info */ 
let strDataFromForm = document.querySelector('div.form-control').id;

let obj = JSON.parse(strDataFromForm)
console.log(obj.isUserAlreadyExist)


if(obj.isUserAlreadyExist){

    alert("THIS USER NAME ALREADY EXISTS - PLEASE CHECK YOUR DETAILS AGAIN! ");

}else{

    alert("YOU HAVE TO CREATE AN ACCOUNT - PLEASE INSERT YOUR DETAILS to CHAT-ME :)");
}
