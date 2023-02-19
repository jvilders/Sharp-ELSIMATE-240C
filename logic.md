# Calculator logic

What follows is an explanation of the mental model I've made of how the Sharp ELSI MATE EL-240C (henceforth just 'calculator') works. I make no guarantees that this mental model is true, only that it has not been disproven by all tests I've performed on the physical calculator so far (tests are in [js/EL240C.test.js](./js/EL240C.test.js)).

In any input snippets, for consistency with the calculator keypad, I will use `×` for multiplication and `÷` for division.

## Overview

### Display
The calculator has an 8+1 display: 8 cells that can show each show 1 digit and optionally a period, and one cell on the far-right that shows status information (memory register filled, in error state, minus sign if displayed value is negative).

### Keypad
Given the 8 digit display cells, the keypad allows entering numbers in the range [0.0000001...99999999], but only if consisting of at most 8 digits.

### Operators
Supported unary operations are:
- Plusminus
- Square root

Supported binary operations are:
- Addition
- Subtraction
- Multiplication
- Division

I won't explain the meaning of these operations here, but suffice to say they work as you expect them to.

The calculator operates on at most two operands in any of its operations. This means that entering `2 + 3 + 4 =` will not wait to carry out the sum operation until you've entered `=`. Instead it will immediately calculate `2 + 3` when you enter the subsequent `+`, displaying `7`, after which you can continue to enter `4 =` and it will calculate `7 + 4` for you.

### Evaluators
The calculator has two buttons that, when pressed in valid circumstance, will carry out an operation: `=` and `%`. As in the code, I've called these evaluators for lack of a better term. The `=` does exactly what you think it does, the `%` was puzzling to me. I initially thought it would simply multiply numbers below 1 by 100 so as to turn proportions into percentage. That's not what it does, but it is related to percentages. Its behavior depends on the operator (this is foreshadowing):

| Input | Displayed | Expanded |
|-------|----------|--------|
| 2 + 3 %  |  2.06 |  2 + (2 / 100 * 3) |
| 2 - 3 %  |  1.94 |  2 - (2 / 100 * 3) |
| 2 × 3 %  |  0.06 |  2 * (3 / 100) |
| 2 ÷ 3 %  |  66.666666 |  2 / (3 / 100) |

### Memory buttons

The calculator has a slot for a value you kan 'keep apart'. To interact with this value, there are three buttons: One to read/wipe the value (`RCM`), one to add something to the value (`M+`), and one to subtract something from the value (`M+`). To use these, you first create the value you want to add/subtract, then press the respective button. If you want to save the new value, you must always use these buttons. 

Reading the memory value and adding to it will not change the value in memory (neither will subtracting from it). The memory register beings at 0, here is an example of how it changes. Note that for this example subsequent Input lines are entered subsequently, not independently like the previous example.

| Input | Displayed | Memory | Expanded Displayed | Expanded Memory
|-------|----------|-------|--------|-------|
| 2 M+  |  2 |  2 | 0 + 2 | 0 + 2
| 2 + 3 M+ | 5 | 7 | 2 + 3 | 2 + 2 + 3

So note how the result of a calculation (`2 + 3`) and the value assigned to the memory register can be different.

### Clearing buttons

The calculator has two buttons for clearing data: Clear All (`CA`), which resets all calculator state; and Clear/Clear Entry (`CCE`), which resets only some of the calculator state. Both of these can also get the calculator out of an error state, which occurs when dividing by 0 or when calculating a number that exceeds the display's maximum value (`99999999`).

## It's more complicated than that

Everything explained so far is true, but the complexity of this calculator comes from how it is able to use previous operations and results in subsequent calculations. This is best shown with some example:

| Input | Displayed | Change |
|-------|-----------| ------- |
|2 + 3 =| 5     | +5 |
|+ =    | 8     | +3 |
| =     | 13    | +5 |
| =     | 18    | +5 |
| =     | 23    | +5 |


| Input | Displayed | Change |
|-------|-----------| ------- |
|2 + 3 =| 5     | +5 |
|- =    | -2     | -7 |
| =     | -7    | -5 |
| =     | -12    | -5 |
| =     | -17    | -5 |


| Input | Displayed | Change |
|-------|-----------| ------- |
|2 × 3 =| 6     | +6 |
|+ =    | 8     | +2 |
| =     | 14    | +6 |
| =     | 20    | +6 |
| =     | 26    | +6 |

These aren't even all combinations of operator in the first calculation and operator in the subsequent input. So far the examples have also all used the `=` evaluator, but there's a second one too of course:

| Input | Displayed | Change |
|-------|-----------| ------- |
|2 + 3 %| 2.06     | +2.06 |
|+ =    | 4.06     | +2 |
| =     | 6.12    | +2.06 |
| =     | 8.18    | +2.06 |
| =     | 10.24    | +2.06 |

Looking at just one of these examples, the logic doesn't feel too strange. For the above example it might be: 'Okay so it reuses the left operand of the first calculation (`2`), then after that it keeps adding the initial result (`2.06`). Then you try it with a different operator and the logic is different. Then you switch the evaluator and suddenly it's different even when using the same initial operator. The difficulty of this project was nailing down that internal logic of calculation and especially what does and does not matter for that logic.

