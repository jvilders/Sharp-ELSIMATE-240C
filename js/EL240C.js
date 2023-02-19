class Calculator {
    // The EL240C has an 8+1 display, with 1 cell reserved for showing the sign in case of a negative 
    // number and for showing an "M" and "E" for respectively if the memory register is filled and if 
    // the calculator is in an error state. For this class this is only used for truncating numbers 
    // and disallowing further keypad input if the maximum number of inputs was reached.
    MAXDIGITS = 8;

    constructor(){
        this.binaryOperators = {
            '+': this.add,
            '-': this.subtract,

            '×': this.multiply,
            '÷': this.divide,
        };

        this.unaryOperators = {
            '√': this.sqrt,
            '±': this.plusminus
        }

        this.memoryButtons = {
            'RCM': this.readOrClearMemory,
            'M+': this.memoryAdd,
            'M-': this.memorySubtract,
        };

        this.evaluators = {
            '%': this.percentageEvaluation,
            '=': this.equalsEvaluation,
        };

        this.clearingButtons = {
            'CA': this.clearAll,
            'CCE': this.clearOrClearEntry
        };

        this.keyPadButtons = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']);

        this.validInputs = new Set([
            ...Object.keys(this.binaryOperators),
            ...Object.keys(this.unaryOperators),
            ...Object.keys(this.memoryButtons),
            ...Object.keys(this.evaluators),
            ...Object.keys(this.clearingButtons),
            ...this.keyPadButtons
        ])

        this.reset();
    }

    reset(){
        this.previous = "0";
        this.previousOperation = this.add;

        this.operands = ["0", null];
        this.operation = null;

        this.operandDisplayed = 0;

        this.overwriteNumber = true;
        this.periodAdded = false;

        this.memoryRegister = "0";
        this.hasReadMemory = false;

        this.inErrorState = false;
    }

    get displayValue(){
        return this.operands[this.operandDisplayed] + (this.operands[this.operandDisplayed].includes('.') ? '' : '.')
    }

    get displayState(){
        return {
            memoryRegisterFilled: this.memoryRegister !== "0",
            inErrorState: this.inErrorState,
            displayValue: this.displayValue
        }
    }

    get inputState(){
        /**
         * Slightly wasteful to recalculate this every time it's used in other methods, but 
         * caching it somehow and then having to remember to invalidate that cache is a much bigger 
         * headache.
         */
        return this.operation ? this.operands[1] ? 'full' : 'missingSecondOperand' : 'numberOnly';
    }

    isValidInput(chr){
        return this.validInputs.has(chr)
    }

    truncateNumber(n){
        if(Math.abs(n) < (1 / (10 ** (this.MAXDIGITS - 1))) || (!isFinite(n))){ // second case is for catching divisions by 0
            return "0"
        } else if (Math.abs(n) > ((10 ** this.MAXDIGITS) - 1)){
            this.inErrorState = true;
    
            return (n / (10 ** this.MAXDIGITS)).toFixed(this.MAXDIGITS - 1).slice(0, this.MAXDIGITS + 1 + (n < 0));;
        } else {
            if(Number.isInteger(n)){
                return n.toString();
            }
    
            return Number(n.toFixed(this.MAXDIGITS).slice(0, this.MAXDIGITS + 1 + (n < 0))).toString();
        }
    }

    clearAll(){
        /**
         * CA = Clear All. Fully resets the calculator.
         */
        this.reset();
    }

    clearOrClearEntry(){
        /**
         * Clear/Clear Entry. Can undo an error state without resetting all calculator state. Otherwise 
         * erases most recently entered operand.
         */
        if(this.inErrorState){
            this.inErrorState = false;
            return;
        }
        
        if(this.inputState === 'full'){
            this.operands[1] = null;
            this.operandDisplayed = 0;
        } else {
            this.operands[0] = "0";
            this.operation = null;
        }
    }

    // memory functions

    readOrClearMemory(){
        /**
         * Read/Clear Memory. Pressing once will insert the value in the memory register as an operand. Pressing twice 
         * consecutively will clear the memory register.
         */
        if(this.hasReadMemory){
            this.memoryRegister = "0";
            this.hasReadMemory = false;
            return
        }

        
        if(this.inputState === 'numberOnly'){
            this.operands[0] = this.memoryRegister;
        }else{
            this.operands[1] = this.memoryRegister
        }
        this.hasReadMemory = true;
    }

    memoryAdd(){
        this.memoryOperation(this.add)
    }

    memorySubtract(){
        this.memoryOperation(this.subtract.bind(this)); // this.subtract calls this.add, needs reference to this
    }

    memoryOperation(operator){
        /**
         * Due to the extra operation after called the shared calculation function (which sets a new value for 
         * the first operand and sets the display to that operand), the value assigned to the memory register 
         * can differ from the displayed value (example in unit tests).
         */
        if(this.inputState !== 'numberOnly'){
            const [_, lOperand, operation, rOperand] = this.getCalcStuff(
                this.inputState,
                this.operation,
                '=',
            );

            this.calculate("0", lOperand, operation, rOperand);
        }
        this.memoryRegister = this.truncateNumber(operator(this.memoryRegister, this.operands[0]));
    }

    // key pad button function

    keyPadButtonInput(chr){
        let targetOperand = this.inputState === 'numberOnly' ? 0 : 1;

        if(this.operands[targetOperand]?.length - this.periodAdded === this.MAXDIGITS){
            return;
        }
        
        let implicitValue
        if(chr !== '.'){
            implicitValue = "";
            this.operandDisplayed = targetOperand;
        } else {
            if(this.periodAdded){
                return;
            }
            implicitValue = "0";
            this.periodAdded = true;
        }

        if(this.overwriteNumber || this.operands[targetOperand] === null){
            this.operands[targetOperand] = implicitValue;
        }

        this.operands[targetOperand] = this.operands[targetOperand] + chr

        this.overwriteNumber = false;
    }

    unaryFunction(chr){
        if(chr === '√' && this.inputState === 'missingSecondOperand'){
            // if after an operator, special behavior: apply sqrt to first operand, insert as second
            this.operands[1] = this.truncateNumber(this.unaryOperators['√'].call(this, this.operands[0]))
            this.operandDisplayed = 1;
        } else {
            this.operands[this.operandDisplayed] = this.unaryOperators[chr].call(this, this.operands[this.operandDisplayed]).toString();
        }

        this.overwriteNumber = chr === '√'
    }

    binaryFunction(chr){
        if(this.inputState === 'full'){
            this.equalsEvaluation();
        }

        this.operation = this.binaryOperators[chr];
    }

    getCalcStuff(status, operator, evaluator){
        if(status === "numberOnly"){
            return [this.previous, this.operands[0], this.previousOperation, this.previous];
        }
    
        let newPrevious;
        if(status === "missingSecondOperand"){
            newPrevious = this.operands[0];
        } else {
            if(operator === this.add || operator === this.subtract){
                newPrevious = this.operands[Number(evaluator === '=')];
            } else {
                newPrevious = this.operands[Number(operator === this.divide)];
            }
        }
    
        let lOperand;
        if(status === "full"){
            lOperand = this.operands[0];
        } else {
            if(operator === this.divide){
                lOperand = "1";
            } else {
                if(evaluator === '%'){
                    lOperand = this.operands[0] / 100;
                } else {
                    lOperand = this.previous;
                    if(operator === this.multiply){
                        lOperand = this.operands[0];
                    }
                }
            }
        }
    
        let rOperand;
        if(status === 'missingSecondOperand'){
            rOperand = this.operands[0];
            if(evaluator === '%' && operator === this.divide){
                rOperand /= 100;
            }
        } else {
            if(evaluator === '='){
                rOperand = this.operands[1];
            } else {
                if(operator === this.multiply || operator === this.divide){
                    rOperand = this.operands[1] / 100;
                } else {
                    rOperand = this.operands[0] / 100 * this.operands[1];
                }
            }
        }
    
        return [newPrevious, lOperand, this.operation, rOperand];
    }

    calculate(newPrevious, lOperand, operation, rOperand){
        this.operands[0] = this.truncateNumber(operation.call(this, lOperand, rOperand));
        
        this.previous = newPrevious;
        this.previousOperation = this.operation || this.previousOperation;
        this.operandDisplayed = 0;
        this.operation = null;
        this.operands[1] = null;
        this.overwriteNumber = true;
    }

    equalsEvaluation(){
        const [newPrevious, lOperand, operation, rOperand] = this.getCalcStuff(
            this.inputState,
            this.operation,
            '=',
        );

        this.calculate(newPrevious, lOperand, operation, rOperand);
    }

    percentageEvaluation(){
        switch(true){
            case this.inputState === 'numberOnly':
                this.operands[0] = "0";
                this.overwriteNumber = true;
            case this.inputState === 'missingSecondOperand' && (this.operation === this.add || this.operation === this.subtract):
                return;
        }

        const [newPrevious, lOperand, operation, rOperand] = this.getCalcStuff(
            this.inputState,
            this.operation,
            '%',
        );

        this.calculate(newPrevious, lOperand, operation, rOperand);
    }

    input(chr){
        if(!this.isValidInput(chr)){
            throw new Error(`Input ${chr} is not a valid input`);
        }

        // chr must be a valid input at this point
        if(chr in this.clearingButtons){
            this.clearingButtons[chr].call(this);
            return;
        }

        if(this.inErrorState){
            // don't allow other inputs
            return
        }

        if(chr in this.memoryButtons){
            this.memoryButtons[chr].call(this);
            return;
        }

        this.hasReadMemory = false;

        if(this.keyPadButtons.has(chr)){
            this.keyPadButtonInput(chr);
            return;
        }

        this.periodAdded = false;

        if(chr in this.unaryOperators){
            this.unaryFunction(chr);
        }

        // special behavior for division of non-zero value by 0
        if(this.operands[1] === "0" && this.operation === this.divide && this.operands[0] !== "0"){
            this.inErrorState = true;
        }

        if(chr in this.binaryOperators){
            this.binaryFunction(chr);
        }

        if(chr in this.evaluators){
            this.evaluators[chr].call(this);
        }
    }

    // consistent binary operators
    add(x, y){
        return Number(x) + Number(y) // avoid concatenating the strings
    }

    subtract(x, y){
        return this.add(x, -y)
    }

    // operators with special behavior in situation [Number [multiply/divide operation] null] + [=/%]
    multiply(x, y){
        return x * y
    }

    divide(x, y){
        return this.multiply(x, 1/y)
    }

    // unary operators 
    sqrt(x){
        return Math.sqrt(x)
    }

    plusminus(x){
        return this.multiply(-1, x)
    }
}

export default Calculator;
