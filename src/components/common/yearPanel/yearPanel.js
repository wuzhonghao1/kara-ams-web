import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './yearPanel.less'
import DecadePanel from './DecadePanel';
let _extends2 = require('babel-runtime/helpers/extends');

let _extends3 = _interopRequireDefault(_extends2);

let _pt_PT = require('rc-calendar/lib/locale/pt_PT');

let _pt_PT2 = _interopRequireDefault(_pt_PT);

let _pt_PT3 = require('./pt_PT');

let _pt_PT4 = _interopRequireDefault(_pt_PT3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// Merge into a locale object
let locale = {
    lang: (0, _extends3['default'])({}, _pt_PT2['default'], { placeholder: 'Data', rangePlaceholder: ['Data inicial', 'Data final'], today: 'Hoje', now: 'Agora', backToToday: 'Hoje', ok: 'Ok', clear: 'Limpar', month: 'Mês', year: 'Ano', timeSelect: 'Hora', dateSelect: 'Selecionar data', monthSelect: 'Selecionar mês', yearSelect: 'Selecionar ano', decadeSelect: 'Selecionar década', yearFormat: 'YYYY', dateFormat: 'D/M/YYYY', dayFormat: 'D', dateTimeFormat: 'D/M/YYYY HH:mm:ss', monthFormat: 'MMMM', monthBeforeYear: false, previousMonth: 'Mês anterior (PageUp)', nextMonth: 'Mês seguinte (PageDown)', previousYear: 'Ano anterior (Control + left)', nextYear: 'Ano seguinte (Control + right)', previousDecade: 'Última década', nextDecade: 'Próxima década', previousCentury: 'Último século', nextCentury: 'Próximo século' }),
    timePickerLocale: (0, _extends3['default'])({}, _pt_PT4['default'], { placeholder: 'Hora' })
};
var ROW = 4;
var COL = 3;

function goYear(direction) {
  let value = this.state.value + direction;
  this.setState({
    value: value
  });
}

function chooseYear(year) {
  this.props.onSelect(year);
}

var YearPanel = function (_React$Component) {
  _inherits(YearPanel, _React$Component);

  function YearPanel(props) {
    _classCallCheck(this, YearPanel);

    var _this = _possibleConstructorReturn(this, (YearPanel.__proto__ || Object.getPrototypeOf(YearPanel)).call(this, props));

    _this.prefixCls = props.rootPrefixCls + '-year-panel';
    _this.state = {
      value: props.value || props.defaultYear
    };
    _this.nextDecade = goYear.bind(_this, 10);
    _this.previousDecade = goYear.bind(_this, -10);
    ['onDecadePanelSelect'].forEach(function (method) {
      _this[method] = _this[method].bind(_this);
    });
    return _this;
  }

  _createClass(YearPanel, [{
    key: 'onDecadePanelSelect',
    value: function onDecadePanelSelect(current) {
      this.setState({
        value: current,
        showDecadePanel: 0
      });
    }
  }, {
    key: 'years',
    value: function years() {
      var currentYear = this.state.value;
      var startYear = parseInt(currentYear / 10, 10) * 10;
      var previousYear = startYear - 1;
      var years = [];
      var index = 0;
      for (var rowIndex = 0; rowIndex < ROW; rowIndex++) {
        years[rowIndex] = [];
        for (var colIndex = 0; colIndex < COL; colIndex++) {
          var year = previousYear + index;
          var content = String(year);
          years[rowIndex][colIndex] = {
            content: content,
            year: year,
            title: content
          };
          index++;
        }
      }
      return years;
    }
  },  {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var props = this.props;
      var years = this.years();
      var currentYear = this.state.value;
      var startYear = parseInt(currentYear / 10, 10) * 10;
      var endYear = startYear + 9;
      var prefixCls = this.prefixCls;

      var yeasEls = years.map(function (row, index) {
        var tds = row.map(function (yearData) {
          var _classNameMap;

          var classNameMap = (_classNameMap = {}, _defineProperty(_classNameMap, prefixCls + '-cell', 1), _defineProperty(_classNameMap, prefixCls + '-selected-cell', yearData.year === currentYear), _defineProperty(_classNameMap, prefixCls + '-last-decade-cell', yearData.year < startYear), _defineProperty(_classNameMap, prefixCls + '-next-decade-cell', yearData.year > endYear), _classNameMap);
          var clickHandler = void 0;
          if (yearData.year < startYear) {
            clickHandler = _this2.previousDecade;
          } else if (yearData.year > endYear) {
            clickHandler = _this2.nextDecade;
          } else {
            clickHandler = chooseYear.bind(_this2, yearData.year);
          }
          return React.createElement(
            'td',
            {
              role: 'gridcell',
              title: yearData.title,
              key: yearData.content,
              onClick: clickHandler,
              className: classnames(classNameMap)
            },
            React.createElement(
              'a',
              {
                className: prefixCls + '-year'
              },
              yearData.content
            )
          );
        });
        return React.createElement(
          'tr',
          { key: index, role: 'row' },
          tds
        );
      });

      var decadePanel = void 0;
      if (this.state.showDecadePanel) {
        decadePanel = React.createElement(DecadePanel, {
          locale: locale,
          value: this.state.value,
          rootPrefixCls: props.rootPrefixCls,
          onSelect: this.onDecadePanelSelect
        });
      }

      return React.createElement(
        'div',
        { className: this.prefixCls + ' fix-year-panel' + ' ' + this.props.bodyRef },
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { className: prefixCls + '-header' },
            React.createElement('a', {
              className: prefixCls + '-prev-decade-btn',
              role: 'button',
              onClick: this.previousDecade,
              title: locale.previousDecade
            }),
            React.createElement(
              'a',
              {
                className: prefixCls + '-decade-select',
                role: 'button',
                onClick: ()=>{},
                title: locale.decadeSelect
              },
              React.createElement(
                'span',
                { className: prefixCls + '-decade-select-content' },
                startYear,
                '-',
                endYear
              ),
              React.createElement(
                'span',
                { className: prefixCls + '-decade-select-arrow' },
                'x'
              )
            ),
            React.createElement('a', {
              className: prefixCls + '-next-decade-btn',
              role: 'button',
              onClick: this.nextDecade,
              title: locale.nextDecade
            })
          ),
          React.createElement(
            'div',
            { className: prefixCls + '-body'},
            React.createElement(
              'table',
              { className: prefixCls + '-table', cellSpacing: '0', role: 'grid' },
              React.createElement(
                'tbody',
                { className: prefixCls + '-tbody' },
                yeasEls
              )
            )
          )
        ),
        decadePanel
      );
    }
  }]);

  return YearPanel;
}(React.Component);

export default YearPanel;

YearPanel.propTypes = {
  rootPrefixCls: PropTypes.string,
  value: PropTypes.number,
  defaultYear: PropTypes.number
};

YearPanel.defaultProps = {
  rootPrefixCls: 'ant-calendar',
  defaultYear: new Date().getFullYear(),
  onSelect: function onSelect() {}
};