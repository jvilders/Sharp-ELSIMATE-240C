import Calculator from './EL240C.js';

class calculatorInputDevice{
    constructor(calculator, debug){
        this.calculator = calculator;
        this.debug = debug;
    }

    input(s){
        this.calculator.input(s)
        if(this.debug){
            console.log(
                {
                    input: s,
                    displayed: this.calculator.displayValue,
                    previous: this.calculator.previous,
                    previousOperation: this.calculator.previousOperation,
                    operands: this.calculator.operands.toString(),
                    operation: this.calculator.operation,
                    operandDisplayed: this.calculator.operandDisplayed,
                    memoryRegister: this.calculator.memoryRegister,
                }
            );
        }
    }

    inputSequence(s){
        for(let inputChr of s.split(' ')){
            this.input(inputChr);
        }
    }
}

const calculator = new Calculator();
const inputDevice = new calculatorInputDevice(calculator);

beforeEach(() => {
    inputDevice.calculator.reset();
});

// All criterion values used in the the tests are obtained from punching in the 
// same inputs on a physical Sharp ELSI MATE EL-240C calculator.

// Note that the criterion values used in the toBe(CloseTo) methods are specified as 
// if no truncation is happening, which the calculator does apply. For operations involving 
// integers below the calculator's maximum (99999999) there is no difference, but in some tests 
// floating point values are used. In these cases the value compared to in the toBeCloseTo method 
// will deviate slightly from what the calculator shows. As these test values also illustrate 
// how the number was arrived it, I've kept them this way as much as possible.

test('throw error on invalid input', () => {
    expect(() => inputDevice.input('(')).toThrowError();
})

describe('[Number] [operator] [Number] =', () => {
    test('Addition', () => {
        inputDevice.inputSequence('2 + 3 =');
        expect(Number(calculator.displayValue)).toBe(5);
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('2 - 3 =');
        expect(Number(calculator.displayValue)).toBe(-1);
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('2 × 3 =');
        expect(Number(calculator.displayValue)).toBe(6);
    });

    test('Division', () => {
        inputDevice.inputSequence('2 ÷ 3 =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 / 3);
    });
});

describe('No history [Number] [operator] =', () => {
    // previous = 0
    test('Addition', () => {
        inputDevice.inputSequence('2 + =');
        expect(Number(calculator.displayValue)).toBe(2);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(2 + 2 + 2);
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('2 - =');
        expect(Number(calculator.displayValue)).toBe(-2);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(-2 - 2 - 2);
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('2 × =');
        expect(Number(calculator.displayValue)).toBe(4);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(4 * 2 * 2);
    });

    test('Division', () => {
        inputDevice.inputSequence('4 ÷ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 4);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 4 / 4 / 4);
    });
});

describe('With + and = history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice.inputSequence('2 + 3 ='); // previous = 3
    });

    test('Addition', () => {
        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBe(3 + 5);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(3 + 5 + 5 + 5);
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('- =');
        expect(Number(calculator.displayValue)).toBe(3 - 5);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(3 - 5 - 5 - 5);
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('× =');
        expect(Number(calculator.displayValue)).toBe(5 * 5);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(5 * 5 * 5 * 5);
    });

    test('Division', () => {
        inputDevice.inputSequence('÷ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 5);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 5 / 5 / 5);
    });
});

describe('With - and = history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice.inputSequence('2 - 3 =');
        // previous = 3
    });

    test('Addition', () => {
        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBe(3 + -1);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(3 + -1 + -1 + -1);
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('- =');
        expect(Number(calculator.displayValue)).toBe(3 - -1);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(3 - -1 - -1 - -1);
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('× =');
        expect(Number(calculator.displayValue)).toBe(-1 * -1); // special behavior, ignores previous value

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(-1 * -1 * -1 * -1);
    });

    test('Division', () => {
        inputDevice.inputSequence('÷ =');
        expect(Number(calculator.displayValue)).toBe(1 / -1); // special behavior, ignores previous number

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(1 / -1 / -1 / -1);
    });
});

describe('With × and = history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice.inputSequence('2 × 3 =');
        // previous = 2, special behavior of × to 'pick' left instead of right operand when evaluation operator is =.
    });

    test('Addition', () => {
        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBe(2 + 6);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(2 + 6 + 6 + 6);
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('- =');
        expect(Number(calculator.displayValue)).toBe(2 - 6);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(2 - 6 - 6 - 6);
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('× =');
        expect(Number(calculator.displayValue)).toBe(6 * 6); // special behavior, ignores previous number and uses first operand instead

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBe(6 * 6 * 6 * 6);
    });

    test('Division', () => {
        inputDevice.inputSequence('÷ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 6); // special behavior, ignores previous number and uses 1 instead

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 6 / 6 / 6);
    });
});

