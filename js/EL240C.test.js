import Calculator from './EL240C.js';

function calculatorInput(calculator, debug){
    function inner(input){
        calculator.input(input);
        if(debug){
            console.log({input, ...calculator.debugState()});
        }
    }
    return inner;
}

let calculator = new Calculator();
let inputDevice = calculatorInput(calculator);


beforeEach(() => {
    calculator.reset();
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
    expect(() => inputDevice('(')).toThrowError();
})

describe('[Number] [operator] [Number] =', () => {
    test('Addition', () => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('3');
        inputDevice('=');

        // previous = 3, unused

        expect(Number(calculator.displayValue)).toBe(5);
    });

    test('Subtraction', () => {
        inputDevice('2');
        inputDevice('-');
        inputDevice('3');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(-1);
    });

    test('Multiplication', () => {
        inputDevice('2');
        inputDevice('×');
        inputDevice('3');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(6);
    });

    test('Division', () => {
        inputDevice('2');
        inputDevice('÷');
        inputDevice('3');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 / 3);
    });
});

describe('No history [Number] [operator] =', () => {
    // previous = 0
    test('Addition', () => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(2);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(2 + 2 + 2);
    });

    test('Subtraction', () => {
        inputDevice('2');
        inputDevice('-');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(-2);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(-2 - 2 - 2);
    });

    test('Multiplication', () => {
        inputDevice('2');
        inputDevice('×');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(4);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(4 * 2 * 2);
    });

    test('Division', () => {
        inputDevice('4');
        inputDevice('÷');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 4);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 4 / 4 / 4);
    });
});

describe('With + and = history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('3');
        inputDevice('=');

        // previous = 3
    });

    test('Addition', () => {
        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(3 + 5);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(3 + 5 + 5 + 5);
    });

    test('Subtraction', () => {
        inputDevice('-');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(3 - 5);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(3 - 5 - 5 - 5);
    });

    test('Multiplication', () => {
        inputDevice('×');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(5 * 5);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(5 * 5 * 5 * 5);
    });

    test('Division', () => {
        inputDevice('÷');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 5);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 5 / 5 / 5);
    });
});

describe('With - and = history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice('2');
        inputDevice('-');
        inputDevice('3');
        inputDevice('=');

        // previous = 3
    });

    test('Addition', () => {
        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(3 + -1);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(3 + -1 + -1 + -1);
    });

    test('Subtraction', () => {
        inputDevice('-');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(3 - -1);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(3 - -1 - -1 - -1);
    });

    test('Multiplication', () => {
        inputDevice('×');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(-1 * -1); // special behavior, ignores previous value

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(-1 * -1 * -1);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(-1 * -1 * -1 * -1);
    });

    test('Division', () => {
        inputDevice('÷');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(1 / -1); // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(1 / -1 / -1);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(1 / -1 / -1 / -1);
    });
});

describe('With × and = history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice('2');
        inputDevice('×');
        inputDevice('3');
        inputDevice('=');

        // previous = 2, special behavior of ×
    });

    test('Addition', () => {
        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(2 + 6);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(2 + 6 + 6 + 6);
    });

    test('Subtraction', () => {
        inputDevice('-');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(2 - 6);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(2 - 6 - 6 - 6);
    });

    test('Multiplication', () => {
        inputDevice('×');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(6 * 6); // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(6 * 6 * 6);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(6 * 6 * 6 * 6);
    });

    test('Division', () => {
        inputDevice('÷');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 6); // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 6 / 6);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 6 / 6 / 6);
    });
});

describe('With ÷ and = history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice('2');
        inputDevice('÷');
        inputDevice('3');
        inputDevice('=');

        // previous = 3
    });

    test('Addition', () => {
        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 / 3 + 3);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 / 3 + 3 + 2 / 3 + 2 / 3);
    });

    test('Subtraction', () => {
        inputDevice('-');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(3 - 2 / 3);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(3 - 2 / 3 - 2 / 3 - 2 / 3);
    });

    test('Multiplication', () => {
        inputDevice('×');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo((2/3) ** 2);  // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo((2/3) ** 3);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo((2/3) ** 4);
    });

    test('Division', () => {
        inputDevice('÷');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2/3));  // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2/3) / (2/3));

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2/3) / (2/3) / (2/3));
    });
});

test('[Number] =', () => {
    inputDevice('2');
    inputDevice('=');

    expect(Number(calculator.displayValue)).toBe(2);

    inputDevice('1');

    expect(Number(calculator.displayValue)).toBe(1); // should have overwritten
});

test('No leading 0 values', () => {
    inputDevice('0');
    inputDevice('1');

    expect(Number(calculator.displayValue)).toBe(1);
})

