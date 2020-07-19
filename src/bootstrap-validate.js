import isFunction from "lodash/isFunction";
import flatten from "lodash/flatten";
import rules from "./rules";
import feedback from "./errors";
import { SEPARATOR_OPTION, SEPARATOR_RULE, LISTENER } from "./constants";

module.exports = (input, string, callback) => {
  // 全部的数组，input 代表所有检测的组件
  const obj = {
    feedback,
    rules,
    inputs: []
  };

  // Normalize the input parameter to a flat array.
  flatten([input]).forEach(element => {
    // Check for either element or selector.
    element = element.nodeType ? element : document.querySelector(element);
    // eslint-disable-next-line no-underscore-dangle
    const _input = {
      ele: element,
      rules: []
    };
    string.split(SEPARATOR_RULE).forEach(rule => {
      // eslint-disable-next-line no-underscore-dangle
      const _rule = {
        ruleName: "",
        errorText: "",
        validity: "",
        options: ""
      };

      // get an array of [rule, option1, ...]
      let options = rule.split(SEPARATOR_OPTION);
      // Take rule name from options.
      const ruleName = options.shift();
      // Take Error Text from options.
      const errorText = options.pop();
      // Sometimes, we need to take special care of options.
      // Allow the use of the colon in the regex options.
      if (ruleName === "regex") {
        // Reduce the options array to its first and last element.
        options = [options.join(SEPARATOR_OPTION)];
      }

      // invoke the rule, returning boolean
      // const validity = rules[ruleName](element, ...options);

      // DOM Manipulations to toggle errors.
      // feedback(element, ruleName, validity, errorText);

      _rule.errorText = errorText;
      // _rule.validity = validity;
      _rule.ruleName = ruleName;
      _rule.options = options;
      _input.rules.push(_rule);
      // optionally invoke the callback.
      // if (isFunction(callback)) callback(validity, ruleName);
    });

    obj.inputs.push(_input);

    element.addEventListener(LISTENER, () => {
      // Let's extract the rules off of the given rule argument.
      string.split(SEPARATOR_RULE).forEach(rule => {
        // get an array of [rule, option1, ...]
        let options = rule.split(SEPARATOR_OPTION);
        // Take rule name from options.
        const ruleName = options.shift();
        // Take Error Text from options.
        const errorText = options.pop();
        // Sometimes, we need to take special care of options.
        // Allow the use of the colon in the regex options.
        if (ruleName === "regex") {
          // Reduce the options array to its first and last element.
          options = [options.join(SEPARATOR_OPTION)];
        }

        // invoke the rule, returning boolean
        const validity = rules[ruleName](element, ...options);

        // DOM Manipulations to toggle errors.
        feedback(element, ruleName, validity, errorText);
        // optionally invoke the callback.
        if (isFunction(callback)) callback(validity, ruleName);
      });
    });
  });

  // eslint-disable-next-line func-names
  obj.validate = function() {
    const info = {
      errorText: "",
      vali: null
    };
    obj.inputs.forEach(_input => {
      _input.rules.forEach(_rule => {
        // eslint-disable-next-line prefer-destructuring
        const ruleName = _rule.ruleName;
        // eslint-disable-next-line prefer-destructuring
        const errorText = _rule.errorText;
        // const validity = _rule.validity
        // eslint-disable-next-line prefer-destructuring
        const options = _rule.options;
        // eslint-disable-next-line prefer-destructuring
        const validity = rules[ruleName](_input.ele, ...options);
        feedback(_input.ele, ruleName, validity, errorText);
        if (validity === false) {
          // break;
          info.vali = false;
          info.errorText = errorText;
        } else if (info.vali === null) {
          info.vali = true;
        }
      });
    });
    return info;
  };

  return obj;
};

export default module.exports;
