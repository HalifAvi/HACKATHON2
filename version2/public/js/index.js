//** Get 'accountCreated' info */ 
let strDataFromForm = document.querySelector('div.join-container').id;

let objDataFromForm = JSON.parse(strDataFromForm);
console.log(objDataFromForm)

if(objDataFromForm.accountCreated){

    alert("Your account has been successfully created! :)");
}

if(objDataFromForm.alreadyExist){

    alert("You already connected to chat with this user name!");
}