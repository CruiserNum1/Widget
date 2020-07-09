export const luhn = value => {
    if (/[^0-9-\s]+/.test(value)) return false;
    let nCheck = 0, bEven = false;
    value = value.replace(/\D/g, "");

    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
              nDigit = parseInt(cDigit, 10);

        if (bEven && (nDigit *= 2) > 9) nDigit -= 9;

        nCheck += nDigit;
        bEven = !bEven;
    }

    return (nCheck % 10) == 0;
}

// const to_digits = numString =>
//   numString
//     .replace(/[^0-9]/g, "")
//     .split("")
//     .map(Number);

// const condTransform = (predicate, value, fn) => {
//     if (predicate) {
//     return fn(value);
//     } else {
//     return value;
//     }
// };

// const doubleEveryOther = (current, idx) =>
//     condTransform(idx % 2 === 0, current, x => x * 2);

// const reduceMultiDigitVals = current =>
//     condTransform(current > 9, current, x => x - 9);

// export const luhn = numString => {
//     const digits = to_digits(numString);
//     const len = digits.length;
//     const luhn_digit = digits[len - 1];

//     const total = digits
//         .slice(0, -1)
//         .reverse()
//         .map(doubleEveryOther)
//         .map(reduceMultiDigitVals)
//         .reduce((current, accumulator) => current + accumulator, luhn_digit);

//     return total % 10 === 0;
// };