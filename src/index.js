import React, { Component } from 'react';
import PropTypes from 'prop-types';

const stringOrElement = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.element,
]);
const objectOfStringOrElement = PropTypes.objectOf(stringOrElement);

const getClassNameOrStyleProps = (classNameOrStyle, componentState) => {
  if (classNameOrStyle === null) {
    return {};
  }
  if (typeof classNameOrStyle === 'function') {
    // eslint-disable-next-line no-param-reassign
    classNameOrStyle = classNameOrStyle.call(null, {
      narrow: componentState.narrow,
    });
  }
  if (typeof classNameOrStyle === 'string') {
    return { className: classNameOrStyle };
  }
  if (typeof classNameOrStyle === 'object') {
    return { style: classNameOrStyle };
  }
  return {};
};

const inBrowser = typeof window !== 'undefined';
const matchMedia = inBrowser && window.matchMedia !== null;

class HyperResponsiveTable extends Component {
  static propTypes = {
    headers: objectOfStringOrElement.isRequired,
    rows: PropTypes.arrayOf(objectOfStringOrElement).isRequired,
    breakpoint: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    keyGetter: PropTypes.func.isRequired,
    tableStyling: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.func,
    ]),
    initialNarrow: PropTypes.bool,
  };

  static defaultProps = {
    initialNarrow: false,
    tableStyling: null,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      narrow: props.initialNarrow,
    };
  }

  componentWillMount() {
    if (inBrowser) {
      this.updateQuery(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.updateQuery(nextProps);
  }

  componentWillUnmount() {
    const { mql } = this.state;
    if (mql) {
      mql.removeListener(this.handleMatch);
    }
  }

  updateQuery = (props) => {
    let mql;
    // Default to wide view for ancient browsers.
    let narrow = false;
    const { breakpoint } = props;
    if (matchMedia) {
      mql = window.matchMedia(typeof breakpoint === 'string' ? breakpoint : `screen and (min-width: ${breakpoint}px)`);
      mql.addListener(this.handleMatch);
      narrow = !mql.matches;
    }

    this.setState((state) => {
      if (state.mql) {
        state.mql.removeListener(this.handleMatch);
      }

      return { mql, narrow };
    });
  };

  handleMatch = (mql) => {
    this.setState((state) => {
      if (state.narrow === mql.matches) {
        return {
          ...state,
          narrow: !mql.matches,
        };
      }
      return state;
    });
  };

  render() {
    const {
      tableStyling,
      headers,
      rows,
      keyGetter,
    } = this.props;
    const { narrow } = this.state;

    const dataKeys = Object.keys(headers);

    if (narrow) {
      return (
        <table {...getClassNameOrStyleProps(tableStyling, this.state)}>
          {rows.map(row => (
            <tbody key={keyGetter(row)}>
              {dataKeys.map(key => <tr key={key}><th scope="row">{headers[key]}</th><td>{row[key]}</td></tr>)}
            </tbody>))
          }
        </table>);
    }

    return (
      <table {...getClassNameOrStyleProps(tableStyling, this.state)}>
        <thead>
          <tr>
            { dataKeys.map(key => <th key={key} scope="col">{headers[key]}</th>) }
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={keyGetter(row)}>
              {dataKeys.map(key => <td key={key}>{row[key]}</td>)}
            </tr>))}
        </tbody>
      </table>);
  }
}

export default HyperResponsiveTable;
