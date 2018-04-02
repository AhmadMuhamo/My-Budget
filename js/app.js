/**Budget Controller Module */
const budgetController = (() => {

    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        calcPercentage(totalInc) {
            totalInc > 0 ? this.percentage = Math.round((this.value / totalInc) * 100) : this.percentage = -1;
        }

        getPercentage() {
            return this.percentage;
        }
    };

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };

    const calculateTotal = (type) => {
        let sum = 0;
        data.items[type].forEach(el => sum += el.value);
        data.total[type] = sum;
    }
    let data = {
        items: {
            exp: [],
            inc: [],
        },
        total: {
            exp: 0,
            inc: 0
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
            if (type === 'exp') {
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
        calculatePercentages: () => {
            data.items.exp.forEach(el => el.calcPercentage(data.total.inc));
        },
        getPercentages: () => {
            let allPercentages;
            allPercentages = data.items.exp.map(el => el.getPercentage());
            return allPercentages;
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
        container: '.container',
        expensePercentage: '.item__percentage',
        budgetMonth: '.budget__title--month'

    };

    const formatNumber = (num, type) => {
        let splitNum, int, dec;
        /**+ or - before number 
         * 2 decimal points
         * comma separating thousands
         */
        num = Math.abs(num);
        num = num.toFixed(2);

        splitNum = num.split('.');
        int = splitNum[0];
        dec = splitNum[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? '-' : type === 'inc' ? '+' : '') + ' ' + int + '.' + dec;
    };

    const nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
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
            let html, selector;

            if (type === 'inc') {
                html = `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div>
                <div class="right clearfix"><div class="item__value">${formatNumber(obj.value, type)}</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`

                selector = DOMStrings.incomeList;
            } else {
                html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div>
                <div class="right clearfix"><div class="item__value">${formatNumber(obj.value, type)}</div><div class="item__percentage">21%</div>
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
            let inputFields, fieldsArr;
            inputFields = document.querySelectorAll('input');

            fieldsArr = Array.from(inputFields);
            fieldsArr.forEach(element => element.value = '');
            fieldsArr[0].focus();
        },
        displayBudget: (obj) => {
            let type;
            obj.budget > 0 ? type = 'inc' : obj.budget < 0 ? type = 'exp' : type = 'normal';

            document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.budgetIncValue).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.budgetExpValue).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.budgetExpPercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.budgetExpPercentage).textContent = '--';
            }
        },
        displayPercentages: (percs) => {
            let percsFields = document.querySelectorAll(DOMStrings.expensePercentage);

            nodeListForEach(percsFields, function (current, index) {
                percs[index] > 0 ? current.textContent = percs[index] + '%' : current.textContent = '--';
            });

        },
        dipslayMonth: () => {
            let date, months, year;
            date = new Date();
            year = date.getFullYear();

            months = new Map();
            months.set(0, 'January');
            months.set(1, 'February');
            months.set(2, 'March');
            months.set(3, 'April');
            months.set(4, 'May');
            months.set(5, 'June');
            months.set(6, 'July');
            months.set(7, 'August');
            months.set(8, 'September');
            months.set(9, 'October');
            months.set(10, 'November');
            months.set(11, 'December');

            document.querySelector(DOMStrings.budgetMonth).textContent = months.get(date.getMonth()) + ', ' + year;
        },
        changeType: () => {
            const fields = document.querySelectorAll(`${DOMStrings.inputType},${DOMStrings.inputDescription},${DOMStrings.inputValue}`);
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.addButton).classList.toggle('red');
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

        document.querySelector(DOM.addButton).addEventListener('click', addItem);
        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                addItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', deleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', uic.changeType);
    };

    const updateBudget = () => {
        /** 1- Calculate the budget */
        bc.calculateBudget();

        /** 2- Return the budget */
        const budget = bc.getBudget();

        /** 3-Display the budget on the UI */
        uic.displayBudget(budget);
    };

    const updatePercentages = () => {
        /** 1- Calculate the percentages */
        bc.calculatePercentages();

        /** 2- Read percentages from the budget controller */
        const percentages = bc.getPercentages();

        /** 3- Update the UI with the new percentages */
        uic.displayPercentages(percentages);
    };

    const addItem = () => {
        let input, newItem;
        /** Get the Input Data */
        input = uic.getInput();

        if (input.description && !isNaN(input.value) && input.value > 0) {
            /** Add the item to the Budget Controller */
            newItem = bc.addItem(input.type, input.description, input.value);

            /** Add the new Item to the UI */
            uic.addListItem(newItem, input.type);

            /** Clear Input Fields */
            uic.clearInputFields();

            /** Calculate and update the Budget */
            updateBudget();

            /** Calculate and update the percentages */
            updatePercentages();
        }

    };

    const deleteItem = (event) => {
        let itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            /** 1- Delete the item from the 'data' object*/
            bc.deleteBudgetItem(type, id);

            /** 2- Delete the item from the UI */
            uic.deleteListItem(itemID);

            /** 3- update and display the new budget */
            updateBudget();

            /** 4- Calculate and update the percentages */
            updatePercentages();
        }
    };

    return {
        initialize: () => {
            setEventListeners();
            uic.dipslayMonth();
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