test('overwrite number after =', () => {
    inputDevice('2');
    inputDevice('+');
    inputDevice('3');
    inputDevice('=');
    inputDevice('1');

    expect(Number(calculator.displayValue)).toBe(1);
});

test('test square root (√)', () => {
    inputDevice('2');
    inputDevice('+');
    inputDevice('7'); // previous = 7
    inputDevice('='); // 9
    inputDevice('√'); // 3

    expect(Number(calculator.displayValue)).toBe(3);

    inputDevice('1'); // tests that the value is overwritten, not added to by inputting a number
    inputDevice('0');

    expect(Number(calculator.displayValue)).toBe(10);

    inputDevice('+');
    inputDevice('='); // 17

    expect(Number(calculator.displayValue)).toBe(17);

    inputDevice('='); // 27

    expect(Number(calculator.displayValue)).toBe(27);
});

test('test plusminus (±)', () => {
    inputDevice('2');
    inputDevice('+');
    inputDevice('±'); // modifies number before operator
    inputDevice('='); // 0 + -2, previous = -2

    expect(Number(calculator.displayValue)).toBe(-2);

    inputDevice('='); // -4

    expect(Number(calculator.displayValue)).toBe(-2 + -2);
});

describe('[Number] [operator] [Number] %', () => {
    test('Addition', () => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('3');
        inputDevice('%');

        // previous = 2, unused

        expect(Number(calculator.displayValue)).toBeCloseTo(2 + (2 / 100 * 3));
    });

    test('Subtraction', () => {
        inputDevice('2');
        inputDevice('-');
        inputDevice('3');
        inputDevice('%');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 - (2 / 100 * 3));
    });

    test('Multiplication', () => {
        inputDevice('2');
        inputDevice('×');
        inputDevice('3');
        inputDevice('%');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 * (3 / 100));
    });

    test('Division', () => {
        inputDevice('2');
        inputDevice('÷');
        inputDevice('3');
        inputDevice('%');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 / (3 / 100));
    });
});

describe('No history [Number] [operator] %', () => {
    // previous = 0
    test('Addition', () => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('%');

        expect(Number(calculator.displayValue)).toBe(2); // special behavior, doesn't do anything
    });

    test('Subtraction', () => {
        inputDevice('2');
        inputDevice('-');
        inputDevice('%');

        expect(Number(calculator.displayValue)).toBe(2); // special behavior, doesn't do anything
    });

    test('Multiplication', () => {
        inputDevice('2');
        inputDevice('×');
        inputDevice('%');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 * 2 / 100);
    });

    test('Division', () => {
        inputDevice('4');
        inputDevice('÷');
        inputDevice('%');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 4 * 100);
    });
});

describe('With + and % history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('3');
        inputDevice('%');

        // previous = 2
    });

    test('Addition', () => {
        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 2.06);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 2.06 + 2.06  + 2.06);
    });

    test('Subtraction', () => {
        inputDevice('-');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 2.06);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 2.06 - 2.06  - 2.06);
    });

    test('Multiplication', () => {
        inputDevice('×');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2.06 * 2.06); // special behavior of ×, ignores previous number

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2.06 * 2.06 * 2.06 * 2.06);
    });

    test('Division', () => {
        inputDevice('÷');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 2.06); // special behavior of ÷, ignores previous number

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 2.06 / 2.06 / 2.06);
    });
});

describe('With - and % history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice('2');
        inputDevice('-');
        inputDevice('3');
        inputDevice('%');

        // previous = 2
    });

    test('Addition', () => {
        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 1.94);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 1.94 + 1.94 + 1.94);
    });

    test('Subtraction', () => {
        inputDevice('-');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 1.94);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 1.94 - 1.94 - 1.94);
    });

    test('Multiplication', () => {
        inputDevice('×');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1.94 * 1.94); // special behavior, ignores previous value

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1.94 * 1.94 * 1.94);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1.94 * 1.94 * 1.94 * 1.94);
    });

    test('Division', () => {
        inputDevice('÷');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 1.94); // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 1.94 / 1.94);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 1.94 / 1.94 / 1.94);
    });
});

describe('With × and % history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice('2');
        inputDevice('×');
        inputDevice('3');
        inputDevice('%');

        // previous = 2
    });

    test('Addition', () => {
        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 0.06);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 + 0.06 + 0.06 + 0.06);
    });

    test('Subtraction', () => {
        inputDevice('-');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 0.06);

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(2 - 0.06 - 0.06 - 0.06);
    });

    test('Multiplication', () => {
        inputDevice('×');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(0.06 * 0.06); // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(0.06 * 0.06 * 0.06);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(0.06 * 0.06 * 0.06 * 0.06);
    });

    test('Division', () => {
        inputDevice('÷');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 0.06); // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 0.06 / 0.06);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / 0.06 / 0.06 / 0.06);
    });
});