describe('With ÷ and = history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice.inputSequence('2 ÷ 3 =');
        // previous = 3
    });

    test('Addition', () => {
        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 / 3 + 3);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 / 3 + 3 + 2 / 3 + 2 / 3);
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('- =');
        expect(Number(calculator.displayValue)).toBeCloseTo(3 - 2 / 3);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(3 - 2 / 3 - 2 / 3 - 2 / 3);
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('× =');
        expect(Number(calculator.displayValue)).toBeCloseTo((2/3) ** 2);  // special behavior, ignores previous number

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo((2/3) ** 4);
    });

    test('Division', () => {
        inputDevice.inputSequence('÷ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2/3));  // special behavior, ignores previous number

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2/3) / (2/3) / (2/3));
    });
});

test('[Number] =', () => {
    inputDevice.inputSequence('2 =');
    expect(Number(calculator.displayValue)).toBe(2);

    inputDevice.input('1'); // should overwrite
    expect(Number(calculator.displayValue)).toBe(1);
});

test('No leading 0 values', () => {
    inputDevice.inputSequence('0 1');
    expect(Number(calculator.displayValue)).toBe(1);
})

test('overwrite number after =', () => {
    inputDevice.inputSequence('2 + 3 = 1');
    expect(Number(calculator.displayValue)).toBe(1);
});

describe('√', () => {
    test('test functionality', () => {
        inputDevice.inputSequence('2 + 7 ='); // previous = 7
        inputDevice.input('√');
        expect(Number(calculator.displayValue)).toBe(Math.sqrt(2 + 7));

        inputDevice.inputSequence('1 0'); // tests that the value is overwritten, not added to by inputting a number
        expect(Number(calculator.displayValue)).toBe(10);

        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBe(7 + 10);

        inputDevice.input('=');
        expect(Number(calculator.displayValue)).toBe(7 + 10 + 10);
    });

    test('truncating', () => {
        inputDevice.inputSequence('2 + 6 √');
        expect(Number(calculator.displayValue)).toBeCloseTo(Math.sqrt(6));

        inputDevice.input('=');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 + Math.sqrt(6));
    });
})

test('test square root (√)', () => {
    inputDevice.inputSequence('2 + 7 ='); // previous = 7
    inputDevice.input('√');
    expect(Number(calculator.displayValue)).toBe(Math.sqrt(2 + 7));

    inputDevice.inputSequence('1 0'); // tests that the value is overwritten, not added to by inputting a number
    expect(Number(calculator.displayValue)).toBe(10);

    inputDevice.inputSequence('+ =');
    expect(Number(calculator.displayValue)).toBe(7 + 10);

    inputDevice.input('=');
    expect(Number(calculator.displayValue)).toBe(7 + 10 + 10);
});

test('test plusminus (±)', () => {
    inputDevice.inputSequence('2 + ± ='); // result = -2, previous = -2
    expect(Number(calculator.displayValue)).toBe(-2);

    inputDevice.input('=');
    expect(Number(calculator.displayValue)).toBe(-2 + -2);
});

describe('[Number] [operator] [Number] %', () => {
    test('Addition', () => {
        inputDevice.inputSequence('2 + 3 %');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 + (2 / 100 * 3));
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('2 - 3 %');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 - (2 / 100 * 3));
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('2 × 3 %');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 * (3 / 100));
    });

    test('Division', () => {
        inputDevice.inputSequence('2 ÷ 3 %');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 / (3 / 100));
    });
});

describe('No history [Number] [operator] %', () => {
    // previous = 0
    test('Addition', () => {
        inputDevice.inputSequence('2 + %');
        expect(Number(calculator.displayValue)).toBe(2); // special behavior of %, doesn't do anything
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('2 - %');
        expect(Number(calculator.displayValue)).toBe(2); // special behavior, doesn't do anything
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('2 × %');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 * 2 / 100);
    });

    test('Division', () => {
        inputDevice.inputSequence('4 ÷ %');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 4 * 100);
    });
});

describe('With + and % history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice.inputSequence('2 + 3 %'); // previous = 2
    });

    test('Addition', () => {
        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 2.06);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 2.06 + 2.06  + 2.06);
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('- =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 2.06);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 2.06 - 2.06  - 2.06);
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('× =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2.06 * 2.06); // special behavior of ×, ignores previous number

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2.06 * 2.06 * 2.06 * 2.06);
    });

    test('Division', () => {
        inputDevice.inputSequence('÷ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 2.06); // special behavior of ÷, ignores previous number

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 2.06 / 2.06 / 2.06);
    });
});

