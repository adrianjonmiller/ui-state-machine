export default class UxStateMachine {
  constructor(states, currentState = null, cb = null) {
    this.states = states;
    this.currentState = currentState;
    this.prevStates = [];
    this.data = null
    this.events = [];
    this.cb = cb;
    this.beforeGuard = null;

    if (currentState) {
      this.updateState(currentState)
    }

    this.methods = {
      emit: this.emit.bind(this),
      onStateChange: this.onStateChange.bind(this),
      getState: this.getState.bind(this),
      getPrevState: this.getPrevState.bind(this),
      getData: this.getData.bind(this),
      goToPrevState: this.goToPrevState.bind(this),
      beforeEach: this.beforeEach.bind(this)
    }

    return this.methods;
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
}

if (window && !('UxStateMachine' in window)) {
  window.UxStateMachine = UxStateMachine;
}