describe('With ÷ and % history [Number] [operator] =', () => {
    beforeEach(() => {
        inputDevice('2');
        inputDevice('÷');
        inputDevice('3');
        inputDevice('%');

        // previous = 3, special behavior of ÷ if using %.
    });

    test('Addition', () => {
        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(3 + (2 / 3 * 100));

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(3 + (2 / 3 * 100) + (2 / 3 * 100) + (2 / 3 * 100));
    });

    test('Subtraction', () => {
        inputDevice('-');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(3 - (2 / 3 * 100));

        inputDevice('=');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(3 - (2 / 3 * 100) - (2 / 3 * 100) - (2 / 3 * 100));
    });

    test('Multiplication', () => {
        inputDevice('×');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo((2 / 3 * 100) ** 2);  // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo((2 / 3 * 100) ** 3, 1);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(19753085, 1); // (2 / 3 * 100) ** 4 with truncation
    });

    test('Division', () => {
        inputDevice('÷');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2 / 3 * 100));  // special behavior, ignores previous number

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2 / 3 * 100) ** 2);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBeCloseTo(1 / (2 / 3 * 100) ** 3);
    });
});

// No tests of form ''With + and % history [Number] [operator] %', because the % won't do 
// anything after a + or -. If used after a × or ÷, it ignores the history, so there is 
// no point in including such test suites.

test('[Number] %', () => {
    inputDevice('2');
    inputDevice('%');

    expect(Number(calculator.displayValue)).toBe(0);

    inputDevice('1');

    expect(Number(calculator.displayValue)).toBe(1); // should have overwritten
});


describe('.', () => {
    test('Empty .', () => {
        inputDevice('.');
        inputDevice('2');

        expect(Number(calculator.displayValue)).toBeCloseTo(0.2);
    });

    test('Should overwrite results', () => {
        inputDevice('2');
        inputDevice('=');
        inputDevice('.');

        expect(Number(calculator.displayValue)).toBe(0);
    });

    test('Should be ignored when a . is already present', () => {
        inputDevice('1');
        inputDevice('.');
        inputDevice('2');
        inputDevice('.');

        expect(Number(calculator.displayValue)).toBeCloseTo(1.2);
    });

    test('The . should not carry across an entered operator', () => {
        inputDevice('2');
        inputDevice('.');
        inputDevice('+');
        inputDevice('3');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(5);
    });

    test('Allow leading 0 values after period', () => {
        inputDevice('.');
        inputDevice('0');
        inputDevice('1');

        expect(Number(calculator.displayValue)).toBe(0.01);
    });
});

test('Test CA', () => {
    inputDevice('2');
    inputDevice('+');
    inputDevice('3');
    inputDevice('=');

    inputDevice('CA');

    inputDevice('√'); // allow overwriting first operand
    inputDevice('0');
    inputDevice('='); // if history was kept, this would add 3

    expect(Number(calculator.displayValue)).toBe(0);
});

describe('Test CCE', () => {
    test('[Number] CCE', () => {
        inputDevice('2');
        inputDevice('CCE');

        expect(Number(calculator.displayValue)).toBe(0);
    });

    test('[Number] [operator] CCE', () => {
        inputDevice('2');
        inputDevice('×'); // operator doesn't matter for this test
        inputDevice('CCE');

        expect(Number(calculator.displayValue)).toBe(0);
        expect(calculator.operation).toBeNull();
    });

    test('[Number] [operator] [Number] CCE', () => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('3');
        inputDevice('CCE');

        expect(Number(calculator.displayValue)).toBe(2);

        // keeps operator
        inputDevice('3');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(5);
    });

    test('[Number] [operator] [Number] CCE CCE', () => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('3');
        inputDevice('CCE');
        inputDevice('CCE');

        expect(Number(calculator.displayValue)).toBe(0);
        expect(calculator.operation).toBeNull();
    });
});

describe('Memory buttons', () => {
    test('Attempting to save 0 skips calculation', () => {
        inputDevice('2');
        inputDevice('-');
        inputDevice('2');
        inputDevice('M+');

        inputDevice('+');
        inputDevice('=');

        // if using = instead of M+ (or M-), the 2 is saved as a previous value and result
        // would be 2
        expect(Number(calculator.displayValue)).toBe(0);
    });

    test('Memory operator applied after calculation', () => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('3');
        inputDevice('±');
        inputDevice('='); // display = -1, previous = -3

        inputDevice('+');
        inputDevice('M-');

        expect(Number(calculator.displayValue)).toBe(-3 + -1);

        inputDevice('RCM');

        expect(Number(calculator.displayValue)).toBe(0 - (-3 + -1));
    });

    test('Memory operation does not update display', () => {
        inputDevice('2');
        inputDevice('M+'); // memory = 2
        inputDevice('M+');

        expect(Number(calculator.displayValue)).toBe(2);

        inputDevice('RCM');

        expect(Number(calculator.displayValue)).toBe(4);
    });

    test('Memory operation wipes previous', () => {
        inputDevice('2');
        inputDevice('+');
        inputDevice('3');
        inputDevice('M+');

        inputDevice('+');
        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(5);

        inputDevice('=');

        expect(Number(calculator.displayValue)).toBe(10);
    });
});

