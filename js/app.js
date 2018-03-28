/**Budget Controller Module */
const budgetController = (() => {

    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };

    let calculateTotal = (type) => {
        let sum = 0;
        data.items[type].forEach( el => sum += el.value);
        data.total[type] = sum;
    }
    let data = {
        items: {
            exp: [],
            inc: [],
        },
        total: {
            exp: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: (type, desc, val) => {
            let item, id;
            /** Generate the id */
            if (data.items[type].length > 0) {
                id = data.items[type][data.items[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            /** Create item base on its type 'inc' or 'exp' */
            if (type ==='exp') {
                item = new Expense(id, desc, val);
            } else {
                item = new Income(id, desc, val);
            }

            /** Push the item to our data object */
            data.items[type].push(item);

            /** return the item */
            return item;
        },
        calculateBudget: () => {
            /** Calculate Total income and expenses */
            calculateTotal('exp');
            calculateTotal('inc');

            /** Calculate the budget: income - expenses */
            data.budget = data.total.inc - data.total.exp;

            /** Calculate the % of the spent income */
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            };
        },
        deleteBudgetItem: (type, id) => {
            let ids, index;

            ids = data.items[type].map(el => el.id);
            index = ids.indexOf(id);

            if (index !== -1) {
                data.items[type].splice(index, 1);
            }
        },
        test: () => {
            console.log(data);
        }
    };

})();

/**UI Controller Module*/
const uiController = (() => {

    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetValue: '.budget__value',
        budgetIncValue: '.budget__income--value',
        budgetExpValue: '.budget__expenses--value',
        budgetExpPercentage: '.budget__expenses--percentage',
        container: '.container'

    };

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: (obj, type) => {
            let html,selector;

            if (type === 'inc') {
                html = `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div>
                <div class="right clearfix"><div class="item__value">${obj.value}</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`

                selector = DOMStrings.incomeList;
            } else {
                html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div>
                <div class="right clearfix"><div class="item__value">- ${obj.value}</div><div class="item__percentage">21%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div>
                </div></div>`

                selector = DOMStrings.expenseList;                
            }

            document.querySelector(selector).insertAdjacentHTML('beforeend', html);
        },
        deleteListItem: (id) => {
            let element = document.getElementById(id);
            element.parentNode.removeChild(element);
        },
        clearInputFields: () => {
            let inputFields,fieldsArr;
            inputFields = document.querySelectorAll('input');

            fieldsArr = Array.from(inputFields);
            fieldsArr.forEach(element => element.value = '');
            fieldsArr[0].focus();
        },
        displayBudget: (obj) => {
            document.querySelector(DOMStrings.budgetValue).textContent = obj.budget;
            document.querySelector(DOMStrings.budgetIncValue).textContent = obj.totalInc;
            document.querySelector(DOMStrings.budgetExpValue).textContent = obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.budgetExpPercentage).textContent = obj.percentage + '%';                
            } else {
                document.querySelector(DOMStrings.budgetExpPercentage).textContent = '--';
            }
        },
        getDOMStrings: () => {
            return DOMStrings;
        }
    };
})();

/**APP Controller Module*/
const controller = ((bc, uic) => {

    const setEventListeners = () => {
        const DOM = uic.getDOMStrings();
        
        document.querySelector(DOM.addButton).addEventListener('click',addItem);
        document.addEventListener('keypress',(event) => {
            if (event.keyCode === 13 || event.which === 13) {
                addItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', deleteItem);
    };

    let updateBudget = () => {
        /** 1- Calculate the budget */
        bc.calculateBudget();

        /** 2- Return the budget */
        let budget = bc.getBudget();

        /** 3-Display the budget on the UI */
        uic.displayBudget(budget);
    };

    let addItem = () => {
        let input, newItem;
        /** Get the Input Data */
        input = uic.getInput();

        if(input.description && !isNaN(input.value) && input.value > 0) {
            /** Add the item to the Budget Controller */
            newItem = bc.addItem(input.type, input.description, input.value);

            /** Add the new Item to the UI */
            uic.addListItem(newItem, input.type);

            /** Clear Input Fields */
            uic.clearInputFields();

            /** Calculate and update the Budget */
            updateBudget();
        }
        
    };

    let deleteItem = (event) => {
        let itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            /** 1- Delete the item from the 'data' object*/
            bc.deleteBudgetItem(type, id);

            /** 2- Delete the item from the UI */
            uic.deleteListItem(itemID);

            /** 3- update and display the new budget */
            updateBudget();
        }
    };
    
    return {
        initialize: () => {
            setEventListeners();
            uic.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };
   
})(budgetController, uiController);

controller.initialize();