describe('With - and % history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice.inputSequence('2 - 3 %'); // previous = 2
    });

    test('Addition', () => {
        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 1.94);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 1.94 + 1.94 + 1.94);
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('- =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 1.94);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 1.94 - 1.94 - 1.94);
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('× =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1.94 * 1.94); // special behavior, ignores previous value

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1.94 * 1.94 * 1.94 * 1.94);
    });

    test('Division', () => {
        inputDevice.inputSequence('÷ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 1.94); // special behavior, ignores previous number

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 1.94 / 1.94 / 1.94);
    });
});

describe('With × and % history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice.inputSequence('2 × 3 %'); // previous = 2, ×'s selection for previous flips if evaluation operator is %
    });

    test('Addition', () => {
        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 0.06);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 0.06 + 0.06 + 0.06);
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('- =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 0.06);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 0.06 - 0.06 - 0.06);
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('× =');
        expect(Number(calculator.displayValue)).toBeCloseTo(0.06 * 0.06);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(0.06 * 0.06 * 0.06 * 0.06);
    });

    test('Division', () => {
        inputDevice.inputSequence('÷ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 0.06);

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 0.06 / 0.06 / 0.06);
    });
});

describe('With ÷ and % history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice.inputSequence('2 ÷ 3 %'); // previous = 3, ÷'s selection for previous flips if evaluation operator is %
    });

    test('Addition', () => {
        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(3 + (2 / 3 * 100));

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(3 + (2 / 3 * 100) + (2 / 3 * 100) + (2 / 3 * 100));
    });

    test('Subtraction', () => {
        inputDevice.inputSequence('- =');
        expect(Number(calculator.displayValue)).toBeCloseTo(3 - (2 / 3 * 100));

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(3 - (2 / 3 * 100) - (2 / 3 * 100) - (2 / 3 * 100));
    });

    test('Multiplication', () => {
        inputDevice.inputSequence('× =');
        expect(Number(calculator.displayValue)).toBeCloseTo((2 / 3 * 100) ** 2);  // special behavior, ignores previous number

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(19753085, 1); // (2 / 3 * 100) ** 4 with truncation
    });

    test('Division', () => {
        inputDevice.inputSequence('÷ =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2 / 3 * 100));  // special behavior, ignores previous number

        inputDevice.inputSequence('= =');
        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2 / 3 * 100) ** 3);
    });
});

// No tests of form 'With [operator] and % history [Number] [operator] %', because the % won't do 
// anything after a + or -. If used after a × or ÷, it ignores the history, so there is 
// no point in including such test suites.

test('[Number] %', () => {
    inputDevice.inputSequence('2 %');
    expect(Number(calculator.displayValue)).toBe(0);

    inputDevice.input('1'); // should overwrite
    expect(Number(calculator.displayValue)).toBe(1); 
});


describe('.', () => {
    test('Empty .', () => {
        inputDevice.inputSequence('. 2');
        expect(Number(calculator.displayValue)).toBeCloseTo(0.2);
    });

    test('Should overwrite results', () => {
        inputDevice.inputSequence('2 = .');
        expect(Number(calculator.displayValue)).toBe(0);
    });

    test('Should be ignored when a . is already present', () => {
        inputDevice.inputSequence('1 . 2 .');
        expect(Number(calculator.displayValue)).toBeCloseTo(1.2);
    });

    test('The . should not carry across an entered operator', () => {
        inputDevice.inputSequence('2 . + 3 =');
        expect(Number(calculator.displayValue)).toBe(5);
    });

    test('Allow leading 0 values after period', () => {
        inputDevice.inputSequence('. 0 1');
        expect(Number(calculator.displayValue)).toBe(0.01);
    });
});

test('Test CA', () => {
    inputDevice.inputSequence('2 + 3 =');
    inputDevice.input('CA');
    inputDevice.inputSequence('√ 0 =') // if history was kept, this would add 3
    expect(Number(calculator.displayValue)).toBe(0);
});

describe('Test CCE', () => {
    test('[Number] CCE', () => {
        inputDevice.inputSequence('2 CCE');
        expect(Number(calculator.displayValue)).toBe(0);
    });

    test('[Number] [operator] CCE', () => {
        inputDevice.inputSequence('2 × CCE');  // which operator it is doesn't matter for this test
        expect(Number(calculator.displayValue)).toBe(0);
        expect(calculator.operation).toBeNull();
    });

    test('[Number] [operator] [Number] CCE', () => {
        inputDevice.inputSequence('2 - 3 CCE');
        expect(Number(calculator.displayValue)).toBe(2);

        // keeps operator
        inputDevice.inputSequence('3 =');
        expect(Number(calculator.displayValue)).toBe(2 - 3);
    });

    test('[Number] [operator] [Number] CCE CCE', () => {
        inputDevice.inputSequence('2 + 3 CCE CCE');
        expect(Number(calculator.displayValue)).toBe(0);
        expect(calculator.operation).toBeNull();
    });
});

