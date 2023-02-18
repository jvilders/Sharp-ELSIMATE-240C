import Calculator from './EL240C.js';

const calculator = new Calculator();

const memoryIndicator = document.querySelector('.display-cell.modifier-cell > div:nth-child(1)');
const minusIndicator = document.querySelector('.display-cell.modifier-cell > div:nth-child(2)');
const errorIndicator = document.querySelector('.display-cell.modifier-cell > div:nth-child(3)');
const displayNumberCells = Array.from(document.querySelectorAll('.number-cell')).reverse();

// interface for updating display
let previousDotCell = displayNumberCells[displayNumberCells.length - 1].children[1]
function updateDisplay(value){
    const valueWithoutSign = value.replace('-', '');
    const withoutPeriodArray = valueWithoutSign.replace('.', '').split('').reverse();
    for(let i = 0; i < displayNumberCells.length; i++){
        displayNumberCells[i].children[0].textContent = withoutPeriodArray[i] || ''
    }

    const dotPosition = valueWithoutSign.indexOf('.');

    previousDotCell.classList.add('hidden');

    const dotCell = displayNumberCells[(valueWithoutSign.length - 1) - dotPosition].children[1];
    dotCell.classList.remove('hidden');
    previousDotCell = dotCell;
}


document.querySelector('#calculator-keypad').addEventListener('click', (e) => {
    const clickedButton = e.target;

    let input;
    if(!(input = clickedButton.attributes["data-button"]?.nodeValue)){
        return;
    }

    calculator.input(input);

    const calculatorState = calculator.displayState;

    memoryIndicator.classList.add('hidden');
    errorIndicator.classList.add('hidden');
    minusIndicator.classList.add('hidden');

    if(calculatorState.memoryRegisterFilled) memoryIndicator.classList.remove('hidden');
    if(calculatorState.inErrorState) errorIndicator.classList.remove('hidden');
    if(calculatorState.displayValue.at(0) === '-') minusIndicator.classList.remove('hidden');

    console.log(calculatorState);

    updateDisplay(calculatorState.displayValue);
});