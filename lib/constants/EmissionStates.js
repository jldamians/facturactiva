'use strict';

class EmissionStates {
  static get PENDING() {
    return 'P';
  }

  static get ACCEPTED() {
    return 'A';
  }

  static get REJECTED() {
    return 'R';
  }

  static get WRONG() {
    return 'N';
  }
}

module.exports = EmissionStates;