## Mental model

The calculator has 6 slots where values are stored, these are:
1. Previous operation
2. Previous value (details later)
3. Left operand
4. Operation
5. Right operand
6. Memory register

I've modeled other state variables like whether the calculator is in an error state and so on, but for the calculation only all or a subset of the above 6 values are used.

A calculation always requires two operands and an operation. `2 + 3` is something the calculator can evaluate (`=`), just `2` or `2 +` is not. Yet in previous examples, such 'incomplete' inputs were used and generated results. This is possible the calculator is implicitly adding in the missing parts using information from the previous calculation. The calculator *does* only evaluate full expressions, it just makes what you entered *into* one if it has to.

Let's break down an earlier example step-by-step:
| Input | Displayed | Previous operation | Previous value | Left operand | Operation | Right operand | Memory register
|-------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
| (start) | 0   | + | 0 | null | null | null | 0
|2      | 2     | + | 0 | 2     | null | null | 0
|+      | 2     | + | 0 | 2     | + | null | 0
|3      | 3     | + | 0 | 2     | + | 3 | 0
|=      | 5     | + | 3 | 5 | null | null | 0
|+      | 5     | + | 3 | 5 | + | null | 0
| =
| (implicit) | 5     | + | 3 | 3 | + | 5 | 0
| (result)     | 8     | + | 5 | 8 | null | null | 0 
| =
| (implicit) | 8     | + | 5 | 8 | + | 5 | 0 
| (result)     | 13    | + | 5 | 13 | null | null | 0 
| =
| (implicit) | 13    | + | 5 | 13 | + | 5 | 0 
| (result)     | 18    | + | 5 | 18 | null | null | 0 
| =
| (implicit) | 18    | + | 5 | 18 | + | 5 | 0 
| (result)     | 23    | + | 5 | 23 | null | null | 0 
  
This same type of implicit 'auto-filling' is happening with other operators and with the other evaluator, but the rules are different between: In the above example on line 5 the Previous value was set to 3, the value of the left operand, but why not the right one? on line 8, why was the left operand switched to the right operand for the calculation? There is no satisfying answer to these questions, it's just how the calculator works. 

Below is the full table that documents how the calculator selects how these values should be updated between steps. Note that these values should seen as updating all at the same time. Whenever the 'Get From' column mentions, for example, 'Left operand', it is referring to the value of the *current* Left Operand before *any new values are assigned*, it will never refer to the 'new' Left operand value:

| Input State               | Evaluator | Operator | Value |  Get From
|------------               | --------- | --- | --- | --- |
| Number only               |  =*   | +/-/×/÷   | Previous value    | Previous value
| Number+operator           |  =    | +         | Previous value    | Left Operand
|                           |       |           | Left operand      | Previous Value
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand
|                           |       | -         | Previous value    | Left Operand
|                           |       |           | Left operand      | Previous Value
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand
|                           |       | ×         | Previous value    | Left Operand
|                           |       |           | Left operand      | Left Operand
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand
|                           |       | ÷         | Previous value    | Left Operand
|                           |       |           | Left operand      | 1
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand
|                           |  %    | +         | Previous value    | Left Operand
|                           |       |           | Left operand      | Left Operand / 100
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand
|                           |       | -         | Previous value    | Left Operand
|                           |       |           | Left operand      | Left Operand / 100
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand
|                           |       | ×         | Previous value    | Left Operand
|                           |       |           | Left operand      | Left Operand / 100
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand
|                           |       | ÷         | Previous value    | Left Operand
|                           |       |           | Left operand      | 1
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand / 100
| Number+operator+Number    |  =    | +         | Previous value    | Right Operand
|                           |       |           | Left operand      | Left Operand
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Right Operand
|                           |       | -         | Previous value    | Right Operand
|                           |       |           | Left operand      | Left Operand
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Right Operand
|                           |       | ×         | Previous value    | Left Operand
|                           |       |           | Left operand      | Left Operand
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Right Operand
|                           |       | ÷         | Previous value    | Right Operand
|                           |       |           | Left operand      | Left Operand
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Right Operand
|                           |  %    | +         | Previous value    | Right Operand
|                           |       |           | Left operand      | Right Operand
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand / 100 * Right Operand
|                           |       | -         | Previous value    | Left Operand
|                           |       |           | Left operand      | Left Operand
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Left Operand / 100 * Right Operand
|                           |       | ×         | Previous value    | Left Operand
|                           |       |           | Left operand      | Left Operand
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Right Operand / 100
|                           |       | ÷         | Previous value    | Right Operand
|                           |       |           | Left operand      | Left Operand
|                           |       |           | Operation         | Operation
|                           |       |           | Right operand     | Right Operand / 100

*The `%` evaluator does not operate in the 'Only Number' case so is omitted from the table.

There are other details like how the calculator truncates numbers and handles error states, but those are edge cases and are reasonably documented in the code itself. Armed with the above table and mental model you should be able to understand any observed result from the calculator. If you made it this far and you want to understand it on an even deeper level (I can't for the life of me imagine why, but that's okay), please read the source code for the implementation directly.