describe('Precision limits', () => {
    test('Disallow entering further numbers if 8 numbers are already entered', () => {
        inputDevice('1');
        inputDevice('2');
        inputDevice('3');
        inputDevice('4');
        inputDevice('5');
        inputDevice('6');
        inputDevice('7');
        inputDevice('8');
        inputDevice('9');
        inputDevice('=');

        expect(calculator.displayValue).toBe("12345678.");
    });

    test('Numbers below 0.0000001 become 0', () => {
        inputDevice('.');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('2');

        inputDevice('÷');
        inputDevice('3');
        inputDevice('=');

        expect(calculator.displayValue).toBe("0.");
    });

    test('Numbers above 99999999 drop trailing digits', () => {
        inputDevice('9');
        inputDevice('8');
        inputDevice('7');
        inputDevice('6');
        inputDevice('5');
        inputDevice('4');
        inputDevice('3');
        inputDevice('2');

        inputDevice('×');
        inputDevice('2');
        inputDevice('=');

        expect(calculator.displayValue).toBe("1.9753086");
    });

    test('Decimal point moves more depending on how many digits overflow', () => {
        inputDevice('1');
        inputDevice('2');
        inputDevice('3');
        inputDevice('4');
        inputDevice('5');
        inputDevice('6');
        inputDevice('7');
        inputDevice('8');

        inputDevice('×');
        inputDevice('1');
        inputDevice('0');
        inputDevice('0');
        inputDevice('=');

        expect(calculator.displayValue).toBe("12.345678");
    });

    test('Trailing 0 values are removed for numbers between minimum and maximum', () => {
        inputDevice('1');
        inputDevice('.');
        inputDevice('2');
        inputDevice('5');

        inputDevice('×');
        inputDevice('2');
        inputDevice('=');

        expect(calculator.displayValue).toBe("2.5");
    });

    test('Trailing 0 values are not removed for truncations of numbers above maximum', () => {
        inputDevice('1');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');

        inputDevice('×');
        inputDevice('1');
        inputDevice('0');
        inputDevice('0');
        inputDevice('=');

        expect(calculator.displayValue).toBe("10.000000");
    });
});

describe('Error state behavior', () => {
    test('Disallow input besides CA and CCE when in error state', () => {
        inputDevice('1');
        inputDevice('0');

        inputDevice('×');

        inputDevice('2');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');

        inputDevice('=');

        expect(calculator.inErrorState).toBe(true);

        inputDevice('+');
        inputDevice('=');

        expect(calculator.displayValue).toBe("2.0000000");
    });

    test('CA resets everything, including the error state', () => {
        calculator.inErrorState = true;
        inputDevice('CA');

        expect(calculator.inErrorState).toBe(false);
    });

    test('CCE clears error state, retains other calculator state', () => {
        inputDevice('2');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');

        inputDevice('×');
        inputDevice('1');
        inputDevice('0');
        inputDevice('='); // previous = 20000000

        expect(calculator.inErrorState).toBe(true);

        inputDevice('CCE');

        inputDevice('=');

        expect(calculator.displayValue).toBe("40000000.");
    });


    test('Division of nonzero value by 0 also causes error state', () => {
        inputDevice('3');
        inputDevice('÷');
        inputDevice('0');
        inputDevice('=');

        expect(calculator.inErrorState).toBe(true);
    });

    test('Division of 0 value by 0 does not cause error state', () => {
        inputDevice('0');
        inputDevice('÷');
        inputDevice('0');
        inputDevice('=');

        expect(calculator.inErrorState).toBe(false);
    });

    test('Error after error', () => {
        inputDevice('2');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');
        inputDevice('0');

        inputDevice('×');

        inputDevice('1');
        inputDevice('0');
        inputDevice('0');

        inputDevice('='); // previous = 20000000

        expect(calculator.inErrorState).toBe(true);
        expect(calculator.displayValue).toBe("20.000000");

        inputDevice('CCE');

        inputDevice('=');

        expect(calculator.displayValue).toBe("4.0000000");
    });
});
