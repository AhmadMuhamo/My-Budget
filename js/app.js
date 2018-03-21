/**Budget Controller */
let budgetController = (() => {

})();

/**UI Controller */
let uiController = (() => {

})();

/**APP Controller */
let controller = ((bc, uc) => {

    let addItem = () => {
        // 1- Get input Data
        // 2- Add the item to the Budget Controller
        // 3- Add the new Item to the UI
        // 4- Calculate the Budget
        // 5- Display the Budget on the UI
    };
    
    document.querySelector('.add__btn').addEventListener('click',addItem);

    document.addEventListener('keypress',(event) => {
        if (event.keyCode === 13 || event.which === 13) {
            addItem();
        }
    });
})(budgetController, uiController);
