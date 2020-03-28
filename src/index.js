export default class UxStateMachine {
  constructor (states, currentState = null) {
      this.states = states;
      this.currentState = currentState;
      this.prevStates = [];
      this.payload = null
      this.events = [];
      this.cb = null;
      this.guard = null;

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
        beforeEach: this.beforeEach.bind(this)
    }

      return this.methods;
  }

  emit (event) {
      try {
          
          let next = this.states[this.currentState].on[event];
          
          if (next) {
                if (next !== this.currentState) {
                    if (this.guard) {
                        this.guard.call({}, next, this.currentState, redirect => {
                            next = redirect && redirect in this.states ? redirect : next
                            this.updateState(next);
                            this.events.push(event);
                        })
                    } else {
                        this.updateState(next);
                        this.events.push(event);
                    }
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
        this.updateState(prevState, false)
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

  beforeEach (cb) {
    this.guard = cb
  }

  updateState (state, forward = true) {
      let payload = this.states[state].payload;

      if (this.currentState) {
          let currentStateOb = this.states[this.currentState];

          if ('leave' in currentStateOb) {
              if (typeof currentStateOb.leave === 'function') {
                  currentStateOb.leave.call({}, this.methods)
              }
          }

          if (forward) {
            this.prevStates.push(this.currentState);
          }
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