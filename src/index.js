export default class UxStateMachine {
  constructor (states, currentState = null) {
      this.states = states;
      this.currentState = currentState;
      this.prevStates = [];
      this.payload = null
      this.events = [];
      this.cb = null;

      if (currentState) {
          this.updateState(currentState)
      }

      this.methods = {
        emit: this.emit.bind(this),
        onStateChange: this.onStateChange.bind(this),
        getState: this.getState.bind(this),
        getPrevState: this.getPrevState.bind(this),
        getPayload: this.getPayload.bind(this),
        goToPrevState: this.goToPrevState.bind(this),
    }

      return this.methods;
  }

  emit (event) {
      try {
          
          let {next} = this.states[this.currentState].on[event.toUpperCase()];
          
          if (next) {
              if (next !== this.currentState) {
                  this.updateState(next);
                  this.events.push(event);
              }
          }  else {
              throw `${event} does not exist in ${this.currentState}`
          }
      } catch (err) {
          console.error(err)
      }
  }

  goToPrevState () {
    let prevState = this.prevStates.length ? this.prevStates.pop() : null;

    if (prevState) {
        this.updateState(prevState)
    }
  }

  onStateChange (cb) {
      this.cb = cb
  }

  getState () {
      return this.currentState
  }

  getPayload () {
      return this.payload
  }

  getPrevState () {
      return this.prevStates.length > 0 ? this.prevStates[this.prevStates.length - 1] : null;
  }

  updateState (state) {
      let payload = this.states[state].payload;

      if (this.currentState) {
          let currentStateOb = this.states[this.currentState];

          if ('leave' in currentStateOb) {
              if (typeof currentStateOb.leave === 'function') {
                  currentStateOb.leave.call({}, this.methods)
              }
          }

          this.prevStates.push(this.currentState);
      }

      this.currentState = state;

      if (payload) {
          this.payload = payload
      }

      let newStateOb = this.states[this.currentState];

      if ('enter' in newStateOb) {
          if (typeof newStateOb.enter === 'function') {
              newStateOb.enter.call({}, this.methods)
          }
      }

      if (typeof this.cb === 'function') {
          this.cb(this.currentState, this.prevStates, payload);
      }
  }
}

if (window && !('UxStateMachine' in window)) {
    window.UxStateMachine = UxStateMachine;
}