describe('Memory buttons', () => {
    test('Attempting to save 0 skips calculation', () => {
        inputDevice.inputSequence('2 - 2 M+');
        inputDevice.inputSequence('+ =');

        // if using = instead of M+ (or M-), the 2 is saved as a previous value and result
        // would be 2
        expect(Number(calculator.displayValue)).toBe(0);
    });

    test('Memory operator is applied after calculation', () => {
        inputDevice.inputSequence('2 + 3 ± ='); // result = -1, previous = -3
        inputDevice.inputSequence('+ M-');
        expect(Number(calculator.displayValue)).toBe(-3 + -1);

        inputDevice.input('RCM');
        expect(Number(calculator.displayValue)).toBe(0 - (-3 + -1)); // memory value different from result value
    });

    test('Memory operation does not update display', () => {
        inputDevice.inputSequence('2 M+ M+');
        expect(Number(calculator.displayValue)).toBe(2);

        inputDevice.input('RCM');
        expect(Number(calculator.displayValue)).toBe(0 + 2 + 2);
    });

    test('Memory operation wipes previous', () => {
        inputDevice.inputSequence('2 + 3 M+');
        inputDevice.inputSequence('+ =');
        expect(Number(calculator.displayValue)).toBe(5);

        inputDevice.input('=');
        expect(Number(calculator.displayValue)).toBe(10);
    });

    test('Reading memory overwrites current operand if present', () => {
        inputDevice.inputSequence('- 2 M+');
        inputDevice.inputSequence('9 RCM');
        expect(Number(calculator.displayValue)).toBe(-2);
    })

    test('Reading preserves operation', () => {
        inputDevice.inputSequence('- 2 M+');
        inputDevice.inputSequence('9 × RCM =');
        expect(Number(calculator.displayValue)).toBe(-18);
    })
});

describe('Precision limits', () => {
    test('Disallow entering further numbers if 8 numbers are already entered', () => {
        inputDevice.inputSequence('1 2 3 4 5 6 7 8 9 =');
        expect(calculator.displayValue).toBe("12345678.");
    });

    test('Numbers below 0.0000001 become 0', () => {
        inputDevice.inputSequence('. 0 0 0 0 0 0 2 ÷ 3 =');
        expect(calculator.displayValue).toBe("0.");
    });

    test('Numbers above 99999999 drop trailing digits', () => {
        inputDevice.inputSequence('9 8 7 6 5 4 3 2 × 2 =');
        expect(calculator.displayValue).toBe("1.9753086");
    });

    test('Decimal point moves more depending on how many digits overflow', () => {
        inputDevice.inputSequence('1 2 3 4 5 6 7 8 × 1 0 0 =');
        expect(calculator.displayValue).toBe("12.345678");
    });

    test('Trailing 0 values are removed for numbers between minimum and maximum', () => {
        inputDevice.inputSequence('1 . 2 5 × 2 =');
        expect(calculator.displayValue).toBe("2.5");
    });

    test('Trailing 0 values are not removed for truncations of numbers above maximum', () => {
        inputDevice.inputSequence('1 0 0 0 0 0 0 0 × 1 0 0 =');
        expect(calculator.displayValue).toBe("10.000000");
    });
});

describe('Error state behavior', () => {
    test('Disallow input besides CA and CCE when in error state', () => {
        inputDevice.inputSequence('1 0 × 2 0 0 0 0 0 0 0 =');
        expect(calculator.inErrorState).toBe(true);

        inputDevice.inputSequence('+ =');
        expect(calculator.displayValue).toBe("2.0000000");
    });

    test('CA resets everything, including the error state', () => {
        calculator.inErrorState = true;
        inputDevice.input('CA');
        expect(calculator.inErrorState).toBe(false);
    });

    test('CCE clears error state, retains other calculator state', () => {
        inputDevice.inputSequence('2 0 0 0 0 0 0 0 × 1 0 =');  // previous = 20000000
        expect(calculator.inErrorState).toBe(true);

        inputDevice.inputSequence('CCE =');
        expect(calculator.displayValue).toBe("40000000."); // 2 * 20000000
    });


    test('Division of nonzero value by 0 also causes error state', () => {
        inputDevice.inputSequence('3 ÷ 0 =');
        expect(calculator.inErrorState).toBe(true);
    });

    test('Division of 0 value by 0 does not cause error state', () => {
        inputDevice.inputSequence('0 ÷ 0 =');
        expect(calculator.inErrorState).toBe(false);
    });

    test('Error after error', () => {
        inputDevice.inputSequence('2 0 0 0 0 0 0 0 × 1 0 0 ='); // previous = 20000000
        expect(calculator.inErrorState).toBe(true);
        expect(calculator.displayValue).toBe("20.000000");

        inputDevice.inputSequence('CCE =');
        expect(calculator.displayValue).toBe("4.0000000"); // 20 * 20000000
    });
});
