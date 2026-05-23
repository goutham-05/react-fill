export const allowDigitsOrBlank = {
  allowedPattern: /^[0-9]*$/,
  validation: {
    pattern: {
      value: /^$|^[0-9]+$/,
      message: "Only numbers are allowed"
    }
  }
};

export const allowPositiveIntegersOnly = {
  allowedPattern: /^[0-9]*$/,
  validation: {
    pattern: {
      value: /^[1-9][0-9]*$/,
      message: "Only numbers greater than 0 are allowed"
    }
  }
};

export const allowPercentRange1to99 = {
  allowedPattern: /^[0-9]*$/,
  validation: {
    pattern: {
      value: /^(?:[1-9][0-9]?|0?[1-9])$/,
      message: "Enter a number greater than 0 and less than 100"
    }
  }
};
