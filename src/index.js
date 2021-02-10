export default class UxStateMachine {
  constructor(states, currentState = null, cb = null) {
    this.states = states;
    this.currentState = currentState;
    this.prevStates = [];
    this.data = null;
    this.events = [];
    this.cb = cb;
    this.beforeGuard = null;
    this.initialized = false;

    this.methods = {
      emit: (...args) => this.check(args, this.emit),
      onStateChange: this.onStateChange.bind(this),
      getState: (...args) => this.check(args, this.getState),
      getPrevState: (...args) => this.check(args, this.getPrevState),
      getData: (...args) => this.check(args, this.getData),
      goToPrevState: (...args) => this.check(args, this.goToPrevState),
      beforeEach: this.beforeEach.bind(this),
      getEvents: (...args) => this.check(args, this.getEvents),
    }

    return {...this.methods, init: this.init.bind(this)};
  }

  getEvents () {
    let on = this.currentState in this.states && 'on' in this.states[this.currentState] ? this.states[this.currentState].on : null;
    return on ? Object.keys(on) : [];
  }

  init (newState) {
    this.currentState = newState || this.currentState;

    if (this.currentState) {
      this.initialized = true;
      this.updateState(this.currentState)
      return this.methods;
    } else {
      console.warn('Cannot initialize; no state defined')
    }
  }

  emit(event, payload = null) {
    try {

      let next = this.states[this.currentState].on[event];

      if (next) {
        if (next !== this.currentState) {
          if (this.beforeGuard) {
            this.beforeGuard.call({}, next, this.currentState, redirect => {
              next = redirect && redirect in this.states ? redirect : next
              this.updateState(next, payload);
              this.events.push(event);
            })
          } else {
            this.updateState(next, payload);
            this.events.push(event);
          }
        }
      } else {
        throw `${event} does not exist in ${this.currentState}`
      }
    } catch (err) {
      console.error(err)
    }
  }

  goToPrevState(payload) {
    let prevState = this.prevStates.length ? this.prevStates.pop() : null;

    if (this.beforeGuard) {
      this.beforeGuard.call({}, prevState, this.currentState, redirect => {
        prevState = redirect && redirect in this.states ? redirect : prevState
        this.updateState(prevState, payload, false);
      })
    } else {
      this.updateState(prevState, payload, false);
    }
  }

  onStateChange(cb) {
    this.cb = cb
  }

  getState() {
    return this.currentState
  }

  getData() {
    return this.data
  }

  getPrevState() {
    return this.prevStates.length > 0 ? this.prevStates[this.prevStates.length - 1] : null;
  }

  beforeEach(cb) {
    this.beforeGuard = cb
  }

  updateState(state, payload, forward = true) {
    let data = 'data' in this.states[state] ? this.states[state].data : null;

    if (this.currentState) {
      let currentStateOb = this.states[this.currentState];

      if ('leave' in currentStateOb) {
        if (typeof currentStateOb.leave === 'function') {
          currentStateOb.leave.call({}, this.methods, payload)
        }
      }

      if (forward) {
        this.prevStates.push(this.currentState);
      }
    }

    this.currentState = state;

    if (data) {
      this.data = data
    }

    let newStateOb = this.states[this.currentState];

    if ('enter' in newStateOb) {
      if (typeof newStateOb.enter === 'function') {
        newStateOb.enter.call({}, this.methods, payload)
      }
    }

    if (typeof this.cb === 'function') {
      this.cb.call({}, data, this.currentState, this.prevStates, payload);
    }
  }

  check (args, cb) {
    try {
      if (!this.initialized) {
        throw 'State machine is not initialized'
      }
      
      if (!this.currentState) {
        throw 'State is not set'
      }

      if (!(this.currentState in this.states)) {
        throw 'State does not exist in states'
      }

      return cb.apply(this, args);
    } catch (err) {
      console.error(err)
    }    
  }
}