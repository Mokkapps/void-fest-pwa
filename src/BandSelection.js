import React, { Component, Fragment } from 'react';
import { Checkbox, Divider } from 'antd';

import lineup from './lineup-2018.json';

const BAND_SELECTION_LS_KEY = 'VOID_FEST_BAND_SELECTION';
const CheckboxGroup = Checkbox.Group;

class BandSelection extends Component {
  constructor(props) {
    super(props);

    const defaultLineupValues = {};

    const addValueToEvent = (lineupDay, valuePrefix) => {
      for (const stage in lineupDay) {
        if (Object.prototype.hasOwnProperty.call(lineupDay, stage)) {
          const stageShort = stage === 'MAIN_STAGE' ? 'm_s' : 't_s';
          let count = 0;
          for (const event of lineupDay[stage]) {
            const value = `${valuePrefix}_${stageShort}_${count}`;
            defaultLineupValues[value] = false;
            event.value = value;
            count += 1;
          }
        }
      }
    };

    for (const day in lineup) {
      if (Object.prototype.hasOwnProperty.call(lineup, day)) {
        switch (day) {
          case 'FRIDAY':
            addValueToEvent(lineup.FRIDAY, 'fr');
            break;
          case 'SATURDAY':
            addValueToEvent(lineup.SATURDAY, 'sa');
            break;
          default:
            break;
        }
      }
    }

    const storedBandSelection = localStorage.getItem(BAND_SELECTION_LS_KEY);

    this.state = {
      bandSelectionValues: storedBandSelection ? JSON.parse(storedBandSelection) : defaultLineupValues
    };
  }

  getCheckboxDefaultValues = eventArr => {
    const { bandSelectionValues } = this.state;
    return eventArr.map(event => event.value).filter(value => bandSelectionValues[value]);
  };

  getCheckboxOptions = eventArr => {
    const { editMode } = this.props;
    return eventArr.map(event => {
      return {
        label: `${event.time} ${event.band}`,
        value: event.value,
        disabled: !editMode
      };
    });
  };

  updateBandSelectionValues = (checkedValues, cbGroupName) => {
    const { bandSelectionValues } = this.state;

    if (checkedValues.length === 0) {
      const filteredKeys = Object.keys(bandSelectionValues).filter(key => key.includes(cbGroupName));
      for (const key of filteredKeys) {
        bandSelectionValues[key] = false;
      }
    } else {
      for (const value of checkedValues) {
        bandSelectionValues[value] = true;
      }
    }

    this.setState({ bandSelectionValues });
    localStorage.setItem(BAND_SELECTION_LS_KEY, JSON.stringify(bandSelectionValues));
  };

  render() {
    return (
      <Fragment>
        <Fragment>
          <h1 style={{ marginBottom: 10 }}>FRIDAY, 10.08.2018</h1>
          <h2 style={{ marginBottom: 10 }}>MAIN STAGE</h2>
          <CheckboxGroup
            style={{ marginBottom: 10 }}
            options={this.getCheckboxOptions(lineup.FRIDAY.MAIN_STAGE)}
            defaultValue={this.getCheckboxDefaultValues(lineup.FRIDAY.MAIN_STAGE)}
            onChange={event => {
              this.updateBandSelectionValues(event, 'FR_MAIN_STAGE');
            }}
          />
          <h2 style={{ marginBottom: 10 }}>TENT STAGE</h2>
          <CheckboxGroup
            style={{ marginBottom: 10 }}
            options={this.getCheckboxOptions(lineup.FRIDAY.TENT_STAGE)}
            defaultValue={this.getCheckboxDefaultValues(lineup.FRIDAY.TENT_STAGE)}
            onChange={event => {
              this.updateBandSelectionValues(event, 'FR_TENT_STAGE');
            }}
          />
        </Fragment>
        <Divider />
        <Fragment>
          <h1 style={{ marginBottom: 10 }}>SATURDAY, 11.08.2018</h1>
          <h2 style={{ marginBottom: 10 }}>MAIN STAGE</h2>
          <CheckboxGroup
            style={{ marginBottom: 10 }}
            options={this.getCheckboxOptions(lineup.SATURDAY.MAIN_STAGE)}
            defaultValue={this.getCheckboxDefaultValues(lineup.SATURDAY.MAIN_STAGE)}
            onChange={event => {
              this.updateBandSelectionValues(event, 'SA_MAIN_STAGE');
            }}
          />
          <h2 style={{ marginBottom: 10 }}>TENT STAGE</h2>
          <CheckboxGroup
            style={{ marginBottom: 10 }}
            options={this.getCheckboxOptions(lineup.SATURDAY.TENT_STAGE)}
            defaultValue={this.getCheckboxDefaultValues(lineup.SATURDAY.TENT_STAGE)}
            onChange={event => {
              this.updateBandSelectionValues(event, 'SA_TENT_STAGE');
            }}
          />
        </Fragment>
      </Fragment>
    );
  }
}

export default BandSelection;
