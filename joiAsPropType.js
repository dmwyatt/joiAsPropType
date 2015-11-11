export const joiSchemaAsPropType = (schema) => createChainableTypeChecker(_joiSchemaAsPropType(schema));

// get a proptype for validating that a value matches a joi schema
function _joiSchemaAsPropType(schema) {
  return (props, propName, componentName, location, propFullName) => {
    const propValue = props[propName];
    let error;
    Joi.validate(propValue, schema, (err, value) => {
      error = err;
    });
    if (error) {
      const errorMessage = `Received error at "${propFullName}" from Joi.  Value: ${propValue}. Joi error: \n${error}`;
      return new Error(errorMessage)
    }
  }
}

const ANONYMOUS = '<<anonymous>>';
const ReactPropTypeLocationNames = {
  prop: 'prop',
  context: 'context',
  childContext: 'child context'
};

/**
 * Use to create propTypes that can use the .isRequired syntax.
 *
 *  Stolen straight from FB.
 *  https://github.com/facebook/react/blob/0b29035484f428cb56e7e1c04a88f66ac020d1d4/src/isomorphic/classic/types/ReactPropTypes.js#L88
 *
 * @param validate: function
 * @returns {function(this:null)}
 */
function createChainableTypeChecker(validate) {
  function checkType(isRequired,
                     props,
                     propName,
                     componentName,
                     location,
                     propFullName) {
    componentName = componentName || ANONYMOUS;
    propFullName = propFullName || propName;
    if (props[propName] == null) {
      var locationName = ReactPropTypeLocationNames[location];
      if (isRequired) {
        return new Error(
            `Required ${locationName} \`${propFullName}\` was not specified in ` +
            `\`${componentName}\`.`
        );
      }
      return null;
    } else {
      return validate(props, propName, componentName, location, propFullName);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}
