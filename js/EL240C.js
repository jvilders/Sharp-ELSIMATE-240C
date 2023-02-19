class Calculator {
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
            'RCM': this.RCM,
            'M+': this.memoryAdd,
            'M-': this.memorySubtract,
        };

        this.evaluators = {
            '%': this.percentageEvaluation,
            '=': this.equalsEvaluation,
        };

        this.clearingButtons = {
            'CA': this.CA,
            'CCE': this.CCE,
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
        this.operands = ["0", null];
        this.operation = null;

        this.previous = "0";
        this.previousOperation = this.add;

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

    debugState(){
        return {
            displayed: this.displayValue,
            previous: this.previous,
            previousOperation: this.previousOperation,
            operands: this.operands.toString(),
            operation: this.operation,
            display: this.operandDisplayed,
        }
    }

    _isValidInput(chr){
        return this.validInputs.has(chr)
    }

    _truncateNumber(n){
        if(Math.abs(n) < (1 / (10 ** (this.MAXDIGITS - 1))) || (!isFinite(n))){
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

    CA(){
        this.reset();
    }

    CCE(){
        if(this.inErrorState){
            this.inErrorState = false;
            return;
        }

        if(this.operands[1] !== null){
            this.operands[1] = null;
            this.operandDisplayed = 0;
        } else {
            this.operands[0] = "0";
            this.operation = null;
        }
    }

    // memory functions

    RCM(){
        if(this.hasReadMemory){
            this.memoryRegister = "0";
            this.hasReadMemory = false;
            return
        }

        if(this.operands[1] === null){
            this.operation = null;
        }
        this.operands[this.operandDisplayed] = this.memoryRegister;
        this.hasReadMemory = true;
    }

    memoryAdd(){
        this._memoryOperation(this.add)
    }

    memorySubtract(){
        this._memoryOperation(this.subtract.bind(this)); // this.subtract calls this.add, needs reference to this
    }

    _memoryOperation(operator){
        if(this.operation !== null){
            let lOperand
            if(this.operands[1] === null){
                if(this.operation === this.divide){
                    lOperand = "1";
                }else if(this.operation === this.multiply){
                    lOperand = this.operands[0];
                }else{
                    lOperand = this.previous
                }
            }else{
                lOperand = this.operands[0]
            }

            const rOperand = this.operands[this.operandDisplayed];
            
            this.operands[0] = this._truncateNumber(this.operation.call(this, lOperand, rOperand));
        }
        
        this.memoryRegister =  this._truncateNumber(operator(this.memoryRegister, this.operands[0]));


        this.previous = "0";
        this.previousOperation = this.add;
        this.operandDisplayed = 0;
        this.operation = null;
        this.operands[1] = null;
        this.overwriteNumber = true;

    }

    // key pad button function

    keyPadButtonInput(chr){
        let targetOperand = this.operation === null ? 0 : 1

        if(this.operands[targetOperand]?.length - this.periodAdded === this.MAXDIGITS){
            // don't allow further inputs
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

    // unary operator function

    unaryFunction(chr){
        let targetOperand = this.operands[1] === null ? 0 : 1

        if(chr === '√' && this.operation !== null && this.operands[1] === null){
            // if after an operator, special behavior: apply sqrt to first operand, insert as second
            this.operands[1] = this._truncateNumber(this.unaryOperators['√'].call(this, this.operands[0]))
            // this.operands[1] = this.unaryOperators['√'].call(this, this.operands[0]).toString();
            this.operandDisplayed = 1;
        } else {
            this.operands[targetOperand] = this.unaryOperators[chr].call(this, this.operands[targetOperand]).toString();
        }

        this.overwriteNumber = chr === '√'
    }

    // binary operator function

    binaryFunction(chr){
        if(this.operands[1] !== null){
            this.equalsEvaluation();
        }

        this.operation = this.binaryOperators[chr];
    }

    equalsEvaluation(){
        // =

        // possible calculator states at this time:
        // 1. [Number]
        // 2. [Number operator]
        // 3. [Number operator Number]
        const selectedOperation = this.operation === null ? this.previousOperation : this.operation;
        let lOperand, rOperand, newPrevious;

        if (this.operation === null) {
            lOperand = this.operands[0];
            rOperand = this.previous;
            newPrevious = this.previous;
        } else if (this.operands[1] === null) {
            if (this.operation === this.divide) {
                lOperand = "1";
            } else if (this.operation === this.multiply) {
                lOperand = this.operands[0];
            } else {
                lOperand = this.previous
            }

            rOperand = this.operands[0]
            newPrevious = this.operands[0]
        } else {
            lOperand = this.operands[0]
            rOperand = this.operands[1]
            newPrevious = this.operation === this.multiply ? this.operands[0] : this.operands[1]
        }

        // 1: previous = rOperand
        // 2: previous = lOperand
        // 3: previous = this.operation === this.multiply ? lOperand : rOperand

        this.operands[0] = this._truncateNumber(selectedOperation.call(this, lOperand, rOperand));
        // this.operands[0] = selectedOperation.call(this, lOperand, rOperand).toString();
        this.previous = newPrevious;
        this.previousOperation = this.operation || this.previousOperation;


        this.operandDisplayed = 0;
        this.operation = null
        this.operands[1] = null;
        this.overwriteNumber = true;
    }

    percentageEvaluation(){
        // =

        // possible calculator states at this time:
        // 1. [Number]
        // 2. [Number operator]
        // 3. [Number operator Number]
        switch(true){
            case this.operation === null:
                this.operands[0] = "0";
                this.overwriteNumber = true;
            case this.operands[1] === null && (this.operation === this.add || this.operation === this.subtract):
                return;
        }

        const selectedOperation = this.operation;
        let lOperand, rOperand, newPrevious;

        if (this.operands[1] === null) {
            if (this.operation === this.divide) {
                lOperand = "1";
                rOperand = this.operands[0] / 100;
            } else {
                lOperand = this.operands[0] / 100;
                rOperand = this.operands[0]
            }

            newPrevious = this.operands[0]
        } else {
            lOperand = this.operands[0]

            if (this.operation === this.multiply){
                rOperand = this.operands[1] / 100
            } else if(this.operation === this.divide){
                rOperand = this.operands[1] / 100
            } else {
                rOperand = this.operands[0] / 100 * this.operands[1]
            }

            newPrevious = this.operation === this.divide ? this.operands[1] : this.operands[0]
        }

        this.operands[0] = this._truncateNumber(selectedOperation.call(this, lOperand, rOperand));
        // this.operands[0] = selectedOperation.call(this, lOperand, rOperand).toString();
        this.previous = newPrevious;
        this.previousOperation = this.operation

        this.operandDisplayed = 0;
        this.operation = null
        this.operands[1] = null;
        this.overwriteNumber = true;
    }


    input(chr){
        if(!this._isValidInput(chr)){
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

    // consistent operators
    add(x, y){
        return Number(x) + Number(y)
    }

    subtract(x, y){
        return this.add(x, -y)
    }

    // operators with special behavior in situation [Number [multiply/divide operation] null] + '='
    multiply(x, y){
        return Number(x) * Number(y)
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
